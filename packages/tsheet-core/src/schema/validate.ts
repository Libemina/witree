// スキーマの意味検証（本体仕様 §12.1 の S 系）。S07（式）・S08（依存の循環）は X-02・X-08 で扱う。
//
// 診断の順序は入力のキー順にしか依存しない（決定性）：
//  (1) スキーマ全体：S13 rootTypeDeclared → `enums` 宣言順の S09 duplicateEnumValue → S13 unknownParam（キーはコードポイント順）
//  (2) コンテナごと（Root → types 宣言順）：型レベル S02 → S12 → `children` 宣言順の S01、
//      次にフィールド宣言順に S13 reservedFieldId → S01（target → sourceType → fromType）→ S09（undefinedEnumRef →
//      duplicateEnumValue）→ S03 → S04 → S05 → S06 → S09 defaultInvalid → S11 → S13 inheritOnRoot、
//      次に `unique` 配列順に S01 ancestorType → S10（`fields` 配列順）
//  (3) 連鎖抑止：S01 を出した参照は S03〜S06 の対象外、S04 を出したフィールドは S05 の対象外、
//      enumRef が未定義のフィールドは default の列挙検査をスキップする（values.ts）
//
// 仕様に明記がなく、保守的に解釈した点（PR の「仕様の確認事項」にも記載）：
//  - 予約名 "Root" は `inherit.fromType` でだけルートを指す。`children` のキー・`ref.target`・`sourceType`・
//    `ancestorType` の "Root" は未定義の型として S01 にする。
//  - S05 で decimal の `scale` の差は問わない。
//  - S06 の候補の比較で enum は `value` の集合（整列）で比べる。`values` が未解決（enumRef 未定義）なら比較しない。
//  - S11 は `required: true` の明示と `default` の存在だけを見る（`required: false` の明示は対象外）。
//  - `root.fields` の inherit は S13（inheritOnRoot）だけを出し、S06 は評価しない。
//  - フィールド ID の予約語 `parent` / `root`（§3.1）には S 表のコードがないので、ルートに関する S13 に寄せる。
//  - `unique.scope.ancestorType` がその型の祖先になりえない場合のコードは表にないので、L-04 では診断しない。
import type { Diagnostic, FieldId, PartPath, TypeName } from "../api.ts";
import { compareCodePoints } from "../compare.ts";
import {
  SCHEMA_DIAGNOSTIC_CODES as CODES,
  type ContainerName,
  type EnumValue,
  type FieldDef,
  type FieldType,
  type RollupFn,
  type SchemaDiagnosticReason,
  type SchemaModel,
  type TypeDef,
} from "./model.ts";
import { checkDefaultValue } from "./values.ts";

export interface ValidateSchemaOptions {
  /** 診断の `at.part`。既定は "schema.json"。 */
  part?: PartPath;
  /** workbook.json の `params` のキー。省略時は S13（unknownParam）を検査しない。 */
  paramKeys?: readonly FieldId[];
}

/** 式言語の予約語（§3.1）。フィールド ID に使えない。 */
const RESERVED_FIELD_IDS: ReadonlySet<string> = new Set(["parent", "root"]);

/** `fn` が受け付ける対象フィールドの型（§8.1 の表）。undefined は任意。 */
const FN_SOURCE_TYPES: Readonly<Record<RollupFn, readonly FieldType[] | undefined>> = {
  sum: ["number", "decimal"],
  avg: ["number", "decimal"],
  wavg: ["number", "decimal"],
  min: ["number", "decimal", "date", "datetime"],
  max: ["number", "decimal", "date", "datetime"],
  any: ["boolean"],
  all: ["boolean"],
  count: undefined,
  countDistinct: undefined,
};

const WEIGHT_TYPES: readonly FieldType[] = ["number", "decimal"];

/** `fn` の結果の型（§8.1 の表）。対象と同じ型になる関数では `sourceFieldType` を返す。 */
function resultTypeOf(fn: RollupFn, sourceFieldType: FieldType | undefined): FieldType | undefined {
  switch (fn) {
    case "count":
    case "countDistinct":
      return "number";
    case "any":
    case "all":
      return "boolean";
    default:
      return sourceFieldType;
  }
}

function sortedEnumValues(values: readonly EnumValue[]): string[] {
  return values.map((v) => v.value).sort(compareCodePoints);
}

/** 継承元として同じ型か（§8.2：同じ `type`。enum は同じ値集合）。enum の値集合が未解決なら同じとみなす。 */
function sameFieldType(a: FieldDef, b: FieldDef): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "enum" && b.type === "enum") {
    if (a.values === undefined || b.values === undefined) return true;
    const x = sortedEnumValues(a.values);
    const y = sortedEnumValues(b.values);
    return x.length === y.length && x.every((v, i) => v === y[i]);
  }
  return true;
}

