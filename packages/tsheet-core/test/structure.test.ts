import { describe, expect, test } from "vitest";
import {
  STRUCTURE_DIAGNOSTIC_CODES,
  validateDataJsonl,
  validateMarksJson,
  validateParts,
  validateRecordLine,
  validateSchemaJson,
  validateViewJson,
  validateWorkbookJson,
  type Diagnostic,
  type PartMap,
} from "../src/index.ts";

// サンプルのワークブック。Node とブラウザの両方で動かすため、node:fs ではなく Vite の glob import で読む。
const exampleFiles = import.meta.glob<string>("../../../examples/**", {
  query: "?raw",
  import: "default",
  eager: true,
});

const EXAMPLES = ["param-sheet", "budget", "wbs"] as const;

function exampleParts(name: string): PartMap {
  const prefix = `../../../examples/${name}/`;
  const parts: PartMap = {};
  for (const [file, content] of Object.entries(exampleFiles)) {
    if (file.startsWith(prefix)) parts[file.slice(prefix.length)] = content;
  }
  return parts;
}

function examplePart(name: string, path: string): string {
  const text = exampleParts(name)[path];
  if (text === undefined) throw new Error(`サンプルにパートがない: ${name}/${path}`);
  return text;
}

/** サンプルの JSON を読み、`mutate` で壊してから文字列に戻す。 */
function mutated(name: string, path: string, mutate: (value: Record<string, unknown>) => void): string {
  const value = JSON.parse(examplePart(name, path)) as Record<string, unknown>;
  mutate(value);
  return JSON.stringify(value);
}

function firstRecordLine(name: string): string {
  const line = examplePart(name, "data.jsonl").split("\n")[0];
  if (line === undefined || line === "") throw new Error(`サンプルの data.jsonl が空: ${name}`);
  return line;
}

const reasons = (ds: Diagnostic[]): unknown[] => ds.map((d) => d.detail?.["reason"]);
const keywords = (ds: Diagnostic[]): unknown[] => ds.map((d) => d.detail?.["keyword"]);
const paths = (ds: Diagnostic[]): unknown[] => ds.map((d) => d.detail?.["instancePath"]);

function expectAll(ds: Diagnostic[], code: string, at: NonNullable<Diagnostic["at"]>): void {
  expect(ds.length).toBeGreaterThan(0);
  for (const d of ds) {
    expect(d.code).toBe(code);
    expect(d.severity).toBe("error");
    expect(d.message).not.toBe("");
    expect(d.at).toEqual(at);
  }
}

describe("サンプルのワークブック", () => {
  test.each(EXAMPLES)("%s：validateParts が診断を返さない", (name) => {
    const parts = exampleParts(name);
    expect(Object.keys(parts)).toContain("workbook.json");
    expect(Object.keys(parts)).toContain("schema.json");
    expect(Object.keys(parts)).toContain("data.jsonl");
    expect(Object.keys(parts).some((p) => p.endsWith(".view.json"))).toBe(true);
    expect(validateParts(parts)).toEqual([]);
  });

  test.each(EXAMPLES)("%s：パートごとの関数でも診断を返さない", (name) => {
    const parts = exampleParts(name);
    expect(validateWorkbookJson(examplePart(name, "workbook.json"))).toEqual([]);
    expect(validateSchemaJson(examplePart(name, "schema.json"))).toEqual([]);
    expect(validateDataJsonl(examplePart(name, "data.jsonl"))).toEqual([]);
    for (const [path, text] of Object.entries(parts)) {
      if (path.endsWith(".view.json")) expect(validateViewJson(text, path)).toEqual([]);
      if (path.endsWith(".marks.json")) expect(validateMarksJson(text, path)).toEqual([]);
    }
  });

  test("param-sheet には marks がある（marks の検証がサンプルで通ることの確認）", () => {
    expect(Object.keys(exampleParts("param-sheet"))).toContain("views/default.marks.json");
  });
});

