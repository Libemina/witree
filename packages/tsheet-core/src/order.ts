// 分数インデックス `order` の生成と比較、兄弟の並び替え（本体仕様 §11「order の扱い」、§12.2 の D16、
// エンジン API 仕様 §5.2、ADR-0002）。エンジンの状態に依存しない純粋関数で、Host を必要としない。
//
// 生成方式（#21 の決定。Figma / rocicorp の fractional-indexing と同じ考え方を、文字集合 0-9A-Za-z で行う）：
//  - 桁は DIGITS の 62 文字。ASCII のコードポイント順がそのまま桁の大小になるので、比較は compareCodePoints でよい。
//  - キーは「整数部 ＋ 小数部」。整数部の桁数は先頭の 1 文字で決まり、`a`..`z` が 2..27 桁、`Z`..`A` が 2..27 桁
//    （`Z` が最短）。整数部より後ろが小数部で、空でもよい。
//      例：`a0`（整数部 a0、小数部なし）、`a0V`（整数部 a0、小数部 V）、`b00`（整数部 b00）
//  - 最初のキーは `a0`。末尾への追加は整数部を 1 増やす（a0, a1, …, az, b00, …, bzz, c000, …）ので N 回で
//    長さは約 log62 N。先頭への追加は整数部を 1 減らす（Zz, Zy, …, Z0, Yzz, …）。
//  - 2 つのキーの間は、整数部が同じなら小数部の中点、違えば a の整数部 ＋ 1 が b より小さければそれ、そうでなければ
//    a の小数部と上限の中点。中点は最初に異なる桁の中間 `(da + db + 1) >> 1` で、差が 1 なら桁を下げて続ける
//    （同じ位置へ繰り返し挿入すると約 5〜6 回ごとに 1 文字伸びる）。浮動小数点は使わない。
//
// 入力の扱い：
//  - `^[0-9A-Za-z]+$` に合う文字列はすべて受け付ける。上の構造に合わないキー（先頭が数字、整数部の桁が足りないなど）や
//    小数部の末尾が 0 のキー（サンプルの `a00` など）も拒否せず、常に a < 結果 < b（コードポイント順）を返す。
//    構造を解析できないキーは文字列全体の中点で扱い、b が null で a < "a0" なら "a0" を返して構造に戻す。
//  - 自分が返した値が次の挿入を不可能にしないよう、`b` が「候補の後ろに 0 だけを付けた形」（候補 c に対して c0、c00、…）
//    になる候補は選ばない（c と c0 の間には入る値が存在しないため）。入る値がそれしかないときだけ末尾 0 の値を返す。
//  - 前提違反（英数字以外・空文字、a >= b、間に入る値が存在しない `("a0", "a00")` のような組）は呼び出し側のバグなので、
//    診断ではなく固定のメッセージの TypeError を投げる。
import type { Diagnostic, NodeId, Order, OrderBetween } from "./api.ts";
import { compareCodePoints } from "./compare.ts";

/** 桁の文字集合。ASCII のコードポイント順（0-9 < A-Z < a-z）がそのまま桁の大小になる。 */
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = DIGITS.length;
const ZERO = "0";
const MAX_DIGIT = "z";
/** 最初のキー（兄弟がいないときの `orderBetween(null, null)`）。 */
const FIRST_ORDER = "a0";

const MSG_INVALID = "order は英数字（0-9A-Za-z）1 文字以上でなければなりません";
const MSG_NOT_LESS = "a は b より小さくなければなりません（コードポイント順）";
const MSG_NO_ROOM = "a と b の間に入る order がありません（b が a の後ろに 0 を付けた形）";

/** D16 の `detail.reason`。 */
type OrderDiagnosticReason = "duplicate-order";

function digitIndex(ch: string): number {
  return DIGITS.indexOf(ch);
}

/** `^[0-9A-Za-z]+$` に合うか。 */
function isOrderText(s: string): boolean {
  if (s === "") return false;
  for (let i = 0; i < s.length; i++) {
    if (digitIndex(s.charAt(i)) < 0) return false;
  }
  return true;
}

/** 先頭の文字が表す整数部の桁数（先頭を含む）。英字でなければ 0（構造を持たない）。 */
function integerLength(head: string): number {
  const c = head.charCodeAt(0);
  if (c >= 0x61 && c <= 0x7a) return c - 0x61 + 2; // a..z → 2..27
  if (c >= 0x41 && c <= 0x5a) return 0x5a - c + 2; // Z..A → 2..27
  return 0;
}

