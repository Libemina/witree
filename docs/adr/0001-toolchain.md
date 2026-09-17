# ADR-0001 開発ツール

- ステータス：採用
- 日付：2026-09-18
- 関連 Issue：#8（P-08）、#9（P-09）、#10（P-10）、#11（P-11）

## 背景

tsheet-core・tsheet-cli・witree を 1 つのリポジトリで開発する。エンジンは「同じ Host の応答と同じ入力に対して常に同じ出力を返す」ことが契約であり（エンジン API 仕様 §1）、Node.js とブラウザの両方で結果が一致することを CI で確認する必要がある。

## 決定

| 項目 | 決定 | 理由 |
|---|---|---|
| パッケージ管理 | pnpm workspaces（`packageManager` で版を固定） | 依存の厳格さ（宣言していないパッケージを import できない）とワークスペース機能 |
| Node.js | 22 LTS（`.nvmrc`）。`engines` は `^22.13.0 \|\| >=24`、`engine-strict=true` | ESLint 10 と Vitest 5 の要件を満たす最小の LTS |
| 言語 | TypeScript 6.0 系（`~6.0.x` で固定）、`strict` に加えて `noUncheckedIndexedAccess`・`exactOptionalPropertyTypes` など | 「未設定」と `null` の区別（本体仕様 §7）を型で守るため。7.x は typescript-eslint が未対応（対応範囲は `<6.1.0`）のため見送り、対応後に上げる |
| モジュール | ESM のみ。`module: NodeNext`、相対 import は `.ts` 拡張子付き、`erasableSyntaxOnly`・`verbatimModuleSyntax` | Node.js の型除去、Vite、Vitest のいずれでもビルドなしで動く |
| パッケージ間の参照 | `exports` がソース（`./src/index.ts`）を直接指す。ビルド手順は設けない | 開発中は Vite と Vitest がソースを直接扱える。配布用のビルドは CLI を公開する時点（C-02 以降）で決める |
| テスト | Vitest。ルートの `vitest.config.ts` が各パッケージを projects として束ねる。tsheet-core のテストは、ブラウザモード（Playwright）で Chromium・Firefox・WebKit でも実行する（`pnpm test:browser`） | Node とブラウザで同じテストを実行できる。3 つのブラウザは JavaScript エンジン（V8・SpiderMonkey・JavaScriptCore）の違いを確認するため。Tauri は Windows で Chromium 系、macOS / Linux で WebKit 系の WebView を使う |
| lint | ESLint（flat config）＋ typescript-eslint の `strictTypeChecked`・`stylisticTypeChecked` | 型情報を使う規則（Promise の放置など）を有効にするため |
| JSON Schema 検証 | Ajv の standalone コード生成（L-03 で導入） | 実行時に `new Function` を使わず、Tauri の CSP と両立する |
| フォーマッタ | 導入しない（`.editorconfig` と ESLint のみ） | 必要になった時点で再検討する |

### エンジン API の型定義の参照方法

`engine/engine-api.v0.1.ts` は契約としてリポジトリ直下に残す。tsheet-core は `src/api.ts` で `export type *` により再エクスポートし、利用側は `tsheet-core` から型を import する。契約ファイルは tsheet-core の `tsconfig.json` の `include` に含め、同じコンパイラ設定（`lib: ES2022`、`types: []`）で検査する。

### 決定性の強制（P-10）

- tsheet-core の `tsconfig.json` は `lib: ["ES2022"]`、`types: []`。DOM / Node の型を使うコードは型検査で失敗する。
- vitest の型定義が Node の型を持ち込むため、テストは `test/` に置き、`test/tsconfig.json` で別に検査する（`src/` にテストを置かない）。
- ESLint で `Date`、`Math.random`、`Intl`、`setTimeout` / `setInterval` / `setImmediate` / `queueMicrotask`、`performance`、`crypto`、`globalThis`、`localeCompare`、`toLocale*` を `packages/tsheet-core/src/` に限って禁止する。
- 上記が実際に失敗することを `test/determinism-guard.test.ts` で確認する。

### CI（P-11）

- GitHub Actions の `check`（lint・typecheck・Node でのテスト）と `test-browser`（ブラウザでのテスト）を、main のルールセットの必須ステータスチェックにする。
- ワークフローの `permissions` は `contents: read` を既定とし、アクションはコミット SHA で固定する。

## 影響

- 相対 import には `.ts` 拡張子が必要になる。
- 配布用のビルドを追加する際は、`rewriteRelativeImportExtensions` か、バンドラの導入を検討する。
- TypeScript 7 への移行は typescript-eslint の対応を待つ。