describe("data.jsonl のレコード（D01）", () => {
  const good = firstRecordLine("param-sheet");

  test("コードは D01", () => {
    expect(STRUCTURE_DIAGNOSTIC_CODES.record).toBe("D01");
  });

  test("適合する行では発生しない", () => {
    expect(validateRecordLine(good, 1)).toEqual([]);
  });

  test("JSON の構文エラー：行番号付きの D01（理由は json）", () => {
    const ds = validateRecordLine('{"id": ', 7);
    expectAll(ds, "D01", { part: "data.jsonl", line: 7 });
    expect(reasons(ds)).toEqual(["json"]);
  });

  test("空行：D01（理由は empty-line）", () => {
    const ds = validateRecordLine("   ", 2);
    expectAll(ds, "D01", { part: "data.jsonl", line: 2 });
    expect(reasons(ds)).toEqual(["empty-line"]);
  });

  test("必須キー（values）の欠落：keyword は required", () => {
    const record = JSON.parse(good) as Record<string, unknown>;
    delete record["values"];
    const ds = validateRecordLine(JSON.stringify(record), 3);
    expectAll(ds, "D01", { part: "data.jsonl", line: 3 });
    expect(reasons(ds)).toEqual(["schema"]);
    expect(keywords(ds)).toEqual(["required"]);
    expect(ds[0]?.detail?.["params"]).toEqual({ missingProperty: "values" });
    expect(ds[0]?.detail?.["metaSchema"]).toBe("urn:tsheet:meta:record:0.1");
  });

  test("型の誤り（order が数値）：keyword は type", () => {
    const record = JSON.parse(good) as Record<string, unknown>;
    record["order"] = 1;
    const ds = validateRecordLine(JSON.stringify(record), 1);
    expectAll(ds, "D01", { part: "data.jsonl", line: 1 });
    expect(keywords(ds)).toEqual(["type"]);
    expect(paths(ds)).toEqual(["/order"]);
  });

  test("additionalProperties: false に反する未知のキー", () => {
    const record = JSON.parse(good) as Record<string, unknown>;
    record["extra"] = true;
    const ds = validateRecordLine(JSON.stringify(record), 1);
    expectAll(ds, "D01", { part: "data.jsonl", line: 1 });
    expect(keywords(ds)).toEqual(["additionalProperties"]);
    expect(ds[0]?.detail?.["params"]).toEqual({ additionalProperty: "extra" });
  });

  test("id が UUIDv4 の形式でない：keyword は pattern", () => {
    const record = JSON.parse(good) as Record<string, unknown>;
    record["id"] = "NOT-A-UUID";
    const ds = validateRecordLine(JSON.stringify(record), 1);
    expectAll(ds, "D01", { part: "data.jsonl", line: 1 });
    expect(keywords(ds)).toEqual(["pattern"]);
    expect(paths(ds)).toEqual(["/id"]);
  });

  test("レコードがオブジェクトでない（配列）", () => {
    const ds = validateRecordLine("[]", 1);
    expectAll(ds, "D01", { part: "data.jsonl", line: 1 });
    expect(keywords(ds)).toEqual(["type"]);
    expect(paths(ds)).toEqual([""]);
    expect(ds[0]?.message).toContain("（/）");
  });

  test("validateDataJsonl：壊れた行だけが 1 始まりの行番号で報告される", () => {
    const text = `${good}\n{broken\n${good}\n\n`;
    const ds = validateDataJsonl(text);
    expect(ds.map((d) => [d.code, d.at?.line, d.detail?.["reason"]])).toEqual([
      ["D01", 2, "json"],
      ["D01", 4, "empty-line"],
    ]);
  });

  test("validateDataJsonl：末尾の改行の後ろは行と数えず、CRLF と BOM を受理する", () => {
    const BOM = String.fromCharCode(0xfeff);
    expect(validateDataJsonl(`${BOM}${good}\r\n${good}\r\n`)).toEqual([]);
    expect(validateDataJsonl(`${good}\n`)).toEqual([]);
    expect(validateDataJsonl(good)).toEqual([]);
    expect(validateDataJsonl("")).toEqual([]);
  });

  test("validateDataJsonl：パート名を指定できる", () => {
    const ds = validateDataJsonl("{", "other.jsonl");
    expect(ds[0]?.at).toEqual({ part: "other.jsonl", line: 1 });
  });
});

