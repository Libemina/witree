import { describe, expect, test } from "vitest";
import {
  STRUCTURE_DIAGNOSTIC_CODES,
  SCHEMA_DIAGNOSTIC_CODES,
  hasSchemaError,
  loadSchema,
  parseSchema,
  validateSchema,
  type Diagnostic,
  type FieldDef,
  type SchemaModel,
} from "../src/index.ts";

// サンプルのワークブック。Node とブラウザの両方で動かすため、node:fs ではなく Vite の glob import で読む。
const exampleFiles = import.meta.glob<string>("../../../examples/**", {
  query: "?raw",
  import: "default",
  eager: true,
});

const EXAMPLES = ["param-sheet", "wbs", "budget"] as const;
type ExampleName = (typeof EXAMPLES)[number];

function examplePart(name: ExampleName, path: string): string {
  const text = exampleFiles[`../../../examples/${name}/${path}`];
  if (text === undefined) throw new Error(`サンプルにパートがない: ${name}/${path}`);
  return text;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => v as Obj;

/** サンプルの schema.json を読み、`mutate` で壊してから文字列に戻す。 */
function mutated(name: ExampleName, mutate: (schema: Obj) => void): string {
  const value = JSON.parse(examplePart(name, "schema.json")) as Obj;
  mutate(value);
  return JSON.stringify(value);
}

function paramKeysOf(name: ExampleName): string[] {
  const workbook = JSON.parse(examplePart(name, "workbook.json")) as { params?: Obj };
  return Object.keys(workbook.params ?? {});
}

/** サンプルを壊して読み込む。paramKeys は workbook.json から取る。 */
function load(name: ExampleName, mutate: (schema: Obj) => void = () => undefined, paramKeys = paramKeysOf(name)) {
  return loadSchema(mutated(name, mutate), { paramKeys });
}

/** モデルが要るテスト用。構造不正なら失敗させる。 */
function modelOf(name: ExampleName, mutate?: (schema: Obj) => void): SchemaModel {
  const result = load(name, mutate);
  if (result.model === undefined) throw new Error(`構造不正: ${JSON.stringify(result.diagnostics)}`);
  return result.model;
}

const typeDef = (s: Obj, type: string): Obj => obj(obj(s["types"])[type]);
const fieldDef = (s: Obj, type: string, id: string): Obj => obj(obj(typeDef(s, type)["fields"])[id]);
const rootDef = (s: Obj): Obj => obj(s["root"]);
const rootFieldDef = (s: Obj, id: string): Obj => obj(obj(rootDef(s)["fields"])[id]);
const rollupOf = (s: Obj, type: string, id: string): Obj => obj(fieldDef(s, type, id)["rollup"]);
const uniqueOf = (s: Obj, type: string, index: number): Obj => obj((typeDef(s, type)["unique"] as unknown[])[index]);

const summary = (ds: readonly Diagnostic[]): unknown[] => ds.map((d) => [d.code, d.detail?.["reason"], d.at?.type, d.at?.field]);
const codes = (ds: readonly Diagnostic[]): string[] => ds.map((d) => d.code);

function fieldOf(model: SchemaModel, type: string, id: string): FieldDef {
  const field = model.typeOrRoot(type)?.fieldIndex.get(id);
  if (field === undefined) throw new Error(`フィールドがない: ${type}.${id}`);
  return field;
}

function expectOnly(ds: readonly Diagnostic[], code: string, reason: string, at: NonNullable<Diagnostic["at"]>, severity: "error" | "warning" = "error"): Diagnostic {
  expect(summary(ds)).toEqual([[code, reason, at.type, at.field]]);
  const d = ds[0];
  if (d === undefined) throw new Error("診断がない");
  expect(d.severity).toBe(severity);
  expect(d.message).not.toBe("");
  expect(d.at).toEqual(at);
  return d;
}

describe("サンプルのワークブック", () => {
  test.each(EXAMPLES)("%s：loadSchema が診断を返さず、書き込み可能でモデルがある", (name) => {
    const result = load(name);
    expect(result.diagnostics).toEqual([]);
    expect(result.readOnly).toBe(false);
    expect(result.model).toBeDefined();
  });

  test("validateSchema を直接呼んでも同じ", () => {
    const model = parseSchema(JSON.parse(examplePart("budget", "schema.json")));
    expect(validateSchema(model, { paramKeys: paramKeysOf("budget") })).toEqual([]);
  });
});

describe("モデルの形", () => {
  test("型・フィールド・子ルールの順序は JSON の記述順と一致する", () => {
    const model = modelOf("param-sheet");
    expect(model.types.map((t) => t.name)).toEqual(["Site", "Device", "System", "Interface", "Vlan"]);
    expect(model.typeIndex.get("Site")?.fields.map((f) => f.id)).toEqual(["code", "name", "domain", "mgmtSubnet", "ntp", "dns", "syslog", "deviceCount"]);
    expect(model.typeIndex.get("Site")?.fields.map((f) => f.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(model.typeIndex.get("Device")?.children.map((c) => [c.child, c.cardinality, c.required, c.index])).toEqual([
      ["System", "one", true, 0],
      ["Interface", "many", false, 1],
    ]);
    expect(model.root.children.map((c) => c.child)).toEqual(["Site"]);
  });

  test("typeOrRoot(\"Root\") はルートを返し、root.fields を型と同じ形で持つ（budget）", () => {
    const model = modelOf("budget");
    expect(model.typeOrRoot("Root")).toBe(model.root);
    expect(model.root.name).toBe("Root");
    expect(model.root.isRoot).toBe(true);
    expect(model.root.fields.map((f) => f.id)).toEqual(["fiscalYear", "currentMonth", "grandTotal"]);
    expect(model.root.fields.map((f) => f.owner)).toEqual(["Root", "Root", "Root"]);
    expect(model.typeOrRoot("Category")?.isRoot).toBe(false);
    expect(model.typeOrRoot("Nope")).toBeUndefined();
    expect(model.rootTypeDeclared).toBe(false);
  });

  test("parentTypes と isSelfRecursive（wbs）", () => {
    const model = modelOf("wbs");
    expect(model.parentTypes("Task")).toEqual(["Root", "Task"]);
    expect(model.isSelfRecursive("Task")).toBe(true);
    expect(model.isReachable("Task")).toBe(true);
  });

  test("canContain と isSelfRecursive（param-sheet）", () => {
    const model = modelOf("param-sheet");
    expect(model.canContain("Site", "Vlan", "descendants")).toBe(true);
    expect(model.canContain("Site", "Vlan", "children")).toBe(false);
    expect(model.canContain("Site", "Device", "children")).toBe(true);
    expect(model.canContain("Root", "Vlan", "descendants")).toBe(true);
    expect(model.canContain("Vlan", "Site", "descendants")).toBe(false);
    expect(model.canContain("Nope", "Site", "children")).toBe(false);
    expect(model.isSelfRecursive("Site")).toBe(false);
    expect(model.parentTypes("System")).toEqual(["Device"]);
    expect(model.parentTypes("Nope")).toEqual([]);
  });

  test("default の未設定と null を区別する", () => {
    const model = modelOf("param-sheet", (s) => {
      fieldDef(s, "Interface", "speed")["default"] = null;
    });
    const unset = fieldOf(model, "Site", "code");
    const value = fieldOf(model, "Interface", "enabled");
    const explicitNull = fieldOf(model, "Interface", "speed");
    expect("default" in unset).toBe(false);
    expect("default" in value).toBe(true);
    expect(value.default).toBe(true);
    expect("default" in explicitNull).toBe(true);
    expect(explicitNull.default).toBeNull();
  });

  test("required の既定と明示を区別する", () => {
    const model = modelOf("param-sheet");
    expect(fieldOf(model, "Site", "code")).toMatchObject({ required: true, requiredExplicit: true });
    expect(fieldOf(model, "Site", "domain")).toMatchObject({ required: false, requiredExplicit: false });
  });

  test("rollup の whenNoSource / depth の既定値を解決する", () => {
    const paramSheet = modelOf("param-sheet");
    expect(fieldOf(paramSheet, "Site", "deviceCount").computed).toEqual({ kind: "rollup", sourceType: "Device", fn: "count", depth: "children", whenNoSource: "zero" });
    expect(fieldOf(paramSheet, "Device", "vlanTotal").computed).toMatchObject({ depth: "descendants", whenNoSource: "zero" });
    const budget = modelOf("budget");
    expect(fieldOf(budget, "Category", "total").computed).toMatchObject({ fn: "sum", sourceField: "amount", depth: "descendants", whenNoSource: "empty" });
    expect(fieldOf(budget, "Account", "months").computed).toMatchObject({
      whenNoSource: "zero",
      where: { text: "NOT(ISBLANK(amount))", owner: "Account", field: "months", purpose: "rollupWhere" },
    });
    const wbs = modelOf("wbs");
    expect(fieldOf(wbs, "Task", "effort").computed).toMatchObject({ whenNoSource: "input", depth: "children" });
    expect(fieldOf(wbs, "Task", "progress").computed).toMatchObject({ fn: "wavg", weight: "effort" });
  });

  test("inherit の field の既定値（自身の ID）を解決し、true と {} を同じに扱う", () => {
    const model = modelOf("param-sheet", (s) => {
      fieldDef(s, "System", "dns")["inherit"] = true;
      fieldDef(s, "System", "syslog")["inherit"] = { field: "ntp" };
    });
    expect(fieldOf(model, "System", "ntp").computed).toEqual({ kind: "inherit", fromType: "Site", field: "ntp", fieldExplicit: false });
    expect(fieldOf(model, "System", "dns").computed).toEqual({ kind: "inherit", field: "dns", fieldExplicit: false });
    expect(fieldOf(model, "System", "syslog").computed).toEqual({ kind: "inherit", field: "ntp", fieldExplicit: true });
  });

  test("formula とフィールド型の属性", () => {
    const model = modelOf("param-sheet");
    expect(fieldOf(model, "Device", "fqdn").computed).toEqual({
      kind: "formula",
      expr: { text: 'hostname & "." & parent.domain', owner: "Device", field: "fqdn", purpose: "formula" },
    });
    expect(fieldOf(model, "Vlan", "vlanId")).toMatchObject({ type: "number", integer: true, min: 1, max: 4094 });
    expect(fieldOf(model, "Site", "code")).toMatchObject({ type: "string", pattern: "^[A-Z]{3}[0-9]{2}$", multiline: false });
    expect(fieldOf(model, "Interface", "uplink")).toMatchObject({ type: "ref", target: ["Interface"], multiple: false, onDelete: "clear" });
    expect(fieldOf(model, "Device", "notes")).toMatchObject({ type: "doc", label: "備考" });
    expect(fieldOf(modelOf("budget"), "Entry", "amount")).toMatchObject({ type: "decimal", scale: 0, unit: "円" });
  });

  test("enums と enumRef の解決（values は解決済みのコピー）", () => {
    const model = modelOf("param-sheet");
    expect(model.enums.map((e) => e.id)).toEqual(["role"]);
    expect(model.enumIndex.get("role")?.values.map((v) => v.value)).toEqual(["core", "distribution", "access"]);
    const role = fieldOf(model, "Device", "role");
    expect(role).toMatchObject({ type: "enum", enumRef: "role", multiple: false });
    if (role.type !== "enum") throw new Error("enum ではない");
    expect(role.values?.map((v) => [v.value, v.label, v.deprecated])).toEqual([
      ["core", "コア", false],
      ["distribution", "ディストリビューション", false],
      ["access", "アクセス", false],
    ]);
    const timezone = fieldOf(model, "System", "timezone");
    if (timezone.type !== "enum") throw new Error("enum ではない");
    expect(timezone.values?.map((v) => v.value)).toEqual(["Asia/Tokyo", "UTC"]);
    expect("enumRef" in timezone).toBe(false);
  });

  test("unique と checks（severity の既定値）", () => {
    const model = modelOf("param-sheet");
    expect(model.typeIndex.get("Device")?.unique).toEqual([
      { index: 0, fields: ["hostname"], scope: "workbook", message: "ホスト名が重複しています" },
      { index: 1, fields: ["mgmtIp"], scope: "workbook", message: "管理IPが重複しています" },
    ]);
    expect(model.typeIndex.get("Interface")?.checks).toEqual([
      {
        index: 0,
        id: "accessSingleVlan",
        expr: { text: 'IF(mode = "access", vlanCount <= 1, TRUE)', owner: "Interface", check: "accessSingleVlan", purpose: "check" },
        severity: "error",
        message: "アクセスポートに複数のVLANが設定されています",
      },
    ]);
    expect(model.typeIndex.get("Device")?.checks[0]?.severity).toBe("warning");
    expect(model.typeIndex.get("Site")?.maxDepth).toBeUndefined();
    expect(model.typeIndex.get("Site")?.titleTemplate).toBe("{code} {name}");
  });

  test("computedFields と expressions の件数と順序", () => {
    const paramSheet = modelOf("param-sheet");
    expect(paramSheet.computedFields.map((c) => `${c.owner}.${c.field}`)).toEqual([
      "Site.deviceCount",
      "Device.fqdn",
      "Device.interfaceCount",
      "Device.vlanTotal",
      "System.ntp",
      "System.dns",
      "System.syslog",
      "Interface.vlanCount",
    ]);
    expect(paramSheet.expressions.map((e) => [e.purpose, e.owner, e.field, e.check])).toEqual([
      ["formula", "Device", "fqdn", undefined],
      ["check", "Device", undefined, "mgmtInSubnet"],
      ["check", "Interface", undefined, "accessSingleVlan"],
    ]);
    const budget = modelOf("budget");
    expect(budget.computedFields.map((c) => `${c.owner}.${c.field}`)).toEqual(["Root.grandTotal", "Category.total", "Account.total", "Account.months"]);
    expect(budget.expressions.map((e) => [e.purpose, e.owner, e.field])).toEqual([["rollupWhere", "Account", "months"]]);
  });

  test("トップレベルの属性と source", () => {
    const text = examplePart("wbs", "schema.json");
    const model = parseSchema(JSON.parse(text));
    expect(model).toMatchObject({ specVersion: "0.1", schemaVersion: 1, id: "wbs", title: "WBS" });
    expect(model.source).toEqual(JSON.parse(text));
  });
});

describe("S01：未定義の型への参照", () => {
  test("コードは S01", () => {
    expect(SCHEMA_DIAGNOSTIC_CODES.undefinedType).toBe("S01");
  });

  test("root.children", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(rootDef(s)["children"])["Nope"] = { cardinality: "many" };
    });
    const d = expectOnly(diagnostics, "S01", "undefinedType", { part: "schema.json", type: "Root" });
    expect(d.detail).toEqual({ reason: "undefinedType", where: "children", ref: "Nope" });
  });

  test("型の children", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(typeDef(s, "Site")["children"])["Nope"] = { cardinality: "one" };
    });
    expectOnly(diagnostics, "S01", "undefinedType", { part: "schema.json", type: "Site" });
  });

  test("ref.target（配列の位置付き）", () => {
    const { diagnostics } = load("wbs", (s) => {
      fieldDef(s, "Task", "dependsOn")["target"] = ["Task", "Nope"];
    });
    const d = expectOnly(diagnostics, "S01", "undefinedType", { part: "schema.json", type: "Task", field: "dependsOn" });
    expect(d.detail).toEqual({ reason: "undefinedType", where: "target", ref: "Nope", index: 1 });
  });

  test("inherit.fromType（S06 は出さない）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "System", "ntp")["inherit"] = { fromType: "Nope" };
    });
    const d = expectOnly(diagnostics, "S01", "undefinedType", { part: "schema.json", type: "System", field: "ntp" });
    expect(d.detail).toEqual({ reason: "undefinedType", where: "fromType", ref: "Nope" });
  });

  test("rollup.sourceType（S03〜S05 は出さない）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      rollupOf(s, "Site", "deviceCount")["sourceType"] = "Nope";
    });
    const d = expectOnly(diagnostics, "S01", "undefinedType", { part: "schema.json", type: "Site", field: "deviceCount" });
    expect(d.detail).toEqual({ reason: "undefinedType", where: "sourceType", ref: "Nope" });
  });

  test("unique.scope.ancestorType（配列の位置付き）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      uniqueOf(s, "Vlan", 0)["scope"] = { ancestorType: "Nope" };
    });
    const d = expectOnly(diagnostics, "S01", "undefinedType", { part: "schema.json", type: "Vlan" });
    expect(d.detail).toEqual({ reason: "undefinedType", where: "ancestorType", ref: "Nope", index: 0 });
  });

  test("定義済みの型（ancestorType を含む）では発生しない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      uniqueOf(s, "Vlan", 0)["scope"] = { ancestorType: "Device" };
    });
    expect(diagnostics).toEqual([]);
  });

  test('fromType: "Root" は root.fields があれば適合', () => {
    const { diagnostics } = load("param-sheet", (s) => {
      rootDef(s)["fields"] = { ntp: { type: "string", format: "host" } };
      fieldDef(s, "System", "ntp")["inherit"] = { fromType: "Root" };
    });
    expect(diagnostics).toEqual([]);
  });

  test('sourceType の "Root" は未定義の型として扱う', () => {
    const { diagnostics } = load("param-sheet", (s) => {
      rollupOf(s, "Site", "deviceCount")["sourceType"] = "Root";
    });
    expect(summary(diagnostics)).toEqual([["S01", "undefinedType", "Site", "deviceCount"]]);
  });
});

