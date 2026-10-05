// メタスキーマ（meta/*.v0.1.json）による構造検証（本体仕様 §12 の手順 1・2、View 仕様 §9 の手順 1）。
// JSON の構文エラーとメタスキーマへの違反を Diagnostic（パート名・data.jsonl は 1 始まりの行番号付き）にする。
// 参照解決・型整合などの意味検証（S 系・D02 以降・V 系）は扱わない。`load` 不要の純粋関数で、Host を必要としない。
//
// 検証関数は Ajv の standalone コード生成で作り、コミットしている（src/generated/、`pnpm generate`）。
//
// 診断コードについて（PR の「仕様の確認事項」にも記載）：
//  - data.jsonl の行は D01（本体仕様 §12.2「JSON の構文エラー、またはレコード形式への違反」）。
//  - schema.json・workbook.json・View 定義・marks の構造不正には、仕様がコードを定めていない（本体仕様 §12 の
//    手順 1 と View 仕様 §9 の手順 1 は「構造検証（メタスキーマ）」を挙げるが、S 系・D 系・V 系の表に該当する
//    コードがない）。ここでは暫定として、各系列の未使用の番号 00 を使う（S00・D00・V00）。仕様で番号が定まったら
//    STRUCTURE_DIAGNOSTIC_CODES を直す。
//
// 仕様に明記がなく、保守的に解釈した点：
//  1. 先頭の BOM と CRLF は受理する（本体仕様 §2.2 規則 1 の読み込み時の扱いに揃える）。
//  2. data.jsonl の空行（空白だけの行を含む）は D01 とする。末尾の改行 1 つの後ろにできる空の断片は行と数えない。
//  3. `validateParts` は存在するパートだけを検証する。必須パートの欠落は読み込み（L-05）の役割とする。
//     views/ 配下は拡張子（`.view.json` / `.marks.json`）で View 定義と marks を見分け、それ以外のパート
//     （docs/ など）は対象にしない。
//  4. JSON の構文エラーの位置や理由は、JavaScript エンジンごとに例外のメッセージが異なり決定性を損なうので、
//     診断に含めない。
import type { Diagnostic, PartMap, PartPath } from "./api.ts";
import { compareCodePoints } from "./compare.ts";
import * as meta from "./generated/meta-validators.js";
import type { MetaValidationError, MetaValidator } from "./generated/meta-validators.js";

/** 構造検証の対象となるパートの種類。 */
export type MetaPartKind = "workbook" | "schema" | "record" | "view" | "marks";

/** 構造不正の `detail.reason`。呼び出し側が原因を区別するための識別子。 */
export type StructureErrorReason =
  | "json" // JSON として解釈できない
  | "empty-line" // data.jsonl の空行
  | "schema"; // メタスキーマへの違反（`keyword`・`instancePath` などを併せて持つ）

/** パートの種類ごとの診断コード。record 以外は暫定（冒頭の注）。 */
export const STRUCTURE_DIAGNOSTIC_CODES: Readonly<Record<MetaPartKind, string>> = {
  workbook: "D00",
  schema: "S00",
  record: "D01",
  view: "V00",
  marks: "V00",
};

const META_SCHEMA_IDS: Readonly<Record<MetaPartKind, string>> = {
  workbook: "urn:tsheet:meta:workbook:0.1",
  schema: "urn:tsheet:meta:schema:0.1",
  record: "urn:tsheet:meta:record:0.1",
  view: "urn:tsheet:meta:view:0.1",
  marks: "urn:tsheet:meta:marks:0.1",
};

const LABELS: Readonly<Record<MetaPartKind, string>> = {
  workbook: "マニフェスト",
  schema: "スキーマ定義",
  record: "レコード",
  view: "View 定義",
  marks: "手動書式（marks）",
};

const VALIDATORS: Readonly<Record<MetaPartKind, MetaValidator>> = {
  workbook: meta.workbook,
  schema: meta.schema,
  record: meta.record,
  view: meta.view,
  marks: meta.marks,
};

const BOM = "﻿";

function stripBom(text: string): string {
  return text.startsWith(BOM) ? text.slice(1) : text;
}

function at(part: PartPath, line: number | undefined): NonNullable<Diagnostic["at"]> {
  return line === undefined ? { part } : { part, line };
}

/** JSON のテキストを解析し、適合すれば診断なし。構文エラーとメタスキーマ違反を 1 件ずつ診断にする。 */
function validateJson(kind: MetaPartKind, text: string, part: PartPath, line?: number): Diagnostic[] {
  const code = STRUCTURE_DIAGNOSTIC_CODES[kind];
  const label = LABELS[kind];
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    return [
      {
        code,
        severity: "error",
        message: `${label}が JSON として解釈できません`,
        at: at(part, line),
        detail: { reason: "json" satisfies StructureErrorReason },
      },
    ];
  }
  const validate = VALIDATORS[kind];
  if (validate(value)) return [];
  const errors: MetaValidationError[] = validate.errors ?? [];
  return errors.map((e) => ({
    code,
    severity: "error",
    message: `${label}がメタスキーマに違反しています（${e.instancePath === "" ? "/" : e.instancePath}）: ${e.message ?? e.keyword}`,
    at: at(part, line),
    detail: {
      reason: "schema" satisfies StructureErrorReason,
      metaSchema: META_SCHEMA_IDS[kind],
      keyword: e.keyword,
      instancePath: e.instancePath,
      schemaPath: e.schemaPath,
      params: e.params,
    },
  }));
}

