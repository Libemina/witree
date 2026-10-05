// 式言語の構文木と構文解析の結果の型（本体仕様 §10.1、エンジン API 仕様 §9）。
// 構文木は不変の判別共用体で、すべてのノードが原文上の位置 `span` を持つ。
// 型検査・参照解決・関数名の確認は X-02 の役割なので、ここには構文の情報だけを置く。

/** 原文上の位置。UTF-16 コード単位で数え、`end` は排他的。 */
export interface Span {
  readonly start: number;
  readonly end: number;
}

/** 参照の対象。`self` は自ノード、`parent` は親ノード、`root` はルートノード（§10.1「参照」）。 */
export type RefScope = "self" | "parent" | "root";

/** 二項演算子。優先順位の低い順に compare・concat・additive・term（§10.1）。 */
export type BinaryOperator = "=" | "<>" | "<" | "<=" | ">" | ">=" | "&" | "+" | "-" | "*" | "/";

/** 数値リテラル。`text` は原文（decimal の精度を保つために X-03 が使う）、`value` は `Number(text)`。 */
export interface NumberNode {
  readonly kind: "number";
  readonly text: string;
  readonly value: number;
  readonly span: Span;
}

/** 文字列リテラル。`value` は `""` を `"` に解除した後の内容。`span` は引用符を含む。 */
export interface StringNode {
  readonly kind: "string";
  readonly value: string;
  readonly span: Span;
}

/** `TRUE` / `FALSE`。 */
export interface BooleanNode {
  readonly kind: "boolean";
  readonly value: boolean;
  readonly span: Span;
}

/** `BLANK`（空値）。 */
export interface BlankNode {
  readonly kind: "blank";
  readonly span: Span;
}

/** フィールド参照 `field` / `parent.field` / `root.field`。 */
export interface RefNode {
  readonly kind: "ref";
  readonly scope: RefScope;
  readonly field: string;
  readonly span: Span;
}

/** 関数呼び出し。`name` の存在と引数の個数は検査しない（X-02）。 */
export interface CallNode {
  readonly kind: "call";
  readonly name: string;
  readonly args: readonly ExprNode[];
  readonly span: Span;
}

/** 単項マイナス。 */
export interface NegNode {
  readonly kind: "neg";
  readonly operand: ExprNode;
  readonly span: Span;
}

/** 二項演算。 */
export interface BinaryNode {
  readonly kind: "binary";
  readonly op: BinaryOperator;
  readonly left: ExprNode;
  readonly right: ExprNode;
  readonly span: Span;
}

/** 括弧。深さの定義と位置情報のために残す（意味解析・評価は透過する）。 */
export interface ParenNode {
  readonly kind: "paren";
  readonly inner: ExprNode;
  readonly span: Span;
}

export type ExprNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | BlankNode
  | RefNode
  | CallNode
  | NegNode
  | BinaryNode
  | ParenNode;

/**
 * 構文解析が失敗した理由。
 * - `tooLong` / `tooDeep`：エンジン API 仕様 §9 の制限（長さ 4,096・深さ 64）
 * - `empty`：空文字か空白だけ
 * - `invalidCharacter` / `unterminatedString` / `invalidNumber` / `invalidName`：字句の誤り
 * - `reservedWord`：`parent` / `root` を `parent.field` の形以外で使った
 * - `chainedComparison`：比較演算子の連結（`a = b = c`）
 * - `unexpectedToken` / `unexpectedEnd`：文法に合わない記号、途中で終わる式
 */
export type ParseErrorReason =
  | "tooLong"
  | "tooDeep"
  | "empty"
  | "invalidCharacter"
  | "unterminatedString"
  | "invalidNumber"
  | "invalidName"
  | "reservedWord"
  | "chainedComparison"
  | "unexpectedToken"
  | "unexpectedEnd";

/** 構文解析の失敗。`position` は原文上の位置（UTF-16 コード単位）、`message` は理由ごとに固定の日本語。 */
export interface ParseError {
  readonly reason: ParseErrorReason;
  readonly position: number;
  readonly message: string;
}

export type ParseResult = { readonly ok: true; readonly ast: ExprNode } | { readonly ok: false; readonly error: ParseError };
