// @ts-check
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// tsheet-core は「同じ Host の応答と同じ入力に対して常に同じ出力を返す」ことが契約（エンジン API 仕様 §1）。
// 時計・乱数・ロケール・タイマー・実行環境に依存する API は Host から注入し、エンジン内では使わない。
const viaHost = "tsheet-core では使えません（決定性）。";
const forbiddenGlobals = [
  { name: "Date", message: `${viaHost}日付演算は自前の実装を、現在時刻は Host.clock を使ってください。` },
  { name: "Intl", message: `${viaHost}ロケールに依存しない自前の実装を使ってください。` },
  { name: "setTimeout", message: viaHost },
  { name: "setInterval", message: viaHost },
  { name: "setImmediate", message: viaHost },
  { name: "queueMicrotask", message: viaHost },
  { name: "performance", message: viaHost },
  { name: "crypto", message: `${viaHost}ハッシュは Host.hash を、ID は Host.ids を使ってください。` },
  { name: "globalThis", message: `${viaHost}グローバル経由で禁止 API に届くのを防ぐため、参照そのものを禁止しています。` },
];

export default defineConfig(
  {
    ignores: ["**/node_modules/", "**/dist/", "**/build/", "**/coverage/", "**/target/", "test/fixtures/"],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["engine/*.ts", "packages/*/vitest.config.ts", "packages/*/vitest.browser.config.ts", "apps/*/vitest.config.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
  {
    // 契約の型定義は仕様書と対照しやすい書き方を優先する（1 行の型、`TypeName | "Root"` のように
    // 取りうる値を示すための冗長な共用体）ので、書式系の規則を外す。
    files: ["engine/**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
    },
  },
  {
    files: ["eslint.config.js", "**/vitest.*config.ts", "test/**/*.ts", "packages/tsheet-cli/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["packages/tsheet-core/src/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", ...forbiddenGlobals],
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: `${viaHost}ID は Host.ids を使ってください。` },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='localeCompare'], MemberExpression[property.value='localeCompare']",
          message: `localeCompare は${viaHost}コードポイント順で比較してください。`,
        },
        {
          selector: "MemberExpression[property.name=/^toLocale/], MemberExpression[property.value=/^toLocale/]",
          message: `toLocale* は${viaHost}`,
        },
      ],
    },
  },
);
