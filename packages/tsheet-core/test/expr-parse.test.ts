import { describe, expect, test } from "vitest";
import {
  EXPR_LIMITS,
  exprDepth,
  parseExpression,
  type BinaryOperator,
  type ExprNode,
  type ParseError,
  type ParseErrorReason,
  type RefScope,
} from "../src/index.ts";

// ---------------------------------------------------------------------------
// 補助：span を外した構文木を作るビルダーと、解析結果の取り出し
// ---------------------------------------------------------------------------
type Bare = Record<string, unknown>;

const num = (text: string): Bare => ({ kind: "number", text, value: Number(text) });
const str = (value: string): Bare => ({ kind: "string", value });
const bool = (value: boolean): Bare => ({ kind: "boolean", value });
const blank = (): Bare => ({ kind: "blank" });
const ref = (field: string, scope: RefScope = "self"): Bare => ({ kind: "ref", scope, field });
const call = (name: string, ...args: Bare[]): Bare => ({ kind: "call", name, args });
const neg = (operand: Bare): Bare => ({ kind: "neg", operand });
const bin = (op: BinaryOperator, left: Bare, right: Bare): Bare => ({ kind: "binary", op, left, right });
const paren = (inner: Bare): Bare => ({ kind: "paren", inner });

function stripSpans(node: ExprNode): Bare {
  switch (node.kind) {
    case "number":
      return { kind: node.kind, text: node.text, value: node.value };
    case "string":
      return { kind: node.kind, value: node.value };
    case "boolean":
      return { kind: node.kind, value: node.value };
    case "blank":
      return { kind: node.kind };
    case "ref":
      return { kind: node.kind, scope: node.scope, field: node.field };
    case "call":
      return { kind: node.kind, name: node.name, args: node.args.map(stripSpans) };
    case "neg":
      return { kind: node.kind, operand: stripSpans(node.operand) };
    case "binary":
      return { kind: node.kind, op: node.op, left: stripSpans(node.left), right: stripSpans(node.right) };
    case "paren":
      return { kind: node.kind, inner: stripSpans(node.inner) };
  }
}

/** 解析が成功することを前提に構文木（span 付き）を返す。 */
function parsed(text: string): ExprNode {
  const result = parseExpression(text);
  if (!result.ok) throw new Error(`解析に失敗した: ${JSON.stringify(text)} → ${result.error.reason} @${result.error.position}`);
  return result.ast;
}

/** 解析が成功することを前提に span を外した構文木を返す。 */
const ast = (text: string): Bare => stripSpans(parsed(text));

/** 解析が失敗することを前提にエラーを返す。 */
function error(text: string): ParseError {
  const result = parseExpression(text);
  if (result.ok) throw new Error(`解析が成功してしまった: ${JSON.stringify(text)}`);
  return result.error;
}

function expectError(text: string, reason: ParseErrorReason, position: number): void {
  const e = error(text);
  expect({ reason: e.reason, position: e.position }).toEqual({ reason, position });
}

const BINARY_OPERATORS: readonly BinaryOperator[] = ["=", "<>", "<", "<=", ">", ">=", "&", "+", "-", "*", "/"];

