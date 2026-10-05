// 単一ファイル形式（`.tsheet`）の pack / unpack（本体仕様 §2.2、エンジン API 仕様 §11）。
// どちらも `load` 不要の純粋関数で、Host を必要としない。
//
// 構造不正（D21）があっても `unpack` は失敗にせず、解析できた範囲のパートと D21 の診断を `UnpackResult` で返す
// （#98 の決定。Host はこれを `load` に渡し、読み取り専用で開く）。原因（`detail.reason`）ごとの復旧の仕方：
//
//  | reason               | 診断の位置                | 返すパート                                                     |
//  |----------------------|---------------------------|----------------------------------------------------------------|
//  | missing-header       | 1 行目                    | 1 行目を先頭行とみなさず、1 行目から区切り行として解析する      |
//  | unsupported-version  | 1 行目                    | 2 行目から通常どおり解析する                                   |
//  | missing-end          | 最終行                    | 最後の（途切れた）パートも含めてすべて返す                     |
//  | invalid-path         | その `%%part` 行          | そのパートの内容を読み飛ばす（順序の検査にも使わない）         |
//  | part-order           | その `%%part` 行（part）  | 順序違反のパートはそのまま返す。重複は最初のものを残し、後のものの内容を読み飛ばす |
//  | unknown-directive    | その行（part）            | その行だけを読み飛ばす（パートの内容には含めない）             |
//  | content-outside-part | 最初の該当行              | 最初の `%%part` より前の内容を読み飛ばす（診断は 1 件にまとめる） |
//  | content-after-end    | `%%end` の次の行          | `%%end` より後ろをすべて読み飛ばす                             |
//
// 仕様に明記がなく、保守的に解釈した点（PR の「仕様の確認事項」にも記載）：
//  1. `%%tsheet` のバージョンが対応バージョンと完全一致しないファイルは D21（unsupported-version）とする（§2.2 規則 2）。
//  2. パートパスは §2.2 規則 4 の順序に位置づけられるもの（`workbook.json`・`schema.json`・`views/…`・
//     `data.jsonl`・`docs/…`）だけを受理する。それ以外は順序が定まらないので「不正なパートパス」とする（規則 3）。
//     `..` は「含んではならない」の文言どおり、セグメント単位ではなく部分文字列として拒否する。
//     `\`・制御文字・空のセグメント・`.` のセグメントも拒否する。
//  3. 同じパスのパートが 2 回現れた場合は、パート順序の違反（D21）とする。
//  4. `%%end` の後ろに許すのは改行 1 つだけ。それ以外の内容（空行を含む）があれば D21 とする。
//  5. `%%` で始まり `%%%` で始まらない行は区切り行としてだけ解釈する。`%%part <path>`・`%%end` の
//     どちらにも一致しない行（未知の指示、末尾に空白のある `%%end`、2 行目以降の `%%tsheet`）は D21 とする。
//  6. 規則 3 により、パートの内容は「改行で終わる行の並び」としてしか表現できない。`pack` は、空でなく
//     改行で終わらない内容に改行を 1 つ補う（空の内容は 0 行のまま往復する）。`unpack` も、途切れて改行で
//     終わらない最終行に改行を補う。
//  7. `pack` は契約上エラーを返す経路がない（`Promise<string>`）。不正なパスを含む `PartMap` からは
//     読み戻せないファイルしか作れないので、例外を投げる。
//  8. 規則 1 の正規化は、`pack` では各パートの内容にも適用する（CRLF → LF、先頭の BOM の除去）。
//     単独の CR は改行として扱わず、そのまま残す。
import type { Diagnostic, PartMap, PartPath, UnpackResult } from "./api.ts";
import { FORMAT_VERSION } from "./version.ts";

const BOM = "﻿";
const HEADER_PREFIX = "%%tsheet ";
const PART_PREFIX = "%%part ";
const END_LINE = "%%end";

/** D21 の `detail.reason`。呼び出し側が原因を区別するための識別子。 */
export type UnpackErrorReason =
  | "missing-header"
  | "unsupported-version"
  | "missing-end"
  | "invalid-path"
  | "part-order"
  | "unknown-directive"
  | "content-outside-part"
  | "content-after-end";

/** コードポイント順の比較（UTF-16 のコード単位順ではない。サロゲートペアで結果が変わる）。 */
function compareCodePoints(a: string, b: string): number {
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const ca = a.codePointAt(i) ?? 0;
    const cb = b.codePointAt(j) ?? 0;
    if (ca !== cb) return ca < cb ? -1 : 1;
    i += ca > 0xffff ? 2 : 1;
    j += cb > 0xffff ? 2 : 1;
  }
  return a.length - i - (b.length - j);
}

/** §2.2 規則 4 の順序での区分。順序に位置づけられないパスは -1。 */
function partRank(path: PartPath): number {
  if (path === "workbook.json") return 0;
  if (path === "schema.json") return 1;
  if (path.startsWith("views/")) return 2;
  if (path === "data.jsonl") return 3;
  if (path.startsWith("docs/")) return 4;
  return -1;
}

function comparePartPaths(a: PartPath, b: PartPath): number {
  const d = partRank(a) - partRank(b);
  return d !== 0 ? d : compareCodePoints(a, b);
}

function hasControlChar(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return true;
  }
  return false;
}

/** パートパスとして受理できるか（§2.2 規則 3・4、冒頭の注 2）。 */
function isValidPartPath(path: string): boolean {
  if (partRank(path) < 0) return false; // 絶対パス（先頭の `/`）やドライブ名もここで落ちる
  if (path.includes("..") || path.includes("\\") || hasControlChar(path)) return false;
  return path.split("/").every((seg) => seg !== "" && seg !== ".");
}

