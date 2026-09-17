# tsheet形式 View定義仕様 v0.1

ステータス：ドラフト（MVP 対象） / 作成日：2026-09-17 / 本体仕様：tsheet形式 仕様 v0.1（以下「本体仕様」）

## 1. 概要

本書は、ワークブックの **View 定義（`views/<name>.view.json`）** と **手動書式（`views/<name>.marks.json`）** を定める。View はデータの見せ方だけを定義し、意味（型・制約・計算）は本体仕様のスキーマが持つ。

| 設計原則 | 内容 |
|---|---|
| 意味と表示の分離 | View を変更してもデータの意味・値・並び順（`order`）は変わらない |
| 共有と個人の分離 | View と marks はワークブックの一部として共有・コミットする。展開状態や選択、スクロール位置は個人状態で、ワークブックに含めない |
| 安定した定義と変動する定義の分離 | 列・幅・ソート・フィルタ・条件付き書式（`.view.json`）と、レコード単位で増減する手動書式（`.marks.json`）を別ファイルにし、差分を読みやすく保つ |
| 意味は式で残す | 書式に意味がある場合（遅延・要確認など）は条件付き書式で式として持ち、手動書式は一時的な目印に使う |

構造検証用の JSON Schema として `meta/view.v0.1.json`（`urn:tsheet:meta:view:0.1`）と `meta/marks.v0.1.json`（`urn:tsheet:meta:marks:0.1`）を提供する。

## 2. ファイルと登録

```
views/
├─ default.view.json      View 定義（必須。name は "default"）
├─ default.marks.json     手動書式（任意。同名の View に対応）
├─ interfaces.view.json
└─ device.view.json
```

`workbook.json` に登録する。

```json
{
  "views": ["views/default.view.json", "views/interfaces.view.json", "views/device.view.json"],
  "marks": ["views/default.marks.json"]
}
```

| キー | 内容 |
|---|---|
| `views` | View 定義の相対パス配列。最初の要素が既定の View。空配列の場合、アプリはスキーマの記述順から暫定の View を生成する（保存はしない） |
| `marks` | 手動書式の相対パス配列（任意）。各ファイルの `view` は `views` 内のいずれかの `name` と一致しなければならない（V10） |

単一ファイル形式（本体仕様 §2.2）では、`views/` 配下のパートとしてパス順に連結される。

## 3. View 定義のトップレベル

| キー | 必須 | 内容 |
|---|---|---|
| `specVersion` | ○ | `"0.1"` |
| `name` | ○ | View の識別子（`^[a-z][A-Za-z0-9_-]{0,63}$`）。ファイル名の `<name>` と一致させる |
| `title` / `description` | | 表示名と説明 |
| `mode` | ○ | `treeGrid`（§4）、`treePanel`（§5）、`crosstab`（§5A） |
| `tree` | | ツリーの表示設定（§3.1） |
| `rows` | | 行の設定（§3.2） |
| `columns` | ○ | 列定義の配列（§6）。`treePanel` では左ツリーの列 |
| `sort` | | 表示時のソート（§7.1） |
| `filter` | | 表示時のフィルタ（§7.2） |
| `rules` | | 条件付き書式（§8.1） |
| `panel` | | `treePanel` の右パネル設定（§5） |
| `crosstab` | `crosstab` で○ | クロス集計の設定（§5A）。他のモードでは指定不可 |

### 3.1 tree

| キー | 既定 | 内容 |
|---|---|---|
| `types` | 全型 | ツリーに表示する型。指定した型以外のノードは表示しない（子孫も表示しない）。フィルタ（§7.2）より前に適用される |
| `expandDepth` | `1` | 開いた時点の展開深さ（`0` はすべて閉じる、`"all"` はすべて展開）。開いた後の展開状態は個人状態 |
| `showTypeBadge` | `true` | タイトル列に型の表示名（`label`）を小さく表示する |
| `showOutline` | `false` | タイトル列に階層番号（`OUTLINE()` 相当）を表示する |

