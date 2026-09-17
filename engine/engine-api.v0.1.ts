// tsheet-core Engine API v0.1 — 型定義（契約）
// エンジンは純粋 TypeScript（lib: ES2022 のみ、DOM / Node 型を含めない）。
// この型定義から JSON Schema（Op と Message の検証用）を生成する。

// ---------------------------------------------------------------------------
// 基本型
// ---------------------------------------------------------------------------
export type NodeId = string;      // UUIDv4（小文字）
export type TypeName = string;    // ^[A-Z][A-Za-z0-9_]{0,63}$
export type FieldId = string;     // ^[a-z][A-Za-z0-9_]{0,63}$
export type ViewName = string;    // ^[a-z][A-Za-z0-9_-]{0,63}$
export type Order = string;       // 分数インデックス
export type PartPath = string;    // "schema.json", "data.jsonl", "views/x.view.json", "docs/<id>/<field>.md"
export type Expr = string;

/** 保存形式の値（本体仕様 §6.2）。undefined は「未設定」を表すため Value に含めない。 */
export type Value = string | number | boolean | string[] | null;
export type Values = Record<FieldId, Value>;

export type Severity = "error" | "warning" | "info";
export interface Diagnostic {
  code: string;                  // S01.., D01.., V01.., E01..
  severity: Severity;
  message: string;
  at?: { node?: NodeId; field?: FieldId; type?: TypeName; view?: ViewName; part?: PartPath; line?: number };
  detail?: Record<string, unknown>;
}

export type Result<T> =
  | { ok: true; value: T; diagnostics: Diagnostic[] }
  | { ok: false; errors: Diagnostic[] };

// ---------------------------------------------------------------------------
// Host（実行環境から注入するもの。エンジンは I/O・時計・乱数を自前で持たない）
// ---------------------------------------------------------------------------
export interface Host {
  clock: { today(): string; timezone: string };   // "YYYY-MM-DD", IANA 名
  ids: { newId(): NodeId };
  hash(bytes: Uint8Array): string;                 // 同期。内容ハッシュ（外部変更検出・ゴールデンテスト用）
  log?(d: Diagnostic): void;
}

export type PartMap = Record<PartPath, string>;   // 論理パス → 内容（テキスト）

// ---------------------------------------------------------------------------
// Op（5 系統）。すべて自己完結：id / order / 値を呼び出し側が確定させて渡す。
// ---------------------------------------------------------------------------
export type DataOp =
  | { kind: "data"; op: "create"; id: NodeId; type: TypeName; parent: NodeId | null; order: Order; values?: Values }
  | { kind: "data"; op: "delete"; id: NodeId }                              // 子孫・marks・参照解除を含む（§6.3）
  | { kind: "data"; op: "move"; id: NodeId; parent: NodeId | null; order: Order }
  | { kind: "data"; op: "set"; id: NodeId; field: FieldId; value: Value }   // null = 明示的な空
  | { kind: "data"; op: "unset"; id: NodeId; field: FieldId }               // 未設定に戻す（継承値に戻す）
  | { kind: "data"; op: "setDoc"; id: NodeId; field: FieldId; content: string };

export type SchemaOp =
  | { kind: "schema"; op: "addType"; type: TypeName; def: unknown }         // def: 本体仕様 §4 の型定義
  | { kind: "schema"; op: "removeType"; type: TypeName }                    // 該当ノードの削除 Op を自動生成
  | { kind: "schema"; op: "setTypeMeta"; type: TypeName | "Root"; label?: string; description?: string; titleTemplate?: string; maxDepth?: number | null }
  | { kind: "schema"; op: "addField"; type: TypeName | "Root"; field: FieldId; def: unknown; after?: FieldId | null }
  | { kind: "schema"; op: "removeField"; type: TypeName | "Root"; field: FieldId }
  | { kind: "schema"; op: "updateField"; type: TypeName | "Root"; field: FieldId; def: unknown }   // type 変更は値の変換 Op を自動生成
  | { kind: "schema"; op: "moveField"; type: TypeName | "Root"; field: FieldId; after: FieldId | null }
  | { kind: "schema"; op: "setChildRule"; parent: TypeName | "Root"; child: TypeName; rule: { cardinality: "one" | "many"; required?: boolean } | null }
  | { kind: "schema"; op: "setUnique"; type: TypeName; rules: unknown[] }
  | { kind: "schema"; op: "setChecks"; type: TypeName; rules: unknown[] }
  | { kind: "schema"; op: "setEnum"; enumId: string; values: unknown[] | null }
  | { kind: "schema"; op: "setSettings"; settings: Record<string, unknown> };