/** `workbook.json`（本体仕様 §2.3、`urn:tsheet:meta:workbook:0.1`）の構造検証。 */
export function validateWorkbookJson(text: string, part: PartPath = "workbook.json"): Diagnostic[] {
  return validateJson("workbook", stripBom(text), part);
}

/** `schema.json`（本体仕様 §3〜§9、`urn:tsheet:meta:schema:0.1`）の構造検証。 */
export function validateSchemaJson(text: string, part: PartPath = "schema.json"): Diagnostic[] {
  return validateJson("schema", stripBom(text), part);
}

/**
 * `data.jsonl` の 1 行（本体仕様 §11、`urn:tsheet:meta:record:0.1`）の構造検証。違反は D01。
 * @param line 1 始まりの行番号（診断の `at.line` に入れる）
 */
export function validateRecordLine(text: string, line: number, part: PartPath = "data.jsonl"): Diagnostic[] {
  if (text.trim() === "") {
    return [
      {
        code: STRUCTURE_DIAGNOSTIC_CODES.record,
        severity: "error",
        message: "空行です（1 行に 1 レコードを書く）",
        at: { part, line },
        detail: { reason: "empty-line" satisfies StructureErrorReason },
      },
    ];
  }
  return validateJson("record", text, part, line);
}

/** `data.jsonl` 全体の構造検証。各行を `validateRecordLine` で検証し、行番号付きの D01 を返す。 */
export function validateDataJsonl(text: string, part: PartPath = "data.jsonl"): Diagnostic[] {
  const lines = stripBom(text).replaceAll("\r\n", "\n").split("\n");
  // 改行で終わる内容は末尾に空要素ができる（§11.1 規則 1）。これは行ではない。
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  const out: Diagnostic[] = [];
  for (let i = 0; i < lines.length; i++) out.push(...validateRecordLine(lines[i] ?? "", i + 1, part));
  return out;
}

/** View 定義 `views/<name>.view.json`（View 仕様、`urn:tsheet:meta:view:0.1`）の構造検証。 */
export function validateViewJson(text: string, part: PartPath): Diagnostic[] {
  return validateJson("view", stripBom(text), part);
}

/** 手動書式 `views/<name>.marks.json`（View 仕様 §8.2、`urn:tsheet:meta:marks:0.1`）の構造検証。 */
export function validateMarksJson(text: string, part: PartPath): Diagnostic[] {
  return validateJson("marks", stripBom(text), part);
}

/** 検証の順序（本体仕様 §12 の処理順に、マニフェストを先頭に置いたもの）。対象外は -1。 */
function kindOf(path: PartPath): MetaPartKind | undefined {
  if (path === "workbook.json") return "workbook";
  if (path === "schema.json") return "schema";
  if (path === "data.jsonl") return "record";
  if (path.startsWith("views/")) {
    if (path.endsWith(".view.json")) return "view";
    if (path.endsWith(".marks.json")) return "marks";
  }
  return undefined;
}

const KIND_ORDER: Readonly<Record<MetaPartKind, number>> = { workbook: 0, schema: 1, record: 2, view: 3, marks: 3 };

/**
 * パートの集合に含まれる対象パートをすべて構造検証する。診断は、マニフェスト → スキーマ → データ → views/
 * （コードポイント順）の順で、`parts` のキーの順序によらず固定される。対象外のパート（docs/ など）は無視する。
 */
export function validateParts(parts: PartMap): Diagnostic[] {
  const targets: [PartPath, MetaPartKind][] = [];
  for (const path of Object.keys(parts)) {
    const kind = kindOf(path);
    if (kind !== undefined) targets.push([path, kind]);
  }
  targets.sort(([pa, ka], [pb, kb]) => KIND_ORDER[ka] - KIND_ORDER[kb] || compareCodePoints(pa, pb));

  const out: Diagnostic[] = [];
  for (const [path, kind] of targets) {
    const text = parts[path] ?? "";
    switch (kind) {
      case "workbook":
        out.push(...validateWorkbookJson(text, path));
        break;
      case "schema":
        out.push(...validateSchemaJson(text, path));
        break;
      case "record":
        out.push(...validateDataJsonl(text, path));
        break;
      case "view":
        out.push(...validateViewJson(text, path));
        break;
      case "marks":
        out.push(...validateMarksJson(text, path));
        break;
    }
  }
  return out;
}
