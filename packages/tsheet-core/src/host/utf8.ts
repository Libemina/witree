// 文字列の UTF-8 エンコード。tsheet-core では `TextEncoder` が使えない（DOM 型を含めない `lib: ES2022` の範囲外）ため、
// 自前で実装する。`Host.hash` に文字列を渡すとき（内容ハッシュ・ゴールデンテスト）に使う。

const REPLACEMENT = 0xfffd;

/**
 * 文字列を UTF-8 のバイト列にする（BOM なし）。
 *
 * 対になっていないサロゲート（孤立サロゲート）は、`TextEncoder` と同じく U+FFFD（EF BF BD）に置換する。
 * JavaScript の文字列は UTF-16 のコード単位の列で、不正なサロゲートを含みうるが、UTF-8 では表現できないため。
 */
export function encodeUtf8(text: string): Uint8Array {
  // UTF-16 の 1 コード単位は最大 3 バイト、サロゲートペア（2 単位）は 4 バイトになるので、3 倍あれば足りる。
  const out = new Uint8Array(text.length * 3);
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    let cp = text.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff) {
      const next = i + 1 < text.length ? text.charCodeAt(i + 1) : 0;
      if (next >= 0xdc00 && next <= 0xdfff) {
        cp = 0x10000 + ((cp - 0xd800) << 10) + (next - 0xdc00);
        i++;
      } else {
        cp = REPLACEMENT;
      }
    } else if (cp >= 0xdc00 && cp <= 0xdfff) {
      cp = REPLACEMENT;
    }

    if (cp < 0x80) {
      out[n++] = cp;
    } else if (cp < 0x800) {
      out[n++] = 0xc0 | (cp >>> 6);
      out[n++] = 0x80 | (cp & 0x3f);
    } else if (cp < 0x10000) {
      out[n++] = 0xe0 | (cp >>> 12);
      out[n++] = 0x80 | ((cp >>> 6) & 0x3f);
      out[n++] = 0x80 | (cp & 0x3f);
    } else {
      out[n++] = 0xf0 | (cp >>> 18);
      out[n++] = 0x80 | ((cp >>> 12) & 0x3f);
      out[n++] = 0x80 | ((cp >>> 6) & 0x3f);
      out[n++] = 0x80 | (cp & 0x3f);
    }
  }
  return out.slice(0, n);
}
