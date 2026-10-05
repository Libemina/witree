// このファイルは scripts/generate-meta-validators.ts が生成した（`pnpm generate`）。手で編集しない。

/** Ajv の ErrorObject と同じ形。Ajv の型には依存しない。 */
export interface MetaValidationError {
  /** 違反した値の位置（JSON Pointer。ルートは空文字列） */
  instancePath: string;
  /** 違反したスキーマのキーワードの位置（JSON Pointer） */
  schemaPath: string;
  /** 違反したキーワード（"required"・"type"・"additionalProperties" など） */
  keyword: string;
  /** キーワードごとの付加情報（`missingProperty`・`additionalProperty` など） */
  params: Record<string, unknown>;
  message?: string;
}

/** 生成された検証関数。適合すれば true。false のときは `errors` に違反が入る（allErrors）。 */
export interface MetaValidator {
  (data: unknown): boolean;
  errors?: MetaValidationError[] | null;
}

/** urn:tsheet:meta:workbook:0.1 */
export const workbook: MetaValidator;
/** urn:tsheet:meta:schema:0.1 */
export const schema: MetaValidator;
/** urn:tsheet:meta:record:0.1 */
export const record: MetaValidator;
/** urn:tsheet:meta:view:0.1 */
export const view: MetaValidator;
/** urn:tsheet:meta:marks:0.1 */
export const marks: MetaValidator;
