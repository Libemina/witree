// UUIDv4 の形式検証。レコードの `id`（本体仕様 §11）と `Host.ids.newId()` の戻り値の形式。

/**
 * UUIDv4（小文字・ハイフン付き）の正規表現。メタスキーマ `meta/record.v0.1.json` の `$defs/uuid` と同じ。
 * 3 つ目のグループの先頭が version の `4`、4 つ目のグループの先頭が variant（`8`〜`b`）。
 */
export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * 文字列が UUIDv4 の形式を満たすか。大文字・ブレース付き（`{…}`）・ハイフンなしは、たとえ UUID として同じ値を
 * 表していても `false`（保存形式は小文字・ハイフン付きに限る）。
 */
export function isUuidV4(s: string): boolean {
  return UUID_V4_PATTERN.test(s);
}