### 3.2 rows

| キー | 既定 | 内容 |
|---|---|---|
| `height` | `"auto"` | 行高。`"auto"` は `wrap: true` の列の内容に応じて自動調整、数値（px）は固定。marks のレコード単位 `height` で上書きできる |
| `grayOutUnavailable` | `true` | その型に存在しないフィールドの列を灰色で表示する。`false` の場合は空白のまま |

## 4. treeGrid モード

すべてのノードを 1 枚のツリーグリッドに表示する。タイトル列（`$title`）にインデントと展開ボタンを持ち、Tab / Shift+Tab でインデント・アウトデント、Enter で兄弟ノードの追加ができる。WBS のように各階層の型が近いデータに向く。

型ごとに項目が異なる場合は、列をフィールド ID に束縛し（§6.1）、そのフィールドを持たない型の行では列を灰色（編集不可）にする。列の一覧は全型のフィールドの和集合から選ぶ。

## 5. treePanel モード

左にタイトルのみのツリー、右に選択ノードの内容を表示する。パラメータシートのように、階層ごとに項目が大きく異なるデータに向く。

右パネルの構成はスキーマから導出する。

- 選択ノード自身のフィールド：縦の Key-Value（プロパティ表示）
- `cardinality: "one"` の子：親に続けて Key-Value として表示（見出しに子の型名）
- `cardinality: "many"` の子：型ごとに表として表示（見出しに子の型名）

`panel` で導出結果を上書きできる。

| キー | 内容 |
|---|---|
| `width` | 右パネルの幅（px）。省略時はアプリの既定 |
| `types.<TypeName>.columns` | その型の表に表示する列（§6）。省略時はスキーマの `fields` の記述順 |
| `types.<TypeName>.collapsed` | 初期状態で表を折りたたむ |

`treePanel` の `columns` は左ツリーに適用する。通常は `$title` のみとする。

## 5A. crosstab モード

行はツリー（`tree.types` で指定した型）、列は **1 つの子型のキーフィールドの値** を横に展開し、セルに値フィールドの集計を置く。月次の予算・実績、拠点別の台数など、「行の階層 × 1 つの軸」の表に向く。汎用のピボット（複数軸・複数集計）は対象外である。

```json
"mode": "crosstab",
"tree": { "types": ["Category", "Account"], "expandDepth": "all" },
"columns": [ { "field": "$title", "width": 220, "pinned": true }, { "field": "Account.owner", "width": 90 } ],
"crosstab": {
  "sourceType": "Entry",
  "key": "period",
  "keys": { "from": "2026-04", "to": "2027-03", "step": "month" },
  "keyLabel": "M月",
  "value": "amount",
  "fn": "sum",
  "columnWidth": 96,
  "format": { "thousands": true, "unit": "none" },
  "rowTotal": true,
  "columnTotal": true
}
```

| キー | 必須 | 内容 |
|---|---|---|
| `sourceType` | ○ | 列に展開する型。`tree.types` のうち **子として `sourceType` を持つ型が 1 つ以上** なければならない（V13）。行の型が複数ある場合（同じ親の下に「通常科目」と「按分科目」を並べるなど）、各行の型ごとに `sourceType` を子に持つかどうかで扱いが決まる |
| `key` | ○ | 列の見出しになる `sourceType` のフィールド（string / enum / date） |
| `keys` | | 列の集合。`{ from, to, step }`（`step` は `day` / `month` / `quarter` / `year`。`quarter` と `year` は `settings.fiscalYearStart` に従う会計期間で区切り、列のキーは各期間の開始月とする。`key` が `date` または `YYYY-MM` 形式の string のときに使える）、値の配列（enum などの明示列挙）、または `"fromData"`（データに存在する値をコードポイント順、enum は定義順）。既定は `"fromData"` |
| `keyLabel` | | 列見出しの表示パターン（本体仕様 §10.3 の `FORMAT` と同じトークン。`M月`、`YYYY/MM`、`FYQ` など）。省略時はキーの値（enum は `label`） |
| `value` | ○ | セルに置く `sourceType` のフィールド（number / decimal） |
| `fn` | ○ | 集計関数。`sum` / `count` / `min` / `max` / `avg`（本体仕様 §8.1 と同じ意味論。空値は無視） |
| `columnWidth` | | 展開した列の幅（px）。既定 96 |
| `format` | | 展開した列の表示形式（§6.3） |
| `rowTotal` / `columnTotal` | | 行合計の列（右端）／列合計の行（最下段）を `fn` で表示する。`fn` が `min` / `max` / `avg` の場合も同じ関数で求める |
| `editable` | | 既定 `true`。`false` で読み取り専用 |