function formatOf(field: FieldDef): string | undefined {
  return field.type === "string" ? field.format : undefined;
}

function describeCandidate(container: TypeDef, field: FieldDef): Record<string, unknown> {
  const format = formatOf(field);
  return format === undefined ? { type: container.name, fieldType: field.type } : { type: container.name, fieldType: field.type, format };
}

/** 診断の組み立て。`at` と `detail.reason` を必ず持たせる。 */
class Collector {
  readonly out: Diagnostic[] = [];
  private readonly part: PartPath;
  constructor(part: PartPath) {
    this.part = part;
  }

  add(
    code: string,
    severity: "error" | "warning",
    message: string,
    at: { type?: ContainerName; field?: FieldId },
    reason: SchemaDiagnosticReason,
    detail: Record<string, unknown> = {},
  ): void {
    const where: NonNullable<Diagnostic["at"]> = { part: this.part };
    if (at.type !== undefined) where.type = at.type;
    if (at.field !== undefined) where.field = at.field;
    this.out.push({ code, severity, message, at: where, detail: { reason, ...detail } });
  }
}

/** 重複する列挙値を、2 回目に現れた順に 1 値につき 1 回ずつ報告する。 */
function duplicateEnumValues(values: readonly EnumValue[]): string[] {
  const seen = new Set<string>();
  const reported = new Set<string>();
  const out: string[] = [];
  for (const { value } of values) {
    if (seen.has(value) && !reported.has(value)) {
      reported.add(value);
      out.push(value);
    }
    seen.add(value);
  }
  return out;
}

function validateGlobal(model: SchemaModel, paramKeys: readonly FieldId[] | undefined, c: Collector): void {
  if (model.rootTypeDeclared) {
    c.add(CODES.root, "error", '型名 "Root" はルートノードの予約名なので、types に定義できません', {}, "rootTypeDeclared");
  }
  for (const e of model.enums) {
    for (const value of duplicateEnumValues(e.values)) {
      c.add(CODES.enumOrDefault, "error", `列挙 "${e.id}" の値 "${value}" が重複しています`, {}, "duplicateEnumValue", {
        enumId: e.id,
        value,
      });
    }
  }
  if (paramKeys !== undefined) {
    for (const key of [...paramKeys].sort(compareCodePoints)) {
      if (model.root.fieldIndex.has(key)) continue;
      c.add(CODES.root, "error", `params のキー "${key}" は root.fields に定義されていません`, { type: "Root", field: key }, "unknownParam");
    }
  }
}

function validateRollup(model: SchemaModel, field: FieldDef, rollup: Extract<NonNullable<FieldDef["computed"]>, { kind: "rollup" }>, c: Collector): void {
  const at = { type: field.owner, field: field.id };
  const source = model.typeIndex.get(rollup.sourceType);
  if (source === undefined) return; // S01 を出している

  // S03
  if (!model.canContain(field.owner, rollup.sourceType, rollup.depth)) {
    c.add(
      CODES.rollupSourceOutOfRange,
      "error",
      `rollup の sourceType "${rollup.sourceType}" は ${field.owner} の${rollup.depth === "children" ? "子" : "子孫"}に存在しえません`,
      at,
      "sourceOutOfRange",
      { sourceType: rollup.sourceType, depth: rollup.depth },
    );
  }

  // S04
  let failed = false;
  let sourceField: FieldDef | undefined;
  const common = { fn: rollup.fn, sourceType: rollup.sourceType };
  if (rollup.sourceField !== undefined) {
    sourceField = source.fieldIndex.get(rollup.sourceField);
    if (sourceField === undefined) {
      failed = true;
      c.add(CODES.rollupSourceField, "error", `rollup の sourceField "${rollup.sourceField}" は型 "${rollup.sourceType}" にありません`, at, "missingSourceField", {
        ...common,
        sourceField: rollup.sourceField,
      });
    } else {
      const allowed = FN_SOURCE_TYPES[rollup.fn];
      if (allowed !== undefined && !allowed.includes(sourceField.type)) {
        failed = true;
        c.add(CODES.rollupSourceField, "error", `rollup の fn "${rollup.fn}" は ${sourceField.type} 型のフィールド "${rollup.sourceField}" に使えません`, at, "fnTypeMismatch", {
          ...common,
          sourceField: rollup.sourceField,
          sourceFieldType: sourceField.type,
        });
      }
    }
  }
  if (rollup.weight !== undefined) {
    const weight = source.fieldIndex.get(rollup.weight);
    if (weight === undefined) {
      failed = true;
      c.add(CODES.rollupSourceField, "error", `rollup の weight "${rollup.weight}" は型 "${rollup.sourceType}" にありません`, at, "missingWeight", {
        ...common,
        weight: rollup.weight,
      });
    } else if (!WEIGHT_TYPES.includes(weight.type)) {
      failed = true;
      c.add(CODES.rollupSourceField, "error", `rollup の weight "${rollup.weight}" は number か decimal でなければなりません（${weight.type}）`, at, "weightTypeMismatch", {
        ...common,
        weight: rollup.weight,
        weightType: weight.type,
      });
    }
  }
  if (failed) return;

  // S05
  const expected = resultTypeOf(rollup.fn, sourceField?.type);
  if (expected !== undefined && expected !== field.type) {
    c.add(CODES.rollupResultType, "error", `rollup の結果の型 ${expected} がフィールドの型 ${field.type} と合いません`, at, "resultTypeMismatch", {
      expected,
      actual: field.type,
    });
  }
}