// 意図的に存在しない Op：renameField / renameType。フィールド ID・型名は不変（§6.4）。

export type ViewOp =
  | { kind: "view"; op: "create"; view: ViewName; def: unknown }
  | { kind: "view"; op: "delete"; view: ViewName }
  | { kind: "view"; op: "patch"; view: ViewName; path: (string | number)[]; value: unknown }  // JSON Pointer 相当。undefined で削除
  | { kind: "view"; op: "replace"; view: ViewName; def: unknown };

export type MarksOp =
  | { kind: "marks"; op: "setRecord"; view: ViewName; id: NodeId; mark: unknown | null }
  | { kind: "marks"; op: "setCell"; view: ViewName; id: NodeId; field: FieldId; mark: unknown | null };

export type ParamOp =
  | { kind: "param"; op: "set"; field: FieldId; value: Value }
  | { kind: "param"; op: "unset"; field: FieldId };

export type Op = DataOp | SchemaOp | ViewOp | MarksOp | ParamOp;

/** トランザクション：全体で成功か失敗か。Undo の単位。 */
export interface Transaction {
  id: string;                    // 呼び出し側が採番（UUIDv4）
  label?: string;                // UI の「元に戻す: 貼り付け」など
  ops: Op[];
}

// ---------------------------------------------------------------------------
// 変更通知
// ---------------------------------------------------------------------------
export interface ChangeSet {
  /** 保存形式が変わったレコード（作成・削除・移動・値の変更） */
  records: { created: NodeId[]; deleted: NodeId[]; moved: NodeId[]; updated: Record<NodeId, FieldId[]> };
  /** 実効値（rollup / inherit / formula）が変わったセル */
  effective: Record<NodeId, FieldId[]>;
  params?: FieldId[];
  parts: PartPath[];             // 内容が変わるパート（schema.json, views/…, docs/… など）
  schemaChanged: boolean;
  viewsChanged: ViewName[];
}

export interface ApplyResult {
  txId: string;
  changes: ChangeSet;
  inverse: Transaction;          // Undo 用。label は元の label を引き継ぐ
  expanded: Op[];                // 自動生成分を含む、実際に適用された Op の列
  diagnostics: Diagnostic[];     // 適用後のデータ検証（D 系・V 系）で新たに増減した診断
  report?: SchemaChangeReport;   // SchemaOp を含む場合
}

export interface SchemaChangeReport {
  rewrittenRecords: number;
  convertedValues: number;
  unconvertibleValues: { node: NodeId; field: FieldId; value: Value }[];
  deletedRecords: number;
  affectedViews: ViewName[];
}

// ---------------------------------------------------------------------------
// 問い合わせと射影
// ---------------------------------------------------------------------------
export interface NodeView {
  id: NodeId; type: TypeName; parent: NodeId | null; order: Order; depth: number; outline: string;
  title: string;
  stored: Values;                                        // 保存値（未設定は無い）
  effective: Record<FieldId, { value: Value; source: "stored" | "inherited" | "rollup" | "formula" | "default-input" | "empty"; from?: NodeId }>;
  hasChildren: boolean;
}

export interface CellView {
  value: Value;                  // 実効値
  text: string;                  // format 適用後の表示文字列
  editable: boolean;
  source: NodeView["effective"][string]["source"];
  style?: Record<string, unknown>;      // 書式の合成結果（View 仕様 §8.3）
  note?: string;
  diagnostics?: Diagnostic[];    // このセルに紐づく D 系診断
  crosstab?: { count: number };  // crosstab セル：該当ノード数
}

export interface RowView {
  id: NodeId; type: TypeName; depth: number; parent: NodeId | null;
  title: string;
  dimmed: boolean;               // filter の祖先表示
  cells: Record<string, CellView>;                       // key = 列キー（field / $title / crosstab のキー値 / $rowTotal）
  rowStyle?: Record<string, unknown>;
  height?: number;
}

export interface Projection {
  view: ViewName;
  columns: { key: string; label: string; width: number; pinned: boolean; align: string; kind: "field" | "special" | "crosstab" | "total" }[];
  rows: RowView[];               // 表示順（sort 適用済み、折りたたみは反映しない）
  totals?: Record<string, CellView>;                     // crosstab の columnTotal
  diagnostics: Diagnostic[];     // V 系
}

export interface ProjectionOptions {
  collapsed?: NodeId[];          // 個人状態。指定したノードの子孫を除いた行だけを返す
  range?: { offset: number; limit: number };
}

