# Witree MVP 計画（ラベル・マイルストーン・Issue）

対象リポジトリ：`oh-yoshiyuki/witree`
GitHub Project：`Witree MVP`（ユーザー所有）

---

## Claude Code への実行手順

このファイルを読み、`gh` で以下を登録してください。**実行前に、作成する件数と内容の一覧を提示して確認を取ること。**

1. `gh auth status` を確認する。Project の操作に `project` スコープが必要なので、不足していれば `gh auth refresh -s project,read:project` を案内する。
2. 「ラベル」の表のとおり `gh label create <name> --color <color> --description <desc> --force` で作成する。既存の既定ラベル（bug, enhancement など）は削除しない。
3. 「マイルストーン」の表のとおり `gh api repos/oh-yoshiyuki/witree/milestones -f title=... -f description=...` で作成する。同名のものがあればスキップする。
4. `gh project create --owner oh-yoshiyuki --title "Witree MVP"` で Project を作り、`gh project link` でリポジトリに紐づける。「Project のフィールド」の表のとおりフィールドを追加する。
5. 「Issue 一覧」の各項目について `gh issue create` を実行する。
   - タイトルは見出しの計画 ID を除いた部分（例：`### L-02 単一ファイル形式の pack / unpack` → `単一ファイル形式の pack / unpack`）。
   - 本文は、メタ情報の箇条書き（milestone〜depends）の後から次の `###` の直前まで。本文の末尾に `計画 ID: L-02` を付ける。
   - `--label` と `--milestone` はメタ情報に従う。
   - 同じタイトルの Issue が既にあれば作成しない（再実行できるようにする）。
   - 計画 ID と Issue 番号の対応を `docs/plan/issue-map.json` に保存する。
6. すべて作成した後、`depends` を `依存: #番号, #番号` の形に置き換えて本文の末尾に追記する（`gh issue edit --body-file`）。
7. 各 Issue を `gh project item-add` で Project に追加し、`gh project item-edit` で Priority と Size を設定する（フィールド ID と選択肢 ID は `gh project field-list --format json` で取得）。Start date / Target date は空のままにする。

---

## ラベル

| name | color | description |
|---|---|---|
| type:feature | 1D76DB | 機能の実装 |
| type:spec | 5319E7 | 仕様書・メタスキーマの追加や修正 |
| type:decision | D93F0B | 実装前に決定が必要（決定内容と理由を Issue に残す） |
| type:bug | D73A4A | 不具合 |
| type:test | 0E8A16 | テスト・検証 |
| type:docs | 0075CA | ドキュメント |
| type:chore | C5DEF5 | リポジトリ・CI・依存関係の保守 |
| area:spec | BFD4F2 | tsheet 形式・View・エンジン API の仕様 |
| area:core | FBCA04 | tsheet-core（エンジン） |
| area:cli | F9D0C4 | tsheet-cli |
| area:web | C2E0C6 | witree（Web / UI） |
| area:desktop | D4C5F9 | witree（Tauri / Rust） |
| area:repo | EDEDED | リポジトリ運用・CI |
| determinism | B60205 | 決定性（環境間で結果が同じ）の確認が必要 |
| security | EE0701 | セキュリティに関わる |

## マイルストーン

| title | description |
|---|---|
| M0 基盤整備と仕様の補正 | 仕様の食い違いの解消、開発ツールの決定、リポジトリと CI の整備 |
| M1 core: 読み込み・検証・保存 | load / serialize / pack / unpack、S 系・D 系の構造検証、正規化、ゴールデンテスト |
| M2 core: 式言語と計算 | 式言語、decimal・日付、rollup / inherit / formula、値の検証、問い合わせ API |
| M3 core: 変更・Undo・射影 | Op とトランザクション、逆操作、SchemaOp、View の検証と射影（crosstab を含む） |
| M4 core: 差分とマージ | diff、reconcile（3 方向マージ）、resolve |
| M5 CLI | CLI 仕様書と tsheet-cli の各コマンド、Git 連携 |
| M6 Web アプリ | Worker ブリッジ、treeGrid / treePanel / crosstab、編集・Undo・診断表示 |
| M7 デスクトップアプリ | Tauri 2、アトミック保存、ロック、スナップショット、外部変更の取り込み |
| M8 業務評価と v0.1.0 リリース | パラメータシート・WBS・月次予算での評価とリリース準備 |

## Project のフィールド

| フィールド | 種類 | 選択肢 |
|---|---|---|
| Status | 既定 | Todo / In Progress / Done |
| Priority | Single select | P0（MVP に必須）/ P1（MVP で対応したい）/ P2（後回し可） |
| Size | Single select | S（半日以内）/ M（1〜2 日）/ L（3〜5 日）/ XL（1 週間超） |
| Start date | Date | |
| Target date | Date | |

Roadmap ビューは Start date と Target date で表示し、Milestone でグループ化する。

---

## Issue 一覧

### P-01 Host に現在時刻と利用者識別子を追加する
- milestone: M0 基盤整備と仕様の補正
- labels: type:spec, area:spec, area:core
- priority: P0
- size: S
- depends: なし

