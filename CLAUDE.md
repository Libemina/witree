# Witree 開発ガイド

tsheet 形式の参照実装。仕様が正で、実装は仕様に従う。計画は [docs/plan/mvp-plan.md](docs/plan/mvp-plan.md)、計画 ID と Issue 番号の対応は [docs/plan/issue-map.json](docs/plan/issue-map.json)、設計判断は [docs/adr/](docs/adr/)。

## コマンド

```sh
pnpm install
pnpm check        # lint → typecheck → test。PR の前に必ず通す
pnpm lint | pnpm typecheck | pnpm test
pnpm test:browser # tsheet-core のテストを Chromium・Firefox・WebKit で実行（初回は pnpm browsers:install）
pnpm vitest run --project tsheet-core   # パッケージ単位（tsheet-core / tsheet-cli / witree / repo）
```

## 構成

- `spec/` 仕様書、`meta/` JSON Schema、`engine/engine-api.v0.1.ts` エンジン API の型定義（契約）、`examples/` サンプル
- `packages/tsheet-core` エンジン、`packages/tsheet-cli` CLI、`apps/witree` アプリ
- `test/` リポジトリ全体に対するテスト（決定性の強制の確認など）

## 規約

- 実装の前に、Issue の「仕様」に挙がっている節を読む。仕様と食い違う実装が必要になったら、実装を曲げずに仕様の修正を Issue で提案する。
- `engine/engine-api.v0.1.ts` は契約。変更は `type:spec` の Issue で、仕様書（`spec/tsheet-engine-api-v0.1.md`）と同時に行う。
- tsheet-core は決定的でなければならない。`Date`・`Math.random`・`Intl`・タイマー・`crypto`・`globalThis`・`localeCompare`・`toLocale*` は lint で、DOM / Node の型は型検査で拒否される。必要なものは `Host` から受け取る。回避のための `eslint-disable` は使わない。
- テストは各パッケージの `test/` に置く（`src/` には置かない）。診断コード（S / D / V / E 系）は、発生するケースと発生しないケースの両方をテストする。
- ESM のみ。相対 import は `.ts` 拡張子付き。enum・namespace など実行時コードを生む TypeScript 構文は使わない（`erasableSyntaxOnly`）。
- 改行は LF。コメント・テスト名・コミットメッセージの本文は日本語でよい。
- CI（`.github/workflows/ci.yml`）の `check` と `test-browser` が通らない PR は main にマージできない。tsheet-core のテストは Node とブラウザの両方で実行されるので、テストコードでも Node 専用の API（`node:fs` など）を使わない。ファイルが必要なテストデータは import できる形で用意する。
- 1 Issue = 1 ブランチ = 1 PR。PR の本文に `Closes #番号` を書く。Issue の完了条件をすべて満たしてから PR を出す。