describe("schema.json（S14）", () => {
  test("コードは S14", () => {
    expect(STRUCTURE_DIAGNOSTIC_CODES.schema).toBe("S14");
  });

  test("適合するスキーマでは発生しない", () => {
    expect(validateSchemaJson(examplePart("wbs", "schema.json"))).toEqual([]);
  });

  test("JSON の構文エラー：行番号なし・パート名付き", () => {
    const ds = validateSchemaJson("{ not json");
    expectAll(ds, "S14", { part: "schema.json" });
    expect(reasons(ds)).toEqual(["json"]);
  });

  test("必須キー（types）の欠落", () => {
    const ds = validateSchemaJson(
      mutated("param-sheet", "schema.json", (s) => {
        delete s["types"];
      }),
    );
    expectAll(ds, "S14", { part: "schema.json" });
    expect(keywords(ds)).toEqual(["required"]);
    expect(ds[0]?.detail?.["metaSchema"]).toBe("urn:tsheet:meta:schema:0.1");
  });

  test("型の誤り（schemaVersion が文字列）", () => {
    const ds = validateSchemaJson(
      mutated("param-sheet", "schema.json", (s) => {
        s["schemaVersion"] = "1";
      }),
    );
    expectAll(ds, "S14", { part: "schema.json" });
    expect(keywords(ds)).toEqual(["type"]);
    expect(paths(ds)).toEqual(["/schemaVersion"]);
  });

  test("未知のトップレベルキー", () => {
    const ds = validateSchemaJson(
      mutated("param-sheet", "schema.json", (s) => {
        s["unknownKey"] = 1;
      }),
    );
    expectAll(ds, "S14", { part: "schema.json" });
    expect(keywords(ds)).toEqual(["additionalProperties"]);
  });

  /** param-sheet の Site.code など、string 型フィールドの `pattern` を差し替える。 */
  function withPattern(pattern: string): string {
    return mutated("param-sheet", "schema.json", (s) => {
      const types = s["types"] as Record<string, { fields: Record<string, Record<string, unknown>> }>;
      const field = Object.values(types)
        .flatMap((t) => Object.values(t.fields))
        .find((f) => f["type"] === "string");
      if (!field) throw new Error("string 型のフィールドがサンプルにない");
      field["pattern"] = pattern;
    });
  }

  // フィールド定義は if/then と unevaluatedProperties で型ごとの属性を限定しているので、format の違反に続けて
  // `if`・`unevaluatedProperties` の違反も報告される（allErrors）。先頭が format であることを確かめる。
  test("pattern が正規表現として不正：keyword は format（regex）", () => {
    const ds = validateSchemaJson(withPattern("(unclosed"));
    expectAll(ds, "S14", { part: "schema.json" });
    expect(keywords(ds)[0]).toBe("format");
    expect(String(paths(ds)[0])).toMatch(/\/pattern$/);
    expect(ds[0]?.detail?.["params"]).toEqual({ format: "regex" });
  });

  test("pattern の `\\Z` は ECMAScript にないので不正とする（ajv-formats と同じ）", () => {
    expect(keywords(validateSchemaJson(withPattern("^abc\\Z")))[0]).toBe("format");
  });

  test("pattern が正当な正規表現なら発生しない", () => {
    expect(validateSchemaJson(withPattern("^[A-Z]{2}-[0-9]+$"))).toEqual([]);
  });

  test("ユニコードを含む pattern も正当", () => {
    expect(validateSchemaJson(withPattern("^[ぁ-ん]+$"))).toEqual([]);
  });
});

