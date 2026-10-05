// `default` の値がフィールドの型・制約に適合するか（S09、本体仕様 §6.2 の保存形式）。
// 自己完結した検査で、Host を必要としない。
//
// 前提と保守的な解釈（PR の「仕様の確認事項」にも記載）：
//  - null は全型で適合（§7 の「明示的な空」）。required との組み合わせは D11 の領分とする。
//  - string の `format`（hostname / ipv4 …）の受理と正規化は値の検証（L-07）に委ね、ここでは検査しない。
//  - string の空文字は保存時に null へ正規化される（§7）ので適合とする。
//  - datetime の `min` / `max` は UTC 換算が要る（オフセット付き同士の比較）ので検査しない。
//  - enum の `deprecated: true` の値は「既存データ上の値としては有効」（§6.4）なので不適合にしない。
//  - ref は UUIDv4（小文字）の形式だけを見て、参照先の存在は確認しない。
import { ucs2length } from "../meta-runtime.ts";
import type { EnumValue, FieldDef } from "./model.ts";

/** `default` の違反の種類。 */
export type DefaultViolation =
  | "jsonType"
  | "integer"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "pattern"
  | "scale"
  | "decimalFormat"
  | "dateFormat"
  | "datetimeFormat"
  | "enumValue"
  | "duplicate"
  | "refFormat"
  | "docPath";

const DECIMAL = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;
const DATE = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
const DATETIME = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]+)?(Z|[+-]([0-9]{2}):([0-9]{2}))$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** 先発グレゴリオ暦の閏年（Date を使わない）。 */
function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/** `YYYY-MM-DD` の形式で、実在する日付か。 */
export function isValidDate(text: string): boolean {
  const m = DATE.exec(text);
  if (m === null) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

/** RFC 3339 でオフセット必須の形式か（§6.2）。日付の実在と時刻・オフセットの範囲は見るが、タイムゾーンの換算はしない。 */
export function isValidDateTime(text: string): boolean {
  const m = DATETIME.exec(text);
  if (m === null) return false;
  if (!isValidDate(`${m[1] ?? ""}-${m[2] ?? ""}-${m[3] ?? ""}`)) return false;
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6]);
  if (hour > 23 || minute > 59 || second > 60) return false; // 60 は閏秒
  if (m[9] !== undefined && (Number(m[9]) > 23 || Number(m[10]) > 59)) return false;
  return true;
}

/**
 * 10 進文字列の比較（小数桁を揃えて BigInt で比べる）。形式は呼び出し側で確認済みであること。
 * 小さな補助であり、decimal の演算（X-03）が入ればそれに置き換えてよい。
 */
export function compareDecimal(a: string, b: string): number {
  const [ia, fa = ""] = a.split(".") as [string, string?];
  const [ib, fb = ""] = b.split(".") as [string, string?];
  const width = Math.max(fa.length, fb.length);
  const x = BigInt(ia + fa.padEnd(width, "0"));
  const y = BigInt(ib + fb.padEnd(width, "0"));
  return x < y ? -1 : x > y ? 1 : 0;
}

function checkString(field: Extract<FieldDef, { type: "string" }>, value: string): DefaultViolation | undefined {
  // 空文字は保存時に null へ正規化される（§7）ので制約は見ない。
  if (value === "") return undefined;
  const length = ucs2length(value);
  if (field.minLength !== undefined && length < field.minLength) return "minLength";
  if (field.maxLength !== undefined && length > field.maxLength) return "maxLength";
  if (field.pattern !== undefined) {
    let re: RegExp | undefined;
    try {
      re = new RegExp(`^(?:${field.pattern})$`);
    } catch {
      // 不正な正規表現はメタスキーマ（format: regex）で弾かれているはずだが、万一の場合は検査をスキップする。
      re = undefined;
    }
    if (re !== undefined && !re.test(value)) return "pattern";
  }
  return undefined;
}

function checkNumber(field: Extract<FieldDef, { type: "number" }>, value: number): DefaultViolation | undefined {
  if (!Number.isFinite(value)) return "jsonType";
  if (field.integer && !Number.isInteger(value)) return "integer";
  if (field.min !== undefined && value < field.min) return "min";
  if (field.max !== undefined && value > field.max) return "max";
  return undefined;
}

function checkDecimal(field: Extract<FieldDef, { type: "decimal" }>, value: string): DefaultViolation | undefined {
  if (!DECIMAL.test(value)) return "decimalFormat";
  const fraction = value.split(".")[1] ?? "";
  if (fraction.length > field.scale) return "scale";
  if (field.min !== undefined && compareDecimal(value, field.min) < 0) return "min";
  if (field.max !== undefined && compareDecimal(value, field.max) > 0) return "max";
  return undefined;
}

function checkEnum(values: readonly EnumValue[] | undefined, value: unknown, multiple: boolean): DefaultViolation | undefined {
  const allowed = values === undefined ? undefined : new Set(values.map((v) => v.value));
  const check = (item: unknown): DefaultViolation | undefined => {
    if (typeof item !== "string") return "jsonType";
    // `values` が未解決（enumRef が未定義）のときは列挙検査をスキップする（S09 undefinedEnumRef で報告済み）。
    if (allowed !== undefined && !allowed.has(item)) return "enumValue";
    return undefined;
  };
  if (!multiple) return check(value);
  if (!Array.isArray(value)) return "jsonType";
  const seen = new Set<string>();
  for (const item of value as unknown[]) {
    const violation = check(item);
    if (violation !== undefined) return violation;
    if (seen.has(item as string)) return "duplicate";
    seen.add(item as string);
  }
  return undefined;
}

function checkRef(value: unknown, multiple: boolean): DefaultViolation | undefined {
  const check = (item: unknown): DefaultViolation | undefined => {
    if (typeof item !== "string") return "jsonType";
    return UUID_V4.test(item) ? undefined : "refFormat";
  };
  if (!multiple) return check(value);
  if (!Array.isArray(value)) return "jsonType";
  const seen = new Set<string>();
  for (const item of value as unknown[]) {
    const violation = check(item);
    if (violation !== undefined) return violation;
    if (seen.has(item as string)) return "duplicate";
    seen.add(item as string);
  }
  return undefined;
}

/**
 * `default` の値がフィールドの型と制約に適合するかを調べ、違反があればその種類を返す。
 * 値は JSON.parse の結果（メタスキーマは `default` を any としている）なので unknown で受ける。
 */
export function checkDefaultValue(field: FieldDef, value: unknown): DefaultViolation | undefined {
  if (value === null) return undefined;
  switch (field.type) {
    case "string":
      return typeof value === "string" ? checkString(field, value) : "jsonType";
    case "number":
      return typeof value === "number" ? checkNumber(field, value) : "jsonType";
    case "decimal":
      return typeof value === "string" ? checkDecimal(field, value) : "jsonType";
    case "boolean":
      return typeof value === "boolean" ? undefined : "jsonType";
    case "date":
      if (typeof value !== "string") return "jsonType";
      if (!isValidDate(value)) return "dateFormat";
      if (field.min !== undefined && value < field.min) return "min";
      if (field.max !== undefined && value > field.max) return "max";
      return undefined;
    case "datetime":
      if (typeof value !== "string") return "jsonType";
      return isValidDateTime(value) ? undefined : "datetimeFormat";
    case "enum":
      return checkEnum(field.values, value, field.multiple);
    case "ref":
      return checkRef(value, field.multiple);
    case "doc":
      if (typeof value !== "string") return "jsonType";
      return value.includes("..") ? "docPath" : undefined;
  }
}
