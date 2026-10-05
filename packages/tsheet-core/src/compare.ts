/**
 * コードポイント順の比較（UTF-16 のコード単位順ではない。サロゲートペアで結果が変わる）。
 * `localeCompare` は決定性のため使えないので、順序が要る場面ではこれを使う。
 */
export function compareCodePoints(a: string, b: string): number {
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