// ---------------------------------------------------------------------------
// 文法の各生成規則
// ---------------------------------------------------------------------------
describe("文法の各生成規則", () => {
  describe("number", () => {
    test("整数は text と value の両方を持つ", () => {
      expect(ast("1")).toEqual(num("1"));
      expect(ast("42")).toEqual({ kind: "number", text: "42", value: 42 });
    });

    test("小数も原文を保つ（decimal の精度は原文から決める）", () => {
      expect(ast("3.25")).toEqual({ kind: "number", text: "3.25", value: 3.25 });
      expect(ast("0.50")).toEqual({ kind: "number", text: "0.50", value: 0.5 });
      expect(ast("007")).toEqual({ kind: "number", text: "007", value: 7 });
    });
  });

  describe("string", () => {
    test("引用符の中身を値にする", () => {
      expect(ast('"abc"')).toEqual(str("abc"));
    });

    test('`""` は `"` 1 文字に解除する', () => {
      expect(ast('"a""b"')).toEqual(str('a"b'));
      expect(ast('""""')).toEqual(str('"'));
      expect(ast('"""a"""')).toEqual(str('"a"'));
    });

    test("空文字列", () => {
      expect(ast('""')).toEqual(str(""));
    });

    test("改行と非 ASCII をそのまま含められる", () => {
      expect(ast('"日本語\n改行\tタブ"')).toEqual(str("日本語\n改行\tタブ"));
      expect(ast('"🙂 é"')).toEqual(str("🙂 é"));
    });
  });

  test("TRUE / FALSE / BLANK", () => {
    expect(ast("TRUE")).toEqual(bool(true));
    expect(ast("FALSE")).toEqual(bool(false));
    expect(ast("BLANK")).toEqual(blank());
  });

  describe("ref", () => {
    test("自ノード・parent・root の 3 種", () => {
      expect(ast("price")).toEqual(ref("price"));
      expect(ast("parent.total")).toEqual(ref("total", "parent"));
      expect(ast("root.rate")).toEqual(ref("rate", "root"));
    });

    test("フィールド ID は小文字始まりで、英数字と `_` を含められる", () => {
      expect(ast("a1_B2")).toEqual(ref("a1_B2"));
      expect(ast("parent . x")).toEqual(ref("x", "parent"));
    });
  });

  describe("call", () => {
    test("引数 0 個・1 個・3 個", () => {
      expect(ast("TODAY()")).toEqual(call("TODAY"));
      expect(ast("ABS(x)")).toEqual(call("ABS", ref("x")));
      expect(ast("IF(flag, 1, 2)")).toEqual(call("IF", ref("flag"), num("1"), num("2")));
    });

    test("入れ子の呼び出し", () => {
      expect(ast("ROUND(ABS(x), 2)")).toEqual(call("ROUND", call("ABS", ref("x")), num("2")));
      expect(ast("COALESCE(parent.a, root.b, BLANK)")).toEqual(call("COALESCE", ref("a", "parent"), ref("b", "root"), blank()));
    });

    test("関数名は大文字・数字・`_` を含められ、未知の名前も受理する", () => {
      expect(ast("FISCAL_YEAR(d)")).toEqual(call("FISCAL_YEAR", ref("d")));
      expect(ast("F1(1)")).toEqual(call("F1", num("1")));
      expect(ast("NO_SUCH_FUNCTION()")).toEqual(call("NO_SUCH_FUNCTION"));
    });

    test("引数には任意の式を書ける", () => {
      expect(ast("IF(a = b, x & y, -z)")).toEqual(call("IF", bin("=", ref("a"), ref("b")), bin("&", ref("x"), ref("y")), neg(ref("z"))));
    });
  });

  test("paren は構文木に残る", () => {
    expect(ast("(1)")).toEqual(paren(num("1")));
    expect(ast("((x))")).toEqual(paren(paren(ref("x"))));
  });

  describe("unary", () => {
    test("単項マイナス", () => {
      expect(ast("-1")).toEqual(neg(num("1")));
      expect(ast("-x")).toEqual(neg(ref("x")));
      expect(ast("- 1")).toEqual(neg(num("1")));
      expect(ast("-ABS(x)")).toEqual(neg(call("ABS", ref("x"))));
    });

    test("`-(-1)` は括弧を挟めば二重にできる", () => {
      expect(ast("-(-1)")).toEqual(neg(paren(neg(num("1")))));
    });
  });

  test.each(BINARY_OPERATORS)("二項演算子 %s", (op) => {
    expect(ast(`a ${op} b`)).toEqual(bin(op, ref("a"), ref("b")));
    expect(ast(`a${op}b`)).toEqual(bin(op, ref("a"), ref("b")));
  });

  test("空白は式のどこにあってもよい", () => {
    expect(ast(" \t1\n+\r\n2 ")).toEqual(bin("+", num("1"), num("2")));
    expect(ast("IF ( a , 1 , 2 )")).toEqual(call("IF", ref("a"), num("1"), num("2")));
  });
});

