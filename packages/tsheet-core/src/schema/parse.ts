// schema.json（メタスキーマ適合済みの JSON）を SchemaModel に変換する。
// 既定値（`depth`・`whenNoSource`・`inherit.field`・`severity` など）はここで解決する。
// メタスキーマに適合しない入力の挙動は未定義（例外になりうる）。構造検証は validateSchemaJson（structure.ts）で先に行う。
import type { FieldId, TypeName, Value } from "../api.ts";
import type {
  CheckRule,
  ChildRule,
  Computed,
  ComputedField,
  ContainerName,
  EnumDef,
  EnumValue,
  ExprSource,
  FieldDef,
  RollupFn,
  SchemaModel,
  TypeDef,
  UniqueRule,
} from "./model.ts";

type Raw = Readonly<Record<string, unknown>>;

/** 予約名。`types` に定義できず、`inherit.fromType` でだけルートを指す（§3.1）。 */
const ROOT: ContainerName = "Root";

function asRaw(value: unknown): Raw {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("メタスキーマに適合しない値（オブジェクトではない）");
  }
  return value as Raw;
}

function optString(raw: Raw, key: string): string | undefined {
  const v = raw[key];
  return typeof v === "string" ? v : undefined;
}

function optNumber(raw: Raw, key: string): number | undefined {
  const v = raw[key];
  return typeof v === "number" ? v : undefined;
}

function optBoolean(raw: Raw, key: string): boolean | undefined {
  const v = raw[key];
  return typeof v === "boolean" ? v : undefined;
}

/** `exactOptionalPropertyTypes` のため、undefined のキーは付けない。 */
function withOptional<T extends object>(base: T, extras: Record<string, unknown>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(extras)) if (v !== undefined) out[k] = v;
  return out as T;
}

function parseEnumValues(raw: unknown): EnumValue[] {
  return (raw as unknown[]).map((item) => {
    const r = asRaw(item);
    return withOptional<EnumValue>(
      { value: String(r["value"]), deprecated: optBoolean(r, "deprecated") === true },
      { label: optString(r, "label") },
    );
  });
}

function parseComputed(id: FieldId, owner: ContainerName, raw: Raw): Computed | undefined {
  if (Object.hasOwn(raw, "rollup")) {
    const r = asRaw(raw["rollup"]);
    const fn = r["fn"] as RollupFn;
    const where = optString(r, "where");
    const whenNoSource = optString(r, "whenNoSource") as "empty" | "zero" | "input" | undefined;
    return withOptional<Computed>(
      {
        kind: "rollup",
        sourceType: String(r["sourceType"]),
        fn,
        depth: (optString(r, "depth") as "children" | "descendants" | undefined) ?? "children",
        whenNoSource: whenNoSource ?? (fn === "count" ? "zero" : "empty"),
      },
      {
        sourceField: optString(r, "sourceField"),
        weight: optString(r, "weight"),
        where: where === undefined ? undefined : ({ text: where, owner, field: id, purpose: "rollupWhere" } satisfies ExprSource),
      },
    );
  }
  if (Object.hasOwn(raw, "inherit")) {
    const r = raw["inherit"] === true ? {} : asRaw(raw["inherit"]);
    const field = optString(r, "field");
    return withOptional<Computed>(
      { kind: "inherit", field: field ?? id, fieldExplicit: field !== undefined },
      { fromType: optString(r, "fromType") },
    );
  }
  if (Object.hasOwn(raw, "formula")) {
    return { kind: "formula", expr: { text: String(raw["formula"]), owner, field: id, purpose: "formula" } };
  }
  return undefined;
}