**セルの意味。** 行の型によって決まる。

- **`sourceType` を子に持つ型の行**（例：Account）：その行の直下で `key` が列の値に一致する `sourceType` のノードを `fn` で集計する。1 件なら値そのもの。
- **`sourceType` を子に持たず、子孫に `sourceType` がありうる型の行**（例：Category）：子孫すべての `sourceType` のノードのうち、`key` が一致するものを `fn` で集計する。読み取り専用。
- **子孫に `sourceType` がありえない型の行**（葉の型など）：展開した列はすべて空で読み取り専用。行合計も空。

**編集。** `sourceType` を子に持つ型の行のセルは、`fn` が `sum` / `min` / `max` / `avg` で該当ノードが **0 件または 1 件** のときに編集できる。0 件のセルに値を入力すると、`parent` = その行、`key` = 列の値、`value` = 入力値のノードを自動生成する（`order` は末尾）。1 件のセルの編集はそのノードの `value` を更新する。値を消すと `value` を `null` にし、ノードは削除しない（削除は treeGrid など別の View で行う）。2 件以上あるセルは集計値の表示のみで編集できない（セルにその旨を示す）。

`sourceType` の他のフィールド（memo など）は crosstab では表示しない。`columns` にはツリー側の列（`$title` と、`tree.types` の型のフィールド）だけを指定できる（V14）。`sort` はツリー側の兄弟間にのみ作用し、`filter` は `tree.types` の型に対して評価する。`rules` は `sourceType` を `types` に含めれば展開した列のセルに適用できる（`target: "cell"`、`fields` に `value`）。

## 6. 列定義

```json
{ "field": "System.ntp", "label": "NTP", "width": 130, "pinned": false, "align": "start", "wrap": false, "format": { } }
```

### 6.1 field（列の束縛）

| 形式 | 意味 |
|---|---|
| `fieldId` | その ID のフィールドを持つ **すべての型** に束縛する。型ごとに `type` が違う場合（Site.name が string、Vlan.name も string など同型なら可）、フィールド型が異なると V02 |
| `Type.fieldId` | 指定した型のフィールドにだけ束縛する。他の型の行では灰色になる |
| `$title` | ツリーのタイトル列（`titleTemplate` の値、インデント、展開ボタン）。treeGrid では 1 つ必須（V04）で、最初の列に置く |
| `$type` | 型の表示名 |
| `$outline` | 階層番号 |
| `$id` | レコード ID（読み取り専用） |

同じ `field` を複数の列に指定してはならない（V03）。計算フィールド（rollup / formula）と継承値は編集不可として表示し、継承値は通常の値と区別できる見た目にする（本体仕様 §8.2）。

### 6.2 列の属性

