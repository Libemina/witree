import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/*/vitest.config.ts",
      "apps/*/vitest.config.ts",
      // ブラウザで実行するプロジェクト。`pnpm test:browser` で実行する（`pnpm test` には含めない）。
      "packages/*/vitest.browser.config.ts",
      { test: { name: "repo", include: ["test/**/*.test.ts"], testTimeout: 60_000 } },
    ],
  },
});