**概要**
本体仕様 §11.2 は `created` / `updated` を「Host の時計」、`createdBy` / `updatedBy` を「Host が渡す識別子」で書くと定め、§10.3 の `NOW()` も現在時刻を必要とする。しかし `engine-api.v0.1.ts` の `Host` には `clock.today()` と `timezone` しかない。

**対応**
- `Host.clock.now(): string`（UTC、秒精度、`Z` 固定）を追加する
- `Host.actor?: string`（未設定なら `createdBy` / `updatedBy` を書かない）を追加する
- エンジン API 仕様 §3 の表と型定義を更新する

**完了条件**
- 型定義・エンジン API 仕様・本体仕様の記述が一致している

### P-02 システム項目の反映漏れを補う（View の特殊列・書き込み規則・マージ規則）
- milestone: M0 基盤整備と仕様の補正
- labels: type:spec, area:spec
- priority: P0
- size: M
- depends: P-01

**概要**
本体仕様 §11.2 は「View では特殊列 `$created` などで表示・ソート・フィルタに使える（View 定義仕様 §6.1）」とするが、View 仕様 §6.1 と `meta/view.v0.1.json` の特殊列は `$title` / `$type` / `$outline` / `$id` だけである。また、エンジン API 仕様にはシステム項目の書き込み規則とマージ規則の記述がない。

**対応**
- View 仕様 §6.1 とメタスキーマに `$created` / `$updated` / `$createdBy` / `$updatedBy` を追加する
- エンジン API 仕様 §6 に、`apply` がシステム項目を書き込む時点（本体仕様 §11.2 の表）と、`privacy.recordActors` の扱いを記載する
- エンジン API 仕様 §10.2 に、システム項目を衝突対象にしない規則（`created` は小さい方、`updated` は大きい方、`*By` はその値を採った側）を記載する

**完了条件**
- 3 つの仕様書とメタスキーマの記述が一致している

### P-03 Engine の同期メソッドと「すべて Promise」原則を整合させる
- milestone: M0 基盤整備と仕様の補正
- labels: type:spec, type:decision, area:spec, area:core
- priority: P0
- size: S
- depends: なし

**概要**
エンジン API 仕様 §1 は「外部インターフェースはすべて Promise を返す」とするが、`Engine` の `orderBetween` / `newId` / `version` は同期関数である。Worker 越しには同期で呼べない。

**提案（推奨）**
`orderBetween` はエンジンの状態に依存しない純粋関数なので、`Engine` から外して `tsheet-core` の単独エクスポートとし、UI がメインスレッドで直接呼ぶ。`newId` は UI 側の Host から取る。`version` は Promise にする。

**完了条件**
- 決定内容と理由を記録し、型定義とエンジン API 仕様 §5.2・§12 を更新している

### P-04 View の計算列（$expr）を仕様化し、レコードの formulas キーを予約する
- milestone: M0 基盤整備と仕様の補正
- labels: type:spec, area:spec
- priority: P1
- size: M
- depends: P-02

**概要**
「アドホックな計算は View の計算列で行う」方針に対して、View 仕様 §6.1 に計算列の定義がない。また、レコード単位の数式は v0.1 では扱わないが、将来用に `formulas` キーを予約する方針である。現在の `meta/record.v0.1.json` は `additionalProperties: false` のため、予約の扱いを決める必要がある。

**対応**
- View 仕様に計算列（列 ID、式、結果型、参照範囲は自ノード・親・ルート）を追加し、診断（V06 の適用範囲、必要なら新しい V コード）を表に追記する
- メタスキーマ（view）を更新する
- `formulas` キーの予約方法（本体仕様への記載のみにするか、record メタスキーマで受理して D 系で警告するか）を決める

**完了条件**
- 仕様書とメタスキーマが更新され、既存サンプルが引き続き検証を通る

### P-05 仕様書の節番号と表記の揺れを整理する
- milestone: M0 基盤整備と仕様の補正
- labels: type:docs, area:spec
- priority: P2
- size: S
- depends: なし

**概要**
本体仕様 §11 で「11.2」が 2 回現れ（システム項目、Git 運用上の注意）、11.1 が 11.2 の後に置かれている。エンジン API 仕様 §4 の `load` の説明は値の検証を「D10〜D18」とするが、本体仕様 §12 の処理順序では D20・D23 も対象である。

**完了条件**
- 節番号と参照（「§11.2」への言及）が一貫している
- 診断コードの範囲表記が本体仕様 §12 と一致している

### P-06 ライセンスを決定して LICENSE を追加する
- milestone: M0 基盤整備と仕様の補正
- labels: type:decision, area:repo
- priority: P0
- size: S
- depends: なし

**概要**
外部の実装者を想定したベンダー中立の形式であるため、特許の許諾を含み、仕様・メタスキーマ・コードを一本化できるライセンスが望ましい。推奨は Apache-2.0。

**完了条件**
- 決定内容と理由を記録し、`LICENSE` を追加して README のライセンス欄を更新している

