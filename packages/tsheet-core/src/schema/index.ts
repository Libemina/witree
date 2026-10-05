// スキーマの読み込み：構造検証（メタスキーマ）→ 解析 → 意味検証（S 系）→ 読み取り専用判定（本体仕様 §12 の手順 1）。
import type { Diagnostic, FieldId, PartPath } from "../api.ts";
import { validateSchemaJson } from "../structure.ts";
import { parseSchema } from "./parse.ts";
import type { SchemaModel } from "./model.ts";
import { hasSchemaError, validateSchema } from "./validate.ts";

export { SCHEMA_DIAGNOSTIC_CODES } from "./model.ts";
export type {
  CheckRule,
  ChildRule,
  Computed,
  ComputedField,
  ContainerName,
  EnumDef,
  EnumValue,
  ExprSource,
  FieldDef,
  FieldType,
  RollupFn,
  SchemaDiagnosticReason,
  SchemaModel,
  StringFormat,
  TypeDef,
  UniqueRule,
} from "./model.ts";
export { parseSchema } from "./parse.ts";
export { hasSchemaError, validateSchema, type ValidateSchemaOptions } from "./validate.ts";
export { checkDefaultValue, type DefaultViolation } from "./values.ts";

export interface LoadSchemaOptions {
  /** 診断の `at.part`。既定は "schema.json"。 */
  part?: PartPath;
  /** workbook.json の `params` のキー。省略時は S13（unknownParam）を検査しない。 */
  paramKeys?: readonly FieldId[];
}

export interface LoadSchemaResult {
  /** 構造検証を通らなかった場合は無い。 */
  model?: SchemaModel;
  diagnostics: Diagnostic[];
  /** 構造不正、または S 系の error がある（§12 の手順 1）。 */
  readOnly: boolean;
}

// structure.ts の stripBom は非公開なので、同じものをここに持つ。
const BOM = "﻿";

function stripBom(text: string): string {
  return text.startsWith(BOM) ? text.slice(1) : text;
}

/**
 * schema.json のテキストを読み込む。構造検証（validateSchemaJson）に 1 件でも違反があれば model を作らず、
 * 読み取り専用とする。適合すれば解析して意味検証し、S 系の error があれば読み取り専用とする。
 */
export function loadSchema(text: string, opts: LoadSchemaOptions = {}): LoadSchemaResult {
  const part = opts.part ?? "schema.json";
  const structural = validateSchemaJson(text, part);
  if (structural.length > 0) return { diagnostics: structural, readOnly: true };
  const model = parseSchema(JSON.parse(stripBom(text)));
  const diagnostics = validateSchema(model, opts.paramKeys === undefined ? { part } : { part, paramKeys: opts.paramKeys });
  return { model, diagnostics, readOnly: hasSchemaError(diagnostics) };
}
