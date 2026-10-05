// 同期の SHA-256（FIPS 180-4 §6.2）。`Host.hash` は同期関数だが、ブラウザの Web Crypto（`crypto.subtle.digest`）は
// 非同期で、しかも tsheet-core では `crypto` 自体が決定性のため禁止されている。そのため純粋 TypeScript で実装する。
// ライブラリには依存せず、`lib: ES2022` の範囲（`Uint8Array`・`DataView`・`>>>`）だけで書く。
//
// 入力の長さは 2^32 ビット（512 MiB）未満を前提とする（下記 `sha256` の JSDoc）。

/** 最初の 64 個の素数の立方根の小数部（FIPS 180-4 §4.2.2）。 */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** 最初の 8 個の素数の平方根の小数部（FIPS 180-4 §5.3.3）。 */
const H0 = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

const BLOCK_BYTES = 64;

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/**
 * SHA-256 のダイジェスト（32 バイト）を返す。
 *
 * 入力は 2^32 ビット（512 MiB）未満を前提とする。FIPS 180-4 はメッセージ長を 64 ビットで表すが、
 * tsheet のワークブックはその大きさに届かないので、長さの上位 32 ビットは `Math.floor` で求めた値を書き込むに
 * とどめ、2^53 バイト以上の入力（JavaScript の配列で表せない大きさ）は扱わない。
 *
 * `bytes` は変更しない。`bytes.byteOffset` が 0 でないビュー（`subarray`）も受け付ける。
 */
export function sha256(bytes: Uint8Array): Uint8Array {
  // パディング（FIPS 180-4 §5.1.1）：0x80、0 埋め、ビット長（ビッグエンディアン 64 ビット）。
  const length = bytes.length;
  const paddedLength = Math.ceil((length + 1 + 8) / BLOCK_BYTES) * BLOCK_BYTES;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(length / 0x20000000), false); // ビット長の上位 32 ビット = length * 8 / 2^32
  view.setUint32(paddedLength - 4, (length << 3) >>> 0, false);

  const h = new Uint32Array(H0);
  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLength; offset += BLOCK_BYTES) {
    // メッセージスケジュール（§6.2.2 手順 1）
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(offset + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const w15 = w[t - 15] ?? 0;
      const w2 = w[t - 2] ?? 0;
      const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3);
      const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10);
      w[t] = ((w[t - 16] ?? 0) + s0 + (w[t - 7] ?? 0) + s1) >>> 0;
    }

    // 作業変数の初期化（手順 2）
    let a = h[0] ?? 0;
    let b = h[1] ?? 0;
    let c = h[2] ?? 0;
    let d = h[3] ?? 0;
    let e = h[4] ?? 0;
    let f = h[5] ?? 0;
    let g = h[6] ?? 0;
    let hh = h[7] ?? 0;

    // 64 ラウンド（手順 3）
    for (let t = 0; t < 64; t++) {
      const bigS1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + bigS1 + ch + (K[t] ?? 0) + (w[t] ?? 0)) >>> 0;
      const bigS0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (bigS0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    // 中間ハッシュ値の更新（手順 4）
    h[0] = ((h[0] ?? 0) + a) >>> 0;
    h[1] = ((h[1] ?? 0) + b) >>> 0;
    h[2] = ((h[2] ?? 0) + c) >>> 0;
    h[3] = ((h[3] ?? 0) + d) >>> 0;
    h[4] = ((h[4] ?? 0) + e) >>> 0;
    h[5] = ((h[5] ?? 0) + f) >>> 0;
    h[6] = ((h[6] ?? 0) + g) >>> 0;
    h[7] = ((h[7] ?? 0) + hh) >>> 0;
  }

  const digest = new Uint8Array(32);
  const out = new DataView(digest.buffer);
  for (let i = 0; i < 8; i++) out.setUint32(i * 4, h[i] ?? 0, false);
  return digest;
}

/** バイト列を小文字の 16 進文字列にする。 */
function toHex(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

/**
 * SHA-256 のダイジェストを小文字 16 進 64 文字で返す。`Host.hash` にそのまま使える形式。
 * 入力の長さの前提は {@link sha256} と同じ。
 */
export function sha256Hex(bytes: Uint8Array): string {
  return toHex(sha256(bytes));
}