describe("S02：ルートから到達できない型", () => {
  test("到達できない型は warning で、読み取り専用にはならない", () => {
    const result = load("param-sheet", (s) => {
      obj(s["types"])["Orphan"] = { fields: {} };
    });
    expectOnly(result.diagnostics, "S02", "unreachable", { part: "schema.json", type: "Orphan" }, "warning");
    expect(result.readOnly).toBe(false);
    expect(result.model?.isReachable("Orphan")).toBe(false);
  });

  test("到達できる型（自己再帰を含む）では発生しない", () => {
    expect(load("wbs").diagnostics).toEqual([]);
  });

  test("到達できない型からだけ参照される型も到達できない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(s["types"])["Orphan"] = { fields: {}, children: { Leaf: { cardinality: "many" } } };
      obj(s["types"])["Leaf"] = { fields: {} };
    });
    expect(summary(diagnostics)).toEqual([
      ["S02", "unreachable", "Orphan", undefined],
      ["S02", "unreachable", "Leaf", undefined],
    ]);
  });
});

describe("S03：rollup の sourceType が depth の範囲にない", () => {
  test("children の範囲に存在しえない（Site の直接の子に Vlan はない）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      rollupOf(s, "Site", "deviceCount")["sourceType"] = "Vlan";
    });
    const d = expectOnly(diagnostics, "S03", "sourceOutOfRange", { part: "schema.json", type: "Site", field: "deviceCount" });
    expect(d.detail).toEqual({ reason: "sourceOutOfRange", sourceType: "Vlan", depth: "children" });
  });

  test("descendants なら発生しない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      rollupOf(s, "Site", "deviceCount")["sourceType"] = "Vlan";
      rollupOf(s, "Site", "deviceCount")["depth"] = "descendants";
    });
    expect(diagnostics).toEqual([]);
  });

  test("子孫にもない型", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(typeDef(s, "Vlan")["fields"])["sites"] = { type: "number", rollup: { sourceType: "Site", fn: "count", depth: "descendants" } };
    });
    expect(summary(diagnostics)).toEqual([["S03", "sourceOutOfRange", "Vlan", "sites"]]);
  });

  test("Root の rollup は全子孫を対象にできる（budget の grandTotal）", () => {
    expect(load("budget").diagnostics).toEqual([]);
  });
});