function parseField(id: FieldId, owner: ContainerName, index: number, raw: Raw, enumIndex: ReadonlyMap<string, EnumDef>): FieldDef {
  const base = withOptional(
    {
      id,
      owner,
      index,
      required: optBoolean(raw, "required") === true,
      requiredExplicit: Object.hasOwn(raw, "required"),
      raw,
    },
    {
      label: optString(raw, "label"),
      description: optString(raw, "description"),
      computed: parseComputed(id, owner, raw),
    },
  );
  // `default` は null が「明示的な空」なので、undefined ではなくキーの有無で区別する（§7）。
  const withDefault = Object.hasOwn(raw, "default") ? { ...base, default: raw["default"] as Value } : base;

  const type = raw["type"] as FieldDef["type"];
  switch (type) {
    case "string":
      return withOptional<FieldDef>(
        { ...withDefault, type, multiline: optBoolean(raw, "multiline") === true },
        {
          format: optString(raw, "format"),
          pattern: optString(raw, "pattern"),
          minLength: optNumber(raw, "minLength"),
          maxLength: optNumber(raw, "maxLength"),
        },
      );
    case "number":
      return withOptional<FieldDef>(
        { ...withDefault, type, integer: optBoolean(raw, "integer") === true },
        { min: optNumber(raw, "min"), max: optNumber(raw, "max"), unit: optString(raw, "unit") },
      );
    case "decimal":
      return withOptional<FieldDef>(
        { ...withDefault, type, scale: optNumber(raw, "scale") ?? 0 },
        { min: optString(raw, "min"), max: optString(raw, "max"), unit: optString(raw, "unit") },
      );
    case "boolean":
    case "doc":
      return { ...withDefault, type };
    case "date":
    case "datetime":
      return withOptional<FieldDef>({ ...withDefault, type }, { min: optString(raw, "min"), max: optString(raw, "max") });
    case "enum": {
      const enumRef = optString(raw, "enumRef");
      const values = Object.hasOwn(raw, "values") ? parseEnumValues(raw["values"]) : enumIndex.get(enumRef ?? "")?.values;
      return withOptional<FieldDef>({ ...withDefault, type, multiple: optBoolean(raw, "multiple") === true }, { enumRef, values });
    }
    case "ref":
      return withOptional<FieldDef>(
        {
          ...withDefault,
          type,
          target: (raw["target"] as unknown[]).map(String),
          multiple: optBoolean(raw, "multiple") === true,
          onDelete: (optString(raw, "onDelete") as "restrict" | "clear" | undefined) ?? "restrict",
        },
        {},
      );
  }
}

function parseChildren(raw: Raw): ChildRule[] {
  const rules = raw["children"];
  if (rules === undefined) return [];
  return Object.entries(asRaw(rules)).map(([child, rule], index) => {
    const r = asRaw(rule);
    return {
      child,
      cardinality: optString(r, "cardinality") as "one" | "many",
      required: optBoolean(r, "required") === true,
      index,
    };
  });
}

function parseUnique(raw: Raw): UniqueRule[] {
  const rules = raw["unique"];
  if (rules === undefined) return [];
  return (rules as unknown[]).map((rule, index) => {
    const r = asRaw(rule);
    const scope = r["scope"];
    return withOptional<UniqueRule>(
      {
        index,
        fields: (r["fields"] as unknown[]).map(String),
        scope: typeof scope === "string" ? (scope as "parent" | "workbook") : { ancestorType: String(asRaw(scope)["ancestorType"]) },
      },
      { message: optString(r, "message") },
    );
  });
}

function parseChecks(raw: Raw, owner: ContainerName): CheckRule[] {
  const rules = raw["checks"];
  if (rules === undefined) return [];
  return (rules as unknown[]).map((rule, index) => {
    const r = asRaw(rule);
    const id = String(r["id"]);
    return {
      index,
      id,
      expr: { text: String(r["expr"]), owner, check: id, purpose: "check" },
      severity: (optString(r, "severity") as "error" | "warning" | undefined) ?? "error",
      message: String(r["message"]),
    };
  });
}

function parseContainer(name: ContainerName, raw: Raw, enumIndex: ReadonlyMap<string, EnumDef>): TypeDef {
  const fieldsRaw = raw["fields"] === undefined ? {} : asRaw(raw["fields"]);
  const fields = Object.entries(fieldsRaw).map(([id, def], index) => parseField(id, name, index, asRaw(def), enumIndex));
  const children = parseChildren(raw);
  return withOptional<TypeDef>(
    {
      name,
      isRoot: name === ROOT,
      fields,
      fieldIndex: new Map(fields.map((f) => [f.id, f])),
      children,
      childIndex: new Map(children.map((c) => [c.child, c])),
      unique: parseUnique(raw),
      checks: parseChecks(raw, name),
      raw,
    },
    {
      label: optString(raw, "label"),
      description: optString(raw, "description"),
      titleTemplate: optString(raw, "titleTemplate"),
      maxDepth: optNumber(raw, "maxDepth"),
    },
  );
}