### P-07 SECURITY.md を追加する
- milestone: M0 基盤整備と仕様の補正
- labels: type:docs, area:repo, security
- priority: P1
- size: S
- depends: なし

**完了条件**
- 報告窓口を Private vulnerability reporting とし、サポート対象（v0.1 の開発中は main のみ）を記載している

### P-08 開発ツールを決定する（ADR-0001）
- milestone: M0 基盤整備と仕様の補正
- labels: type:decision, area:repo
- priority: P0
- size: S
- depends: なし

**概要**
モノレポと検証の基盤を決め、`docs/adr/0001-toolchain.md` に記録する。

**提案（推奨）**
- パッケージ管理：pnpm workspaces（依存の厳格さとワークスペース機能のため）
- 言語：TypeScript strict、Node.js は LTS を `.nvmrc` / `engines` で固定
- テスト：Vitest（Node）と Vitest ブラウザモード（Playwright）でゴールデンテストを両環境で実行
- lint：ESLint（flat config）
- JSON Schema 検証：Ajv の standalone コード生成（ビルド時に検証関数を生成し、実行時に `new Function` を使わない。Tauri の CSP とも両立する）

**完了条件**
- ADR がマージされている

### P-09 モノレポの雛形を作る
- milestone: M0 基盤整備と仕様の補正
- labels: type:chore, area:repo
- priority: P0
- size: M
- depends: P-08

**対応**
- `packages/tsheet-core`、`packages/tsheet-cli`、`apps/witree` の空パッケージを作る
- `engine/engine-api.v0.1.ts` を tsheet-core から参照する方法を決める（型定義は契約として `engine/` に残す）
- ルートに `lint` / `typecheck` / `test` のスクリプトを用意する

**完了条件**
- `pnpm install` → `pnpm typecheck` → `pnpm test` が空の状態で成功する

### P-10 決定性を強制する tsconfig と lint を設定する
- milestone: M0 基盤整備と仕様の補正
- labels: type:chore, area:core, determinism
- priority: P0
- size: S
- depends: P-09

**対応**
- tsheet-core の `tsconfig` を `lib: ["ES2022"]`、`types: []` にする（DOM / Node 型を含めない）
- ESLint で `Date`、`Math.random`、`Intl`、`setTimeout` / `setInterval`、`crypto`、`String.prototype.localeCompare`、`toLocale*` の使用を禁止する

**完了条件**
- 禁止 API を使うコードが lint または型検査で失敗することをテストで確認している

### P-11 CI を構築し、main の必須チェックに設定する
- milestone: M0 基盤整備と仕様の補正
- labels: type:chore, area:repo, security
- priority: P0
- size: M
- depends: P-09

**対応**
- GitHub Actions で lint・typecheck・test（Node とブラウザ）を実行する
- ワークフローの `permissions` は `contents: read` を既定とし、サードパーティ製アクションはコミット SHA で固定する
- main のルールセットに、PR 必須（承認 0）と必須ステータスチェックを追加する

**完了条件**
- PR で CI が動き、失敗時に main へマージできない

### P-12 Dependabot を設定する
- milestone: M0 基盤整備と仕様の補正
- labels: type:chore, area:repo, security
- priority: P1
- size: S
- depends: P-09

**完了条件**
- `.github/dependabot.yml` で npm と github-actions の定期更新が動いている（cargo は D-01 で追加する）

### L-01 テスト用 Host と Host 共通部品を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core, determinism
- priority: P0
- size: M
- depends: P-01, P-10

**概要**
`Host.hash` は同期関数だが、ブラウザの Web Crypto は非同期である。そのため、純粋 TypeScript の同期 SHA-256 を用意する。

**対応**
- 同期 SHA-256（テストベクタで検証）
- テスト用 Host（固定の日付・時刻、連番またはシード付きの ID、固定の利用者識別子）
- UUIDv4 の形式検証ユーティリティ

**完了条件**
- 同期 SHA-256 が NIST のテストベクタと一致し、Node とブラウザで同じ結果になる

### L-02 単一ファイル形式の pack / unpack を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core, determinism
- priority: P0
- size: M
- depends: P-09

**仕様**：本体仕様 §2.2、エンジン API 仕様 §11

**対応**
- `%%tsheet` / `%%part` / `%%end` の解析と生成、パート順序の固定
- `%` スタッフィング（書き出し時の付加、読み込み時の除去）
- CRLF と BOM の受理、LF・BOM なしでの出力
- 構造不正の検出（D21）

**完了条件**
- サンプル 2 件で pack → unpack → pack が同一バイト列になる
- `%%` で始まる Markdown 行、`..` を含むパス、`%%end` の欠落をテストしている

### L-03 メタスキーマによる構造検証を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: P-08, P-09

**対応**
- `meta/` の 5 つのスキーマから Ajv standalone で検証関数を生成するビルド手順
- 検証エラーを `Diagnostic`（パート名・行番号付き）に変換する

**完了条件**
- サンプル全ファイルが検証を通り、不正な入力で D01 などの診断が返る

### L-04 スキーマの読み込みと意味検証（S01〜S06、S09〜S13）を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: L-03