// ---------------------------------------------------------------------------
// 優先順位と結合
// ---------------------------------------------------------------------------
describe("優先順位と結合", () => {
  test("term は additive より強い", () => {
    expect(ast("1 + 2 * 3")).toEqual(bin("+", num("1"), bin("*", num("2"), num("3"))));
    expect(ast("1 * 2 + 3")).toEqual(bin("+", bin("*", num("1"), num("2")), num("3")));
    expect(ast("1 - 2 / 3")).toEqual(bin("-", num("1"), bin("/", num("2"), num("3"))));
  });

  test("additive / term / concat は左結合", () => {
    expect(ast("1 - 2 - 3")).toEqual(bin("-", bin("-", num("1"), num("2")), num("3")));
    expect(ast("1 / 2 / 3")).toEqual(bin("/", bin("/", num("1"), num("2")), num("3")));
    expect(ast("a & b & c")).toEqual(bin("&", bin("&", ref("a"), ref("b")), ref("c")));
    expect(ast("1 + 2 - 3 + 4")).toEqual(bin("+", bin("-", bin("+", num("1"), num("2")), num("3")), num("4")));
  });

  test("concat は compare より強く、additive より弱い", () => {
    expect(ast("a & b = c")).toEqual(bin("=", bin("&", ref("a"), ref("b")), ref("c")));
    expect(ast("a & b + c")).toEqual(bin("&", ref("a"), bin("+", ref("b"), ref("c"))));
    expect(ast("a + b & c")).toEqual(bin("&", bin("+", ref("a"), ref("b")), ref("c")));
  });

  test("unary は term より強い", () => {
    expect(ast("-2 * 3")).toEqual(bin("*", neg(num("2")), num("3")));
    expect(ast("2 * -3")).toEqual(bin("*", num("2"), neg(num("3"))));
    expect(ast("-(2 * 3)")).toEqual(neg(paren(bin("*", num("2"), num("3")))));
    expect(ast("1 - -1")).toEqual(bin("-", num("1"), neg(num("1"))));
  });

  test("括弧で優先順位を変えられる", () => {
    expect(ast("(1 + 2) * 3")).toEqual(bin("*", paren(bin("+", num("1"), num("2"))), num("3")));
  });

  test("compare は非結合：連結すると chainedComparison（位置は 2 つ目の演算子）", () => {
    expectError("a = b = c", "chainedComparison", 6);
    expectError("a < b <> c", "chainedComparison", 6);
    expectError("1 >= 2 <= 3", "chainedComparison", 7);
    expectError("a=b=c", "chainedComparison", 3);
  });

  test("括弧で囲めば比較を重ねられる", () => {
    expect(ast("(a = b) = c")).toEqual(bin("=", paren(bin("=", ref("a"), ref("b"))), ref("c")));
  });

  test("二項演算子の間に TRUE / BLANK などのリテラルを置ける", () => {
    expect(ast("x = TRUE")).toEqual(bin("=", ref("x"), bool(true)));
    expect(ast("x <> BLANK")).toEqual(bin("<>", ref("x"), blank()));
  });
});

// ---------------------------------------------------------------------------
// 予約語
// ---------------------------------------------------------------------------
describe("予約語 parent / root", () => {
  test("単独では使えない", () => {
    expectError("parent", "reservedWord", 0);
    expectError("root", "reservedWord", 0);
  });

  test("`.` が続かなければ reservedWord（位置は予約語）", () => {
    expectError("parent + 1", "reservedWord", 0);
    expectError("1 + parent", "reservedWord", 4);
    expectError("ABS(root)", "reservedWord", 4);
  });

  test("二重の参照や予約語をフィールドに置けない（位置は 2 つ目の予約語）", () => {
    expectError("parent.parent.x", "reservedWord", 7);
    expectError("root.parent", "reservedWord", 5);
    expectError("parent.root", "reservedWord", 7);
  });

  test("`.` の後が無い・識別子でない", () => {
    expectError("root.", "unexpectedEnd", 5);
    expectError("root.1", "unexpectedToken", 5);
    expectError('parent."x"', "unexpectedToken", 7);
    expectError("parent.ABS(1)", "unexpectedToken", 7);
    expectError("parent.(x)", "unexpectedToken", 7);
  });

  test("参照の後に `.` は続けられない", () => {
    expectError("parent.x.y", "unexpectedToken", 8);
    expectError("foo.bar", "unexpectedToken", 3);
    expectError("(foo.bar)", "unexpectedToken", 4);
    expectError("ABS(foo.bar)", "unexpectedToken", 7);
  });

  test("前方一致するだけの名前は普通の参照", () => {
    expect(ast("parents")).toEqual(ref("parents"));
    expect(ast("rooted")).toEqual(ref("rooted"));
    expect(ast("parent.parents")).toEqual(ref("parents", "parent"));
    expect(ast("root.rootId")).toEqual(ref("rootId", "root"));
  });

  test("大文字の PARENT / ROOT は予約語ではなく大文字名", () => {
    expect(ast("PARENT(1)")).toEqual(call("PARENT", num("1")));
    expectError("ROOT", "unexpectedToken", 0);
  });
});