/** 先頭の BOM を除去し、CRLF を LF にする（§2.2 規則 1）。 */
function normalizeText(text: string): string {
  const s = text.startsWith(BOM) ? text.slice(1) : text;
  return s.replaceAll("\r\n", "\n");
}

/**
 * パートの集合を単一ファイル形式のテキストにする（§2.2）。
 * 出力は LF・BOM なしで、パートの順序は `parts` のキーの順序によらず固定される。
 * 不正なパートパスがあれば TypeError を投げる（冒頭の注 7）。
 */
export function pack(parts: PartMap): string {
  const paths = Object.keys(parts);
  for (const path of paths) {
    if (!isValidPartPath(path)) {
      throw new TypeError(`D21: 不正なパートパスです: ${JSON.stringify(path)}`);
    }
  }
  paths.sort(comparePartPaths);

  let out = `${HEADER_PREFIX}${FORMAT_VERSION}\n`;
  for (const path of paths) {
    out += `${PART_PREFIX}${path}\n`;
    const content = normalizeText(parts[path] ?? "");
    if (content === "") continue;
    const lines = content.split("\n");
    // 改行で終わる内容は末尾に空要素ができる。終わらない内容には最終行の改行を補うことになる（冒頭の注 6）。
    if (lines[lines.length - 1] === "") lines.pop();
    for (const line of lines) {
      out += line.startsWith("%%") ? `%${line}\n` : `${line}\n`;
    }
  }
  return `${out}${END_LINE}\n`;
}

/**
 * 単一ファイル形式のテキストをパートの集合に戻す（§2.2）。CRLF と BOM を受理する。
 * 構造が不正でも例外や失敗にはせず、解析できた範囲の `parts` と D21 の `diagnostics` を返す（冒頭の表）。
 * 正しいファイルでは `diagnostics` は空になる。D21 の原因は `detail.reason`（UnpackErrorReason）、
 * 位置は `at.line`（単一ファイル内の 1 始まりの行番号）と `at.part` で示す。
 */
export function unpack(single: string): UnpackResult {
  const diagnostics: Diagnostic[] = [];
  const d21 = (reason: UnpackErrorReason, message: string, line: number, part?: PartPath): void => {
    diagnostics.push({
      code: "D21",
      severity: "error",
      message,
      at: part === undefined ? { line } : { part, line },
      detail: { reason },
    });
  };

  const lines = normalizeText(single).split("\n");
  const header = lines[0] ?? "";
  let start = 1; // 区切り行の解析を始める行（0 始まりの添字）
  if (!header.startsWith(HEADER_PREFIX)) {
    d21("missing-header", "1 行目が `%%tsheet <specVersion>` ではありません", 1);
    start = 0; // 先頭行がないので、1 行目も区切り行・内容として解析する
  } else {
    const version = header.slice(HEADER_PREFIX.length);
    if (version !== FORMAT_VERSION) {
      d21("unsupported-version", `対応していない形式バージョンです: ${JSON.stringify(version)}（対応: ${FORMAT_VERSION}）`, 1);
    }
  }

  // キーは isValidPartPath を通ったものだけなので、`__proto__` などが入ることはない。
  const parts: PartMap = {};
  let current: PartPath | undefined; // 内容を受け取るパート。不正・重複したパートでは undefined
  let inPart = false;
  let previous: PartPath | undefined; // 順序の検査用：直前の有効なパート
  let buffer = "";
  let ended = false;
  let outsideReported = false;

  const flush = (): void => {
    if (current !== undefined) parts[current] = buffer;
    buffer = "";
  };

  let i = start;
  for (; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const lineNo = i + 1;
    if (line.startsWith("%%") && !line.startsWith("%%%")) {
      if (line === END_LINE) {
        flush();
        ended = true;
        i++;
        break;
      }
      if (!line.startsWith(PART_PREFIX)) {
        d21("unknown-directive", `解釈できない区切り行です: ${JSON.stringify(line)}`, lineNo, current);
        continue; // この行だけを読み飛ばす
      }
      flush();
      inPart = true;
      current = undefined;
      const path = line.slice(PART_PREFIX.length);
      if (!isValidPartPath(path)) {
        d21("invalid-path", `不正なパートパスです: ${JSON.stringify(path)}`, lineNo);
        continue; // current が undefined のままなので、このパートの内容は読み飛ばされる
      }
      if (previous !== undefined && comparePartPaths(previous, path) >= 0) {
        const message =
          previous === path
            ? `パートが重複しています: ${path}`
            : `パートの順序が不正です: ${path} は ${previous} より前になければなりません`;
        d21("part-order", message, lineNo, path);
      }
      // 重複したパートは最初の内容を残し、後のものの内容は読み飛ばす。順序違反だけのパートはそのまま受け取る。
      if (!Object.hasOwn(parts, path)) current = path;
      previous = path;
      continue;
    }
    if (i === lines.length - 1 && line === "") break; // 途切れたファイルの末尾の改行。下で missing-end になる
    if (!inPart) {
      if (!outsideReported) d21("content-outside-part", "最初の `%%part` より前に内容があります", lineNo);
      outsideReported = true;
      continue;
    }
    buffer += `${line.startsWith("%%%") ? line.slice(1) : line}\n`;
  }

  if (!ended) {
    flush(); // 途切れた最後のパートも返す
    d21("missing-end", "`%%end` がありません（ファイルが途中で途切れています）", lines.length);
  } else if (!(i === lines.length || (i === lines.length - 1 && lines[i] === ""))) {
    d21("content-after-end", "`%%end` の後ろに内容があります", i + 1);
  }

  return { parts, diagnostics };
}
