# Witree

**階層型表計算ツール（ツリーシート）** — tsheet 形式の参照実装

> Witree is a hierarchical spreadsheet ("tree sheet") and the reference implementation of **tsheet**, a vendor-neutral, Git-friendly text format in which hierarchy is data and rollups / inheritance are declared in a schema.

> [!NOTE]
> 現在は仕様 v0.1（ドラフト）の段階で、実装に着手したところです。API・形式ともに予告なく変わります。

## Witree とは

Witree は、行の親子関係をデータとして持ち、集計・継承のルールをスキーマで宣言し、テキスト形式で保存する表計算ソフトです。拠点 → 機器 → インターフェースのパラメータシート、多段の WBS、区分 → 勘定科目 → 月次の予算表のように、**Excel ではインデントや小計行でしか階層を表せず、並び替えやフィルタで構造が壊れてしまうデータ** を引き受けます。

Excel の代替ではなく、補完ツールです。既存のカテゴリとは次の点で異なります。

| 比較対象 | Witree の立ち位置 |
|---|---|
| 表計算（Excel / Sheets） | 階層がデータとして保たれ、並び替えやフィルタで壊れない |
| ノーコード DB | 階層が主構造。多対多の関係は扱わない |
| アウトライナー | ノードが型と集計を持つ |
| ツリーグリッド型 PM | 階層ごとに異なる項目を定義でき、用途が PM に限定されない |
| BI | 入力・編集が主目的。多軸分析は扱わない（crosstab は 1 軸のみ） |

## 特徴

- **階層はデータ** — ノードはフラットな配列で、親を `parent` で参照します。見た目（インデント）に依存しません
- **意味と表示の分離** — 型・制約・計算はスキーマ（`schema.json`）に、列・ソート・フィルタ・書式は View（`*.view.json`）に置きます。計算結果はデータに保存しません
- **宣言的な計算** — 子 → 親の集計（`rollup`：sum / count / min / max / avg / 加重平均など）、親 → 子の継承（`inherit`）、同一ノードの式（`formula`）
- **「未設定」と「明示的な空」の区別** — キーなしは祖先から継承、`null` は継承を遮断します
- **Git で扱いやすい** — 正規化済み JSONL（1 行 1 ノード、id 順）により、同じ内容は常に同じバイト列になり、差分は意味のある変更だけを示します
- **2 つの物理形式** — フォルダ形式と単一ファイル形式（`.tsheet`）を `pack` / `unpack` で無損失に相互変換できます
- **3 つの表示モード** — `treeGrid`（WBS 向け）、`treePanel`（階層ごとに項目が違うパラメータシート向け）、`crosstab`（勘定科目 × 月のような 1 軸のクロス集計）
- **データを壊さない** — 値の違反は受理して診断で知らせ、構造の違反だけを拒否します
- **外部変更に強い** — アプリの外でファイルが書き換えられることを前提に、3 方向マージで取り込みます
- **環境に依存しない計算** — 式言語は Excel に寄せた関数名で、正規表現・文字列比較・日付演算はロケールや実行環境に依存しません

## tsheet 形式

tsheet は特定の実装に依存しないワークブック形式です（名称は常に小文字で表記します）。

```
my-params/                    フォルダ形式
├─ workbook.json              マニフェスト（settings・params を含む）
├─ schema.json                スキーマ（型・フィールド・集計・継承・制約）
├─ data.jsonl                 データ（1 行 1 ノード）
├─ views/
│  ├─ default.view.json       View 定義
│  └─ default.marks.json      手動書式
└─ docs/<recordId>/<fieldId>.md   doc 型フィールドの本文
```

単一ファイル形式は、これらのパートを固定の順序で連結したテキストです。圧縮しないため、Git で行単位の差分が取れます。

```
%%tsheet 0.1
%%part workbook.json
{ ... }
%%part schema.json
{ ... }
%%part data.jsonl
{"id":"633ce429-…","type":"Interface","parent":"413a04d8-…","order":"a1","values":{"mode":"trunk","port":"Te1/0/1"}}
%%end
```

WBS のスキーマは、たとえば次のように書きます。末端のタスクでは工数を入力し、親タスクでは子の合計を表示します。

```json
"effort": {
  "type": "number", "label": "工数", "unit": "人日",
  "rollup": { "sourceType": "Task", "sourceField": "effort", "fn": "sum", "whenNoSource": "input" }
}
```

推奨する Git の設定です。差分の見出しに変更されたパートが表示されます。

```
# .gitattributes
*.tsheet text eol=lf diff=tsheet
*.jsonl  text eol=lf
```

```sh
git config diff.tsheet.xfuncname '^%%part .*$'
```