// ---------------------------------------------------------------------------
// 字句の境界
// ---------------------------------------------------------------------------
describe("字句の境界", () => {
  describe("空白", () => {
    test("ASCII の space / tab / LF / CR だけを空白とする", () => {
      expect(ast("1 \t\n\r+2")).toEqual(bin("+", num("1"), num("2")));
    });

    test("NBSP・全角空白は invalidCharacter", () => {
      expectError("1 + 2", "invalidCharacter", 1);
      expectError("1　+ 2", "invalidCharacter", 1);
      expectError(" 1", "invalidCharacter", 0);
    });
  });

  describe("数値", () => {
    test.each([
      ["1.", 0],
      [".5", 0],
      ["1e3", 0],
      ["+1", 0],
      ["12abc", 0],
      ["1.2.3", 0],
      ["1_000", 0],
      ["1 + +1", 4],
      ["x + 1.", 4],
    ])("%s は invalidNumber（位置 %i）", (text, position) => {
      expectError(text, "invalidNumber", position);
    });

    test("`1.5`・`0`・`10` は数値", () => {
      expect(ast("1.5")).toEqual(num("1.5"));
      expect(ast("0")).toEqual(num("0"));
      expect(ast("10")).toEqual(num("10"));
    });

    test("数値の後に演算子や `)` が続けば境界になる", () => {
      expect(ast("1+2")).toEqual(bin("+", num("1"), num("2")));
      expect(ast("(1.5)")).toEqual(paren(num("1.5")));
    });
  });

  describe("名前", () => {
    test("小文字始まりの名前は識別子、`true` も識別子（参照）として受理する", () => {
      expect(ast("true")).toEqual(ref("true"));
      expect(ast("blank")).toEqual(ref("blank"));
      expect(ast("aB")).toEqual(ref("aB"));
      expect(ast("x_")).toEqual(ref("x_"));
    });

    test("大文字名は `(` が続けば呼び出し、続かなければ unexpectedToken", () => {
      expect(ast("FOO(1)")).toEqual(call("FOO", num("1")));
      expect(ast("FOO (1)")).toEqual(call("FOO", num("1")));
      expectError("FOO", "unexpectedToken", 0);
      expectError("1 + FOO", "unexpectedToken", 4);
      expectError("FOO + 1", "unexpectedToken", 0);
    });

    test("TRUE / FALSE / BLANK に `(` は続けられない", () => {
      expectError("TRUE(1)", "unexpectedToken", 4);
      expectError("BLANK()", "unexpectedToken", 5);
    });

    test("大文字小文字が混じる名前は invalidName", () => {
      expectError("Abc", "invalidName", 0);
      expectError("Parent", "invalidName", 0);
      expectError("True", "invalidName", 0);
      expectError("Fx(1)", "invalidName", 0);
      expectError("ABs(1)", "invalidName", 0);
      expectError("1 + Abc", "invalidName", 4);
    });

    test("大文字小文字を完全に区別する", () => {
      expectError("abs(1)", "unexpectedToken", 3);
      expect(ast("ABS(x) + abs")).toEqual(bin("+", call("ABS", ref("x")), ref("abs")));
    });

    test("先頭の `_` は invalidCharacter", () => {
      expectError("_x", "invalidCharacter", 0);
      expectError("1 + _", "invalidCharacter", 4);
    });
  });

  describe("文字列", () => {
    test("閉じる `\"` が無ければ unterminatedString（位置は開く `\"`）", () => {
      expectError('"abc', "unterminatedString", 0);
      expectError('"a""', "unterminatedString", 0);
      expectError('"', "unterminatedString", 0);
      expectError('1 + "x', "unterminatedString", 4);
    });

    test("隣り合う文字列の間には演算子が要る", () => {
      expectError('"a" "b"', "unexpectedToken", 4);
      expect(ast('"a" & "b"')).toEqual(bin("&", str("a"), str("b")));
    });
  });

  test("空の式は empty（位置 0）", () => {
    expectError("", "empty", 0);
    expectError("   ", "empty", 0);
    expectError("\n\t\r", "empty", 0);
  });

  test("末尾の余りは unexpectedToken", () => {
    expectError("1 2", "unexpectedToken", 2);
    expectError("(1))", "unexpectedToken", 3);
    expectError("x y", "unexpectedToken", 2);
    expectError("1 + 2 )", "unexpectedToken", 6);
    expectError("foo.", "unexpectedToken", 3);
  });

  test("字母にない文字は invalidCharacter", () => {
    expectError("1 + !", "invalidCharacter", 4);
    expectError("@", "invalidCharacter", 0);
    expectError("1 ! 2", "invalidCharacter", 2);
    expectError("x % 2", "invalidCharacter", 2);
    expectError("a == b", "unexpectedToken", 3); // `==` は `=` が 2 つ。字母の外ではない
    expectError("'a'", "invalidCharacter", 0);
    expectError("１", "invalidCharacter", 0);
  });

  test("字句は必要になるまで読まないので、原文上で先の誤りが報告される", () => {
    expectError("1 2 !", "unexpectedToken", 2);
    expectError("1 ! 2 3", "invalidCharacter", 2);
  });

  describe("呼び出しの引数", () => {
    test("空の引数は書けない", () => {
      expectError("F(1,)", "unexpectedToken", 4);
      expectError("F(,1)", "unexpectedToken", 2);
      expectError("F(,)", "unexpectedToken", 2);
      expectError("F(1,,2)", "unexpectedToken", 4);
    });

    test("引数の区切りは `,` だけ", () => {
      expectError("F(1 2)", "unexpectedToken", 4);
      expectError("F(1; 2)", "invalidCharacter", 3);
    });

    test("閉じ括弧が無ければ unexpectedEnd", () => {
      expectError("F(1", "unexpectedEnd", 3);
      expectError("F(", "unexpectedEnd", 2);
      expectError("F(1,", "unexpectedEnd", 4);
    });
  });

  describe("単項マイナス", () => {
    test("二重にはできない", () => {
      expectError("--1", "unexpectedToken", 1);
      expectError("1 + --1", "unexpectedToken", 5);
    });

    test("被演算子が無ければ unexpectedEnd", () => {
      expectError("-", "unexpectedEnd", 1);
      expectError("-(", "unexpectedEnd", 2);
    });
  });

  test("括弧", () => {
    expectError("()", "unexpectedToken", 1);
    expectError("(", "unexpectedEnd", 1);
    expectError("(1", "unexpectedEnd", 2);
    expectError("(1 + 2", "unexpectedEnd", 6);
    expectError("1 + )", "unexpectedToken", 4);
    expectError(")", "unexpectedToken", 0);
  });

  test("演算子の後に被演算子が無ければ unexpectedEnd（位置は末尾）", () => {
    expectError("1 +", "unexpectedEnd", 3);
    expectError("1 + ", "unexpectedEnd", 4);
    expectError("a &", "unexpectedEnd", 3);
    expectError("a =", "unexpectedEnd", 3);
  });

  test("演算子が連続すれば unexpectedToken", () => {
    expectError("1 * * 2", "unexpectedToken", 4);
    expectError("1 = = 2", "unexpectedToken", 4);
    expectError("a & & b", "unexpectedToken", 4);
  });
});