**仕様**：本体仕様 §3〜§9、§12.1

**対応**
- 型・子ルール・フィールド定義の内部表現
- 識別子の規則と予約語（`parent` / `root` / `Root`）
- S01〜S06、S09〜S13 の検出（S07・S08 は式と依存グラフを扱う X-02・X-08 で実装する）
- S 系 error がある場合の読み取り専用判定

**完了条件**
- 各コードについて、発生するケースと発生しないケースのテストがある

### L-05 データの読み込みと構造検証（D01〜D09、D19、D22）を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: L-04

**対応**
- JSONL の読み込み（行番号付きの診断）、id の重複、型・親の存在、親子の循環、配置可能な型、多重度、required の子、maxDepth
- `dataSchemaVersion` の不一致（D19）、Git のコンフリクトマーカー（D22）
- `LoadResult.readOnly` と `readOnlyReason` の判定
- 読み込み時にシステム項目を補わないこと

**完了条件**
- 各コードのテストがあり、サンプルの読み込みで error が 0 件である

### L-06 値の保存形式と正規化を実装する（基本型）
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core, determinism
- priority: P0
- size: L
- depends: L-04

**仕様**：本体仕様 §6.2、§7、§11.1

**対応**
- number（NaN・Infinity の拒否、最短表現、`-0` → `0`）、decimal（`scale` への正規化）、boolean、date、datetime（オフセット必須）
- enum（定義順）、ref（id 昇順）、空文字 → `null`
- 正規化できない値は文字列のまま保持し D10 を返す
- 未設定と `null` を区別した値の保持

**完了条件**
- 型ごとの正規化テストがあり、Node とブラウザで結果が一致する

### L-07 値の保存形式と正規化を実装する（string の format）
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core, determinism
- priority: P0
- size: L
- depends: L-06

**仕様**：本体仕様 §6.3

**対応**
- hostname / fqdn / host / ipv4 / ipv6（RFC 5952）/ cidr（ホスト部の検査）/ mac / email / uri
- pattern・minLength・maxLength の検証（pattern は全体一致。正規表現の制約は X-06 と共通化する）

**完了条件**
- 各 format の受理・拒否・正規化のテストがある

### L-08 doc パートの読み込みと検証（D18）を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core, security
- priority: P1
- size: S
- depends: L-05

**完了条件**
- `docsDir` 外のパス、`..` を含むパス、存在しない本文を D18 として検出する

### L-09 分数インデックス（orderBetween）と D16 を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, type:decision, area:core, determinism
- priority: P0
- size: M
- depends: P-03

**概要**
本体仕様は `order` を「英数字、コードポイント順で比較」とだけ定める。生成アルゴリズム（文字集合、先頭・末尾への挿入、長さの増え方）を決め、Issue に記録する。

**完了条件**
- 任意の a < b に対して a < orderBetween(a, b) < b が成り立つことをプロパティテストで確認している
- 兄弟間の `order` 重複を D16 として検出し、id 順で安定させる

### L-10 serialize と正規化規則を実装する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:feature, area:core, determinism
- priority: P0
- size: M
- depends: L-05, L-06, L-08

**仕様**：本体仕様 §2.5、§11.1、View 仕様 §8.2・§10

**対応**
- レコードのキー順、`values` のキー順、空白なし、非 ASCII をエスケープしない、id 順、末尾改行
- 未正規化行の検出（D20）
- `privacy.recordActors: false` のときの `createdBy` / `updatedBy` の除去（D23）
- View・marks の保存規則（2 スペース、既定値の省略、marks のキー順）と、存在しないレコードを参照する marks の削除（V11）
- `contentHash()`

**完了条件**
- サンプルの load → serialize が入力と同一バイト列になる

### L-11 ゴールデンテストの基盤を作る
- milestone: M1 core: 読み込み・検証・保存
- labels: type:test, area:core, determinism
- priority: P0
- size: M
- depends: L-01, L-10, P-11

**対応**
- `examples/` の各ワークブックについて、Node とブラウザで load → serialize → contentHash を実行し、期待値のファイルと比較する
- 期待値の更新手順（意図した変更のときだけ更新する）を README に記載する

**完了条件**
- CI で両環境のハッシュが一致し、期待値との差分で失敗する

### L-12 WBS のサンプルワークブックを追加する
- milestone: M1 core: 読み込み・検証・保存
- labels: type:test, area:spec
- priority: P1
- size: S
- depends: なし

**概要**
本体仕様 §14.2 の WBS はスキーマ例のみで、`examples/` にない。MVP の題材の 1 つなので、テストデータとして一式を用意する。

**完了条件**
- `examples/wbs/` に workbook / schema / data（3 段以上の Task、whenNoSource: input、wavg、dependsOn、dateOrder 違反の例）と treeGrid の View があり、メタスキーマの検証を通る

### X-01 式の字句解析と構文解析を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: P-09

**仕様**：本体仕様 §10.1、エンジン API 仕様 §9

