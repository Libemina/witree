// L-03: packages/tsheet-core/src/generated/ にコミットしてある検証関数が、meta/ のメタスキーマから
// いま生成したものと一致すること（`pnpm generate` の実行漏れがないこと）と、生成コードが tsheet-core の
// 決定性の規約（ADR-0001）を守っていることを確かめる。生成は Node.js でしか行えないので、リポジトリ全体の
// テストに置く。
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { FORBIDDEN_IN_GENERATED, generateMetaValidators } from "../packages/tsheet-core/scripts/meta-validators.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = join(root, "packages", "tsheet-core", "src", "generated");

function committed(file: string): string {
  return readFileSync(join(generatedDir, file), "utf8").replaceAll("\r\n", "\n");
}

const generated = generateMetaValidators(join(root, "meta"));

describe("生成した検証関数", () => {
  test("meta-validators.js はコミット済みの内容と一致する（違えば pnpm generate）", () => {
    expect(committed("meta-validators.js")).toBe(generated.js);
  });

  test("meta-validators.d.ts はコミット済みの内容と一致する（違えば pnpm generate）", () => {
    expect(committed("meta-validators.d.ts")).toBe(generated.dts);
  });

  test("生成は決定的である", () => {
    expect(generateMetaValidators(join(root, "meta"))).toEqual(generated);
  });

  test("ESM で、require や new Function を含まない", () => {
    expect(generated.js).toMatch(/^import \* as runtime from "\.\.\/meta-runtime\.ts";$/m);
    expect(generated.js).not.toMatch(/\brequire\(/);
    expect(generated.js).not.toMatch(/\bnew Function\b/);
    expect(generated.js).not.toMatch(/\beval\(/);
  });

  test.each(FORBIDDEN_IN_GENERATED.map((re) => [re.source, re]))("禁止された語を含まない: %s", (_source, re) => {
    expect(generated.js).not.toMatch(re);
  });

  test("5 つのメタスキーマの検証関数をエクスポートする", () => {
    for (const name of ["workbook", "schema", "record", "view", "marks"]) {
      expect(generated.js).toMatch(new RegExp(`^export const ${name} = validate\\d+;$`, "m"));
      expect(generated.dts).toContain(`export const ${name}: MetaValidator;`);
    }
  });
});
