// 式の構文解析（本体仕様 §10.1 の文法、エンジン API 仕様 §9 の制限）。再帰下降で、文法どおりの優先順位と結合にする：
//  - compare は非結合（`a = b = c` は chainedComparison。位置は 2 つ目の演算子）
//  - concat / additive / term は左結合（ループで畳む。再帰しない）
//  - unary の `-` は高々 1 つ（`--1` は unexpectedToken。`-(-1)` は可）
//  - `parent` / `root` の後には `.` と fieldId が必須（単独・`parent.parent.x`・`root.parent` は reservedWord）
//  - 大文字名は TRUE / FALSE / BLANK か、`(` が続けば関数呼び出し。それ以外は unexpectedToken
//  - `F()` は可、`F(1,)` / `F(,1)` は不可
//
// 型検査・参照解決・関数名の存在・引数の個数は検査しない（X-02）。診断コードも付けない（S07 / V06 は呼び出し側が決める）。
//
// 制限（PR の「仕様の確認事項」にも記載）：
//  - 長さは UTF-16 コード単位で数え、`maxLength` を超えていれば字句解析の前に tooLong（位置は maxLength）。
//  - 深さは構文木のノードの入れ子の段数（根 = 1、葉 = 1、paren / call / neg / binary は 1 段消費）。
//    `exprDepth(ast) > maxDepth` なら tooDeep。構文解析の途中でも、`(`・引数付きの `F(`・`-` で入るたびに
//    `nesting` を数えて早期に打ち切る（4,096 文字の `((((…` でもスタックを使い切らない）ほか、
//    ノードを作るたびに深さを確かめて、左結合の長い連鎖（`1+1+…`）も演算子の位置で打ち切る。
import type { BinaryOperator, ExprNode, ParseErrorReason, ParseResult, RefScope } from "./ast.ts";
import { Lexer, ParseFailure, type Token } from "./lexer.ts";
import { EXPR_LIMITS } from "./limits.ts";

/** 理由ごとに固定の日本語メッセージ（JavaScript エンジンの例外メッセージは含めない。決定性のため）。 */
const MESSAGES: Readonly<Record<ParseErrorReason, string>> = {
  tooLong: "式が長すぎます（最大 4,096 文字）",
  tooDeep: "式の入れ子が深すぎます（最大 64 段）",
  empty: "式が空です",
  invalidCharacter: "式に使えない文字があります",
  unterminatedString: '文字列が閉じられていません（`"` で閉じる。`"` 自体は `""` と書く）',
  invalidNumber: "数値の形式が不正です（`123` または `123.45` の形で書く）",
  invalidName: "名前の形式が不正です（フィールドは小文字で始め、関数名は大文字・数字・`_` だけで書く）",
  reservedWord: "`parent` と `root` は `parent.フィールド` / `root.フィールド` の形でだけ使えます",
  chainedComparison: "比較演算子は連結できません（`a = b = c` のようには書けない）",
  unexpectedToken: "この位置に置けない記号です",
  unexpectedEnd: "式が途中で終わっています",
};

const COMPARE_OPS: ReadonlySet<BinaryOperator> = new Set<BinaryOperator>(["=", "<>", "<", "<=", ">", ">="]);
const CONCAT_OPS: ReadonlySet<BinaryOperator> = new Set<BinaryOperator>(["&"]);
const ADDITIVE_OPS: ReadonlySet<BinaryOperator> = new Set<BinaryOperator>(["+", "-"]);
const TERM_OPS: ReadonlySet<BinaryOperator> = new Set<BinaryOperator>(["*", "/"]);

const isDigit = (c: number): boolean => c >= 0x30 && c <= 0x39;

/** 解析したノードと、その部分木の深さ。 */
interface Parsed {
  readonly node: ExprNode;
  readonly depth: number;
}

const leaf = (node: ExprNode): Parsed => ({ node, depth: 1 });

function isPunct(token: Token, value: "(" | ")" | "," | "."): boolean {
  return token.kind === "punct" && token.value === value;
}

function binaryOpOf(token: Token, ops: ReadonlySet<BinaryOperator>): BinaryOperator | undefined {
  return token.kind === "op" && ops.has(token.value) ? token.value : undefined;
}

class Parser {
  private readonly lexer: Lexer;
  /** いま入っている `(`・引数付きの `F(`・`-` の数。スタックの保護用（冒頭の注）。 */
  private nesting = 0;

  constructor(text: string) {
    this.lexer = new Lexer(text);
  }

  parse(): ExprNode {
    if (this.lexer.peek().kind === "eof") throw new ParseFailure("empty", 0);
    const { node } = this.parseCompare();
    const rest = this.lexer.peek();
    if (rest.kind !== "eof") throw new ParseFailure("unexpectedToken", rest.span.start);
    return node;
  }