interface ParsedOrder {
  readonly integer: string;
  readonly fraction: string;
}

/** キーを整数部と小数部に分ける。構造に合わなければ null。 */
function parseOrder(key: string): ParsedOrder | null {
  const len = integerLength(key.charAt(0));
  if (len === 0 || key.length < len) return null;
  return { integer: key.slice(0, len), fraction: key.slice(len) };
}

function hasNonZeroDigit(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) !== ZERO) return true;
  }
  return false;
}

/** b が候補 c の後ろに 0 だけを付けた形（c0、c00、…）なら true。c を返すと (c, b) の間に入る値が無くなる。 */
function leavesNoRoom(candidate: string, b: string): boolean {
  return b.length > candidate.length && b.startsWith(candidate) && !hasNonZeroDigit(b.slice(candidate.length));
}

/** 整数部を 1 増やす。最大（z が 27 桁）なら null。桁があふれたら次の先頭文字の最小値（az → b00、Zz → a0）。 */
function incrementInteger(integer: string): string | null {
  for (let i = integer.length - 1; i >= 1; i--) {
    const d = digitIndex(integer.charAt(i));
    if (d < BASE - 1) return integer.slice(0, i) + DIGITS.charAt(d + 1) + ZERO.repeat(integer.length - i - 1);
  }
  const head = integer.charAt(0);
  if (head === MAX_DIGIT) return null;
  const next = head === "Z" ? "a" : String.fromCharCode(head.charCodeAt(0) + 1);
  return next + ZERO.repeat(integerLength(next) - 1);
}

/** 整数部を 1 減らす。最小（A の後ろに 0 が 26 桁）なら null。桁が尽きたら前の先頭文字の最大値（a0 → Zz、Z0 → Yzz）。 */
function decrementInteger(integer: string): string | null {
  for (let i = integer.length - 1; i >= 1; i--) {
    const d = digitIndex(integer.charAt(i));
    if (d > 0) return integer.slice(0, i) + DIGITS.charAt(d - 1) + MAX_DIGIT.repeat(integer.length - i - 1);
  }
  const head = integer.charAt(0);
  if (head === "A") return null;
  const prev = head === "a" ? "Z" : String.fromCharCode(head.charCodeAt(0) - 1);
  return prev + MAX_DIGIT.repeat(integerLength(prev) - 1);
}

/** 桁列 a より大きい値（上限なし）。最初の桁と BASE の中点、桁が z なら 1 桁下げて続ける。末尾が 0 にはならない。 */
function above(a: string): string {
  const da = a === "" ? 0 : digitIndex(a.charAt(0));
  if (BASE - da > 1) return DIGITS.charAt((da + BASE + 1) >> 1);
  return a.charAt(0) + above(a.slice(1));
}

/**
 * 桁列 a と b の間に入る値（a < b が前提。小数部同士、または構造を持たないキー全体に使う）。
 * 共通の接頭辞を外し、最初に異なる桁の中点を取る。差が 1 なら桁を下げて続ける。
 * 入る値が存在しない（b が a の後ろに 0 を 1 つ付けた形）なら null。
 * 入る値がそれしか無い場合を除き、末尾が 0 の値や、b の直前に隙間を残さない値は返さない。
 */
function between(a: string, b: string): string | null {
  let n = 0;
  while (n < a.length && a.charAt(n) === b.charAt(n)) n++;
  if (n > 0) {
    const rest = between(a.slice(n), b.slice(n));
    return rest === null ? null : b.slice(0, n) + rest;
  }
  const da = a === "" ? 0 : digitIndex(a.charAt(0));
  const db = digitIndex(b.charAt(0));
  if (db === da) {
    // a が空で b が 0 で始まる。0 の後ろへ降りる。b が "0" なら入る値はなく、"00…" なら 0 を 1 つ減らした値しかない
    const tail = b.slice(1);
    if (tail === "") return null;
    return ZERO + (between("", tail) ?? "");
  }
  if (db - da > 1) return DIGITS.charAt((da + db + 1) >> 1);
  // 隣り合う桁。b の先頭 1 桁だけで b より小さくなるならそれ。そうでなければ a の先頭桁の下に降りる
  const first = b.charAt(0);
  if (b.length > 1 && !leavesNoRoom(first, b)) return first;
  return DIGITS.charAt(da) + above(a.slice(1));
}

