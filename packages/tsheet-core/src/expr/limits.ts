// 式の制限値（エンジン API 仕様 §9）。契約 `ExprLimits` の各値はリテラル型なので、ここが唯一の実体になる。
// 構文解析では `maxLength`（長さ）と `maxDepth`（構文木の深さ）だけを使う。残りは評価時の制限（E20）。
import type { ExprLimits } from "../api.ts";

export const EXPR_LIMITS: ExprLimits = {
  maxLength: 4096,
  maxDepth: 64,
  maxSteps: 100000,
  maxRegexLength: 512,
  maxStringLength: 65536,
};