**完了条件**
- 文法どおりの構文木を生成し、`""` のエスケープ、予約語、式の長さ（4,096 文字）と構文木の深さ（64）の制限をテストしている

### X-02 式の型検査と参照解決（S07）を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: X-01, L-04

**対応**
- `fieldId` / `parent.fieldId` / `root.fieldId` の解決と、親になりうる型すべてでの整合
- 論理文脈の boolean 限定、date と number の加減算、decimal と number の混在、date と datetime の混在の禁止
- `ExprContext.purpose` ごとの参照可能範囲、`parseExpr` API と `ExprInfo`

**完了条件**
- S07 の各ケース（構文エラー、未知の参照・関数、`parent` の誤用、型不整合）のテストがある

### X-03 decimal の固定小数点演算を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core, determinism
- priority: P0
- size: M
- depends: X-01

**完了条件**
- BigInt による加減乗が正確で、除算・avg・wavg が `scale` への half-up 丸めになることをテストしている

### X-04 日付・日時の演算と FORMAT を自前で実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core, determinism
- priority: P0
- size: L
- depends: X-01

**仕様**：本体仕様 §2.4、§10.2、§10.3

**対応**
- 先発グレゴリオ暦の日付演算（`Date` を使わない）、`DAYS`、`DATE`、datetime の UTC 換算比較
- `FORMAT` のトークン（YYYY / YY / MM / M / DD / D / HH / mm / ss / FY / Q / CQ）、`FISCAL_YEAR`、`FISCAL_QUARTER`
- `fiscalYearStart`・`fiscalYearLabel` の反映、`TODAY()` / `NOW()` を Host から取得

**完了条件**
- うるう年、年度をまたぐ四半期、`fiscalYearLabel: end` のテストがある

### X-05 関数ライブラリを実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core, determinism
- priority: P0
- size: L
- depends: X-02, X-03, X-04

**対応**
- 論理・数値・文字列・ネットワーク・ノードの各関数（本体仕様 §10.3）
- 空値の伝播、`AND` / `OR` の特例、`COALESCE`
- `UPPER` / `LOWER` のロケール非依存の単純ケース変換、文字列のコードポイント順比較
- `OUTLINE()`、`CREATED()` などシステム項目の参照

**完了条件**
- 全関数について、空値を含むケースのテストがある

### X-06 正規表現の制約を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core, security, determinism
- priority: P0
- size: M
- depends: X-01

**対応**
- 使用できるフラグを `i` / `s` / `u` に限定する
- `pattern` は全体一致、`REGEXMATCH` は部分一致とする
- パターン長の上限（512 文字）を設け、ネストした量指定子を拒否する

**完了条件**
- 破滅的バックトラックを起こすパターンが `parseExpr` で拒否される

### X-07 評価器と演算ステップ制限（E20）を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core, security
- priority: P0
- size: M
- depends: X-05, X-06

**完了条件**
- ステップ数（100,000）と文字列長（65,536）の上限で評価を打ち切り、結果を空として E20 を返す
- `evaluate` API が状態を変えない

### X-08 依存グラフと循環検出（S08）を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: X-02

**完了条件**
- rollup・inherit・formula・where から辺を作り、自己再帰型の自己集計を除いて循環を検出する

### X-09 rollup を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: X-07, X-08

**仕様**：本体仕様 §8.1

**完了条件**
- すべての `fn`、`depth`、`where`、`whenNoSource`（件数は where の適用前）、`wavg` の重み、自己集計の多段計算、D17 をテストしている
- param-sheet の `vlanTotal`、budget の区分合計が期待値になる

### X-10 inherit を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: X-08

**仕様**：本体仕様 §3.1、§7、§8.2

**完了条件**
- param-sheet の §14.1 の表（継承、上書き、`null` による遮断）が期待どおりになる
- `fromType`、`Root` へのフォールバック、候補がない場合をテストしている

### X-11 formula・titleTemplate・ルートノードのフィールドを実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: X-07, X-08

**完了条件**
- formula の結果を型変換し、変換できない場合は D10 を返す
- `titleTemplate` の `{fieldId}` と `{fieldId:pattern}`、省略時の既定を実装している
- `root.fields` と `params` の値を計算・検証している（S13 を含む）

### X-12 値の検証（D10〜D14、D17）を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: X-09, X-10, X-11

**完了条件**
- 実効値に対する required、unique（3 種類の scope、空値を含む組は対象外）、checks（空の結果は判定しない）、ref の参照先を検証している

### X-13 実効値と問い合わせ API を実装する
- milestone: M2 core: 式言語と計算
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: X-12

**完了条件**
- `NodeView.effective` の `source` と `from` が正しく、`getNode` / `getChildren` / `getAncestors` / `search` / `diagnostics` がテストされている

### O-01 トランザクションの基盤を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: X-13

**完了条件**
- all-or-nothing の適用、`preview`、`ChangeSet`（records と effective）の生成、E09・E11・E13 をテストしている

### O-02 DataOp を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: O-01, P-02

