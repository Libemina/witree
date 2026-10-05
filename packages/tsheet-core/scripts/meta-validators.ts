// meta/ の 5 つのメタスキーマ（JSON Schema Draft 2020-12）から、Ajv の standalone コード生成で
// 検証関数を作る（ADR-0001：実行時に `new Function` を使わず、Tauri の CSP とブラウザで動かすため）。
//
// 生成結果は src/generated/ にコミットする（`pnpm install && pnpm test` にビルド手順を要らなくするため）。
// コミット済みの出力が最新であることは test/meta-validators-generated.test.ts（リポジトリ全体のテスト）が確かめる。
//
// Ajv の ESM 出力は、補助関数（文字数の計算・深い等価）を `require("ajv/dist/runtime/…")` で読み込む形で
// 出力する。ここでは生成後にそれらを src/meta-runtime.ts への参照に置き換え、`require` が残っていないことを
// 確かめる。これにより Ajv は生成時だけの依存（devDependency）になり、実行時の依存にはならない。
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { _, Name } from "ajv/dist/compile/codegen/index.js";
// CommonJS の既定エクスポート。ESM からは `module.exports`（= 関数）が既定 import になり、`.default` も同じ関数。
import standalone from "ajv/dist/standalone/index.js";
import { regex } from "../src/meta-runtime.ts";

export const META_NAMES = ["workbook", "schema", "record", "view", "marks"] as const;
export type MetaName = (typeof META_NAMES)[number];

export const META_SCHEMA_IDS: Readonly<Record<MetaName, string>> = {
  workbook: "urn:tsheet:meta:workbook:0.1",
  schema: "urn:tsheet:meta:schema:0.1",
  record: "urn:tsheet:meta:record:0.1",
  view: "urn:tsheet:meta:view:0.1",
  marks: "urn:tsheet:meta:marks:0.1",
};

/** 生成コードの中で src/meta-runtime.ts を参照する名前。 */
const RUNTIME = "runtime";
const RUNTIME_IMPORT = `import * as ${RUNTIME} from "../meta-runtime.ts";`;

/** Ajv が出力する `require(...)` と、置き換え先の補助関数。 */
const REQUIRE_REPLACEMENTS: Readonly<Record<string, string>> = {
  'require("ajv/dist/runtime/ucs2length").default': `${RUNTIME}.ucs2length`,
  'require("ajv/dist/runtime/equal").default': `${RUNTIME}.equal`,
};

/** 生成コードに現れてはならない語（tsheet-core の決定性の規約。eslint.config.js の禁止一覧に対応する）。 */
export const FORBIDDEN_IN_GENERATED: readonly RegExp[] = [
  /\brequire\(/,
  /\bnew Function\b/,
  /\beval\(/,
  /\bDate\b/,
  /\bIntl\b/,
  /\bglobalThis\b/,
  /\blocaleCompare\b/,
  /\btoLocale\w*\b/,
  /\bMath\.random\b/,
  /\bsetTimeout\b|\bsetInterval\b|\bsetImmediate\b|\bqueueMicrotask\b/,
  /\bperformance\b/,
  /\bcrypto\b/,
];

export interface GeneratedMetaValidators {
  /** src/generated/meta-validators.js の内容 */
  js: string;
  /** src/generated/meta-validators.d.ts の内容 */
  dts: string;
}

function readMetaSchema(metaDir: string, name: MetaName): object {
  const text = readFileSync(join(metaDir, `${name}.v0.1.json`), "utf8");
  const schema: unknown = JSON.parse(text);
  if (typeof schema !== "object" || schema === null || !("$id" in schema) || schema.$id !== META_SCHEMA_IDS[name]) {
    throw new Error(`meta/${name}.v0.1.json の $id が ${META_SCHEMA_IDS[name]} ではありません`);
  }
  return schema;
}

/**
 * メタスキーマから検証関数のモジュール（JS と型定義）を生成する。出力は入力だけで決まる（決定的）。
 * @param metaDir リポジトリの meta/ ディレクトリ
 */
export function generateMetaValidators(metaDir: string): GeneratedMetaValidators {
  const ajv = new Ajv2020({
    allErrors: true,
    // 生成コードは `runtime.formats.<name>` で format の判定関数を参照する
    code: { source: true, esm: true, lines: true, formats: _`${new Name(RUNTIME)}.formats` },
  });
  // meta/schema.v0.1.json が `pattern` の値に `format: "regex"` を使う。判定関数は実行時と同じものを登録する。
  // 関数として登録する（オブジェクト形式だと生成コードが `.validate` を呼ぶ形になり、runtime.formats と合わない）。
  ajv.addFormat("regex", regex);
  // marks は `urn:tsheet:meta:view:0.1#/$defs/style` を参照するので、全部を登録してから生成する。
  for (const name of META_NAMES) ajv.addSchema(readMetaSchema(metaDir, name));

  const exports: Record<string, string> = {};
  for (const name of META_NAMES) exports[name] = META_SCHEMA_IDS[name];
  let code = standalone.default(ajv, exports);

  code = code.replace(/^"use strict";\n?/, "");
  for (const [from, to] of Object.entries(REQUIRE_REPLACEMENTS)) code = code.replaceAll(from, to);
  for (const pattern of FORBIDDEN_IN_GENERATED) {
    const m = pattern.exec(code);
    if (m) throw new Error(`生成コードに禁止された語が含まれています: ${m[0]}`);
  }

  const header = [
    "// このファイルは scripts/generate-meta-validators.ts が meta/*.v0.1.json から生成した（`pnpm generate`）。",
    "// 手で編集しない。メタスキーマを変えたら再生成してコミットする。",
    "// Ajv standalone（ESM）の出力から、`require` による補助関数の読み込みを ../meta-runtime.ts への参照に置き換えている。",
    RUNTIME_IMPORT,
    "",
  ].join("\n");
  const js = `${header}${code.endsWith("\n") ? code : `${code}\n`}`;

  const dts = [
    "// このファイルは scripts/generate-meta-validators.ts が生成した（`pnpm generate`）。手で編集しない。",
    "",
    "/** Ajv の ErrorObject と同じ形。Ajv の型には依存しない。 */",
    "export interface MetaValidationError {",
    "  /** 違反した値の位置（JSON Pointer。ルートは空文字列） */",
    "  instancePath: string;",
    "  /** 違反したスキーマのキーワードの位置（JSON Pointer） */",
    "  schemaPath: string;",
    '  /** 違反したキーワード（"required"・"type"・"additionalProperties" など） */',
    "  keyword: string;",
    "  /** キーワードごとの付加情報（`missingProperty`・`additionalProperty` など） */",
    "  params: Record<string, unknown>;",
    "  message?: string;",
    "}",
    "",
    "/** 生成された検証関数。適合すれば true。false のときは `errors` に違反が入る（allErrors）。 */",
    "export interface MetaValidator {",
    "  (data: unknown): boolean;",
    "  errors?: MetaValidationError[] | null;",
    "}",
    "",
    ...META_NAMES.map((name) => `/** ${META_SCHEMA_IDS[name]} */\nexport const ${name}: MetaValidator;`),
    "",
  ].join("\n");

  return { js, dts };
}