describe("workbook.json（D24）", () => {
  test("コードは D24", () => {
    expect(STRUCTURE_DIAGNOSTIC_CODES.workbook).toBe("D24");
  });

  test("適合するマニフェストでは発生しない", () => {
    expect(validateWorkbookJson(examplePart("budget", "workbook.json"))).toEqual([]);
  });

  test("JSON の構文エラー", () => {
    const ds = validateWorkbookJson("");
    expectAll(ds, "D24", { part: "workbook.json" });
    expect(reasons(ds)).toEqual(["json"]);
  });

  test("必須キー（dataSchemaVersion）の欠落", () => {
    const ds = validateWorkbookJson(
      mutated("budget", "workbook.json", (w) => {
        delete w["dataSchemaVersion"];
      }),
    );
    expectAll(ds, "D24", { part: "workbook.json" });
    expect(keywords(ds)).toEqual(["required"]);
    expect(ds[0]?.detail?.["metaSchema"]).toBe("urn:tsheet:meta:workbook:0.1");
  });

  test("specVersion の値が違う：keyword は const", () => {
    const ds = validateWorkbookJson(
      mutated("budget", "workbook.json", (w) => {
        w["specVersion"] = "0.2";
      }),
    );
    expectAll(ds, "D24", { part: "workbook.json" });
    expect(keywords(ds)).toEqual(["const"]);
  });

  test("settings の未知のキー", () => {
    const ds = validateWorkbookJson(
      mutated("budget", "workbook.json", (w) => {
        w["settings"] = { unknown: 1 };
      }),
    );
    expectAll(ds, "D24", { part: "workbook.json" });
    expect(keywords(ds)).toEqual(["additionalProperties"]);
    expect(paths(ds)).toEqual(["/settings"]);
  });

  test("パート名を指定できる", () => {
    expect(validateWorkbookJson("{", "sub/workbook.json")[0]?.at).toEqual({ part: "sub/workbook.json" });
  });
});

