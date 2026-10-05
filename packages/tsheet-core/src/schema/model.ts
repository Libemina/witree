// スキーマ（schema.json）の内部表現（本体仕様 §3〜§9）と、意味検証（§12.1 の S 系）の診断コード。
//
// コンテナの方針：
//  - 宣言順は配列（`fields`・`children`・`types`・`enums`）が正本で、引きは ReadonlyMap（`fieldIndex` など）。
//    反復は常に配列で行い、Map の反復順には依存しない。
//  - プレーンオブジェクトはプロトタイプのキー（`constructor` など）の事故があるので、引きには使わない。
//  - 「未設定」と「明示的な空」（§7）を区別するため、`default` はキーの有無で表す（キー無し＝未設定、null＝明示的な空）。
import type { Expr, FieldId, TypeName, Value } from "../api.ts";

/** フィールド型（本体仕様 §6.2）。 */
export type FieldType = "string" | "number" | "decimal" | "boolean" | "date" | "datetime" | "enum" | "ref" | "doc";

/** string の format（§6.3）。 */
export type StringFormat = "hostname" | "fqdn" | "host" | "ipv4" | "ipv6" | "cidr" | "mac" | "email" | "uri";

/** rollup の集計関数（§8.1）。 */
export type RollupFn = "sum" | "count" | "countDistinct" | "min" | "max" | "avg" | "wavg" | "any" | "all";

/** フィールドを持つコンテナの名前。型名、またはルートノードの予約名 "Root"（§3.1）。 */
export type ContainerName = TypeName;

/**
 * 式の出どころ。L-04 では式を解釈せず、式の検証（S07、X-02）と依存グラフ（S08、X-08）への入力として保持する。
 */
export interface ExprSource {
  text: Expr;
  owner: ContainerName;
  field?: FieldId;
  check?: string;
  purpose: "formula" | "rollupWhere" | "check";
}

/** 計算フィールドの定義（§8）。既定値は解決済み。 */
export type Computed =
  | {
      kind: "rollup";
      sourceType: TypeName;
      sourceField?: FieldId;
      fn: RollupFn;
      weight?: FieldId;
      depth: "children" | "descendants";
      where?: ExprSource;
      /** 既定値は解決済み（`fn === "count"` なら "zero"、それ以外は "empty"）。 */
      whenNoSource: "empty" | "zero" | "input";
    }
  | {
      kind: "inherit";
      fromType?: ContainerName;
      /** 既定（自身のフィールド ID）を解決済み。 */
      field: FieldId;
      fieldExplicit: boolean;
    }
  | { kind: "formula"; expr: ExprSource };

/** 列挙値（§6.4）。 */
export interface EnumValue {
  value: string;
  label?: string;
  deprecated: boolean;
}

/** トップレベルの共有列挙定義（§3 の `enums`）。 */
export interface EnumDef {
  id: string;
  values: readonly EnumValue[];
}

interface FieldBase {
  id: FieldId;
  owner: ContainerName;
  /** コンテナ内での宣言順（0 始まり）。 */
  index: number;
  label?: string;
  description?: string;
  required: boolean;
  /** `required` が明示されていたか（S11 で `required: false` の明示を区別する）。 */
  requiredExplicit: boolean;
  /** キー無し＝未設定、null＝明示的な空。`Object.hasOwn(raw, "default")` のときだけキーを付ける。 */
  default?: Value;
  computed?: Computed;
  /** 元の JSON のフィールド定義。 */
  raw: Readonly<Record<string, unknown>>;
}

/** フィールド定義（§6）。型ごとの追加属性は判別共用体で持つ。 */
export type FieldDef = FieldBase &
  (
    | { type: "string"; format?: StringFormat; pattern?: string; minLength?: number; maxLength?: number; multiline: boolean }
    | { type: "number"; integer: boolean; min?: number; max?: number; unit?: string }
    | { type: "decimal"; scale: number; min?: string; max?: string; unit?: string }
    | { type: "boolean" }
    | { type: "date"; min?: string; max?: string }
    | { type: "datetime"; min?: string; max?: string }
    | {
        type: "enum";
        multiple: boolean;
        enumRef?: string;
        /** 解決済みのコピー（`values` の直接指定、または `enumRef` の参照先）。`enumRef` が未定義のときだけ無い。 */
        values?: readonly EnumValue[];
      }
    | { type: "ref"; target: readonly TypeName[]; multiple: boolean; onDelete: "restrict" | "clear" }
    | { type: "doc" }
  );

/** 子ルール（§5）。 */
export interface ChildRule {
  child: TypeName;
  cardinality: "one" | "many";
  required: boolean;
  /** コンテナ内での宣言順（0 始まり）。 */
  index: number;
}

/** 一意制約（§9.1）。 */
export interface UniqueRule {
  index: number;
  fields: readonly FieldId[];
  scope: "parent" | "workbook" | { ancestorType: TypeName };
  message?: string;
}