**対応**
- create（`default` の書き込み、`cardinality: one` かつ `required` の子の自動生成）、move、set、unset、setDoc
- 拒否（E01〜E04、E06〜E08、E10）と、値違反の受理（D10）
- システム項目の書き込み（Host の時計と識別子、`privacy.recordActors`）

**完了条件**
- 拒否と受理の境界（エンジン API 仕様 §6.1 の表）をすべてテストしている

### O-03 delete の連鎖を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: O-02

**完了条件**
- 子孫の削除、`onDelete: clear` の参照解除、全 View の marks の削除、doc パートの削除を `expanded` に含めている
- 削除範囲外からの `restrict` 参照を E05 で拒否する

### O-04 逆操作（inverse）を生成する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, type:test, area:core, determinism
- priority: P0
- size: L
- depends: O-03, O-05, O-06

**完了条件**
- すべての Op について、apply → inverse の apply で serialize が元のバイト列に戻ることをテストしている（自動生成された Op を含む）

### O-05 ParamOp・MarksOp・ViewOp を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: O-01

**完了条件**
- `patch` の JSON Pointer 相当のパス指定（`undefined` で削除）、marks の `null` での削除をテストしている

### O-06 SchemaOp を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: XL
- depends: O-03, O-05

**仕様**：エンジン API 仕様 §6.4

**対応**
- 型・フィールド・子ルール・unique・checks・列挙・settings の各 Op
- removeType / removeField に伴うデータ・View・marks の書き換え
- updateField による型変換（変換できない値は元の文字列のまま保持）と `SchemaChangeReport`
- 互換性のない変更での `schemaVersion` / `dataSchemaVersion` の更新

**完了条件**
- 各 Op の自動生成内容と `preview` の件数をテストしている

### O-07 View の意味検証（V01〜V15）を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: X-02

**完了条件**
- 各コードのテストがあり、error のある View だけが開けない状態になる

### O-08 射影（treeGrid / treePanel）を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: O-07, X-13

**仕様**：View 仕様 §3〜§7、エンジン API 仕様 §8

**対応**
- tree.types → filter（祖先の表示、dim）→ sort（兄弟間、空値は末尾、codepoint 照合）の順で行を決める
- `collapsed` と `range`、`CellView.editable` の最終判定、format の適用結果（`text`）

**完了条件**
- param-sheet の 3 つの View で期待どおりの行と列が返る

### O-09 書式の合成（rules と marks）を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P1
- size: M
- depends: O-08

**完了条件**
- View 仕様 §8.3 の適用順序、`stop`、参照フィールドを持たない型での非評価をテストしている

### O-10 crosstab の射影を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: O-08, X-04

**仕様**：View 仕様 §5A

**完了条件**
- `keys`（範囲・列挙・fromData）、会計期間の quarter / year、行の型ごとのセルの意味、編集可否（0〜1 件）、rowTotal / columnTotal をテストしている
- budget の月次・四半期の View が期待値になる

### O-11 View の計算列（$expr）の射影を実装する
- milestone: M3 core: 変更・Undo・射影
- labels: type:feature, area:core
- priority: P1
- size: M
- depends: P-04, O-08

**完了条件**
- P-04 で定めた仕様どおりに計算列を表示・ソート・フィルタでき、結果を保存しない

### R-01 diff を実装する
- milestone: M4 core: 差分とマージ
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: L-10

**完了条件**
- 作成・削除・移動・更新と、変わったパートを返す

### R-02 reconcile（データと params）を実装する
- milestone: M4 core: 差分とマージ
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: R-01, O-04

**仕様**：エンジン API 仕様 §10.2

**完了条件**
- 表の全ケース（field / deleteEdit / moveCycle / doc の衝突、move と order の disk 優先と notes、set と unset の衝突）と、システム項目のマージ規則をテストしている

### R-03 reconcile（View と marks）を実装する
- milestone: M4 core: 差分とマージ
- labels: type:feature, area:core
- priority: P1
- size: M
- depends: R-02

**完了条件**
- columns は field、rules は id、その他はパスをキーとしたマージと、viewKey / marksKey の衝突をテストしている

### R-04 スキーマの外部変更と未保存トランザクションの再適用を実装する
- milestone: M4 core: 差分とマージ
- labels: type:feature, area:core
- priority: P0
- size: L
- depends: R-02, O-06

**完了条件**
- disk のスキーマを正とし、`unsaved` を順に再適用した結果（applied / rejected）を `schemaReplay` に返す

### R-05 resolve を実装する
- milestone: M4 core: 差分とマージ
- labels: type:feature, area:core
- priority: P0
- size: M
- depends: R-03, R-04

**完了条件**
- 解決がトランザクションとして Undo でき、未知の衝突と未解決での保存要求を E12 で拒否する

### C-01 CLI 仕様書（別紙）を作成する
- milestone: M5 CLI
- labels: type:spec, area:spec, area:cli
- priority: P0
- size: M
- depends: なし

**概要**
本体仕様は CLI の詳細を別紙に委ねている。実装しながら固める方針のため、M1 の完了前後に草案を作り、各コマンドの実装で更新する。