  // compare = concat [ ( "=" | "<>" | "<" | "<=" | ">" | ">=" ) concat ]
  private parseCompare(): Parsed {
    const left = this.parseConcat();
    const opToken = this.lexer.peek();
    const op = binaryOpOf(opToken, COMPARE_OPS);
    if (op === undefined) return left;
    this.lexer.next();
    const right = this.parseConcat();
    const chained = this.lexer.peek();
    if (binaryOpOf(chained, COMPARE_OPS) !== undefined) throw new ParseFailure("chainedComparison", chained.span.start);
    return this.binary(op, left, right, opToken.span.start);
  }

  // concat = additive { "&" additive }
  private parseConcat(): Parsed {
    return this.parseLeftAssociative(CONCAT_OPS, () => this.parseAdditive());
  }

  // additive = term { ( "+" | "-" ) term }
  private parseAdditive(): Parsed {
    return this.parseLeftAssociative(ADDITIVE_OPS, () => this.parseTerm());
  }

  // term = unary { ( "*" | "/" ) unary }
  private parseTerm(): Parsed {
    return this.parseLeftAssociative(TERM_OPS, () => this.parseUnary());
  }

  /** 左結合の二項演算をループで畳む。 */
  private parseLeftAssociative(ops: ReadonlySet<BinaryOperator>, operand: () => Parsed): Parsed {
    let left = operand();
    for (;;) {
      const opToken = this.lexer.peek();
      const op = binaryOpOf(opToken, ops);
      if (op === undefined) return left;
      this.lexer.next();
      left = this.binary(op, left, operand(), opToken.span.start);
    }
  }

  // unary = [ "-" ] primary
  private parseUnary(): Parsed {
    const minus = this.lexer.peek();
    if (minus.kind !== "op" || minus.value !== "-") return this.parsePrimary();
    this.lexer.next();
    this.enter(minus.span.start);
    const operand = this.parsePrimary();
    this.leave();
    return this.wrap(
      { kind: "neg", operand: operand.node, span: { start: minus.span.start, end: operand.node.span.end } },
      operand.depth + 1,
      minus.span.start,
    );
  }

  // primary = number | string | "TRUE" | "FALSE" | "BLANK" | ref | call | "(" expr ")"
  private parsePrimary(): Parsed {
    const token = this.lexer.next();
    switch (token.kind) {
      case "number":
        return leaf({ kind: "number", text: token.text, value: Number(token.text), span: token.span });
      case "string":
        return leaf({ kind: "string", value: token.value, span: token.span });
      case "ident":
        return this.parseRef(token);
      case "upper":
        return this.parseUpper(token);
      case "punct":
        if (token.value === "(") return this.parseParen(token);
        // `.5` のような小数点から始まる数値は認めない（`root.1` の `.` は parseRef が先に消費するので、ここには来ない）
        if (token.value === "." && isDigit(this.lexer.charAt(token.span.end))) {
          throw new ParseFailure("invalidNumber", token.span.start);
        }
        throw new ParseFailure("unexpectedToken", token.span.start);
      case "op":
        // `+1` のような符号付きの数値は認めない（符号は数値の一部でない）。`--1` の 2 つ目の `-` などはここに来る
        if (token.value === "+" && isDigit(this.lexer.charAt(token.span.end))) {
          throw new ParseFailure("invalidNumber", token.span.start);
        }
        throw new ParseFailure("unexpectedToken", token.span.start);
      case "eof":
        throw new ParseFailure("unexpectedEnd", token.span.start);
    }
  }

  // ref = [ ( "parent" | "root" ) "." ] fieldId
  private parseRef(head: Extract<Token, { kind: "ident" }>): Parsed {
    const scope = scopeOf(head.name);
    if (scope === undefined) {
      // 識別子の後の `.` は文法にない（`foo.bar`）。呼び出し側が unexpectedToken にする
      return leaf({ kind: "ref", scope: "self", field: head.name, span: head.span });
    }
    if (!isPunct(this.lexer.peek(), ".")) throw new ParseFailure("reservedWord", head.span.start);
    this.lexer.next();
    const field = this.lexer.next();
    if (field.kind === "eof") throw new ParseFailure("unexpectedEnd", field.span.start);
    if (field.kind !== "ident") throw new ParseFailure("unexpectedToken", field.span.start);
    if (scopeOf(field.name) !== undefined) throw new ParseFailure("reservedWord", field.span.start);
    return leaf({ kind: "ref", scope, field: field.name, span: { start: head.span.start, end: field.span.end } });
  }

  // "TRUE" | "FALSE" | "BLANK" | call
  private parseUpper(name: Extract<Token, { kind: "upper" }>): Parsed {
    switch (name.name) {
      case "TRUE":
        return leaf({ kind: "boolean", value: true, span: name.span });
      case "FALSE":
        return leaf({ kind: "boolean", value: false, span: name.span });
      case "BLANK":
        return leaf({ kind: "blank", span: name.span });
      default:
        if (!isPunct(this.lexer.peek(), "(")) throw new ParseFailure("unexpectedToken", name.span.start);
        return this.parseCall(name);
    }
  }