// ---------------------------------------------------------------------------
// 制限
// ---------------------------------------------------------------------------
describe("制限", () => {
  test("EXPR_LIMITS は契約の値", () => {
    expect(EXPR_LIMITS).toEqual({ maxLength: 4096, maxDepth: 64, maxSteps: 100000, maxRegexLength: 512, maxStringLength: 65536 });
  });

  describe("式の長さ（4,096 文字）", () => {
    const longString = (n: number): string => `"${"a".repeat(n - 2)}"`;
    const manyArgs = (n: number): string => `F(${"1,".repeat((n - 4) / 2)}1)`;

    test("4,095 文字と 4,096 文字は受理する", () => {
      expect(longString(4095)).toHaveLength(4095);
      expect(parseExpression(longString(4095)).ok).toBe(true);
      expect(parseExpression(`${longString(4095)} `).ok).toBe(true);
      expect(manyArgs(4096)).toHaveLength(4096);
      const result = parseExpression(manyArgs(4096));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.ast.kind).toBe("call");
        expect(exprDepth(result.ast)).toBe(2);
      }
    });

    test("4,097 文字は tooLong（位置は 4,096）", () => {
      expectError(longString(4097), "tooLong", 4096);
      expectError(`${longString(4095)}  `, "tooLong", 4096);
      expectError(`${manyArgs(4096)} `, "tooLong", 4096);
    });

    test("長さは字句解析の前に検査する（他の誤りより優先される）", () => {
      expectError(`!${" ".repeat(4096)}`, "tooLong", 4096);
      expectError(" ".repeat(4097), "tooLong", 4096);
    });

    test("長さは UTF-16 コード単位で数える（サロゲートペアは 2）", () => {
      const emoji = `"${"🙂".repeat(2047)}"`; // 2 + 2047 * 2 = 4096 コード単位
      expect(emoji).toHaveLength(4096);
      expect(parseExpression(emoji).ok).toBe(true);
      expectError(`"${"🙂".repeat(2047)}a"`, "tooLong", 4096); // 4097 コード単位（コードポイントは 2,050）
    });
  });

  describe("構文木の深さ（64）", () => {
    test("exprDepth の定義", () => {
      expect(exprDepth(parsed("1"))).toBe(1);
      expect(exprDepth(parsed('"a"'))).toBe(1);
      expect(exprDepth(parsed("parent.x"))).toBe(1);
      expect(exprDepth(parsed("-1"))).toBe(2);
      expect(exprDepth(parsed("(1)"))).toBe(2);
      expect(exprDepth(parsed("F(1)"))).toBe(2);
      expect(exprDepth(parsed("F()"))).toBe(1);
      expect(exprDepth(parsed("1+2"))).toBe(2);
      expect(exprDepth(parsed("1+2+3"))).toBe(3);
      expect(exprDepth(parsed("F(1, (2))"))).toBe(3);
      expect(exprDepth(parsed("1 + F(2) * 3"))).toBe(4);
    });

    test("括弧の入れ子：63 対（深さ 64）は受理、64 対は tooDeep", () => {
      const ok = `${"(".repeat(63)}1${")".repeat(63)}`;
      expect(exprDepth(parsed(ok))).toBe(64);
      expectError(`${"(".repeat(64)}1${")".repeat(64)}`, "tooDeep", 63);
    });

    test("呼び出しの入れ子：63 段は受理、64 段は tooDeep", () => {
      const ok = `${"ABS(".repeat(63)}1${")".repeat(63)}`;
      expect(exprDepth(parsed(ok))).toBe(64);
      expectError(`${"ABS(".repeat(64)}1${")".repeat(64)}`, "tooDeep", 63 * 4);
    });

    test("引数のない呼び出しは段を消費しない", () => {
      expect(exprDepth(parsed(`${"(".repeat(63)}F()${")".repeat(63)}`))).toBe(64);
      expectError(`${"(".repeat(63)}F(1)${")".repeat(63)}`, "tooDeep", 63);
    });

    test("左結合の連鎖：63 回（深さ 64）は受理、64 回は tooDeep（位置は 64 個目の演算子）", () => {
      const ok = `${"1+".repeat(63)}1`;
      expect(exprDepth(parsed(ok))).toBe(64);
      expectError(`${"1+".repeat(64)}1`, "tooDeep", 127);
      expectError(`${"a&".repeat(64)}a`, "tooDeep", 127);
    });

    test("単項マイナスの入れ子", () => {
      const inner = `${"-(".repeat(31)}1${")".repeat(31)}`; // 深さ 63
      expect(exprDepth(parsed(inner))).toBe(63);
      expect(exprDepth(parsed(`(${inner})`))).toBe(64);
      expect(ast("-(-(-1))")).toEqual(neg(paren(neg(paren(neg(num("1")))))));
      expectError(`${"-(".repeat(32)}1${")".repeat(32)}`, "tooDeep", 63);
    });

    test("深さの組み合わせ（paren / call / neg / binary を混ぜる）", () => {
      const unit = "-(F(1+"; // neg → paren → call → binary で 4 段消費
      const ok = `${unit.repeat(15)}1${"))".repeat(15)}`; // 60 + 1 = 61… ではなく binary の右辺 1 を含めて 61
      expect(parseExpression(ok).ok).toBe(true);
      expect(exprDepth(parsed(ok))).toBe(61);
      expect(exprDepth(parsed(`(((${ok})))`))).toBe(64);
      expectError(`((((${ok}))))`, "tooDeep", 0);
    });

    test("4,096 文字いっぱいの `(((…` でも例外を投げず tooDeep を返す", () => {
      const text = "(".repeat(4096);
      expect(text).toHaveLength(4096);
      expect(() => parseExpression(text)).not.toThrow();
      expectError(text, "tooDeep", 63);
      expectError("ABS(".repeat(1024), "tooDeep", 63 * 4);
      expectError("-".repeat(4096), "unexpectedToken", 1);
    });

    test("深さの判定は長さの判定より後", () => {
      expectError("(".repeat(4097), "tooLong", 4096);
    });
  });
});