function validateInherit(model: SchemaModel, containers: readonly TypeDef[], field: FieldDef, inherit: Extract<NonNullable<FieldDef["computed"]>, { kind: "inherit" }>, c: Collector): void {
  if (field.owner === "Root") return; // S13 inheritOnRoot
  const owner: TypeName = field.owner;
  const at = { type: field.owner, field: field.id };
  const base = inherit.fromType === undefined ? { field: inherit.field } : { fromType: inherit.fromType, field: inherit.field };

  let candidates: TypeDef[];
  if (inherit.fromType === undefined) {
    candidates = containers.filter((t) => t.fieldIndex.has(inherit.field) && (t.isRoot || model.canContain(t.name, owner, "descendants")));
  } else {
    const from = model.typeOrRoot(inherit.fromType);
    if (from === undefined) return; // S01 を出している
    const ok = from.fieldIndex.has(inherit.field) && (from.isRoot || model.canContain(from.name, owner, "descendants"));
    candidates = ok ? [from] : [];
  }

  if (candidates.length === 0) {
    c.add(
      CODES.inheritSource,
      "error",
      inherit.fromType === undefined
        ? `継承元のフィールド "${inherit.field}" を持つ祖先が ${owner} には存在しえません`
        : `継承元 ${inherit.fromType}.${inherit.field} は ${owner} の祖先として存在しえません`,
      at,
      "noAncestorCandidate",
      { ...base, candidates: [] },
    );
    return;
  }

  const described = candidates.map((t) => describeCandidate(t, t.fieldIndex.get(inherit.field) ?? field));
  const sources = candidates.map((t) => t.fieldIndex.get(inherit.field)).filter((f): f is FieldDef => f !== undefined);
  if (sources.some((src) => !sameFieldType(field, src))) {
    c.add(CODES.inheritSource, "error", `継承元のフィールド "${inherit.field}" の型が ${field.type} と異なります`, at, "typeMismatch", {
      ...base,
      candidates: described,
    });
    return;
  }
  if (field.type === "string" && sources.some((src) => formatOf(src) !== field.format)) {
    c.add(CODES.inheritSource, "warning", `継承元のフィールド "${inherit.field}" の format が異なります`, at, "formatMismatch", {
      ...base,
      candidates: described,
    });
  }
}

