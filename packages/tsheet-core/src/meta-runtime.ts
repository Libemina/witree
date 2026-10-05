// 生成された検証関数（src/generated/meta-validators.js）が実行時に使う補助関数。
// Ajv の standalone 出力は `require("ajv/dist/runtime/…")` で自前の補助関数を読み込むが、
// ESM で動かすこと、および Ajv を実行時の依存にしないことのために、生成時にここへの参照に置き換える
// （scripts/meta-validators.ts）。いずれも決定的で、Date・Intl・ロケールに依存しない。

/**
 * コードポイント数（minLength / maxLength 用）。Ajv の `ajv/dist/runtime/ucs2length` と同じ数え方で、
 * サロゲートペアを 1 文字と数える。
 */
export function ucs2length(str: string): number {
  const len = str.length;
  let length = 0;
  let pos = 0;
  while (pos < len) {
    length++;
    const value = str.charCodeAt(pos++);
    if (value >= 0xd800 && value <= 0xdbff && pos < len) {
      // 上位サロゲートの直後に下位サロゲートがあれば 1 文字として読み飛ばす
      if ((str.charCodeAt(pos) & 0xfc00) === 0xdc00) pos++;
    }
  }
  return length;
}

/**
 * JSON 値の構造的な等価（uniqueItems 用）。Ajv の `ajv/dist/runtime/equal`（fast-deep-equal）のうち、
 * JSON.parse の結果に現れうる値（プリミティブ・配列・オブジェクト）だけを扱う。
 */
export function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    // NaN は JSON に現れないが、念のため fast-deep-equal と同じく等しいとみなす
    return a !== a && b !== b;
  }
  const aIsArray = Array.isArray(a);
  if (aIsArray !== Array.isArray(b)) return false;
  if (aIsArray) {
    const x = a as unknown[];
    const y = b as unknown[];
    if (x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) if (!equal(x[i], y[i])) return false;
    return true;
  }
  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  const keys = Object.keys(x);
  if (keys.length !== Object.keys(y).length) return false;
  for (const key of keys) {
    if (!Object.hasOwn(y, key) || !equal(x[key], y[key])) return false;
  }
  return true;
}

// `\Z` は ECMAScript の正規表現では「Z という文字」にしかならないので、他の正規表現方言の名残として拒否する
// （ajv-formats の `regex` と同じ扱い）。
const Z_ANCHOR = /[^\\]\\Z/;

/**
 * `format: "regex"`（スキーマ定義の `pattern`）。ECMAScript の正規表現として解釈できるかだけを見る
 * （本体仕様 §10.2）。ajv-formats の `regex` と同じ判定で、フラグは付けずにコンパイルする。
 */
export function regex(str: string): boolean {
  if (Z_ANCHOR.test(str)) return false;
  try {
    new RegExp(str);
    return true;
  } catch {
    return false;
  }
}

/** 生成コードが `format` キーワードの判定に使う関数の表。 */
export const formats: Readonly<Record<string, (data: string) => boolean>> = { regex };