  // call = FUNCNAME "(" [ expr { "," expr } ] ")"
  private parseCall(name: Extract<Token, { kind: "upper" }>): Parsed {
    this.lexer.next(); // "("
    const close = this.lexer.peek();
    if (isPunct(close, ")")) {
      this.lexer.next();
      // 引数のない呼び出しは葉（深さ 1）
      return leaf({ kind: "call", name: name.name, args: [], span: { start: name.span.start, end: close.span.end } });
    }
    this.enter(name.span.start);
    const args: ExprNode[] = [];
    let depth = 0;
    for (;;) {
      const arg = this.parseCompare();
      args.push(arg.node);
      depth = Math.max(depth, arg.depth);
      const separator = this.lexer.next();
      if (isPunct(separator, ",")) continue;
      if (isPunct(separator, ")")) {
        this.leave();
        return this.wrap(
          { kind: "call", name: name.name, args, span: { start: name.span.start, end: separator.span.end } },
          depth + 1,
          name.span.start,
        );
      }
      if (separator.kind === "eof") throw new ParseFailure("unexpectedEnd", separator.span.start);
      throw new ParseFailure("unexpectedToken", separator.span.start);
    }
  }

  // "(" expr ")"
  private parseParen(open: Extract<Token, { kind: "punct" }>): Parsed {
    this.enter(open.span.start);
    const inner = this.parseCompare();
    const close = this.lexer.next();
    if (close.kind === "eof") throw new ParseFailure("unexpectedEnd", close.span.start);
    if (!isPunct(close, ")")) throw new ParseFailure("unexpectedToken", close.span.start);
    this.leave();
    return this.wrap({ kind: "paren", inner: inner.node, span: { start: open.span.start, end: close.span.end } }, inner.depth + 1, open.span.start);
  }

  private binary(op: BinaryOperator, left: Parsed, right: Parsed, position: number): Parsed {
    return this.wrap(
      { kind: "binary", op, left: left.node, right: right.node, span: { start: left.node.span.start, end: right.node.span.end } },
      Math.max(left.depth, right.depth) + 1,
      position,
    );
  }

  /** 入れ子に 1 段入る。この段の構文は中身より 1 段深いので、`nesting` が maxDepth に達したら深さの超過が確定する。 */
  private enter(position: number): void {
    this.nesting++;
    if (this.nesting >= EXPR_LIMITS.maxDepth) throw new ParseFailure("tooDeep", position);
  }

  private leave(): void {
    this.nesting--;
  }

  /** 作ったノードの深さを確かめる。 */
  private wrap(node: ExprNode, depth: number, position: number): Parsed {
    if (depth > EXPR_LIMITS.maxDepth) throw new ParseFailure("tooDeep", position);
    return { node, depth };
  }
}

function scopeOf(name: string): Exclude<RefScope, "self"> | undefined {
  return name === "parent" || name === "root" ? name : undefined;
}

function failure(reason: ParseErrorReason, position: number): ParseResult {
  return { ok: false, error: { reason, position, message: MESSAGES[reason] } };
}

/**
 * 構文木の深さ。根と葉（number / string / boolean / blank / ref / 引数のない call）が 1、
 * paren / call / neg / binary は中身より 1 深い。再帰せず明示スタックで数える。
 */
export function exprDepth(root: ExprNode): number {
  let max = 0;
  const stack: { node: ExprNode; level: number }[] = [{ node: root, level: 1 }];
  for (let item = stack.pop(); item !== undefined; item = stack.pop()) {
    const { node, level } = item;
    if (level > max) max = level;
    switch (node.kind) {
      case "neg":
        stack.push({ node: node.operand, level: level + 1 });
        break;
      case "paren":
        stack.push({ node: node.inner, level: level + 1 });
        break;
      case "binary":
        stack.push({ node: node.left, level: level + 1 }, { node: node.right, level: level + 1 });
        break;
      case "call":
        for (const arg of node.args) stack.push({ node: arg, level: level + 1 });
        break;
      default:
        break;
    }
  }
  return max;
}

/**
 * 式を構文解析する（§10.1）。例外を投げず、失敗は `ParseError`（理由・位置・固定の日本語メッセージ）で返す。
 * 同じ入力には常に同じ結果を返す。
 */
export function parseExpression(text: string): ParseResult {
  if (text.length > EXPR_LIMITS.maxLength) return failure("tooLong", EXPR_LIMITS.maxLength);
  let ast: ExprNode;
  try {
    ast = new Parser(text).parse();
  } catch (e) {
    if (e instanceof ParseFailure) return failure(e.reason, e.position);
    throw e;
  }
  // 最終判定。構文解析中の検査と一致するので、ここで超えることはないはず
  if (exprDepth(ast) > EXPR_LIMITS.maxDepth) return failure("tooDeep", ast.span.start);
  return { ok: true, ast };
}