describe("View 定義（V16）", () => {
  const part = "views/default.view.json";

  test("コードは V16", () => {
    expect(STRUCTURE_DIAGNOSTIC_CODES.view).toBe("V16");
  });

  test("適合する View 定義では発生しない", () => {
    expect(validateViewJson(examplePart("wbs", part), part)).toEqual([]);
  });

  test("JSON の構文エラー", () => {
    const ds = validateViewJson("[", part);
    expectAll(ds, "V16", { part });
    expect(reasons(ds)).toEqual(["json"]);
  });

  test("必須キー（columns）の欠落", () => {
    const ds = validateViewJson(
      mutated("wbs", part, (v) => {
        delete v["columns"];
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toEqual(["required"]);
    expect(ds[0]?.detail?.["metaSchema"]).toBe("urn:tsheet:meta:view:0.1");
  });

  test("mode が列挙値にない", () => {
    const ds = validateViewJson(
      mutated("wbs", part, (v) => {
        v["mode"] = "grid";
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toEqual(["enum"]);
    expect(paths(ds)).toEqual(["/mode"]);
  });

  test("未知のトップレベルキー", () => {
    const ds = validateViewJson(
      mutated("wbs", part, (v) => {
        v["layout"] = {};
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toEqual(["additionalProperties"]);
  });
});

describe("手動書式 marks（V16）", () => {
  const part = "views/default.marks.json";
  const good = examplePart("param-sheet", part);

  test("コードは V16", () => {
    expect(STRUCTURE_DIAGNOSTIC_CODES.marks).toBe("V16");
  });

  test("適合する marks では発生しない", () => {
    expect(validateMarksJson(good, part)).toEqual([]);
  });

  test("JSON の構文エラー", () => {
    const ds = validateMarksJson("{,}", part);
    expectAll(ds, "V16", { part });
    expect(reasons(ds)).toEqual(["json"]);
  });

  test("必須キー（view）の欠落", () => {
    const ds = validateMarksJson(
      mutated("param-sheet", part, (m) => {
        delete m["view"];
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toEqual(["required"]);
    expect(ds[0]?.detail?.["metaSchema"]).toBe("urn:tsheet:meta:marks:0.1");
  });

  test("records のキーがレコード ID の形式でない：keyword は propertyNames", () => {
    const ds = validateMarksJson(
      mutated("param-sheet", part, (m) => {
        m["records"] = { "not-an-id": { height: 20 } };
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toContain("propertyNames");
  });

  test("style が view のメタスキーマの $defs/style に反する（スキーマ間の $ref）", () => {
    const ds = validateMarksJson(
      mutated("param-sheet", part, (m) => {
        const records = m["records"] as Record<string, Record<string, unknown>>;
        const first = Object.values(records)[0];
        if (!first) throw new Error("サンプルの marks にレコードがない");
        first["style"] = { bold: "yes" };
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toEqual(["type"]);
    expect(String(paths(ds)[0])).toMatch(/^\/records\/[0-9a-f-]+\/style\/bold$/);
  });

  test("型の誤り（height が文字列）", () => {
    const ds = validateMarksJson(
      mutated("param-sheet", part, (m) => {
        const records = m["records"] as Record<string, Record<string, unknown>>;
        for (const r of Object.values(records)) r["height"] = "44";
      }),
      part,
    );
    expectAll(ds, "V16", { part });
    expect(keywords(ds)).toEqual(["type", "type"]);
  });
});

describe("validateParts", () => {
  const base = exampleParts("param-sheet");

  test("壊れたパートごとに、パート名付きの診断を返す", () => {
    const parts: PartMap = {
      ...base,
      "workbook.json": "{",
      "views/default.view.json": "{}",
      "data.jsonl": `${firstRecordLine("param-sheet")}\nnope\n`,
    };
    const ds = validateParts(parts);
    const summary = ds.map((d) => [d.code, d.at?.part, d.at?.line]);
    expect(summary).toContainEqual(["D24", "workbook.json", undefined]);
    expect(summary).toContainEqual(["D01", "data.jsonl", 2]);
    expect(summary.filter(([code]) => code === "V16").every(([, part]) => part === "views/default.view.json")).toBe(true);
    expect(summary.some(([code]) => code === "V16")).toBe(true);
    expect(summary.some(([code]) => code === "S14")).toBe(false);
  });

  test("診断の順序はキーの順序によらず、マニフェスト → スキーマ → データ → views/ で固定される", () => {
    const broken: PartMap = {
      "views/z.marks.json": "{",
      "data.jsonl": "{\n",
      "views/a.view.json": "{",
      "schema.json": "{",
      "workbook.json": "{",
    };
    const order = validateParts(broken).map((d) => d.at?.part);
    expect(order).toEqual(["workbook.json", "schema.json", "data.jsonl", "views/a.view.json", "views/z.marks.json"]);
    const reversed = Object.fromEntries(Object.entries(broken).reverse());
    expect(validateParts(reversed).map((d) => d.at?.part)).toEqual(order);
  });

  test("docs/ と views/ 配下の対象外のファイルは検証しない", () => {
    const parts: PartMap = {
      ...base,
      "docs/413a04d8-4dd6-48d6-8291-37623d5745a3/notes.md": "{ not json",
      "views/readme.txt": "{ not json",
    };
    expect(validateParts(parts)).toEqual([]);
  });

  test("パートがなければ何も返さない（欠落の検出は読み込みの役割）", () => {
    expect(validateParts({})).toEqual([]);
  });

  test("同じ入力には同じ出力を返す", () => {
    const parts: PartMap = { ...base, "schema.json": '{"specVersion":"0.1"}' };
    expect(validateParts(parts)).toEqual(validateParts(parts));
  });
});