/** 検証ルール（§9.2）。既定の `severity` は解決済み。 */
export interface CheckRule {
  index: number;
  id: string;
  expr: ExprSource;
  severity: "error" | "warning";
  message: string;
}

/** 型定義（§4）。ルートノードも同じ形で表す（`name` が "Root"、`isRoot` が true）。 */
export interface TypeDef {
  name: ContainerName;
  isRoot: boolean;
  label?: string;
  description?: string;
  titleTemplate?: string;
  maxDepth?: number;
  fields: readonly FieldDef[];
  fieldIndex: ReadonlyMap<FieldId, FieldDef>;
  children: readonly ChildRule[];
  childIndex: ReadonlyMap<TypeName, ChildRule>;
  unique: readonly UniqueRule[];
  checks: readonly CheckRule[];
  /** 元の JSON の型定義（ルートでは `root`）。 */
  raw: Readonly<Record<string, unknown>>;
}

/** 計算フィールドの一覧の要素（依存グラフ X-08 の頂点）。 */
export interface ComputedField {
  owner: ContainerName;
  field: FieldId;
  computed: Computed;
}

/** 解析済みのスキーマ。派生表（親型・到達可能集合・子孫の閉包）は `parseSchema` で 1 回だけ計算する。 */
export interface SchemaModel {
  specVersion: "0.1";
  schemaVersion: number;
  id?: string;
  title?: string;
  description?: string;
  enums: readonly EnumDef[];
  enumIndex: ReadonlyMap<string, EnumDef>;
  /** ルートノード。`name` は "Root"、`isRoot` は true。`root.children` / `root.fields` を型と同じ形で持つ。 */
  root: TypeDef;
  types: readonly TypeDef[];
  typeIndex: ReadonlyMap<TypeName, TypeDef>;
  /** `types` に予約名 "Root" が定義されていた（S13）。その定義は `types` には入れない。 */
  rootTypeDeclared: boolean;
  /** 計算フィールド。コンテナ（Root → types）とフィールドの宣言順。 */
  computedFields: readonly ComputedField[];
  /** 式の出どころ。コンテナの宣言順に、フィールド（formula / rollup の where）→ checks の順。 */
  expressions: readonly ExprSource[];
  /** 元の JSON。 */
  source: unknown;
  typeOrRoot(name: ContainerName): TypeDef | undefined;
  /** `type` を子に持つコンテナ。Root → types の宣言順。 */
  parentTypes(type: TypeName): readonly ContainerName[];
  /** Root から `children` をたどって到達できるか。 */
  isReachable(type: TypeName): boolean;
  /** `container` の直接の子（children）または子孫（descendants）に `type` が現れうるか。 */
  canContain(container: ContainerName, type: TypeName, depth: "children" | "descendants"): boolean;
  /** 型が自分自身を直接の子に持つか（A → B → A のような間接の再帰は含めない）。 */
  isSelfRecursive(type: TypeName): boolean;
}

/** 意味検証（本体仕様 §12.1）の診断コード。S07・S08 は式と依存グラフ（X-02・X-08）で扱う。 */
export const SCHEMA_DIAGNOSTIC_CODES = {
  /** 未定義の型への参照 */
  undefinedType: "S01",
  /** ルートから到達できない型 */
  unreachableType: "S02",
  /** rollup の `sourceType` が `depth` の範囲に存在しえない */
  rollupSourceOutOfRange: "S03",
  /** rollup の `sourceField` / `weight` の不在、または `fn` と型の不一致 */
  rollupSourceField: "S04",
  /** rollup の結果型とフィールドの `type` の不一致 */
  rollupResultType: "S05",
  /** 継承元が祖先として存在しえない、または型が異なる */
  inheritSource: "S06",
  /** `enumRef` の未定義、列挙値の重複、`default` の不適合 */
  enumOrDefault: "S09",
  /** `unique.fields` に存在しないフィールド */
  uniqueField: "S10",
  /** rollup のフィールドに `required` / `default` がある */
  rollupWithInput: "S11",
  /** 自己再帰しない型の `maxDepth` */
  maxDepthWithoutRecursion: "S12",
  /** ルートノードに関する違反（`root.fields` の inherit、`types` の Root、`params` の未知のキー、予約語のフィールド ID） */
  root: "S13",
} as const;

/** S 系診断の `detail.reason`。 */
export type SchemaDiagnosticReason =
  | "undefinedType"
  | "unreachable"
  | "sourceOutOfRange"
  | "missingSourceField"
  | "missingWeight"
  | "fnTypeMismatch"
  | "weightTypeMismatch"
  | "resultTypeMismatch"
  | "noAncestorCandidate"
  | "typeMismatch"
  | "formatMismatch"
  | "undefinedEnumRef"
  | "duplicateEnumValue"
  | "defaultInvalid"
  | "uniqueFieldMissing"
  | "rollupWithInput"
  | "maxDepthWithoutRecursion"
  | "inheritOnRoot"
  | "rootTypeDeclared"
  | "unknownParam"
  | "reservedFieldId";