// ---------------------------------------------------------------------------
// エラー位置とメッセージ
// ---------------------------------------------------------------------------
describe("エラーの位置とメッセージ", () => {
  test("代表的な位置", () => {
    expectError("1 +", "unexpectedEnd", 3);
    expectError("(1", "unexpectedEnd", 2);
    expectError("1 2", "unexpectedToken", 2);
    expectError('"abc', "unterminatedString", 0);
    expectError("1 + !", "invalidCharacter", 4);
  });

  const SAMPLES: Readonly<Record<ParseErrorReason, readonly string[]>> = {
    tooLong: [" ".repeat(4097), `"${"a".repeat(5000)}"`],
    tooDeep: ["(".repeat(100), `${"1+".repeat(100)}1`],
    empty: ["", "  "],
    invalidCharacter: ["!", "1 + @"],
    unterminatedString: ['"', '1 & "x'],
    invalidNumber: ["1.", "+1"],
    invalidName: ["Abc", "ABS(Xy)"],
    reservedWord: ["parent", "root.parent"],
    chainedComparison: ["a = b = c", "1 < 2 < 3"],
    unexpectedToken: ["1 2", "FOO"],
    unexpectedEnd: ["1 +", "("],
  };

  test.each(Object.entries(SAMPLES))("%s のメッセージは入力によらず固定の日本語", (reason, inputs) => {
    const messages = new Set(inputs.map((text) => error(text).message));
    expect(messages.size).toBe(1);
    const [message] = messages;
    expect(message).toBeDefined();
    expect(message).not.toBe("");
    expect(message).toMatch(/[぀-ヿ一-鿿]/); // かな・漢字を含む
    expect(message).not.toMatch(/Error|at line|Unexpected/); // JS エンジンの例外メッセージを含めない
    for (const text of inputs) expect(error(text).reason).toBe(reason);
  });

  test("理由ごとにメッセージは異なる", () => {
    const messages = Object.values(SAMPLES).map((inputs) => error(inputs[0] ?? "").message);
    expect(new Set(messages).size).toBe(messages.length);
  });
});