describe("S04：sourceField / weight と fn", () => {
  test("sourceField が存在しない（S05 は出さない）", () => {
    const { diagnostics } = load("wbs", (s) => {
      rollupOf(s, "Task", "effort")["sourceField"] = "nope";
    });
    const d = expectOnly(diagnostics, "S04", "missingSourceField", { part: "schema.json", type: "Task", field: "effort" });
    expect(d.detail).toEqual({ reason: "missingSourceField", fn: "sum", sourceType: "Task", sourceField: "nope" });
  });

  test("weight が存在しない", () => {
    const { diagnostics } = load("wbs", (s) => {
      rollupOf(s, "Task", "progress")["weight"] = "nope";
    });
    const d = expectOnly(diagnostics, "S04", "missingWeight", { part: "schema.json", type: "Task", field: "progress" });
    expect(d.detail).toMatchObject({ weight: "nope", fn: "wavg" });
  });

  test("fn と対象の型が合わない（sum に string）", () => {
    const { diagnostics } = load("wbs", (s) => {
      rollupOf(s, "Task", "effort")["sourceField"] = "name";
    });
    const d = expectOnly(diagnostics, "S04", "fnTypeMismatch", { part: "schema.json", type: "Task", field: "effort" });
    expect(d.detail).toEqual({ reason: "fnTypeMismatch", fn: "sum", sourceType: "Task", sourceField: "name", sourceFieldType: "string" });
  });

  test("weight の型が number / decimal でない", () => {
    const { diagnostics } = load("wbs", (s) => {
      rollupOf(s, "Task", "progress")["weight"] = "name";
    });
    const d = expectOnly(diagnostics, "S04", "weightTypeMismatch", { part: "schema.json", type: "Task", field: "progress" });
    expect(d.detail).toMatchObject({ weight: "name", weightType: "string" });
  });

  test("fn ごとの許容型：min に date、any に boolean、countDistinct に string は適合", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(typeDef(s, "Site")["fields"])["anyEnabled"] = { type: "boolean", rollup: { sourceType: "Interface", sourceField: "enabled", fn: "any", depth: "descendants" } };
      obj(typeDef(s, "Site")["fields"])["models"] = { type: "number", rollup: { sourceType: "Device", sourceField: "hostname", fn: "countDistinct" } };
    });
    expect(diagnostics).toEqual([]);
    expect(load("wbs").diagnostics).toEqual([]);
  });

  test("avg に boolean は不適合", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(typeDef(s, "Device")["fields"])["x"] = { type: "number", rollup: { sourceType: "Interface", sourceField: "enabled", fn: "avg" } };
    });
    expect(summary(diagnostics)).toEqual([["S04", "fnTypeMismatch", "Device", "x"]]);
  });
});

