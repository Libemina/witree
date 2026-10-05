// 式の字句解析（内部用）。構文解析器が必要に応じて 1 トークンずつ取り出す（遅延）ので、
// 字句の誤りと文法の誤りは原文上の早い方が先に報告される。
//
// 本体仕様 §10.1 は字句の規則を定めていないので、次のように決めた（PR の「仕様の確認事項」にも記載）：
//  - 空白は ASCII の space / tab / LF / CR だけ。NBSP や全角空白は `invalidCharacter`。
//  - 数値は `[0-9]+(\.[0-9]+)?` だけ。`1.`・`.5`・`1e3`・`12abc` は `invalidNumber`（符号は数値の一部でない）。
//  - 名前は `[A-Za-z][A-Za-z0-9_]*` を最長一致で切り出してから、`^[a-z][A-Za-z0-9_]*$` なら識別子
//    （fieldId・予約語）、`^[A-Z][A-Z0-9_]*$` なら大文字名（TRUE / FALSE / BLANK・関数名）、どちらでも
//    なければ（`Abc`・`Parent`）`invalidName`。先頭の `_` は `invalidCharacter`。大文字小文字は完全に区別する。
//  - 文字列は `"` から `"` まで。`""` で `"` を表す。改行や非 ASCII 文字をそのまま含められる。
//    閉じる `"` がなければ `unterminatedString`（位置は開く `"`）。
import type { BinaryOperator, ParseErrorReason, Span } from "./ast.ts";

/** 演算子以外の記号。 */
export type Punct = "(" | ")" | "," | ".";

export type Token =
  | { readonly kind: "number"; readonly text: string; readonly span: Span }
  | { readonly kind: "string"; readonly value: string; readonly span: Span }
  | { readonly kind: "ident"; readonly name: string; readonly span: Span }
  | { readonly kind: "upper"; readonly name: string; readonly span: Span }
  | { readonly kind: "op"; readonly value: BinaryOperator; readonly span: Span }
  | { readonly kind: "punct"; readonly value: Punct; readonly span: Span }
  | { readonly kind: "eof"; readonly span: Span };

/** 字句・構文の誤り。`parseExpression` が捕まえて `ParseError` にする（外には出さない）。 */
export class ParseFailure extends Error {
  readonly reason: ParseErrorReason;
  readonly position: number;

  constructor(reason: ParseErrorReason, position: number) {
    super(reason);
    this.name = "ParseFailure";
    this.reason = reason;
    this.position = position;
  }
}

const isDigit = (c: number): boolean => c >= 0x30 && c <= 0x39;
const isLetter = (c: number): boolean => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
const isNameChar = (c: number): boolean => isLetter(c) || isDigit(c) || c === 0x5f;
const isSpace = (c: number): boolean => c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d;

const IDENT = /^[a-z][A-Za-z0-9_]*$/;
const UPPER = /^[A-Z][A-Z0-9_]*$/;

// 1 文字の記号（`.` と `<` `>` は先読みが要るので scan() で扱う）
const SINGLE_PUNCT: Readonly<Record<string, Punct>> = { "(": "(", ")": ")", ",": "," };
const SINGLE_OP: Readonly<Record<string, BinaryOperator>> = { "=": "=", "&": "&", "+": "+", "-": "-", "*": "*", "/": "/" };

export class Lexer {
  private readonly text: string;
  private pos = 0;
  private ahead: Token | undefined;

  constructor(text: string) {
    this.text = text;
  }

  /** 次のトークンを消費せずに返す。 */
  peek(): Token {
    this.ahead ??= this.scan();
    return this.ahead;
  }

  /** 次のトークンを消費して返す。 */
  next(): Token {
    const token = this.peek();
    this.ahead = undefined;
    return token;
  }

  /** 原文の `index` の文字コード。範囲外なら -1。 */
  charAt(index: number): number {
    return index < this.text.length ? this.text.charCodeAt(index) : -1;
  }

  private scan(): Token {
    const text = this.text;
    while (this.pos < text.length && isSpace(text.charCodeAt(this.pos))) this.pos++;
    const start = this.pos;
    if (start >= text.length) return { kind: "eof", span: { start, end: start } };

    const c = text.charCodeAt(start);
    if (isDigit(c)) return this.scanNumber(start);
    if (isLetter(c)) return this.scanName(start);
    if (c === 0x22) return this.scanString(start);
    if (c === 0x2e) {
      // `.` は常に区切り記号（`parent.` / `root.`）。`.5` のような数値かどうかは構文解析器が位置で判断する
      this.pos = start + 1;
      return { kind: "punct", value: ".", span: { start, end: this.pos } };
    }
    if (c === 0x3c) {
      // `<` `<>` `<=`
      const n = this.charAt(start + 1);
      const value: BinaryOperator = n === 0x3e ? "<>" : n === 0x3d ? "<=" : "<";
      this.pos = start + value.length;
      return { kind: "op", value, span: { start, end: this.pos } };
    }
    if (c === 0x3e) {
      // `>` `>=`
      const value: BinaryOperator = this.charAt(start + 1) === 0x3d ? ">=" : ">";
      this.pos = start + value.length;
      return { kind: "op", value, span: { start, end: this.pos } };
    }
    const ch = text[start] ?? "";
    const punct = SINGLE_PUNCT[ch];
    if (punct !== undefined) {
      this.pos = start + 1;
      return { kind: "punct", value: punct, span: { start, end: this.pos } };
    }
    const op = SINGLE_OP[ch];
    if (op !== undefined) {
      this.pos = start + 1;
      return { kind: "op", value: op, span: { start, end: this.pos } };
    }
    throw new ParseFailure("invalidCharacter", start);
  }

  private scanNumber(start: number): Token {
    let i = start;
    while (isDigit(this.charAt(i))) i++;
    if (this.charAt(i) === 0x2e && isDigit(this.charAt(i + 1))) {
      i += 2;
      while (isDigit(this.charAt(i))) i++;
    }
    // `1.`・`1.2.3`・`1e3`・`12abc`・`1_000` は数値として不正
    const after = this.charAt(i);
    if (after === 0x2e || isNameChar(after)) throw new ParseFailure("invalidNumber", start);
    this.pos = i;
    return { kind: "number", text: this.text.slice(start, i), span: { start, end: i } };
  }

  private scanName(start: number): Token {
    let i = start;
    while (isNameChar(this.charAt(i))) i++;
    const name = this.text.slice(start, i);
    const span: Span = { start, end: i };
    this.pos = i;
    if (IDENT.test(name)) return { kind: "ident", name, span };
    if (UPPER.test(name)) return { kind: "upper", name, span };
    throw new ParseFailure("invalidName", start);
  }

  private scanString(start: number): Token {
    let value = "";
    let i = start + 1;
    for (;;) {
      const close = this.text.indexOf('"', i);
      if (close < 0) throw new ParseFailure("unterminatedString", start);
      value += this.text.slice(i, close);
      if (this.charAt(close + 1) !== 0x22) {
        this.pos = close + 1;
        return { kind: "string", value, span: { start, end: this.pos } };
      }
      value += '"'; // `""` は `"` 1 文字
      i = close + 2;
    }
  }
}