このリポジトリ自体も `.gitattributes` で改行を LF に固定しています。Windows で作業する場合も、そのままクローンしてください。

## 構成

```
UI（React）  ──メッセージ──▶  Web Worker: tsheet-core  ◀── Host ──▶ Tauri（Rust）/ FS
CLI（Node）  ──直接呼び出し──▶  tsheet-core            ◀── Host（Node fs）
```

| パッケージ | 役割 |
|---|---|
| `tsheet-core` | エンジン。検証・計算・変更（Op のトランザクション）・射影・逆操作の生成・3 方向マージ。純粋 TypeScript（`lib: ES2022` のみ）で、I/O・時計・乱数・ロケールを持たず、必要なものは Host から注入します |
| `tsheet-cli` | 検証、`pack` / `unpack`、正規化（`fmt`）、`export`、`diff`、Git マージドライバー（`merge`） |
| `witree` | アプリ。React ＋ TanStack Table / Virtual（Web）、Tauri 2（デスクトップ）。Rust 側はファイル入出力・変更監視・アトミック保存のみを担います |

エンジンは、同じ Host の応答と同じ入力に対して常に同じ出力を返します。CI では Node.js とブラウザの両方で `load` → `serialize` の結果が一致することを確認します（ゴールデンテスト）。

## リポジトリの構成

```
spec/        仕様書（形式・View・エンジン API）
meta/        JSON Schema（Draft 2020-12）
engine/      エンジン API の型定義（契約）
examples/    サンプルワークブック
packages/    tsheet-core, tsheet-cli
apps/        witree（Web / デスクトップ）
docs/        計画（plan/）と設計判断の記録（adr/）
test/        リポジトリ全体に対するテスト
```

## 開発

Node.js 22 以上と pnpm 10 が必要です（`corepack enable` で pnpm の版が揃います）。

```sh
pnpm install
pnpm check    # lint → typecheck → test

pnpm browsers:install   # 初回のみ（Playwright のブラウザ）
pnpm test:browser       # tsheet-core のテストを Chromium・Firefox・WebKit で実行
```

開発ツールの選定理由は [docs/adr/0001-toolchain.md](docs/adr/0001-toolchain.md) に、開発時の規約は [CLAUDE.md](CLAUDE.md) に記載しています。

## ドキュメント

| 文書 | 内容 |
|---|---|
| [spec/tsheet-spec-v0.1.md](spec/tsheet-spec-v0.1.md) | 形式本体：マニフェスト、settings、スキーマ、データ、システム項目、式言語、診断（S 系・D 系） |
| [spec/tsheet-view-spec-v0.1.md](spec/tsheet-view-spec-v0.1.md) | View 定義、手動書式、crosstab、診断（V 系） |
| [spec/tsheet-engine-api-v0.1.md](spec/tsheet-engine-api-v0.1.md) | エンジンの振る舞い、Op とトランザクション、reconcile、エラー（E 系） |
| [engine/engine-api.v0.1.ts](engine/engine-api.v0.1.ts) | エンジン API の型定義 |
| [meta/](meta/) | `schema` / `record` / `view` / `marks` / `workbook` の JSON Schema |

## サンプル

| サンプル | 内容 |
|---|---|
| [examples/param-sheet/](examples/param-sheet/) | ネットワーク機器のパラメータシート。Site → Device → System / Interface → Vlan。NTP・DNS・syslog の継承と遮断、IF の対向参照、FQDN の式、VLAN 数の集計、treeGrid / treePanel の View |
| [examples/budget/](examples/budget/) | 月次予算。Category → Account → Entry。4 月始まりの会計年度、月次の crosstab、会計四半期の集計表、同じデータの treeGrid 表示 |

## ロードマップ

MVP は、パラメータシート（treePanel）、WBS（treeGrid）、月次予算（crosstab）の 3 つの題材を、開発者自身の業務で評価することを目標にしています。実装は次の順で進めます。

1. **tsheet-core** — 読み込み・検証・正規化・計算・Op の適用・Undo・射影・reconcile
2. **tsheet-cli** — 検証、形式変換、export、Git 連携
3. **witree** — Web 版とデスクトップ版の UI

MVP では次を扱いません：xlsx の入出力（Power Query で代替）、モバイルでの編集、アプリ内の Git 操作、リアルタイム共同編集、宣言的マイグレーション、型の継承、複数軸のピボット、ガント表示、権限管理。

## 開発への参加

仕様がドラフトの段階のため、まずは Issue で提案や質問をお寄せください。設計判断の多くは仕様書に理由とともに記載しています。

## ライセンス

未定（決定後に追記します）。

---

開発：[Libemina](https://github.com/oh-yoshiyuki)