describe("S05：rollup の結果型とフィールドの type", () => {
  test("sum の結果（number）を string のフィールドに入れる", () => {
    const { diagnostics } = load("wbs", (s) => {
      obj(typeDef(s, "Task")["fields"])["effortText"] = { type: "string", rollup: { sourceType: "Task", sourceField: "effort", fn: "sum" } };
    });
    const d = expectOnly(diagnostics, "S05", "resultTypeMismatch", { part: "schema.json", type: "Task", field: "effortText" });
    expect(d.detail).toEqual({ reason: "resultTypeMismatch", expected: "number", actual: "string" });
  });

  test("min の結果（date）を datetime のフィールドに入れる", () => {
    const { diagnostics } = load("wbs", (s) => {
      obj(typeDef(s, "Task")["fields"])["startAt"] = { type: "datetime", rollup: { sourceType: "Task", sourceField: "start", fn: "min" } };
    });
    expect(summary(diagnostics)).toEqual([["S05", "resultTypeMismatch", "Task", "startAt"]]);
  });

  test("count の結果（number）を decimal のフィールドに入れる", () => {
    const { diagnostics } = load("budget", (s) => {
      fieldDef(s, "Account", "months")["type"] = "decimal";
      fieldDef(s, "Account", "months")["scale"] = 0;
      delete fieldDef(s, "Account", "months")["integer"];
    });
    expect(summary(diagnostics)).toEqual([["S05", "resultTypeMismatch", "Account", "months"]]);
  });

  test("S04 を出したフィールドでは S05 を出さない", () => {
    const { diagnostics } = load("wbs", (s) => {
      obj(typeDef(s, "Task")["fields"])["effortText"] = { type: "string", rollup: { sourceType: "Task", sourceField: "nope", fn: "sum" } };
    });
    expect(codes(diagnostics)).toEqual(["S04"]);
  });

  test("結果型が合えば発生しない（decimal の scale の差は不問）", () => {
    const { diagnostics } = load("budget", (s) => {
      fieldDef(s, "Category", "total")["scale"] = 2;
    });
    expect(diagnostics).toEqual([]);
  });
});

