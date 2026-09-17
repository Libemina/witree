// L-12: examples/ 配下のすべてのサンプルワークブックが、meta/ のメタスキーマ（JSON Schema Draft 2020-12）の
// 構造検証を通り、data.jsonl が正規化済みの並び（本体仕様 §11.1）になっていることを確かめる。
// 意味検証（S 系・D 系・V 系）はエンジンの役割で、ここでは扱わない。
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import addFormats from "ajv-formats";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import { describe, expect, test } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplesDir = join(root, "examples");

function readText(path: string): string {
  return readFileSync(path, "utf8");
}

function readJson(path: string): unknown {
  return JSON.parse(readText(path));
}

// メタスキーマどうしは $ref で参照し合っていない（それぞれ $id: urn:tsheet:meta:<name>:0.1 を持つ独立したスキーマ）。
// meta/schema.v0.1.json が `format: "regex"` を使うので ajv-formats を登録する。
const ajv = new Ajv2020({ allErrors: true });
addFormats.default(ajv);

type MetaName = "workbook" | "schema" | "record" | "view" | "marks";

function compileMeta(name: MetaName): ValidateFunction {
  return ajv.compile(readJson(join(root, "meta", `${name}.v0.1.json`)) as object);
}

const meta: Record<MetaName, ValidateFunction> = {
  workbook: compileMeta("workbook"),
  schema: compileMeta("schema"),
  record: compileMeta("record"),
  view: compileMeta("view"),
  marks: compileMeta("marks"),
};

/** 検証エラーを「場所: 内容」の配列にする。適合していれば空配列。 */
function violations(name: MetaName, value: unknown): string[] {
  const validate = meta[name];
  if (validate(value)) return [];
  return (validate.errors ?? []).map((e) => `${e.instancePath || "/"}: ${e.message ?? e.keyword}`);
}

interface RecordLine {
  id: string;
  parent: string | null;
}

function isRecordLine(value: unknown): value is RecordLine {
  if (typeof value !== "object" || value === null) return false;
  const { id, parent } = value as Record<string, unknown>;
  return typeof id === "string" && (typeof parent === "string" || parent === null);
}

/** data.jsonl を行に分ける。末尾の改行 1 つを除き、空行は残す（空行があれば検証で失敗させる）。 */
function dataLines(example: string): string[] {
  const text = readText(join(examplesDir, example, "data.jsonl"));
  expect(text.endsWith("\n"), "ファイル末尾に改行がある").toBe(true);
  expect(text.includes("\r"), "改行は LF のみ").toBe(false);
  return text.slice(0, -1).split("\n");
}

const examples = readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

test("サンプルが見つかる", () => {
  expect(examples).toEqual(expect.arrayContaining(["budget", "param-sheet", "wbs"]));
});

describe.each(examples)("examples/%s", (example) => {
  const dir = join(examplesDir, example);
  const viewFiles = readdirSync(join(dir, "views")).sort();

  test("workbook.json がメタスキーマに適合する", () => {
    expect(violations("workbook", readJson(join(dir, "workbook.json")))).toEqual([]);
  });

  test("schema.json がメタスキーマに適合する", () => {
    expect(violations("schema", readJson(join(dir, "schema.json")))).toEqual([]);
  });

  test("data.jsonl の各行がメタスキーマに適合する", () => {
    const lines = dataLines(example);
    expect(lines.length).toBeGreaterThan(0);
    const failed = lines.flatMap((line, i) =>
      violations("record", JSON.parse(line)).map((v) => `${i + 1} 行目 ${v}`),
    );
    expect(failed).toEqual([]);
  });

  test("data.jsonl は id 順で、id が一意で、parent が存在する", () => {
    const records = dataLines(example).map((line): RecordLine => {
      const record: unknown = JSON.parse(line);
      if (!isRecordLine(record)) throw new Error(`レコードの形式ではない行: ${line}`);
      return record;
    });
    const ids = records.map((r) => r.id);
    // UUID は ASCII なので、既定の sort（UTF-16 コードユニット順）がコードポイント順と一致する。
    expect(ids).toEqual([...ids].sort());
    expect(new Set(ids).size).toBe(ids.length);
    const known = new Set(ids);
    const orphans = records.filter((r) => r.parent !== null && !known.has(r.parent)).map((r) => r.id);
    expect(orphans).toEqual([]);
  });

  test("data.jsonl の各行が正規化済みの JSON である（空白なし・非 ASCII はエスケープしない）", () => {
    // JSON.stringify は空白を入れず、非 ASCII をエスケープしないので、往復で一致すれば足りる。
    // 値そのものの正規化（decimal の桁数など）はスキーマに依存するので、エンジンの役割とする。
    const changed = dataLines(example).filter((line) => JSON.stringify(JSON.parse(line)) !== line);
    expect(changed).toEqual([]);
  });

  test("data.jsonl のキーが正規の順序である（レコードは規定順、values はコードポイント順）", () => {
    const canonical = ["id", "type", "parent", "order", "created", "updated", "createdBy", "updatedBy", "values"];
    const failed = dataLines(example).filter((line) => {
      const record = JSON.parse(line) as { values: Record<string, unknown> };
      const keys = Object.keys(record);
      const valueKeys = Object.keys(record.values);
      // フィールド ID は ASCII（^[a-z][A-Za-z0-9_]*$）なので、既定の sort がコードポイント順と一致する。
      return (
        keys.join() !== canonical.filter((k) => keys.includes(k)).join() ||
        valueKeys.join() !== [...valueKeys].sort().join()
      );
    });
    expect(failed).toEqual([]);
  });

  test("views/ に View 定義がある", () => {
    expect(viewFiles.filter((f) => f.endsWith(".view.json")).length).toBeGreaterThan(0);
  });

  test.each(viewFiles.filter((f) => f.endsWith(".view.json")))("views/%s がメタスキーマに適合する", (file) => {
    expect(violations("view", readJson(join(dir, "views", file)))).toEqual([]);
  });

  test.each(viewFiles.filter((f) => f.endsWith(".marks.json")))("views/%s がメタスキーマに適合する", (file) => {
    expect(violations("marks", readJson(join(dir, "views", file)))).toEqual([]);
  });
});