**対象**
validate、fmt（`--strip-actors`）、pack、unpack、export（型ごとのファイルと単一の横長テーブル、`createdBy` / `updatedBy` は既定で出力しない）、diff、merge（Git マージドライバー）、出力形式（text / JSON）、終了コード

**完了条件**
- `spec/tsheet-cli-v0.1.md` がマージされている

### C-02 tsheet-cli の雛形と Node 用 Host を作る
- milestone: M5 CLI
- labels: type:feature, area:cli
- priority: P0
- size: M
- depends: L-10, C-01

**完了条件**
- フォルダ形式と単一ファイル形式の読み書き、アトミック保存（一時ファイルから置換）、終了コードの共通処理ができている

### C-03 validate コマンドを実装する
- milestone: M5 CLI
- labels: type:feature, area:cli
- priority: P0
- size: M
- depends: C-02, X-12, O-07

**完了条件**
- 診断を text と JSON で出力し、error があれば終了コード 1 を返す
- pre-commit フックと CI での使用例を README に記載している

### C-04 fmt・pack・unpack コマンドを実装する
- milestone: M5 CLI
- labels: type:feature, area:cli
- priority: P0
- size: M
- depends: C-02

**完了条件**
- `fmt --strip-actors` が識別子を除いた複製を作り、pack / unpack が往復で一致する

### C-05 export コマンドを実装する
- milestone: M5 CLI
- labels: type:feature, type:decision, area:cli
- priority: P1
- size: L
- depends: C-02, X-13

**概要**
出力形式（CSV の文字コードと BOM の有無、JSON / JSONL の選択）を決める。Power Query での取り込みを前提にする。

**完了条件**
- `path`・`id`・`parentId` 列を含む型ごとの出力と、単一の横長テーブルの出力を、budget と param-sheet で確認している

### C-06 diff コマンドを実装する
- milestone: M5 CLI
- labels: type:feature, area:cli
- priority: P1
- size: S
- depends: C-02, R-01

**完了条件**
- 2 つのワークブック（またはファイル）のレコード単位の差分を表示する

### C-07 merge コマンド（Git マージドライバー）を実装する
- milestone: M5 CLI
- labels: type:feature, area:cli
- priority: P1
- size: M
- depends: C-02, R-05

**完了条件**
- 衝突がなければマージ結果を書き、未解決の衝突があれば終了コード 1 でファイルを書き換えない
- `.gitattributes` と `git config` の設定手順を README に記載している

### C-08 Op・Transaction・Message の JSON Schema を型定義から生成する
- milestone: M5 CLI
- labels: type:feature, area:core, area:cli
- priority: P2
- size: M
- depends: P-03

**完了条件**
- 型定義から生成した JSON Schema で、CLI の入力を検証できる

### W-01 witree アプリの雛形を作る
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: M
- depends: P-09

**完了条件**
- React、TanStack Table / Virtual を導入し、`apps/witree` が開発サーバーで起動する

### W-02 Worker ブリッジを実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web, area:core
- priority: P0
- size: M
- depends: W-01, O-01

**仕様**：エンジン API 仕様 §12

**完了条件**
- リクエスト ID 付きの直列処理、`changes` / `diagnostics` / `progress` イベント、大きな PartMap の Transferable での受け渡しを実装している

### W-03 Web 版の Host とファイルアクセスを実装する
- milestone: M6 Web アプリ
- labels: type:feature, type:decision, area:web
- priority: P0
- size: M
- depends: W-02, L-01

**概要**
ブラウザでのファイルアクセス方法（File System Access API の採用と、非対応ブラウザでの扱い）を決める。

**完了条件**
- 決定内容を記録し、フォルダ形式と単一ファイル形式を開いて保存できる

### W-04 treeGrid ビューを実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: XL
- depends: W-02, O-08

**完了条件**
- 仮想スクロール、展開と折りたたみ、Tab / Shift+Tab によるインデント・アウトデント、Enter による兄弟の追加、該当しない列の灰色表示、ドラッグによる並び替え（sort 中は無効）ができる

### W-05 セルの編集と入力を実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: L
- depends: W-04

**完了条件**
- 型ごとの入力部品、継承値と計算値の見た目の区別、「未設定に戻す」（Delete）と「空にする」の区別、D10 のセルの強調表示ができる

### W-06 treePanel ビューを実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: L
- depends: W-05

**完了条件**
- 左のツリー、右パネルの Key-Value（`cardinality: one` の子を含む）、`many` の子の表を、param-sheet の device View で操作できる

### W-07 crosstab ビューを実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: L
- depends: W-05, O-10

**完了条件**
- 空セルへの入力でノードを作成し、2 件以上のセルは編集不可と表示し、合計行と合計列を表示する

### W-08 Undo / Redo を実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: M
- depends: W-05, O-04

**完了条件**
- 自動保存後も履歴を遡れ、E08 で拒否された履歴を飛ばして利用者に通知する

### W-09 診断パネルと読み取り専用状態を表示する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: M
- depends: W-04

**完了条件**
- 診断の一覧から該当セルへ移動でき、読み取り専用の理由を表示する

