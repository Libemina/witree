// meta/ のメタスキーマから src/generated/meta-validators.{js,d.ts} を生成する。
//   pnpm generate          生成して書き込む
//   pnpm generate --check  コミット済みの出力が最新か確かめる（違えば終了コード 1）
// 生成の本体は meta-validators.ts。Node.js の型除去で直接実行する。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { generateMetaValidators } from "./meta-validators.ts";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(packageDir, "..", "..");
const outputs = {
  js: join(packageDir, "src", "generated", "meta-validators.js"),
  dts: join(packageDir, "src", "generated", "meta-validators.d.ts"),
};

const generated = generateMetaValidators(join(repoRoot, "meta"));
const check = process.argv.includes("--check");

let stale = 0;
for (const [kind, path] of Object.entries(outputs) as [keyof typeof outputs, string][]) {
  const content = generated[kind];
  const label = relative(repoRoot, path).replaceAll("\\", "/");
  if (check) {
    let current: string | undefined;
    try {
      current = readFileSync(path, "utf8").replaceAll("\r\n", "\n");
    } catch {
      current = undefined;
    }
    if (current === content) {
      console.log(`最新: ${label}`);
    } else {
      console.error(`古い: ${label}（pnpm generate で再生成してコミットしてください）`);
      stale++;
    }
  } else {
    writeFileSync(path, content, "utf8");
    console.log(`生成: ${label}（${content.length} 文字）`);
  }
}
if (stale > 0) process.exit(1);