// ---------------------------------------------------------------------------
// 決定性
// ---------------------------------------------------------------------------
describe("決定性", () => {
  const INPUTS: readonly string[] = [
    "1",
    "3.25",
    '"a""b"',
    "TRUE",
    "BLANK",
    "parent.total * root.rate",
    "IF(a = b, x & y, -z)",
    "1 + 2 * 3 - 4 / 5",
    "-(2 * 3)",
    "(a = b) = c",
    "COALESCE(parent.a, root.b, BLANK)",
    "ROUND(ABS(x), 2) & \"件\"",
    `${"(".repeat(63)}1${")".repeat(63)}`,
    `${"1+".repeat(63)}1`,
    "",
    "   ",
    "1 +",
    "(1",
    "1 2",
    '"abc',
    "1 + !",
    "parent",
    "root.",
    "a = b = c",
    "--1",
    "F(1,)",
    "Abc",
    "1e3",
    " 1",
    "(".repeat(4096),
    " ".repeat(4097),
    `${"1+".repeat(64)}1`,
  ];

  test("同じ入力には同じ結果を返す（toEqual）", () => {
    for (const text of INPUTS) {
      expect(parseExpression(text)).toEqual(parseExpression(text));
    }
  });

  test("同じ入力には同じ結果を返す（JSON.stringify の一致）", () => {
    const first = INPUTS.map((text) => JSON.stringify(parseExpression(text)));
    const second = INPUTS.map((text) => JSON.stringify(parseExpression(text)));
    expect(second).toEqual(first);
  });

  test("結果は入力に関係なく独立している（前の解析が後に影響しない）", () => {
    const alone = JSON.stringify(parseExpression("1 + 2"));
    for (const text of INPUTS) parseExpression(text);
    expect(JSON.stringify(parseExpression("1 + 2"))).toBe(alone);
  });
});