### W-10 View の操作と編集を実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P1
- size: L
- depends: W-04, O-05

**完了条件**
- 列幅・列順・表示と非表示・ソート・フィルタ・条件付き書式を操作し、共有定義として保存できる。式は `parseExpr` で即時検証する

### W-11 スキーマ編集 UI を実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P0
- size: XL
- depends: W-04, O-06

**完了条件**
- 型・フィールド・子ルール・制約・列挙を編集でき、破壊的な変更の前に `preview` で影響件数を確認できる

### W-12 手動書式とセルのメモを実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web
- priority: P1
- size: M
- depends: W-05, O-09

**完了条件**
- レコード単位とセル単位の書式・メモ・行高を設定できる

### W-13 個人状態と利用者設定を実装する
- milestone: M6 Web アプリ
- labels: type:feature, area:web, security
- priority: P1
- size: M
- depends: W-04

**完了条件**
- 展開状態・選択・スクロール位置をワークブック外（または `.tsheet-local/`）に保存する
- 利用者識別子の設定と、ワークブックの `privacy.recordActors` の切り替えができる

### D-01 Tauri 2 の雛形と Rust 側のファイル操作を実装する
- milestone: M7 デスクトップアプリ
- labels: type:feature, area:desktop
- priority: P0
- size: L
- depends: W-03

**完了条件**
- Rust 側はファイルの読み書き・アトミック保存・変更監視のみを提供し、TypeScript 側の Host から呼べる
- Dependabot に cargo を追加している

### D-02 ロックファイルを実装する
- milestone: M7 デスクトップアプリ
- labels: type:feature, type:decision, area:desktop
- priority: P0
- size: M
- depends: D-01

**概要**
ロックファイルの名前・置き場所・内容・古いロックの扱いは仕様に定めがないため、決めて記録する。`privacy.recordActors: false` のワークブックでは識別子を書かず、ホスト名とプロセス ID だけを記録する（本体仕様 §2.5）。

**完了条件**
- 多重オープンを防ぎ、異常終了後のロックを利用者が解除できる

### D-03 自動保存とスナップショットを実装する
- milestone: M7 デスクトップアプリ
- labels: type:feature, area:desktop
- priority: P0
- size: M
- depends: D-01

**完了条件**
- 直近数版のスナップショットを保持し（保持数は設定で変更可）、`diff` で比較して復元できる

### D-04 外部変更の検出と取り込みを実装する
- milestone: M7 デスクトップアプリ
- labels: type:feature, area:desktop
- priority: P0
- size: L
- depends: D-01, R-05, W-08

**完了条件**
- `contentHash` で外部変更を検出し、衝突がなければ自動で取り込み、衝突があれば解決画面を表示する。解決まで保存を止め、D22 のファイルは読み取り専用で開く

### D-05 ファイルサイズの警告と形式の変換を実装する
- milestone: M7 デスクトップアプリ
- labels: type:feature, area:desktop
- priority: P1
- size: S
- depends: D-01

**完了条件**
- 20 MB で警告し、50 MB でフォルダ形式への変換を案内する。単一ファイル形式とフォルダ形式を相互に変換できる

### D-06 Tauri のセキュリティ設定と配布方法を決める
- milestone: M7 デスクトップアプリ
- labels: type:decision, area:desktop, security
- priority: P1
- size: M
- depends: D-01

**完了条件**
- capabilities と CSP を最小限にし、配布形式とコード署名の方針を記録している

### E-01 パラメータシートで業務評価する
- milestone: M8 業務評価と v0.1.0 リリース
- labels: type:test, area:web
- priority: P0
- size: L
- depends: W-06, D-04

**完了条件**
- 実際のパラメータシートを移行して使い、課題を Issue として起票している

### E-02 WBS で業務評価する
- milestone: M8 業務評価と v0.1.0 リリース
- labels: type:test, area:web
- priority: P0
- size: L
- depends: W-04, D-04, L-12

**完了条件**
- 実際の WBS を移行して使い、課題を Issue として起票している（ガント表示の要否もここで判断材料を集める）

### E-03 月次予算で業務評価する
- milestone: M8 業務評価と v0.1.0 リリース
- labels: type:test, area:web
- priority: P0
- size: L
- depends: W-07, D-04, C-05

**完了条件**
- 実際の予算表を移行して使い、Power Query での取り込みを含めて課題を Issue として起票している

### E-04 性能を確認する
- milestone: M8 業務評価と v0.1.0 リリース
- labels: type:test, area:core, area:web
- priority: P1
- size: M
- depends: W-04

**完了条件**
- 20 MB 規模のワークブックで、load・全体再計算・project・apply の所要時間を計測し、差分再計算の要否を判断している

### E-05 v0.1.0 のリリース準備をする
- milestone: M8 業務評価と v0.1.0 リリース
- labels: type:chore, type:docs, area:repo
- priority: P0
- size: M
- depends: E-01, E-02, E-03

**完了条件**
- CHANGELOG と CONTRIBUTING を追加し、仕様書のステータスを更新し、Issue と PR の受付方針（Collaborators only の継続可否）を見直している
