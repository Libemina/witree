// P-10: tsheet-core で禁止している API を使うコードが、lint または型検査で失敗することを確かめる。
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const eslint = new ESLint({ cwd: root });

async function lintAs(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: join(root, filePath) });
  return (result?.messages ?? []).map((m) => m.ruleId ?? "fatal");
}

const forbidden: [name: string, code: string, rule: string][] = [
  ["Date", "export const x = new Date();", "no-restricted-globals"],
  ["Date.now", "export const x = Date.now();", "no-restricted-globals"],
  ["Math.random", "export const x = Math.random();", "no-restricted-properties"],
  ["Intl", "export const x = new Intl.Collator();", "no-restricted-globals"],
  ["setTimeout", "setTimeout(() => undefined, 0);", "no-restricted-globals"],
  ["setInterval", "setInterval(() => undefined, 0);", "no-restricted-globals"],
  ["crypto", "export const x = crypto.randomUUID();", "no-restricted-globals"],
  ["globalThis", "export const x = globalThis.Date;", "no-restricted-globals"],
  ["localeCompare", 'export const x = "a".localeCompare("b");', "no-restricted-syntax"],
  ["localeCompare（添字）", 'export const x = "a"["localeCompare"]("b");', "no-restricted-syntax"],
  ["toLocaleString", "export const x = (1).toLocaleString();", "no-restricted-syntax"],
  ["toLocaleUpperCase", 'export const x = "a".toLocaleUpperCase();', "no-restricted-syntax"],
];

describe("tsheet-core の lint", () => {
  test.each(forbidden)("%s を拒否する", async (_name, code, rule) => {
    expect(await lintAs("packages/tsheet-core/src/index.ts", code)).toContain(rule);
  });

  test("禁止 API を使わないコードは通る", async () => {
    const code = 'export const x = [3, 1, 2].sort((a, b) => a - b).join(",").toUpperCase();\n';
    expect(await lintAs("packages/tsheet-core/src/index.ts", code)).toEqual([]);
  });

  test("tsheet-cli では Date を使える（禁止は tsheet-core だけ）", async () => {
    expect(await lintAs("packages/tsheet-cli/src/index.ts", "export const x = new Date();\n")).toEqual([]);
  });
});

describe("tsheet-core の型検査", () => {
  test("DOM / Node の型を使うコードは型検査に失敗する", () => {
    const tsc = createRequire(import.meta.url).resolve("typescript/bin/tsc");
    let output = "";
    try {
      execFileSync(process.execPath, [tsc, "--noEmit", "-p", join(root, "test/fixtures/core-forbidden")], {
        encoding: "utf8",
        stdio: "pipe",
      });
    } catch (e) {
      output = String((e as { stdout?: unknown }).stdout);
    }
    for (const name of ["document", "process", "setTimeout", "crypto"]) {
      expect(output).toMatch(new RegExp(String.raw`env-types\.ts.*error TS\d+: Cannot find name '${name}'`));
    }
  });
});