// ---------------------------------------------------------------------------
// span
// ---------------------------------------------------------------------------
describe("span", () => {
  test("`1 + (2)` の各ノード", () => {
    const node = parsed("1 + (2)");
    expect(node.span).toEqual({ start: 0, end: 7 });
    if (node.kind !== "binary") throw new Error("binary ではない");
    expect(node.left.span).toEqual({ start: 0, end: 1 });
    expect(node.right.span).toEqual({ start: 4, end: 7 });
    if (node.right.kind !== "paren") throw new Error("paren ではない");
    expect(node.right.inner.span).toEqual({ start: 5, end: 6 });
  });

  test("文字列リテラルの span は引用符を含む", () => {
    expect(parsed('"a""b"').span).toEqual({ start: 0, end: 6 });
    expect(parsed('""').span).toEqual({ start: 0, end: 2 });
    expect(parsed(' "x" ').span).toEqual({ start: 1, end: 4 });
  });

  test("前後の空白は span に含めない", () => {
    expect(parsed("  1  ").span).toEqual({ start: 2, end: 3 });
    expect(parsed(" 1 + 2 ").span).toEqual({ start: 1, end: 6 });
  });

  test("参照・呼び出し・単項マイナスの span", () => {
    expect(parsed("parent.x").span).toEqual({ start: 0, end: 8 });
    expect(parsed("parent . x").span).toEqual({ start: 0, end: 10 });
    const callNode = parsed("F(1, 22)");
    expect(callNode.span).toEqual({ start: 0, end: 8 });
    if (callNode.kind !== "call") throw new Error("call ではない");
    expect(callNode.args.map((a) => a.span)).toEqual([
      { start: 2, end: 3 },
      { start: 5, end: 7 },
    ]);
    expect(parsed("F()").span).toEqual({ start: 0, end: 3 });
    const negNode = parsed("- 1");
    expect(negNode.span).toEqual({ start: 0, end: 3 });
    if (negNode.kind !== "neg") throw new Error("neg ではない");
    expect(negNode.operand.span).toEqual({ start: 2, end: 3 });
  });

  test("2 文字の演算子を含む二項演算の span", () => {
    const node = parsed("a <> b");
    expect(node.span).toEqual({ start: 0, end: 6 });
    if (node.kind !== "binary") throw new Error("binary ではない");
    expect(node.right.span).toEqual({ start: 5, end: 6 });
  });

  test("span は UTF-16 コード単位で数える", () => {
    const node = parsed('"🙂" & x');
    if (node.kind !== "binary") throw new Error("binary ではない");
    expect(node.left.span).toEqual({ start: 0, end: 4 });
    expect(node.right.span).toEqual({ start: 7, end: 8 });
  });
});