describe("S06：継承元", () => {
  test("fromType の型が祖先になりえない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "System", "ntp")["inherit"] = { fromType: "Vlan" };
    });
    const d = expectOnly(diagnostics, "S06", "noAncestorCandidate", { part: "schema.json", type: "System", field: "ntp" });
    expect(d.detail).toEqual({ reason: "noAncestorCandidate", fromType: "Vlan", field: "ntp", candidates: [] });
  });

  test("fromType の型に field がない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "System", "ntp")["inherit"] = { fromType: "Site", field: "nope" };
    });
    expect(summary(diagnostics)).toEqual([["S06", "noAncestorCandidate", "System", "ntp"]]);
  });

  test("fromType なしで、field を持つ祖先候補が 1 つもない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "System", "ntp")["inherit"] = true;
      typeDef(s, "Site")["fields"] = { code: fieldDef(s, "Site", "code") };
    });
    // Site.fields を code だけにしたので、ntp・dns・syslog の候補がなくなる（unique の code は残る）
    expect(summary(diagnostics)).toEqual([
      ["S06", "noAncestorCandidate", "System", "ntp"],
      ["S06", "noAncestorCandidate", "System", "dns"],
      ["S06", "noAncestorCandidate", "System", "syslog"],
    ]);
  });

  test("型が異なる（error）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "Site", "ntp")["type"] = "number";
      delete fieldDef(s, "Site", "ntp")["format"];
    });
    const d = expectOnly(diagnostics, "S06", "typeMismatch", { part: "schema.json", type: "System", field: "ntp" });
    expect(d.detail).toEqual({ reason: "typeMismatch", fromType: "Site", field: "ntp", candidates: [{ type: "Site", fieldType: "number" }] });
  });

  test("enum は値集合で比べる（集合が違えば error、順序だけ違えば適合）", () => {
    const withZone = (values: string[]) => (s: Obj) => {
      obj(typeDef(s, "Site")["fields"])["zone"] = { type: "enum", values: [{ value: "a" }, { value: "b" }] };
      obj(typeDef(s, "System")["fields"])["zone"] = { type: "enum", values: values.map((value) => ({ value })), inherit: true };
    };
    expect(summary(load("param-sheet", withZone(["a", "c"])).diagnostics)).toEqual([["S06", "typeMismatch", "System", "zone"]]);
    expect(load("param-sheet", withZone(["b", "a"])).diagnostics).toEqual([]);
  });

  test("format だけ異なる（warning、読み取り専用にはならない）", () => {
    const result = load("param-sheet", (s) => {
      fieldDef(s, "Site", "ntp")["format"] = "fqdn";
    });
    const d = expectOnly(result.diagnostics, "S06", "formatMismatch", { part: "schema.json", type: "System", field: "ntp" }, "warning");
    expect(d.detail).toEqual({ reason: "formatMismatch", fromType: "Site", field: "ntp", candidates: [{ type: "Site", fieldType: "string", format: "fqdn" }] });
    expect(result.readOnly).toBe(false);
  });

  test("fromType なしで候補が root.fields にだけある場合は発生しない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      rootDef(s)["fields"] = { ntp: { type: "string", format: "host" } };
      delete obj(typeDef(s, "Site")["fields"])["ntp"];
      fieldDef(s, "System", "ntp")["inherit"] = true;
    });
    expect(diagnostics).toEqual([]);
  });

  test("fromType なしの候補は祖先になりうるコンテナだけ（System に Device.ntp は候補、Vlan.ntp は候補外）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      delete obj(typeDef(s, "Site")["fields"])["ntp"];
      obj(typeDef(s, "Vlan")["fields"])["ntp"] = { type: "number" };
      obj(typeDef(s, "Device")["fields"])["ntp"] = { type: "string", format: "host" };
      fieldDef(s, "System", "ntp")["inherit"] = true;
    });
    expect(diagnostics).toEqual([]);
  });

  test('fromType: "Root" で root.fields にない', () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "System", "ntp")["inherit"] = { fromType: "Root" };
    });
    expect(summary(diagnostics)).toEqual([["S06", "noAncestorCandidate", "System", "ntp"]]);
  });

  test("自己再帰する型は自分自身から継承できる", () => {
    const { diagnostics } = load("wbs", (s) => {
      fieldDef(s, "Task", "assignee")["inherit"] = { fromType: "Task" };
    });
    expect(diagnostics).toEqual([]);
  });

  test("サンプルの継承（System ← Site）では発生しない", () => {
    expect(load("param-sheet").diagnostics).toEqual([]);
  });
});