| キー | 既定 | 内容 |
|---|---|---|
| `label` | スキーマの `label` | 見出しの上書き。`Type.field` でない列に指定した場合、すべての型で共通の見出しになる |
| `labelExpr` | | 見出しを式で計算する。`label` より優先。行に依存しないため、参照できるのは `root.fieldId`・`TODAY()`・`FORMAT` などノードを文脈としない要素に限る（V15）。例：`"\"FY\" & root.fiscalYear & \" 合計\""` |
| `width` | 120 | 列幅（px）。`$title` の既定は 240 |
| `hidden` | `false` | 非表示。列の順序は保ったまま隠す |
| `pinned` | `false` | 左端に固定。固定列は定義順で左から並べ、非固定列より前に置く |
| `align` | 型による | `start` / `center` / `end`。既定は number・decimal が `end`、boolean が `center`、それ以外は `start` |
| `wrap` | `false` | セル内で折り返す。`rows.height: "auto"` のときに行高へ影響する |
| `readOnly` | `false` | この View では編集させない |
| `format` | | 表示形式（§6.3） |

### 6.3 format

フィールド型に応じたキーだけが意味を持つ。該当しないキーは無視する（V05 warning）。

| キー | 対象 | 内容 |
|---|---|---|
| `decimals` | number / decimal | 小数桁数（decimal の既定は `scale`） |
| `thousands` | number / decimal | 桁区切り |
| `unit` | number / decimal | スキーマの `unit` を `none` / `suffix` / `prefix` で表示（既定 `suffix`） |
| `percent` | number / decimal | 100 倍して `%` を付ける（値は変えない） |
| `date` / `datetime` | date / datetime | 表示パターン。`YYYY`・`MM`・`M`・`DD`・`D`・`HH`・`mm`・`ss` と区切り文字。既定は保存形式のまま |
| `boolean` | boolean | `checkbox`（既定）/ `yesNo` / `onOff` |
| `enum` | enum | `label`（既定）/ `value` / `both` |
| `ref` | ref | `title`（既定。参照先の `titleTemplate`）/ `path`（祖先を含むパス） |
| `doc` | doc | `preview`（既定。冒頭のみ）/ `link` |

`format` は表示のみに作用し、保存値・式の評価・エクスポートの値には影響しない。

## 7. ソートとフィルタ

### 7.1 sort

```json
"sort": [ { "field": "Interface.port", "dir": "asc", "collation": "codepoint" } ]
```

- ソートは **同じ親の下の兄弟間** でのみ行う。階層を崩さない。
- 複数指定した場合は先頭から優先する。
- 比較には実効値（継承後・計算後）を使う。空値は昇順・降順のいずれでも末尾に置く。
- `field` を持たない型の兄弟は、持つ型の後ろに `order` 順で並べる。
- `collation` が `codepoint`（既定）なら本体仕様の決定的順序、`locale` ならアプリのロケールに従う（`Intl.Collator` など）。`locale` は表示専用で、エンジンの動作には影響しない。
- `sort` が有効な間、ドラッグによる並び替えは **無効** にする。並び替えるには sort を解除する。`order` は手動の並び順であり、sort が書き換えることはない。

### 7.2 filter

```json
"filter": { "types": ["Interface"], "expr": "mode = \"trunk\"", "ancestors": "dim" }
```

- `types`：対象型。省略時は全型。
- `expr`：本体仕様 §10 の式。各ノードを文脈として評価し、`TRUE` のノードを一致とする。空の結果は不一致として扱う。
- 一致したノードの **祖先は必ず表示** する。`ancestors` が `dim` なら祖先を薄く表示、`show` なら通常表示。
- 一致したノードの子孫は、`types` と `expr` の条件に自身が一致しない限り表示しない。
- フィルタ中の新規ノード追加は、選択ノードの子または兄弟として通常どおり行える（追加直後は条件に関係なく表示する）。

`tree.types`（§3.1）は「その型を View に存在させない」設定で、`filter.types` は「一致条件」である。前者は祖先表示の対象にもならない。

## 8. 書式

### 8.1 条件付き書式（rules）

```json
{
  "id": "manyVlanOnAccess",
  "types": ["Interface"],
  "when": "AND(mode = \"access\", vlanCount > 1)",
  "target": "cell",
  "fields": ["vlanCount"],
  "style": { "bg": "red", "bold": true },
  "stop": false
}
```

