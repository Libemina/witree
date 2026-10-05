// 式言語の公開面（X-01：字句解析・構文解析）。字句解析器（lexer.ts）は内部用で公開しない。
export type {
  BinaryNode,
  BinaryOperator,
  BlankNode,
  BooleanNode,
  CallNode,
  ExprNode,
  NegNode,
  NumberNode,
  ParenNode,
  ParseError,
  ParseErrorReason,
  ParseResult,
  RefNode,
  RefScope,
  Span,
  StringNode,
} from "./ast.ts";
export { EXPR_LIMITS } from "./limits.ts";
export { exprDepth, parseExpression } from "./parser.ts";
