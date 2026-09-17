import { playwright } from "@vitest/browser-playwright";
import { defineProject } from "vitest/config";

// エンジンは Node とブラウザで同じ結果を返さなければならない（エンジン API 仕様 §1）。
// 同じテストを V8・SpiderMonkey・JavaScriptCore の 3 つのエンジンでも実行する。
export default defineProject({
  test: {
    name: "tsheet-core:browser",
    include: ["test/**/*.test.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      screenshotFailures: false,
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
    },
  },
});