// ---------------------------------------------------------------------------
// 式
// ---------------------------------------------------------------------------
export interface ExprContext { type: TypeName | "Root" | "none"; view?: ViewName; purpose: "formula" | "rollupWhere" | "check" | "filter" | "rule" | "labelExpr" | "adhoc" }
export interface ExprInfo { resultType: string; references: { self: FieldId[]; parent: FieldId[]; root: FieldId[] }; functions: string[] }
export interface ExprLimits { maxLength: 4096; maxDepth: 64; maxSteps: 100000; maxRegexLength: 512; maxStringLength: 65536 }

// ---------------------------------------------------------------------------
// reconcile（3 方向マージ）
// ---------------------------------------------------------------------------
export type Conflict =
  | { kind: "field"; id: NodeId; field: FieldId; base: Value | undefined; local: Value | undefined; disk: Value | undefined }
  | { kind: "deleteEdit"; id: NodeId; deletedBy: "local" | "disk"; editedFields: FieldId[] }
  | { kind: "moveCycle"; id: NodeId; localParent: NodeId | null; diskParent: NodeId | null }
  | { kind: "doc"; id: NodeId; field: FieldId }
  | { kind: "viewKey"; view: ViewName; path: (string | number)[] }
  | { kind: "marksKey"; view: ViewName; id: NodeId; field?: FieldId };

export interface ReconcileResult {
  merged: PartMap;               // 衝突がなければそのまま採用できる正規化済みの結果
  conflicts: Conflict[];         // 空でなければ merged は「衝突箇所を base のまま」にした暫定
  changes: ChangeSet;            // local から merged への差分
  schemaReplay?: { applied: string[]; rejected: { txId: string; reason: Diagnostic[] }[] };   // §10.4
  notes: Diagnostic[];           // order の衝突など、自動解決した内容の通知
}

export type Resolution = { conflict: Conflict; choose: "local" | "disk" } | { conflict: Extract<Conflict, { kind: "field" }>; value: Value | undefined };

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------
export interface LoadResult { diagnostics: Diagnostic[]; readOnly: boolean; readOnlyReason?: "schemaError" | "versionMismatch" | "conflictMarkers" | "truncated" }

export interface Engine {
  // ライフサイクル
  load(parts: PartMap): Promise<Result<LoadResult>>;
  serialize(): Promise<PartMap>;                          // 正規化済み。docs も含む
  contentHash(): Promise<string>;

  // 変更
  preview(tx: Transaction): Promise<Result<ApplyResult>>;   // 適用せずに結果だけ返す
  apply(tx: Transaction): Promise<Result<ApplyResult>>;

  // 問い合わせ
  getNode(id: NodeId): Promise<NodeView | null>;
  getChildren(id: NodeId | null): Promise<NodeView[]>;    // order 順
  getAncestors(id: NodeId): Promise<NodeView[]>;
  search(q: { text?: string; types?: TypeName[]; expr?: Expr; limit?: number }): Promise<NodeId[]>;
  project(view: ViewName, opts?: ProjectionOptions): Promise<Result<Projection>>;
  getSchema(): Promise<unknown>; getView(view: ViewName): Promise<unknown>; getParams(): Promise<Values>;
  diagnostics(filter?: { severity?: Severity; codes?: string[]; node?: NodeId }): Promise<Diagnostic[]>;

  // 式
  parseExpr(expr: Expr, ctx: ExprContext): Promise<Result<ExprInfo>>;
  evaluate(expr: Expr, at: { node: NodeId } | { root: true }): Promise<Result<{ value: Value; type: string }>>;

  // マージ・差分
  reconcile(base: PartMap, disk: PartMap, opts?: { unsaved?: Transaction[] }): Promise<ReconcileResult>;
  resolve(resolutions: Resolution[]): Promise<Result<ApplyResult>>;
  diff(a: PartMap, b: PartMap): Promise<{ records: ChangeSet["records"]; parts: PartPath[] }>;

  // 形式変換（純粋関数。load 不要）
  pack(parts: PartMap): Promise<string>;
  unpack(single: string): Promise<Result<PartMap>>;

  // ユーティリティ
  orderBetween(a: Order | null, b: Order | null): Order;
  newId(): NodeId;
  version(): { engine: string; spec: "0.1" };
}

// ---------------------------------------------------------------------------
// Worker メッセージ
// ---------------------------------------------------------------------------
export type Request = { id: string; method: keyof Engine; params: unknown[] };
export type Response = { id: string; result: unknown } | { id: string; error: { code: string; message: string; data?: unknown } };
export type Event = { event: "changes"; changes: ChangeSet } | { event: "diagnostics"; diagnostics: Diagnostic[] } | { event: "progress"; op: string; ratio: number };