/** 先頭への挿入（b の前）。 */
function before(pb: ParsedOrder, b: string): string | null {
  // 小数部が 0 以外を含むなら整数部そのもの。小数部が無い・0 だけなら（整数部を返すと次に隙間が無くなるので）整数部を 1 減らす
  if (hasNonZeroDigit(pb.fraction)) return pb.integer;
  return decrementInteger(pb.integer) ?? between("", b);
}

/** 末尾への挿入（a の後ろ）。 */
function after(pa: ParsedOrder): string {
  return incrementInteger(pa.integer) ?? pa.integer + above(pa.fraction);
}

/** a と b の間への挿入（両方とも構造を持つ）。 */
function middle(pa: ParsedOrder, pb: ParsedOrder, b: string): string | null {
  if (pa.integer === pb.integer) {
    const rest = between(pa.fraction, pb.fraction);
    return rest === null ? null : pa.integer + rest;
  }
  const inc = incrementInteger(pa.integer);
  if (inc !== null && compareCodePoints(inc, b) < 0 && !leavesNoRoom(inc, b)) return inc;
  return pa.integer + above(pa.fraction);
}

function assertOrderText(s: string): void {
  if (!isOrderText(s)) throw new TypeError(MSG_INVALID);
}

/**
 * a と b の間に入る order を返す（エンジン API 仕様 §5.2、契約の `OrderBetween`）。
 * a が null なら先頭、b が null なら末尾、両方 null なら最初のキー `"a0"`。a < b なら a < 結果 < b（コードポイント順）。
 * 前提違反（英数字以外・空文字、a >= b、間に入る値が存在しない組）は TypeError。
 */
export const orderBetween: OrderBetween = (a, b) => {
  if (a !== null) assertOrderText(a);
  if (b !== null) assertOrderText(b);
  let result: string | null;
  if (a === null) {
    if (b === null) return FIRST_ORDER;
    const pb = parseOrder(b);
    result = pb === null ? between("", b) : before(pb, b);
  } else if (b === null) {
    const pa = parseOrder(a);
    if (pa !== null) result = after(pa);
    else result = compareCodePoints(a, FIRST_ORDER) < 0 ? FIRST_ORDER : above(a);
  } else {
    if (compareCodePoints(a, b) >= 0) throw new TypeError(MSG_NOT_LESS);
    const pa = parseOrder(a);
    const pb = parseOrder(b);
    result = pa === null || pb === null ? between(a, b) : middle(pa, pb, b);
  }
  if (result === null) throw new TypeError(MSG_NO_ROOM);
  return result;
};

/** order の比較（コードポイント順。本体仕様 §11）。負なら a < b、0 なら等しい、正なら a > b。 */
export function compareOrder(a: Order, b: Order): number {
  return compareCodePoints(a, b);
}

/**
 * 同じ親の下の兄弟を (order, id) のコードポイント順に並べる（本体仕様 §11「order の扱い」）。入力は変更しない。
 * order が重複するノードは id 順で安定させ、重複するノード 1 件につき 1 個の D16（warning）を返す。
 * order の形式（`^[0-9A-Za-z]+$`）は検査しない（D01 の役割）。
 * @param parent 兄弟の親（ルート直下は null）。診断の `detail.parent` に入れる
 */
export function sortSiblings<T extends { readonly id: NodeId; readonly order: Order }>(
  siblings: readonly T[],
  parent: NodeId | null,
): { sorted: T[]; diagnostics: Diagnostic[] } {
  const sorted = [...siblings].sort((x, y) => compareCodePoints(x.order, y.order) || compareCodePoints(x.id, y.id));
  const diagnostics: Diagnostic[] = [];
  let start = 0;
  while (start < sorted.length) {
    const order = sorted[start]?.order ?? "";
    let end = start + 1;
    while (end < sorted.length && sorted[end]?.order === order) end++;
    if (end - start > 1) {
      const ids = sorted.slice(start, end).map((node) => node.id);
      for (const id of ids) {
        diagnostics.push({
          code: "D16",
          severity: "warning",
          message: `兄弟間で order "${order}" が重複しています（${ids.length} 件）`,
          at: { node: id },
          detail: { reason: "duplicate-order" satisfies OrderDiagnosticReason, order, parent, ids },
        });
      }
    }
    start = end;
  }
  return { sorted, diagnostics };
}