function validateField(model: SchemaModel, containers: readonly TypeDef[], field: FieldDef, c: Collector): void {
  const at = { type: field.owner, field: field.id };
  const computed = field.computed;

  // S13: 予約語
  if (RESERVED_FIELD_IDS.has(field.id)) {
    c.add(CODES.root, "error", `フィールド ID "${field.id}" は式言語の予約語なので使えません`, at, "reservedFieldId");
  }

  // S01: target → sourceType → fromType
  if (field.type === "ref") {
    field.target.forEach((ref, index) => {
      if (model.typeIndex.has(ref)) return;
      c.add(CODES.undefinedType, "error", `ref の target "${ref}" は定義されていない型です`, at, "undefinedType", { where: "target", ref, index });
    });
  }
  if (computed?.kind === "rollup" && !model.typeIndex.has(computed.sourceType)) {
    c.add(CODES.undefinedType, "error", `rollup の sourceType "${computed.sourceType}" は定義されていない型です`, at, "undefinedType", {
      where: "sourceType",
      ref: computed.sourceType,
    });
  }
  if (computed?.kind === "inherit" && computed.fromType !== undefined && model.typeOrRoot(computed.fromType) === undefined) {
    c.add(CODES.undefinedType, "error", `inherit の fromType "${computed.fromType}" は定義されていない型です`, at, "undefinedType", {
      where: "fromType",
      ref: computed.fromType,
    });
  }

  // S09: enumRef → 列挙値の重複
  if (field.type === "enum") {
    if (field.enumRef !== undefined && !model.enumIndex.has(field.enumRef)) {
      c.add(CODES.enumOrDefault, "error", `enumRef "${field.enumRef}" は定義されていない列挙です`, at, "undefinedEnumRef", { enumId: field.enumRef });
    }
    if (field.enumRef === undefined && field.values !== undefined) {
      for (const value of duplicateEnumValues(field.values)) {
        c.add(CODES.enumOrDefault, "error", `列挙値 "${value}" が重複しています`, at, "duplicateEnumValue", { value });
      }
    }
  }

  // S03 → S04 → S05
  if (computed?.kind === "rollup") validateRollup(model, field, computed, c);

  // S06
  if (computed?.kind === "inherit") validateInherit(model, containers, field, computed, c);

  // S09: default
  if (Object.hasOwn(field, "default")) {
    const violation = checkDefaultValue(field, field.default);
    if (violation !== undefined) {
      c.add(CODES.enumOrDefault, "error", `default の値がフィールドの型・制約に適合しません（${violation}）`, at, "defaultInvalid", {
        value: field.default,
        violation,
      });
    }
  }

  // S11
  if (computed?.kind === "rollup" && computed.whenNoSource !== "input") {
    const has: string[] = [];
    if (field.requiredExplicit && field.required) has.push("required");
    if (Object.hasOwn(field, "default")) has.push("default");
    if (has.length > 0) {
      c.add(CODES.rollupWithInput, "error", `rollup のフィールドに ${has.join(" / ")} は指定できません（whenNoSource: "input" を除く）`, at, "rollupWithInput", { has });
    }
  }

  // S13: root.fields の inherit
  if (field.owner === "Root" && computed?.kind === "inherit") {
    c.add(CODES.root, "error", "root.fields のフィールドに inherit は指定できません", at, "inheritOnRoot");
  }
}

function validateContainer(model: SchemaModel, containers: readonly TypeDef[], container: TypeDef, c: Collector): void {
  const at = { type: container.name };

  if (!container.isRoot) {
    // S02
    if (!model.isReachable(container.name)) {
      c.add(CODES.unreachableType, "warning", `型 "${container.name}" にはルートから到達できません`, at, "unreachable");
    }
    // S12
    if (container.maxDepth !== undefined && !model.isSelfRecursive(container.name)) {
      c.add(CODES.maxDepthWithoutRecursion, "warning", `型 "${container.name}" は自己再帰しないので maxDepth は意味を持ちません`, at, "maxDepthWithoutRecursion");
    }
  }

  // S01: children
  for (const rule of container.children) {
    if (model.typeIndex.has(rule.child)) continue;
    c.add(CODES.undefinedType, "error", `children の "${rule.child}" は定義されていない型です`, at, "undefinedType", { where: "children", ref: rule.child });
  }

  for (const field of container.fields) validateField(model, containers, field, c);

  for (const rule of container.unique) {
    if (typeof rule.scope === "object" && !model.typeIndex.has(rule.scope.ancestorType)) {
      c.add(CODES.undefinedType, "error", `unique の ancestorType "${rule.scope.ancestorType}" は定義されていない型です`, at, "undefinedType", {
        where: "ancestorType",
        ref: rule.scope.ancestorType,
        index: rule.index,
      });
    }
    for (const id of rule.fields) {
      if (container.fieldIndex.has(id)) continue;
      c.add(CODES.uniqueField, "error", `unique のフィールド "${id}" は型 "${container.name}" にありません`, { type: container.name, field: id }, "uniqueFieldMissing", {
        index: rule.index,
      });
    }
  }
}

/** スキーマの意味検証（S01〜S06、S09〜S13）。診断の順序は入力のキー順にだけ依存する。 */
export function validateSchema(model: SchemaModel, opts: ValidateSchemaOptions = {}): Diagnostic[] {
  const c = new Collector(opts.part ?? "schema.json");
  const containers: readonly TypeDef[] = [model.root, ...model.types];
  validateGlobal(model, opts.paramKeys, c);
  for (const container of containers) validateContainer(model, containers, container, c);
  return c.out;
}

/** S 系の `error` が 1 件でもあるか（本体仕様 §12：ある場合はデータを読み取り専用で開く）。 */
export function hasSchemaError(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === "error");
}