| キー | 内容 |
|---|---|
| `id` | View 内で一意 |
| `types` | 対象型。省略時は `when` を評価できるすべての型 |
| `when` | 式。ノードを文脈として評価し、`TRUE` のとき適用。空の結果は適用しない |
| `target` | `row`（既定。行全体）/ `cell`（`fields` の列のみ） |
| `fields` | `target: "cell"` で必須 |
| `style` | §8.3 |
| `stop` | `true` なら、このルールが適用されたノード（`cell` ならそのセル）に後続のルールを適用しない |

`when` が参照するフィールドを持たない型では、そのルールは評価しない（エラーにしない）。ただし `types` で明示した型に参照フィールドがない場合は V06。

### 8.2 手動書式（marks）

```json
{
  "specVersion": "0.1",
  "view": "default",
  "records": {
    "413a04d8-4dd6-48d6-8291-37623d5745a3": {
      "height": 44,
      "style": { "bold": true },
      "note": "コア機器。変更は事前承認が必要",
      "cells": {
        "speed": { "style": { "bg": "orange" }, "note": "10Gへの増速を検討中" }
      }
    }
  }
}
```

- キーはレコード `id`。レコード単位の `height`・`style`・`note` と、セル単位（フィールド ID）の `style`・`note` を持つ。
- `note` はセルのコメント（Excel のメモに相当）。データではないので式から参照できない。データとして残すべき内容は、スキーマに `doc` や `string` のフィールドを追加して保存する。
- 存在しないレコード ID の項目は、読み込み時に V11（warning）とし、**保存時に自動で削除** する。存在しないフィールドの `cells` も同様。
- `view` ごとに独立している。同じ書式を複数の View で共有する仕組みは持たない（共有すべき書式は rules で表す）。
- レコードの移動（親の付け替え）や並び替えでは、ID が変わらないため書式は保たれる。

### 8.3 style と適用順序

```json
{ "bg": "yellow", "fg": "gray", "bold": true, "italic": false, "strike": false, "underline": false }
```

`bg` / `fg` はパレット名（`gray`・`red`・`orange`・`yellow`・`green`・`teal`・`blue`・`purple`・`pink`。ライト／ダークテーマに追従）または `#RRGGBB` とする。パレット名を推奨する。

適用は次の順で、後のものが同じ属性を上書きする（属性単位でマージする）。

1. 型・列の既定の見た目（計算フィールドの読み取り専用表示、継承値の表示、灰色の列）
2. marks のレコード単位 `style`
3. marks のセル単位 `style`
4. rules を配列順に適用（`stop` で打ち切り）

条件付き書式が手動書式より優先するのは Excel と同じ挙動である。

## 9. 処理順序と診断（V 系）

View の処理は、本体仕様のデータ検証（D 系）と実効値の計算が終わった後に行う。

1. View 定義と marks の構造検証（メタスキーマ）
2. フィールド参照・型・式の意味検証（V 系）
3. `tree.types` による絞り込み → `filter` → `sort` の順で表示集合と並びを決める
4. 書式の適用（§8.3）

| コード | 重大度 | 内容 |
|---|---|---|
| V01 | error | `columns` / `sort` / `rules.fields` / `panel.types` が存在しない型・フィールドを参照している |
| V02 | error | 型を限定しない `field` が、型によって異なるフィールド型に束縛される |
| V03 | error | 同じ `field` の列が重複している |
| V04 | error | `treeGrid` に `$title` 列がない、または最初の列でない |
| V05 | warning | `format` にフィールド型と合わないキーがある（無視する） |
| V06 | error | `rules` / `filter` の式の構文エラー・未知の参照・型不整合（本体仕様 S07 と同じ判定） |
| V07 | error | `rules` の `id` が重複している |
| V08 | error | `sort` / `filter` / `rules` が doc 型フィールドを参照している |
| V09 | warning | `pinned` の列が非固定列より後ろにある（固定列を前に並べ替えて表示する） |
| V10 | error | marks の `view` に対応する View がない |
| V11 | warning | marks が存在しないレコード・フィールドを参照している（保存時に削除する） |
| V12 | error | `workbook.json` の `views` が空でないのに `default` という `name` の View がない |
| V13 | error | `tree.types` のどの型も `crosstab.sourceType` を子に持たない、`key` / `value` のフィールド型が要件を満たさない、`fn` と `value` の型が合わない、`keys` の範囲や `step` が `key` の型と合わない |
| V14 | error | `crosstab` の View の `columns` に `tree.types` 以外の型のフィールドがある |
| V15 | error | `labelExpr` がノードのフィールドや `parent.` を参照している |