describe("S09：列挙と default", () => {
  test("enumRef が未定義（default の列挙検査はスキップ）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "Device", "role")["enumRef"] = "nope";
      fieldDef(s, "Device", "role")["default"] = "anything";
    });
    const d = expectOnly(diagnostics, "S09", "undefinedEnumRef", { part: "schema.json", type: "Device", field: "role" });
    expect(d.detail).toEqual({ reason: "undefinedEnumRef", enumId: "nope" });
  });

  test("トップレベルの enums の値が重複（at は part だけ、detail に enumId）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      (obj(s["enums"])["role"] as unknown[]).push({ value: "core" }, { value: "core" });
    });
    const d = expectOnly(diagnostics, "S09", "duplicateEnumValue", { part: "schema.json" });
    expect(d.detail).toEqual({ reason: "duplicateEnumValue", enumId: "role", value: "core" });
  });

  test("インラインの values の値が重複", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      (fieldDef(s, "Interface", "mode")["values"] as unknown[]).push({ value: "access", label: "重複" });
    });
    const d = expectOnly(diagnostics, "S09", "duplicateEnumValue", { part: "schema.json", type: "Interface", field: "mode" });
    expect(d.detail).toEqual({ reason: "duplicateEnumValue", value: "access" });
  });

  describe("default の不適合", () => {
    const cases: [string, ExampleName, (s: Obj) => void, string, string][] = [
      ["integer に 1.5", "param-sheet", (s) => void (fieldDef(s, "Vlan", "vlanId")["default"] = 1.5), "Vlan", "integer"],
      ["number の max 超過", "param-sheet", (s) => void (fieldDef(s, "Vlan", "vlanId")["default"] = 5000), "Vlan", "max"],
      ["number に文字列", "param-sheet", (s) => void (fieldDef(s, "Vlan", "vlanId")["default"] = "1"), "Vlan", "jsonType"],
      ["pattern 不一致", "param-sheet", (s) => void (fieldDef(s, "Site", "code")["default"] = "abc"), "Site", "pattern"],
      ["maxLength 超過", "param-sheet", (s) => void (fieldDef(s, "Vlan", "name")["default"] = "x".repeat(33)), "Vlan", "maxLength"],
      ["enum 外の値", "param-sheet", (s) => void (fieldDef(s, "Interface", "mode")["default"] = "nope"), "Interface", "enumValue"],
      ["boolean に文字列", "param-sheet", (s) => void (fieldDef(s, "Interface", "enabled")["default"] = "yes"), "Interface", "jsonType"],
      ["ref が UUIDv4 でない", "param-sheet", (s) => void (fieldDef(s, "Interface", "uplink")["default"] = "NOT-A-UUID"), "Interface", "refFormat"],
      ["doc に .. を含む", "param-sheet", (s) => void (fieldDef(s, "Device", "notes")["default"] = "docs/../x.md"), "Device", "docPath"],
      ["decimal の桁超過", "budget", (s) => void (fieldDef(s, "Entry", "amount")["default"] = "1.5"), "Entry", "scale"],
      ["decimal の形式不正", "budget", (s) => void (fieldDef(s, "Entry", "amount")["default"] = "01"), "Entry", "decimalFormat"],
      ["存在しない日付", "wbs", (s) => void (fieldDef(s, "Task", "start")["default"] = "2026-02-30"), "Task", "dateFormat"],
    ];
    test.each(cases)("%s", (_label, name, mutate, type, violation) => {
      const { diagnostics } = load(name, mutate);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]).toMatchObject({ code: "S09", severity: "error", at: { part: "schema.json", type }, detail: { reason: "defaultInvalid", violation } });
    });

    test("decimal の min / max は桁を揃えて比べる", () => {
      const result = load("budget", (s) => {
        fieldDef(s, "Entry", "amount")["min"] = "-10";
        fieldDef(s, "Entry", "amount")["max"] = "100";
        fieldDef(s, "Entry", "amount")["default"] = "-11";
      });
      expect(result.diagnostics[0]?.detail?.["violation"]).toBe("min");
      const ok = load("budget", (s) => {
        fieldDef(s, "Entry", "amount")["min"] = "-10";
        fieldDef(s, "Entry", "amount")["max"] = "100";
        fieldDef(s, "Entry", "amount")["default"] = "100";
      });
      expect(ok.diagnostics).toEqual([]);
    });

    test("multiple の enum は重複のない配列", () => {
      const withDefault = (value: unknown) => (s: Obj) => {
        fieldDef(s, "Interface", "speed")["multiple"] = true;
        fieldDef(s, "Interface", "speed")["default"] = value;
      };
      expect(load("param-sheet", withDefault(["1g", "1g"])).diagnostics[0]?.detail?.["violation"]).toBe("duplicate");
      expect(load("param-sheet", withDefault("1g")).diagnostics[0]?.detail?.["violation"]).toBe("jsonType");
      expect(load("param-sheet", withDefault(["1g", "10g"])).diagnostics).toEqual([]);
    });

    test("datetime はオフセット必須の RFC 3339", () => {
      const withDatetime = (value: unknown) => (s: Obj) => {
        obj(typeDef(s, "Site")["fields"])["since"] = { type: "datetime", default: value };
      };
      expect(load("param-sheet", withDatetime("2026-09-16T10:00:00")).diagnostics[0]?.detail?.["violation"]).toBe("datetimeFormat");
      expect(load("param-sheet", withDatetime("2026-09-16T10:00:00+09:00")).diagnostics).toEqual([]);
      expect(load("param-sheet", withDatetime("2026-09-16T10:00:00.5Z")).diagnostics).toEqual([]);
    });
  });

  test("適合する default（閏日・空文字・deprecated の値・null）では発生しない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "Vlan", "vlanId")["default"] = 100;
      fieldDef(s, "Site", "code")["default"] = "ABC01";
      fieldDef(s, "Site", "name")["default"] = "";
      fieldDef(s, "Interface", "mode")["default"] = "trunk";
      fieldDef(s, "Interface", "mode")["values"] = [{ value: "access" }, { value: "trunk", deprecated: true }];
      fieldDef(s, "Interface", "uplink")["default"] = "413a04d8-4dd6-48d6-8291-37623d5745a3";
      fieldDef(s, "Device", "notes")["default"] = "docs/x/notes.md";
      fieldDef(s, "Interface", "enabled")["default"] = null;
      obj(typeDef(s, "Site")["fields"])["opened"] = { type: "date", default: "2024-02-29", min: "2000-01-01" };
    });
    expect(diagnostics).toEqual([]);
    expect(load("budget", (s) => void (fieldDef(s, "Entry", "amount")["default"] = "-1200")).diagnostics).toEqual([]);
  });
});