/**
 * メタスキーマ適合済みの schema.json を SchemaModel にする。
 * 派生表（親型・到達可能集合・子孫の閉包）はここで 1 回だけ計算し、結果に閉じ込める。
 */
export function parseSchema(json: unknown): SchemaModel {
  const raw = asRaw(json);

  const enums: EnumDef[] = Object.entries(raw["enums"] === undefined ? {} : asRaw(raw["enums"])).map(([id, values]) => ({
    id,
    values: parseEnumValues(values),
  }));
  const enumIndex = new Map(enums.map((e) => [e.id, e]));

  const root = parseContainer(ROOT, asRaw(raw["root"]), enumIndex);

  const typesRaw = asRaw(raw["types"]);
  const types: TypeDef[] = [];
  let rootTypeDeclared = false;
  for (const [name, def] of Object.entries(typesRaw)) {
    // 予約名 Root の定義は S13 として報告し、型としては扱わない。
    if (name === ROOT) {
      rootTypeDeclared = true;
      continue;
    }
    types.push(parseContainer(name, asRaw(def), enumIndex));
  }
  const typeIndex = new Map(types.map((t) => [t.name, t]));

  /** コンテナ列。Root を先頭に、types の宣言順。派生表はすべてこの順序を基準にする。 */
  const containers: readonly TypeDef[] = [root, ...types];

  const typeOrRoot = (name: ContainerName): TypeDef | undefined => (name === ROOT ? root : typeIndex.get(name));

  // 子孫の閉包（子辺の推移閉包）。未定義の子（S01）は集合に含めるが、その先はたどらない。
  const descendants = new Map<ContainerName, ReadonlySet<TypeName>>();
  for (const container of containers) {
    const seen = new Set<TypeName>();
    const queue: TypeName[] = container.children.map((c) => c.child);
    // 反復中に push した要素も配列の反復子は拾う（長さを都度見る）
    for (const name of queue) {
      if (seen.has(name)) continue;
      seen.add(name);
      const def = typeIndex.get(name);
      if (def !== undefined) for (const c of def.children) queue.push(c.child);
    }
    descendants.set(container.name, seen);
  }
  const reachable = descendants.get(ROOT) ?? new Set<TypeName>();

  const computedFields: ComputedField[] = [];
  const expressions: ExprSource[] = [];
  for (const container of containers) {
    for (const field of container.fields) {
      const computed = field.computed;
      if (computed === undefined) continue;
      computedFields.push({ owner: container.name, field: field.id, computed });
      if (computed.kind === "formula") expressions.push(computed.expr);
      else if (computed.kind === "rollup" && computed.where !== undefined) expressions.push(computed.where);
    }
    for (const check of container.checks) expressions.push(check.expr);
  }

  return withOptional<SchemaModel>(
    {
      specVersion: "0.1",
      schemaVersion: optNumber(raw, "schemaVersion") ?? 1,
      enums,
      enumIndex,
      root,
      types,
      typeIndex,
      rootTypeDeclared,
      computedFields,
      expressions,
      source: json,
      typeOrRoot,
      parentTypes: (type) => containers.filter((c) => c.childIndex.has(type)).map((c) => c.name),
      isReachable: (type) => reachable.has(type),
      canContain: (container, type, depth) => {
        if (depth === "children") return typeOrRoot(container)?.childIndex.has(type) ?? false;
        return descendants.get(container)?.has(type) ?? false;
      },
      isSelfRecursive: (type) => typeIndex.get(type)?.childIndex.has(type) ?? false,
    },
    { id: optString(raw, "id"), title: optString(raw, "title"), description: optString(raw, "description") },
  );
}