V 系の `error` がある View は開けないが、ワークブック自体は他の View で開ける。

## 10. 正規化

View 定義と marks は人が編集しうるため、本体仕様 §11.1 のような厳密な正規化は課さない。ただしアプリが保存する際は次に従う。

- 2 スペースのインデント、キーは本書の表の記載順、UTF-8・LF・末尾改行。
- marks の `records` のキーは `id` のコードポイント順、`cells` のキーはフィールド ID のコードポイント順に並べる。
- 既定値と同じ値の属性（`hidden: false` など）は書き出さない。
- `columns` の順序は利用者の並び順そのものなので、並べ替えない。

## 11. 個人状態（ワークブックに含めないもの）

展開／折りたたみの状態、選択セル・選択範囲、スクロール位置、ウィンドウやパネルの配置、直近に開いた View、一時的な検索文字列。これらはアプリのローカル領域（またはワークブック内の `.tsheet-local/`）に View の `name` をキーとして保存し、Git の対象にしない。

View の `columns.width` や `sort` を利用者が操作した場合は、**共有定義の変更** としてワークブックに保存する。操作を個人状態にとどめたい場合は、View を複製して個人用の View を作る運用とする（MVP では「共有 View を直接変更する」のみをサポートする）。

## 12. 例

`examples/param-sheet/views/` に 3 つの View と 1 つの marks を置く。

| ファイル | 内容 |
|---|---|
| `default.view.json` | treeGrid。全型の列の和集合、`System.ntp` など型限定の列、無効 IF を打ち消し線にする rule、アクセスポートの VLAN 超過を赤にする rule |
| `interfaces.view.json` | treeGrid。`filter` でトランク IF のみを一致させ、祖先（Site・Device）を薄く表示。固定行高 |
| `device.view.json` | treePanel。左ツリーは Site と Device のみ、右パネルで Interface 表の列を指定 |
| `default.marks.json` | コア機器の行を太字＋メモ、アクセスポートの速度セルに橙＋メモ、行高の上書き |

`examples/budget/` は crosstab の例である。区分（Category）→ 勘定科目（Account）→ 月別計上（Entry: `period`, `amount`）の 3 段で、`default.view.json` が FY2026（2026-04〜2027-03）の月次表（`root.fiscalYear` を使った `labelExpr`、`root.currentMonth` 以前の未入力セルを黄色にする rule を含む）、`quarterly.view.json` が `step: "quarter"` と `keyLabel: "FYQ"` による会計四半期の読み取り専用表、`entries.view.json` が同じデータの treeGrid 表示。会計年度の開始月は `workbook.json` の `settings.fiscalYearStart` で指定する。区分行の年間合計はスキーマの rollup（`depth: "descendants"`）、各月の区分合計は crosstab の集計で求める。

## 13. MVP の対象外

列のグループ見出し（crosstab の年→月の 2 段見出しを含む）、複数列での集計行（フッター。crosstab の `columnTotal` を除く）、View 単位の権限、View のテンプレート化（他ワークブックへの流用）、複数軸・複数集計の汎用ピボット、ガントやカレンダーなど表以外の表示モード、印刷レイアウト、個人用 View の自動生成。ガント表示は WBS 用途で需要が高いため、`mode` の追加候補として次版で検討する。