describe("S10：unique.fields に存在しないフィールド", () => {
  test("存在しないフィールド（at.field は該当 ID、detail.index は配列の位置）", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      uniqueOf(s, "Device", 1)["fields"] = ["mgmtIp", "nope"];
    });
    const d = expectOnly(diagnostics, "S10", "uniqueFieldMissing", { part: "schema.json", type: "Device", field: "nope" });
    expect(d.detail).toEqual({ reason: "uniqueFieldMissing", index: 1 });
  });

  test("存在するフィールドの組み合わせでは発生しない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      uniqueOf(s, "Device", 1)["fields"] = ["mgmtIp", "hostname"];
    });
    expect(diagnostics).toEqual([]);
  });
});

describe("S11：rollup のフィールドに required / default", () => {
  test('whenNoSource: "input" では発生しない（wbs）', () => {
    expect(load("wbs", (s) => void (fieldDef(s, "Task", "effort")["required"] = true)).diagnostics).toEqual([]);
  });

  test("input 以外で required: true", () => {
    const { diagnostics } = load("wbs", (s) => {
      rollupOf(s, "Task", "effort")["whenNoSource"] = "empty";
      fieldDef(s, "Task", "effort")["required"] = true;
    });
    const d = expectOnly(diagnostics, "S11", "rollupWithInput", { part: "schema.json", type: "Task", field: "effort" });
    expect(d.detail).toEqual({ reason: "rollupWithInput", has: ["required"] });
  });

  test("whenNoSource 省略（既定）で default がある", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "Site", "deviceCount")["default"] = 0;
    });
    const d = expectOnly(diagnostics, "S11", "rollupWithInput", { part: "schema.json", type: "Site", field: "deviceCount" });
    expect(d.detail).toEqual({ reason: "rollupWithInput", has: ["default"] });
  });

  test("required と default の両方", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      fieldDef(s, "Site", "deviceCount")["required"] = true;
      fieldDef(s, "Site", "deviceCount")["default"] = null;
    });
    expect(diagnostics[0]?.detail).toEqual({ reason: "rollupWithInput", has: ["required", "default"] });
  });

  test("required: false の明示は対象外", () => {
    expect(load("param-sheet", (s) => void (fieldDef(s, "Site", "deviceCount")["required"] = false)).diagnostics).toEqual([]);
  });
});

describe("S12：自己再帰しない型の maxDepth", () => {
  test("自己再帰する Task の maxDepth では発生しない（wbs）", () => {
    expect(load("wbs").diagnostics).toEqual([]);
  });

  test("自己再帰しない Site に maxDepth を付けると warning", () => {
    const result = load("param-sheet", (s) => {
      typeDef(s, "Site")["maxDepth"] = 3;
    });
    expectOnly(result.diagnostics, "S12", "maxDepthWithoutRecursion", { part: "schema.json", type: "Site" }, "warning");
    expect(result.readOnly).toBe(false);
  });

  test("間接の再帰（A → B → A）は直接の自己再帰ではない", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      typeDef(s, "Vlan")["children"] = { Interface: { cardinality: "many" } };
      typeDef(s, "Interface")["maxDepth"] = 2;
    });
    expect(summary(diagnostics)).toEqual([["S12", "maxDepthWithoutRecursion", "Interface", undefined]]);
  });
});

describe("S13：ルートノードに関する違反", () => {
  test("root.fields に inherit がある", () => {
    const { diagnostics } = load("budget", (s) => {
      rootFieldDef(s, "currentMonth")["inherit"] = true;
    });
    expectOnly(diagnostics, "S13", "inheritOnRoot", { part: "schema.json", type: "Root", field: "currentMonth" });
  });

  test("types に Root が定義されている（types には入れない）", () => {
    const result = load("param-sheet", (s) => {
      obj(s["types"])["Root"] = { fields: {} };
    });
    expectOnly(result.diagnostics, "S13", "rootTypeDeclared", { part: "schema.json" });
    expect(result.model?.rootTypeDeclared).toBe(true);
    expect(result.model?.types.map((t) => t.name)).not.toContain("Root");
    expect(result.model?.typeIndex.has("Root")).toBe(false);
  });

  test("params のキーが root.fields にない（コードポイント順）", () => {
    const { diagnostics } = load("budget", undefined, ["zz", "fiscalYear", "aa"]);
    expect(summary(diagnostics)).toEqual([
      ["S13", "unknownParam", "Root", "aa"],
      ["S13", "unknownParam", "Root", "zz"],
    ]);
    expect(diagnostics[0]?.at).toEqual({ part: "schema.json", type: "Root", field: "aa" });
  });

  test("paramKeys を省略すると params は検査しない", () => {
    expect(loadSchema(examplePart("budget", "schema.json")).diagnostics).toEqual([]);
    expect(load("param-sheet", undefined, ["anything"]).diagnostics).toHaveLength(1);
  });

  test("フィールド ID が予約語 parent / root（types と root.fields の両方）", () => {
    const { diagnostics } = load("budget", (s) => {
      obj(rootDef(s)["fields"])["root"] = { type: "string" };
      obj(typeDef(s, "Entry")["fields"])["parent"] = { type: "string" };
    });
    expect(summary(diagnostics)).toEqual([
      ["S13", "reservedFieldId", "Root", "root"],
      ["S13", "reservedFieldId", "Entry", "parent"],
    ]);
  });

  test("適合するルート定義（root.fields の rollup / formula と params）では発生しない", () => {
    const { diagnostics } = load("budget", (s) => {
      obj(rootDef(s)["fields"])["label"] = { type: "string", formula: 'fiscalYear & "年度"' };
    });
    expect(diagnostics).toEqual([]);
  });
});

describe("readOnly の判定", () => {
  test("warning だけ（S02 と S12）では false", () => {
    const result = load("param-sheet", (s) => {
      obj(s["types"])["Orphan"] = { fields: {}, maxDepth: 2 };
    });
    expect(codes(result.diagnostics)).toEqual(["S02", "S12"]);
    expect(result.readOnly).toBe(false);
    expect(hasSchemaError(result.diagnostics)).toBe(false);
  });

  test("error があれば true", () => {
    const result = load("param-sheet", (s) => {
      obj(s["types"])["Orphan"] = { fields: {} };
      uniqueOf(s, "Vlan", 0)["fields"] = ["nope"];
    });
    expect(codes(result.diagnostics)).toEqual(["S10", "S02"]);
    expect(result.readOnly).toBe(true);
    expect(hasSchemaError(result.diagnostics)).toBe(true);
    expect(result.model).toBeDefined();
  });

  test("構造不正では model が無く、構造検証のコードで true", () => {
    for (const text of ["{ not json", '{"specVersion":"0.1"}', mutated("wbs", (s) => void (s["schemaVersion"] = "1"))]) {
      const result = loadSchema(text);
      expect(result.model).toBeUndefined();
      expect(result.readOnly).toBe(true);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics.every((d) => d.code === STRUCTURE_DIAGNOSTIC_CODES.schema)).toBe(true);
    }
  });

  test("BOM 付きのテキストを受理し、part を指定できる", () => {
    const BOM = String.fromCharCode(0xfeff);
    const result = loadSchema(`${BOM}${mutated("param-sheet", (s) => void (typeDef(s, "Site")["maxDepth"] = 1))}`, { part: "sub/schema.json" });
    expect(result.model).toBeDefined();
    expect(result.diagnostics.map((d) => d.at)).toEqual([{ part: "sub/schema.json", type: "Site" }]);
  });
});

describe("診断の順序", () => {
  /** 複数の違反を仕込む。 */
  function breakMany(s: Obj): void {
    obj(s["types"])["Root"] = { fields: {} };
    (obj(s["enums"])["role"] as unknown[]).push({ value: "access" });
    obj(s["types"])["Orphan"] = { fields: {}, maxDepth: 2 };
    obj(typeDef(s, "Site")["children"])["Nope"] = { cardinality: "many" };
    fieldDef(s, "Site", "code")["default"] = "bad";
    rollupOf(s, "Site", "deviceCount")["sourceType"] = "Vlan";
    uniqueOf(s, "Site", 0)["fields"] = ["nope"];
    fieldDef(s, "Device", "role")["enumRef"] = "nope";
    fieldDef(s, "System", "ntp")["inherit"] = { fromType: "Vlan" };
  }
  const paramKeys = ["zz", "aa"];
  const expected = [
    ["S13", "rootTypeDeclared", undefined, undefined],
    ["S09", "duplicateEnumValue", undefined, undefined],
    ["S13", "unknownParam", "Root", "aa"],
    ["S13", "unknownParam", "Root", "zz"],
    ["S01", "undefinedType", "Site", undefined],
    ["S09", "defaultInvalid", "Site", "code"],
    ["S03", "sourceOutOfRange", "Site", "deviceCount"],
    ["S10", "uniqueFieldMissing", "Site", "nope"],
    ["S09", "undefinedEnumRef", "Device", "role"],
    ["S06", "noAncestorCandidate", "System", "ntp"],
    ["S02", "unreachable", "Orphan", undefined],
    ["S12", "maxDepthWithoutRecursion", "Orphan", undefined],
  ];

  test("全体 → コンテナ（Root → types の宣言順）→ 型レベル → フィールド → unique の順で固定される", () => {
    const text = mutated("param-sheet", breakMany);
    expect(summary(loadSchema(text, { paramKeys }).diagnostics)).toEqual(expected);
  });

  test("types のキー順を入れ替えると順序が追従する", () => {
    const text = mutated("param-sheet", (s) => {
      breakMany(s);
      s["types"] = Object.fromEntries(Object.entries(obj(s["types"])).reverse());
    });
    expect(summary(loadSchema(text, { paramKeys }).diagnostics)).toEqual([
      ...expected.slice(0, 4),
      ["S02", "unreachable", "Orphan", undefined],
      ["S12", "maxDepthWithoutRecursion", "Orphan", undefined],
      ["S06", "noAncestorCandidate", "System", "ntp"],
      ["S09", "undefinedEnumRef", "Device", "role"],
      ["S01", "undefinedType", "Site", undefined],
      ["S09", "defaultInvalid", "Site", "code"],
      ["S03", "sourceOutOfRange", "Site", "deviceCount"],
      ["S10", "uniqueFieldMissing", "Site", "nope"],
    ]);
  });

  test("1 フィールド内の順序：S13 reservedFieldId → S01 → S09 → S03 → S09 default → S11", () => {
    const { diagnostics } = load("param-sheet", (s) => {
      obj(typeDef(s, "Site")["fields"])["parent"] = {
        type: "enum",
        enumRef: "nope",
        default: 1,
        rollup: { sourceType: "Vlan", fn: "count" },
      };
    });
    expect(summary(diagnostics)).toEqual([
      ["S13", "reservedFieldId", "Site", "parent"],
      ["S09", "undefinedEnumRef", "Site", "parent"],
      ["S03", "sourceOutOfRange", "Site", "parent"],
      ["S05", "resultTypeMismatch", "Site", "parent"],
      ["S09", "defaultInvalid", "Site", "parent"],
      ["S11", "rollupWithInput", "Site", "parent"],
    ]);
  });

  test("同じ入力には同じ出力を返す", () => {
    const text = mutated("param-sheet", breakMany);
    const a = loadSchema(text, { paramKeys });
    const b = loadSchema(text, { paramKeys });
    expect(a.diagnostics).toEqual(b.diagnostics);
    expect(a.readOnly).toBe(b.readOnly);
    expect(a.model?.computedFields).toEqual(b.model?.computedFields);
    expect(a.model?.expressions).toEqual(b.model?.expressions);
  });
});
