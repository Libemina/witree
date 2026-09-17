# tsheet形式 仕様 v0.1（スキーマ・データ・ファイル形式）

ステータス：ドラフト（MVP 対象） / 作成日：2026-09-16 / 改訂：2026-09-17

tsheet は、階層構造を持つデータをスキーマ・View 定義・データに分けてテキストで保持する、ベンダー中立のワークブック形式である。参照実装は Witree（デスクトップ／Web アプリと CLI）だが、本仕様は特定の実装に依存しない。名称は常に小文字の `tsheet` と表記する。

## 1. 概要

本書は、ワークブックを構成するファイルのうち **スキーマ JSON（`schema.json`）** の仕様と、スキーマに従う **データ JSONL（`data.jsonl`）** のレコード形式を定める。View 定義 JSON（列順・列幅・表示モードなど）は別紙で定義し、本書では参照関係のみを扱う。

構造検証用の JSON Schema（Draft 2020-12）として `meta/schema.v0.1.json`（スキーマ用、`$id: urn:tsheet:meta:schema:0.1`）と `meta/record.v0.1.json`（データ 1 行用、`$id: urn:tsheet:meta:record:0.1`）を併せて提供する。参照解決・型整合・循環といった JSON Schema で表現できない検証は、§12 の意味検証（S 系・D 系診断）で行う。

| 設計原則 | 内容 |
|---|---|
| 階層はデータ | 親子関係は `parent` 参照で持ち、インデントなどの見た目に依存しない |
| 意味と表示の分離 | スキーマは意味（型・制約・計算）のみを持つ。表示は View 定義に置く |
| 計算は宣言 | 集計・継承・式はフィールド定義に宣言し、計算結果はデータに保存しない |
| テキストで安定 | 同じ内容は常に同じバイト列に正規化し、Git の差分が意味のある変更だけを示すようにする |
| データを壊さない | スキーマに合わない値も削除せずに保持し、診断で知らせる |

## 2. ワークブックのファイル構成

ワークブックは **フォルダ形式** と **単一ファイル形式** の 2 つの物理形式を持つ。どちらも同じ論理構成（パートの集合）を表し、相互に無損失で変換できる（§2.2）。実装は両方を開けなければならない。

### 2.1 フォルダ形式

```
my-params/                    ワークブック（1 ディレクトリ）
├─ workbook.json              マニフェスト
├─ schema.json                スキーマ（本書 §3〜§10）
├─ data.jsonl                 データ（本書 §11）
├─ views/
│  ├─ default.view.json       View 定義（別紙：列・幅・ソート・フィルタ・条件付き書式）
│  └─ default.marks.json      手動書式（別紙：レコード単位・セル単位の書式と行高）
└─ docs/                      doc 型フィールドの本文
   └─ <recordId>/<fieldId>.md
```

フォルダ形式は `workbook.json` の存在で識別する。展開・折りたたみ状態、選択範囲、ウィンドウ配置などの **個人状態はワークブックに含めない**。アプリのローカル領域に保存するか、ワークブック内に置く場合は `.tsheet-local/` とし、`.gitignore` の対象とする。

### 2.2 単一ファイル形式（`.tsheet`）

フォルダ形式の全パートを 1 つのテキストファイルに連結した形式で、拡張子は `.tsheet` とする。Excel のように 1 ファイルとして受け渡しでき、かつ圧縮しないため Git で行単位の差分が取れる。

```
%%tsheet 0.1
%%part workbook.json
{
  "specVersion": "0.1",
  ...
}
%%part schema.json
{ ... }
%%part views/default.view.json
{ ... }
%%part views/default.marks.json
{ ... }
%%part data.jsonl
{"id":"413a…","type":"Device","parent":"dd2e…","order":"a0","values":{…}}
%%part docs/413a…/notes.md
# 備考
本文…
%%end
```

規則：

1. 文字コードは UTF-8（BOM なし）、改行は LF。読み込み時は CRLF と BOM を受理し、書き出し時は常に LF・BOM なしに正規化する。
2. 1 行目は `%%tsheet <specVersion>`。最終行は `%%end` とし、これがないファイルは途中で途切れたものとして扱う（D21）。
3. 各パートは `%%part <path>` 行で始まり、次の `%%part` または `%%end` の直前までを内容とする。`<path>` はフォルダ形式での相対パス（`/` 区切り）で、`..` を含んではならない。内容の末尾の改行はパート区切り行の直前の改行 1 つとし、パート本体の末尾改行として扱う。
4. パートの順序は固定する：`workbook.json` → `schema.json` → `views/` 配下（パスのコードポイント順）→ `data.jsonl` → `docs/` 配下（パスのコードポイント順）。同じ内容は常に同じバイト列になる。
5. パート内容の行が `%%` で始まる場合（Markdown 本文でのみ起こりうる）、書き出し時に行頭へ `%` を 1 つ追加し、読み込み時に `%%%` 以上で始まる行から `%` を 1 つ除去する。
6. 保存は一時ファイルに書いてから置き換える（アトミック保存）。

`pack`（フォルダ → 単一ファイル）と `unpack`（単一ファイル → フォルダ）は、正規化済みの入力に対して往復で同一のバイト列を返さなければならない。

Git では次の設定を推奨する。差分の見出しに変更されたパートが表示される。

```
# .gitattributes
*.tsheet text eol=lf diff=tsheet
*.jsonl  text eol=lf
```
```
# 各自の git config
git config diff.tsheet.xfuncname '^%%part .*$'
```

単一ファイル形式の実用上の目安は 20 MB 程度までとし、これを超える場合はフォルダ形式（将来はデータの分割、§15）を用いる。

### 2.3 マニフェスト

`workbook.json` の例（単一ファイル形式でも同じ内容をパートとして持つ）：

```json
{
  "specVersion": "0.1",
  "settings": { "fiscalYearStart": 4 },
  "params": { "fiscalYear": 2026, "currentMonth": "2026-09" },
  "schema": "schema.json",
  "data": "data.jsonl",
  "views": ["views/default.view.json"],
  "marks": ["views/default.marks.json"],
  "docsDir": "docs",
  "dataSchemaVersion": 1
}
```

| キー | 必須 | 内容 |
|---|---|---|
| `specVersion` | ○ | 本仕様のバージョン。v0.1 では `"0.1"` |
| `schema` | ○ | スキーマファイルの相対パス |
| `data` | ○ | データファイルの相対パス |
| `views` | ○ | View 定義ファイルの相対パス配列（空配列可）。詳細は View 定義仕様 |
| `marks` | | 手動書式ファイルの相対パス配列。詳細は View 定義仕様 |
| `docsDir` | ○ | doc 型の本文を置くディレクトリ |
| `dataSchemaVersion` | ○ | データが準拠している `schema.json` の `schemaVersion`（§13） |
| `settings` | | エンジンが解釈するワークブック設定（§2.4） |
| `params` | | ルートノードのフィールド値（§3.1）。キーは `root.fields` のフィールド ID |

マニフェストの構造検証用に `meta/workbook.v0.1.json`（`urn:tsheet:meta:workbook:0.1`）を提供する。

### 2.4 settings（ワークブック設定）

利用者が定義する値（§3.1 の `params`）と異なり、エンジンの動作を決める固定の項目である。

| キー | 既定 | 内容 |
|---|---|---|
| `fiscalYearStart` | `1` | 会計年度の開始月（1〜12）。`FORMAT` の `FY`・`Q` トークン、View の四半期・年度単位の列生成が参照する |
| `fiscalYearLabel` | `"start"` | `FY` の年号を開始年（`start`）と終了年（`end`）のどちらで表すか（4 月始まりの 2026 年度は、`start` なら FY2026、`end` なら FY2027） |
| `weekStart` | `"mon"` | 週の開始曜日 |
| `timezone` | ホストの値 | `TODAY()` の基準となる IANA タイムゾーン名。指定した場合はホストの値より優先する |
| `privacy.recordActors` | `true` | 作成者・最終更新者（`createdBy` / `updatedBy`）を記録するか（§2.5） |

### 2.5 個人情報を記録しない設定（`privacy`）

Office の「保存時にファイルのプロパティから個人情報を削除する」に相当する設定を、ワークブック単位で持つ。利用者の識別子はワークブックとともに移動する情報なので、アプリの環境設定ではなくマニフェストの `settings` に置く。ワークブックを受け取った側の環境が異なっても、設定は保たれる。

```json
"settings": { "privacy": { "recordActors": false } }
```

| 値 | 動作 |
|---|---|
| `true`（既定） | `create` と変更のたびに、Host から与えられた識別子を `createdBy` / `updatedBy` に書く。識別子が未設定なら書かない |
| `false` | 識別子を一切書かない。読み込んだレコードに `createdBy` / `updatedBy` が残っていれば、正規化（§11.1）の一部として **保存時に除去** する（読み込み時に D23 で通知） |

- `created` / `updated`（日時）はこの設定の対象外である。日時は個人を特定しないため、履歴や順序の用途で残す。
- `false` から `true` に戻しても、除去済みの値は復元されない。
- ロックファイル（ワークブックの外、Git 対象外）に書く利用者名はこの設定の対象外だが、`false` のワークブックではロックファイルにも識別子を書かず、ホスト名とプロセス ID だけを記録することを推奨する。
- 既定を `true` にするのは、共同編集で「誰が変えたか」を後から辿れることの価値が大きいためである。外部に配布するワークブックでは `false` にするか、CLI の `fmt --strip-actors` で識別子を除いた複製を作る。

## 3. スキーマのトップレベル

| キー | 必須 | 型 | 内容 |
|---|---|---|---|
| `$schema` | | string | エディタ補完用のメタスキーマへの参照 |
| `specVersion` | ○ | `"0.1"` | 本仕様のバージョン |
| `schemaVersion` | ○ | 整数 ≥ 1 | このスキーマの改訂番号。ID の変更など互換性のない変更で増やす |
| `id` | | 識別子 | スキーマの識別子 |
| `title` / `description` | | string | 表示用 |
| `enums` | | object | 共有の列挙定義。キーが列挙 ID、値が列挙値の配列（§6.4） |
| `root` | ○ | object | ルートノードの定義。`children`（ルート直下に置ける型、§5）と `fields`（ワークブック全体の設定値、§3.1） |
| `types` | ○ | object | 型定義。キーが型名、値が型定義（§4） |

### 3.1 ルートノードのフィールド（`root.fields` と `params`）

ワークブック全体で 1 つだけ持つ値（会計年度、当月、共通設定など）は、ルートノードのフィールドとして定義する。定義は `schema.json` の `root.fields`（§6 のフィールド定義と同じ形式）、値は `workbook.json` の `params` に置く。

```json
"root": {
  "fields": {
    "fiscalYear":   { "type": "number", "integer": true, "required": true },
    "currentMonth": { "type": "string", "pattern": "^[0-9]{4}-(0[1-9]|1[0-2])$" },
    "grandTotal":   { "type": "decimal", "scale": 0, "rollup": { "sourceType": "Entry", "sourceField": "amount", "fn": "sum", "depth": "descendants" } }
  },
  "children": { "Category": { "cardinality": "many" } }
}
```

- 式からは `root.fieldId` で参照する（§10.1）。どの型のノードからでも参照できる。
- `rollup` はワークブック全体（ルートの全子孫）を対象に集計する。`formula` も使える。`inherit` は指定できない（S13）。
- `inherit` の解決（§8.2）では、祖先をたどって候補が見つからない場合、`root.fields` に同じ ID・同じ型のフィールドがあればその実効値を採用する。`fromType` に `"Root"` を指定すると、ルートだけを候補にする。
- `params` の値は §7 の意味論（未設定と `null` の区別）と §6 の保存形式に従い、`data.jsonl` と同じ検証（D10・D11）を受ける。
- MVP ではルートノードを `data.jsonl` のレコードとしては持たない。将来ルートをレコード化する場合も、`params` の内容をそのまま移せる形にしている。

**識別子の規則。** フィールド ID・列挙 ID・チェック ID は `^[a-z][A-Za-z0-9_]{0,63}$`（lowerCamelCase 推奨）、型名は `^[A-Z][A-Za-z0-9_]{0,63}$`（UpperCamelCase）とする。`parent` と `root` は式言語の予約語のため、フィールド ID に使えない。型名 `Root` はルートノードを指す予約名で、`types` に定義できない。ID はデータと View から参照される不変の識別子であり、画面上の名称を変えたい場合は `label` を変更する。先頭を英字に限定しているのは、JavaScript のオブジェクトで整数に見えるキーだけが先頭に並べ替えられる挙動を避け、キーの記述順を保つためでもある。

## 4. 型定義

型は「ノードの種類」であり、階層の各段で持つ項目の違いを表す。

| キー | 必須 | 内容 |
|---|---|---|
| `label` | | 型の表示名。省略時は型名 |
| `description` | | 説明 |
| `titleTemplate` | | ツリーや参照表示に使うノード名のテンプレート。`{fieldId}` を値で置換する（計算フィールドも可、空値は空文字）。`{fieldId:pattern}` で `FORMAT` と同じ書式を指定できる（例 `{period:M月}`）。省略時は最初の string フィールドの値、それもなければ「型の表示名＋ID の先頭 8 文字」 |
| `fields` | ○ | フィールド定義。キーがフィールド ID。**記述順が既定の列順** になる（View で上書き可）。空オブジェクト可 |
| `children` | | この型の下に置ける型（§5）。省略時は葉となる型 |
| `maxDepth` | | 同じ型が連続して入れ子になる段数の上限。自己再帰する型（例：Task の下に Task）でのみ意味を持つ |
| `unique` | | 一意制約の配列（§9.1） |
| `checks` | | 検証ルールの配列（§9.2） |

## 5. 子ルールと多重度

`root.children` と各型の `children` は、型名から子ルールへのマップである。

```json
"children": {
  "System":    { "cardinality": "one", "required": true },
  "Interface": { "cardinality": "many" }
}
```

| `cardinality` | 件数 | `required: true` の意味 | UI の既定表示 |
|---|---|---|---|
| `one` | 親 1 つにつき 0〜1 件 | 親の作成時に自動生成し、単独では削除できない | 縦の Key-Value（プロパティ表示） |
| `many` | 0 件以上 | 1 件以上必要（自動生成はせず、検証のみ） | 表 |

同じ型を複数の親型の子として宣言してよい。型が自分自身を子に持つ再帰も許可する（WBS の Task など）。子ルールの記述順は、UI で型ごとにまとめて表示する場合の既定の並び順になる。

## 6. フィールド定義

### 6.1 共通属性

| キー | 内容 |
|---|---|
| `type` | 必須。フィールド型（§6.2） |
| `label` / `description` | 表示名と説明 |
| `required` | 必須入力。**継承を解決した後の実効値** で判定する（§7） |
| `default` | ノード作成時に **レコードへ書き込む** 初期値。読み込み時に補う仮想的な既定値ではない。スキーマの既定値を後から変えても、既存データの意味が変わらないようにするためである |
| `rollup` | 子→親の集計（§8.1） |
| `inherit` | 親→子の継承（§8.2） |
| `formula` | 同一ノード（と親）の値からの計算（§8.3）。`required` / `default` と併用不可 |

`rollup` / `inherit` / `formula` は同時に 1 つまでしか指定できない。

### 6.2 フィールド型

| `type` | 保存形式 | 追加属性 |
|---|---|---|
| `string` | JSON 文字列 | `format`, `pattern`, `minLength`, `maxLength`, `multiline` |
| `number` | JSON 数値（NaN・Infinity 不可） | `integer`, `min`, `max`, `unit` |
| `decimal` | 10 進文字列（例 `"1234.50"`、`scale` 桁に正規化） | `scale`（必須）, `min`, `max`（いずれも 10 進文字列）, `unit` |
| `boolean` | `true` / `false` | なし |
| `date` | `"YYYY-MM-DD"` | `min`, `max` |
| `datetime` | RFC 3339、オフセット必須（例 `"2026-09-16T10:00:00+09:00"`） | `min`, `max` |
| `enum` | 列挙値の `value`。`multiple` の場合は配列（定義順に正規化） | `values` または `enumRef`（いずれか一方）, `multiple` |
| `ref` | 参照先レコードの `id`。`multiple` の場合は配列（id 昇順に正規化） | `target`（必須）, `multiple`, `onDelete` |
| `doc` | ワークブックルートからの相対パス（例 `"docs/<id>/notes.md"`） | なし |

`unit` は表示と式の型推論の補助であり、単位換算は行わない。金額など誤差が許されない値には `decimal` を使う。

### 6.3 string の format

| `format` | 受理する値 | 保存時の正規化 |
|---|---|---|
| `hostname` | RFC 1123 のホスト名（単一ラベル可） | 小文字化 |
| `fqdn` | ドット区切りの完全修飾ドメイン名 | 小文字化、末尾のドットを除去 |
| `host` | `hostname`・IPv4・IPv6 のいずれか | 各形式に従う |
| `ipv4` | ドット 10 進表記 | 先頭ゼロの除去 |
| `ipv6` | RFC 4291 表記 | RFC 5952 の圧縮・小文字表記 |
| `cidr` | IPv4/IPv6 のネットワークアドレス＋プレフィックス長 | 上記に準ずる。ホスト部が 0 でない場合は D10 |
| `mac` | 区切り文字 `:` `-` `.` の各表記 | `aa:bb:cc:dd:ee:ff` 形式 |
| `email` / `uri` | 一般的な形式 | なし |

### 6.4 列挙値

```json
"values": [
  { "value": "access", "label": "アクセス" },
  { "value": "trunk",  "label": "トランク", "deprecated": false }
]
```

データには `value` を保存し、`label` は表示にのみ使う。`deprecated: true` の値は新たに選択できないが、既存データ上の値としては有効である。同じ集合を複数のフィールドで使う場合は、トップレベルの `enums` に定義して `enumRef` で参照する。

### 6.5 ref と doc

`ref` の `target` は参照できる型名の配列である。`onDelete` は参照先が削除されたときの扱いで、`restrict`（既定。参照されているレコードは削除できない）または `clear`（単一参照は `null`、複数参照は配列から除去）を指定する。

`doc` の本文ファイルはエンジンが `docsDir/<recordId>/<fieldId>.md` に作成・管理する。値のパスは `docsDir` 配下に限られ、`..` を含んではならない。長文をレコードの外に出すことで、JSONL の各行を短く保ち、本文の差分も Markdown として読めるようにする。

## 7. 値の意味論：「未設定」と「明示的な空」

`values` にキーが **存在しない** 状態と、値が **`null`** の状態を区別する。

| 状態 | レコード上の表現 | 継承（§8.2） | `required` の判定 |
|---|---|---|---|
| 未設定 | キーなし | 祖先から継承する | 継承後の値で判定 |
| 明示的な空 | `null` | 継承しない（遮断する） | 違反 |
| 値あり | 値 | 継承しない（上書き） | 適合 |

string の空文字 `""` は保存時に `null` へ正規化する。UI では「未設定に戻す（継承値に戻す）」と「空にする（継承も止める）」を別の操作として提供する。継承が有効なフィールドでは Delete キーを「未設定に戻す」に割り当てることを推奨する。

## 8. 計算フィールド

### 8.1 rollup（子 → 親の集計）

```json
"effort": {
  "type": "number",
  "rollup": {
    "sourceType": "Task",
    "sourceField": "effort",
    "fn": "sum",
    "depth": "children",
    "where": "status <> \"cancelled\"",
    "whenNoSource": "input"
  }
}
```

| キー | 必須 | 内容 |
|---|---|---|
| `sourceType` | ○ | 集計対象の型 |
| `sourceField` | `count` 以外で ○ | 集計対象のフィールド（`count` では指定不可） |
| `fn` | ○ | 集計関数（下表） |
| `weight` | `wavg` で ○ | 重みに使う `sourceType` のフィールド（`wavg` 以外では指定不可） |
| `depth` | | `children`（既定。直接の子のみ）または `descendants`（すべての子孫。途中に別の型を挟んでよい） |
| `where` | | 対象ノードを絞り込む式。対象ノードを文脈として評価する |
| `whenNoSource` | | 対象ノードが 0 件のときの扱い（後述） |

| `fn` | 対象フィールドの型 | 結果の型 |
|---|---|---|
| `sum` | number / decimal | 対象と同じ |
| `count` | なし | number（整数） |
| `countDistinct` | 任意（空値は数えない） | number（整数） |
| `min` / `max` | number / decimal / date / datetime | 対象と同じ |
| `avg` | number / decimal | 対象と同じ（decimal はフィールドの `scale` に四捨五入） |
| `wavg` | number / decimal（`weight` も同様） | 対象と同じ |
| `any` / `all` | boolean | boolean |

集計では空値を無視する。対象ノードが 1 件以上あってもすべて空値の場合、結果は空になる（`count` を除く）。`wavg` は、値と重みの両方が空でないノードだけを使い、重みの合計が 0 の場合は空になる。

`whenNoSource` は、範囲内に `sourceType` のノードが 1 件もない場合の扱いを決める。件数は `where` を適用する **前** に数える。

| 値 | 動作 |
|---|---|
| `empty` | 空（`count` 以外の既定） |
| `zero` | 0（`count` の既定） |
| `input` | そのノードではフィールドを入力可能にし、入力値を採用する |

`input` は WBS の「末端のタスクでは工数を入力し、親では子の合計を表示する」振る舞いを実現する。末端で入力した値はレコードに保存される。そのノードに子が追加されると入力値は **無視される** が、削除はしない（D17 で通知）。子がすべて削除されると、再び入力値が有効になる。

型が自分自身を集計する場合（Task.effort が子の Task.effort を合計するなど）は、子の **実効値**（子自身の集計結果または入力値）を使うため、多段の階層でも下から順に集計される。

### 8.2 inherit（親 → 子の継承）

```json
"ntp": { "type": "string", "format": "host", "inherit": { "fromType": "Site", "field": "ntp" } }
```

`inherit` には `true` または `{ "fromType"?, "field"? }` を指定する。`true` と `{}` は同じ意味である。`field` の既定値は自身のフィールド ID である。

**解決の手順。** 自ノードでフィールドが未設定の場合、親から順に祖先をたどる。`fromType` を指定した場合はその型の祖先だけを候補とし、指定しない場合は `field` を持つ型の祖先を候補とする。祖先に候補がなければ、`root.fields` の同名フィールドを最後の候補とする（§3.1）。最も近い候補の **実効値** を採用する。候補の実効値が `null`（明示的な空）の場合は `null` を採用する。これにより、中間の階層で「ここから下は設定しない」と宣言できる。候補が見つからない場合、値は空のままとなる。

継承元のフィールドは同じ `type` でなければならない（enum の場合は同じ値集合）。`format` が異なる場合は警告とする。UI では継承された値を通常の値と区別して表示し、編集した時点でそのノードに値が書き込まれ、継承値が上書きされる。

### 8.3 formula（同一ノードの計算）

```json
"fqdn": { "type": "string", "formula": "hostname & \".\" & parent.domain" }
```

式（§10）の結果をフィールドの値とする。常に読み取り専用である。結果をフィールドの `type` に変換できない場合は D10 とする。

### 8.4 評価順序

エンジンはスキーマの読み込み時に「型.フィールド」を単位とする依存グラフを作り、循環を検出する（S08）。依存の辺は、rollup では対象フィールドと `weight`、inherit では継承元、formula と `where` では式中の参照から得る。自己再帰型の自己集計は、インスタンス上では常に子から親への方向にしか依存しないため、循環の対象外とする。

インスタンスの評価は、「ノード×フィールド」単位のメモ化付き遅延評価で実装すれば足りる。静的に循環がないことが保証されているため、評価中の循環はデータの親子循環（D05）がある場合にしか発生しない。

## 9. 一意制約と検証ルール

### 9.1 unique

```json
"unique": [
  { "fields": ["port"], "scope": "parent", "message": "同じ機器内でポートが重複しています" }
]
```

`fields` の組み合わせが、`scope` の範囲内で一意であることを求める。`scope` には `"parent"`（同じ親の下）、`"workbook"`（ワークブック全体）、または `{ "ancestorType": "Site" }`（指定した型の同じ祖先の下）を指定する。値は実効値（継承後・計算後）で比較する。空値を含む組み合わせは判定の対象外とする（SQL の UNIQUE 制約と同じ）。

### 9.2 checks

```json
"checks": [
  {
    "id": "accessSingleVlan",
    "expr": "IF(mode = \"access\", vlanCount <= 1, TRUE)",
    "severity": "error",
    "message": "アクセスポートに複数のVLANが設定されています"
  }
]
```

式の結果が `TRUE` なら適合、`FALSE` なら `severity`（既定は `error`）で違反とする。**結果が空の場合は判定しない。** 入力の有無は `required` で表す。

## 10. 式言語（MVP）

利用者が表計算ソフトに慣れていることを前提に、関数名や演算子は Excel に寄せる。ただし、**空値は 0 として扱わずに伝播する** 点が Excel と異なる。空を既定値に置き換える場合は `COALESCE` を使う。

### 10.1 文法

```
expr     = compare ;
compare  = concat [ ( "=" | "<>" | "<" | "<=" | ">" | ">=" ) concat ] ;
concat   = additive { "&" additive } ;
additive = term { ( "+" | "-" ) term } ;
term     = unary { ( "*" | "/" ) unary } ;
unary    = [ "-" ] primary ;
primary  = number | string | "TRUE" | "FALSE" | "BLANK"
         | ref | call | "(" expr ")" ;
ref      = [ ( "parent" | "root" ) "." ] fieldId ;
call     = FUNCNAME "(" [ expr { "," expr } ] ")" ;
string   = '"' { char | '""' } '"' ;          (* "" で " を表す *)
```

**参照。** `fieldId` は自ノードのフィールド、`parent.fieldId` は親ノードのフィールド、`root.fieldId` はルートノードのフィールド（§3.1）を表す。いずれも実効値（継承後・計算後）である。親になりうる型が複数ある場合は、そのすべてに同じ ID・同じ型のフィールドが存在しなければならない（S07）。兄弟や任意の他ノードを直接参照する手段は MVP では提供しない。子孫の値は rollup を介して参照する。

**型。** 論理演算の文脈には boolean 以外を置けない（S07。暗黙の真偽値変換はしない）。date に number を足し引きすると日数の加減算になる。decimal どうしの演算は精度を保ち、number と混在した場合は number に変換する。空値を含む演算・比較の結果は空になる。

### 10.2 実装依存を排除するための規定

エンジンは実行環境（ブラウザ、WebView、Node.js など）や OS の設定に依存せず、同じ入力から同じ結果を返さなければならない。

| 項目 | 規定 |
|---|---|
| 正規表現 | フィールドの `pattern` と `REGEXMATCH` は ECMAScript（ES2022）の正規表現構文に従う。使用できるフラグは `i`・`s`・`u` のみ（`v`・`g`・`y`・`m`・`d` は不可）。`pattern` は **全体一致**（暗黙に `^(?:…)$`）、`REGEXMATCH` は **部分一致** とする。 |
| 文字列比較 | 比較演算子・`min`/`max`・`unique`・正規化（§11.1）における文字列の順序は **Unicode コードポイント順** とする。`Intl.Collator` などロケール依存の照合を使ってはならない。ロケールに応じた並び（五十音順など）は View 側の表示時ソートで行い、エンジンの決定的な順序とは分ける。 |
| 大文字小文字 | `=` 比較は大文字小文字を区別する。`UPPER`/`LOWER` は Unicode の単純ケース変換（ロケール非依存）とする。 |
| 日付 | 先発グレゴリオ暦。`date` は文字列のまま扱い、実行環境の `Date` やタイムゾーンに依存しない自前の実装で演算する。`DAYS(end, start)` は `end − start` の日数（負数可）。`date` と `datetime` の混在演算・比較は S07 とする。`datetime` の比較は UTC に換算して行う。 |
| `TODAY()` / `NOW()` | ホストから与えられた「今日」の `YYYY-MM-DD`（タイムゾーンは `settings.timezone` またはホストの値）と、現在時刻（UTC の datetime）を使う。ワークブック内の全ノードで同じ値になる。 |
| decimal | 整数演算（BigInt 相当）による固定小数点で実装する。加減乗は正確に、除算はフィールドの `scale` に **四捨五入（half-up）** で丸める。`avg`・`wavg` も同様。 |
| number | IEEE 754 倍精度。表示・保存は JSON の最短表現（§11.1）。 |

### 10.3 関数（MVP）

| 分類 | 関数 |
|---|---|
| 論理 | `IF(cond, then, else)`, `AND(…)`, `OR(…)`, `NOT(x)`, `ISBLANK(x)`, `COALESCE(a, b, …)` |
| 数値 | `ROUND(x, n)`, `ABS(x)`, `MIN(…)`, `MAX(…)`, `MOD(a, b)` |
| 文字列 | `LEN(s)`, `LEFT(s, n)`, `RIGHT(s, n)`, `UPPER(s)`, `LOWER(s)`, `TRIM(s)`, `REGEXMATCH(s, pattern)` |
| 日付 | `TODAY()`, `NOW()`, `DATE(y, m, d)`, `DAYS(end, start)`, `FORMAT(x, pattern)`, `FISCAL_YEAR(d)`, `FISCAL_QUARTER(d)` |
| ネットワーク | `CIDR_CONTAINS(cidr, ip)`, `IS_IPV4(s)`, `IS_IPV6(s)` |
| ノード | `ID()`, `DEPTH()`（ルート直下が 1）, `OUTLINE()`（`"1.2.3"` 形式の階層番号。同じ親の下の兄弟を型を問わず `order` 順に数える）, `CREATED()` / `UPDATED()`（datetime。未記録なら空）, `CREATED_BY()` / `UPDATED_BY()`（string。未記録なら空） |

`FORMAT(x, pattern)` は date・datetime・`YYYY-MM` 形式の string を、次のトークンで文字列にする。トークン以外の文字はそのまま出力する。

| トークン | 出力 | 備考 |
|---|---|---|
| `YYYY` / `YY` | 年（4 桁／下 2 桁） | |
| `MM` / `M` | 月（2 桁／そのまま） | |
| `DD` / `D` | 日 | `YYYY-MM` 形式には使えない |
| `HH` / `mm` / `ss` | 時・分・秒 | datetime のみ |
| `FY` | 会計年度（4 桁） | `settings.fiscalYearStart` と `fiscalYearLabel` に従う |
| `Q` | 会計四半期（1〜4） | 同上。`FYQ` で「2026Q2」のように連結できる |
| `CQ` | 暦年四半期（1〜4） | |

`FISCAL_YEAR(d)` と `FISCAL_QUARTER(d)` は同じ規則で数値を返す。

`AND` / `OR` は、引数に `FALSE` / `TRUE` が 1 つでもあれば、ほかの引数が空でもその値を返す。`COALESCE` 以外の関数は、引数に空値があると空を返す。

## 11. データレコード（JSONL）

`data.jsonl` の 1 行が 1 ノードを表す。

```json
{"id":"633ce429-712b-4233-86e3-85ec9a124326","type":"Interface","parent":"413a04d8-4dd6-48d6-8291-37623d5745a3","order":"a1","values":{"description":"to tky01-acc01","enabled":true,"mode":"trunk","port":"Te1/0/1","speed":"10g"}}
```

| キー | 内容 |
|---|---|
| `id` | UUIDv4（小文字・ハイフン付き） |
| `type` | 型名 |
| `parent` | 親ノードの `id`。ルート直下は `null` |
| `order` | 兄弟間の並び順を表す分数インデックス（英数字、コードポイント順で比較） |
| `created` / `updated` | システム項目（任意）。作成日時・最終更新日時。RFC 3339 の UTC（`Z` 固定）、秒精度（§11.2） |
| `createdBy` / `updatedBy` | システム項目（任意）。作成者・最終更新者の識別子（§11.2） |
| `values` | フィールド ID → 値。未設定と `null` を区別する（§7） |

**ID に時刻順の形式を使わない理由。** 行は id 順に並べるため、UUIDv7 や ULID のような時刻順の ID を使うと、新しい行が常にファイル末尾に追加される。すると、別々のブランチで同時に行を追加したときに同じ位置で必ず衝突する。ランダムな ID であれば追加位置がファイル全体に分散する。ID は一意性だけに責任を持ち、作成順は `created`（§11.2）が担う。

### 11.2 システム項目

`created` / `updated` / `createdBy` / `updatedBy` は、スキーマで定義せず、エンジンだけが書き込む項目である。式からは `CREATED()` / `UPDATED()` / `CREATED_BY()` / `UPDATED_BY()` で参照でき、View では特殊列 `$created` などで表示・ソート・フィルタに使える（View 定義仕様 §6.1）。

| 項目 | 内容 | 書き込む時点 |
|---|---|---|
| `created` | 作成日時。RFC 3339、UTC（`2026-09-17T09:12:33Z`）、秒精度 | `create` 時（Host の時計） |
| `updated` | 最終更新日時。同上。省略時は `created` と同じとみなす | 値の変更（`set` / `unset` / `setDoc`）、`move`、Undo/Redo、スキーマ変更に伴う書き換え |
| `createdBy` / `updatedBy` | 利用者の識別子。Git の `user.email` と同じ位置づけで、Host が設定値を渡す。認証・検証はしない | `created` / `updated` と同時 |

- UTC 固定にするのは、端末のタイムゾーンで表記が揺れて差分に混ざるのを防ぐためである。表示時のローカル時刻への変換は View の `format` で行う。
- 子の追加・削除は親の `updated` を変えない（ロールアップの再計算は変更ではない）。marks・View の変更もデータの変更ではないため対象外。
- いずれも任意項目である。エンジンは読み込み時に欠けている項目を補わない（`load → serialize` の決定性を保つため）。識別子が未設定なら `createdBy` / `updatedBy` は書かない（空文字や "unknown" を入れない）。
- 同一秒内に作成された兄弟の順序は `order`、ワークブック全体では `id` で安定させる。作成順を厳密に保証するものではなく「おおむねの作成順」である。別の端末で作成されたレコードは、その端末の時計に従う。
- 利用者の識別子は個人情報になりうる。ワークブック単位で記録を止めるには `settings.privacy.recordActors: false`（§2.5）を使い、配布用に識別子を除いた複製を作るには CLI の `fmt --strip-actors` を使う。`export` は既定で `createdBy` / `updatedBy` を出力しない（明示した場合のみ）。

**order の扱い。** `order` は同じ親の下の兄弟間で、型を問わずに比較する。`cardinality: "one"` のノードも `order` を持つ。値が重複した場合は `id` 順で安定させ、警告する（D16）。挿入時は隣接する 2 つの値の間の文字列を生成するため、他の行の書き換えは発生しない。

### 11.1 正規化規則

エンジンは保存時に必ず次の形式で書き出す。同じ内容であれば、どの実装が書き出しても同じバイト列になることを保証する。

1. 文字コードは UTF-8（BOM なし）、改行は LF とする。1 行に 1 レコードを書き、ファイル末尾にも改行を置く。
2. レコードのキーは `id`, `type`, `parent`, `order`, `created`, `updated`, `createdBy`, `updatedBy`, `values` の順に並べる（存在するものだけ）。`values` 内のキーはコードポイント順に並べる。`values` が空でも `{}` を出力する。
3. JSON には空白を入れない。非 ASCII 文字はエスケープせずにそのまま出力する。
4. 行は `id` のコードポイント昇順に並べる。
5. rollup と formula の計算結果、および継承による実効値は書き出さない（`whenNoSource: "input"` の入力値は書き出す）。
6. 値は §6 の保存形式に正規化する（decimal の桁数、format ごとの表記、enum・ref の配列順、空文字から `null` への変換）。
7. 数値は JSON の最短表現で出力し、`-0` は `0` とする。

スキーマ・View・マニフェストの各 JSON にはこの規則を課さない（人が編集するため、インデント付きの整形を許容する）。

### 11.2 Git 運用上の注意

`.gitattributes` の `merge=union` は、同じレコードを両方のブランチで編集した場合に、同じ id の行を 2 つ残してしまう。使う場合は、マージ後に必ずエンジンの検証を実行する（D02 で検出される）。検証 CLI は pre-commit フックと CI の両方に組み込むことを推奨する。

## 12. 処理順序と診断

エンジンは次の順で処理する。診断の重大度は `error` / `warning` / `info` の 3 段階とする。`error` があっても保存は可能だが、CLI は終了コード 1 を返す。

1. スキーマの構造検証（メタスキーマ）と意味検証（S 系）。S 系の `error` がある場合、データは読み取り専用で開く。
2. データの読み込みと構造検証（D01〜D09、D19）。
3. 実効値の計算（§8.4）。
4. 値の検証（D10〜D18、D20）。

### 12.1 スキーマの意味検証（S 系）

| コード | 重大度 | 内容 |
|---|---|---|
| S01 | error | `root.children`・`children`・`ref.target`・`fromType`・`sourceType`・`ancestorType` が未定義の型を参照している |
| S02 | warning | ルートから到達できない型がある |
| S03 | error | `sourceType` が `depth` の範囲（子、または子孫）に存在しえない |
| S04 | error | `sourceField` / `weight` が存在しない、または `fn` と型が合わない（§8.1 の表） |
| S05 | error | rollup の結果型とフィールドの `type` が合わない |
| S06 | error | 継承元が祖先として存在しえない、または型が異なる（`format` のみ異なる場合は warning） |
| S07 | error | 式の構文エラー、未知の参照・関数、予約語 `parent` の使用、型の不整合 |
| S08 | error | 計算の依存関係が循環している（自己再帰型の自己集計を除く） |
| S09 | error | `enumRef` が未定義、列挙値の `value` が重複、`default` が型・制約に適合しない |
| S10 | error | `unique.fields` に存在しないフィールドがある |
| S11 | error | rollup（`whenNoSource: "input"` 以外）のフィールドに `required` / `default` がある |
| S12 | warning | 自己再帰しない型に `maxDepth` がある |
| S13 | error | `root.fields` に `inherit` がある、`types` に `Root` が定義されている、または `params` のキーが `root.fields` にない |

### 12.2 データの検証（D 系）

| コード | 重大度 | 内容 |
|---|---|---|
| D01 | error | JSON の構文エラー、またはレコード形式（`meta/record.v0.1.json`）への違反 |
| D02 | error | `id` が重複している |
| D03 | error | `type` がスキーマに存在しない |
| D04 | error | `parent` のノードが存在しない |
| D05 | error | 親子関係が循環している |
| D06 | error | その親の下には置けない型である |
| D07 | error | `cardinality: "one"` の子が 2 件以上ある |
| D08 | error | `required` の子が存在しない |
| D09 | error | `maxDepth` を超えている |
| D10 | error | 値の型・format・制約（pattern、min/max など）に違反している |
| D11 | error | `required` のフィールドの実効値が空である |
| D12 | error | `unique` に違反している |
| D13 | 定義による | `checks` に違反している |
| D14 | error | `ref` の参照先が存在しない、または `target` に含まれない型である |
| D15 | warning | スキーマにないフィールドがある（値は保持する） |
| D16 | warning | 兄弟間で `order` が重複している |
| D17 | info | 子が存在するため、`whenNoSource: "input"` の入力値が無視されている |
| D18 | error | doc のパスが不正、またはファイルが存在しない |
| D19 | error | `dataSchemaVersion` がスキーマの `schemaVersion` と一致しない |
| D20 | warning | 正規化されていない行がある（次回の保存時に正規化される） |
| D21 | error | 単一ファイル形式の構造が不正（先頭行・`%%end` の欠落、不正なパートパス、パート順序の違反） |
| D22 | error | Git のコンフリクトマーカー（`<<<<<<<` など）を含む。読み取り専用で開き、自動保存を無効にする |
| D23 | info | `privacy.recordActors` が `false` なのに `createdBy` / `updatedBy` を持つレコードがある（次回の保存時に除去される） |

## 13. バージョニング

`specVersion` は本仕様（ファイル形式）のバージョン、`schemaVersion` は利用者のスキーマの改訂番号、`dataSchemaVersion` はデータが準拠しているスキーマの改訂番号である。

`label`、`description`、列挙値の追加、制約の緩和は、`schemaVersion` を変えずに行ってよい。フィールド ID・型名・列挙値 `value` の変更、フィールドの型の変更は互換性のない変更として `schemaVersion` を増やし、データと View 定義を同じコミットで移行する。MVP では宣言的なマイグレーションを提供せず、バージョンが一致しない場合は D19 として読み取り専用で開く。

## 14. 例

### 14.1 パラメータシート

`examples/param-sheet/` に、スキーマ・データ・マニフェストの一式をフォルダ形式で置く。`tsheet pack` で単一ファイル形式に変換できる。型の構成は次のとおりである。

```
(root)
└─ Site         拠点           many
   └─ Device    機器           many
      ├─ System     基本設定   one（required）  ← ntp / dns / syslog を Site から継承
      └─ Interface  IF         many
         └─ Vlan    VLAN       many
```

サンプルデータには次のケースを含めている。

| ノード | 内容 | 期待される実効値 |
|---|---|---|
| tky01-core01 の System | `timezone` のみ保存 | ntp / dns / syslog をすべて Site から継承 |
| tky01-acc01 の System | `ntp` を上書き、`syslog: null` | ntp は `10.10.0.2`、dns は継承、syslog は空（継承を遮断） |
| tky01-acc01 の Te1/1/1 | `uplink` で tky01-core01 の Te1/0/1 を参照 | 対向 IF の表示名は `Te1/0/1` |
| Device.fqdn | formula | `tky01-core01.example.co.jp` など |
| Device.vlanTotal | `depth: "descendants"` の count | tky01-core01 は 2、tky01-acc01 は 3 |

### 14.2 WBS

自己再帰型、`whenNoSource: "input"`、加重平均、階層番号を使う例である。

```json
{
  "specVersion": "0.1",
  "schemaVersion": 1,
  "root": { "children": { "Task": { "cardinality": "many" } } },
  "types": {
    "Task": {
      "label": "タスク",
      "titleTemplate": "{wbs} {name}",
      "maxDepth": 6,
      "children": { "Task": { "cardinality": "many" } },
      "fields": {
        "wbs":      { "type": "string", "label": "WBS番号", "formula": "OUTLINE()" },
        "name":     { "type": "string", "label": "タスク名", "required": true },
        "assignee": { "type": "string", "label": "担当" },
        "effort": {
          "type": "number", "label": "工数", "unit": "人日", "min": 0,
          "rollup": { "sourceType": "Task", "sourceField": "effort", "fn": "sum", "whenNoSource": "input" }
        },
        "start": {
          "type": "date", "label": "開始",
          "rollup": { "sourceType": "Task", "sourceField": "start", "fn": "min", "whenNoSource": "input" }
        },
        "end": {
          "type": "date", "label": "終了",
          "rollup": { "sourceType": "Task", "sourceField": "end", "fn": "max", "whenNoSource": "input" }
        },
        "progress": {
          "type": "number", "label": "進捗", "unit": "%", "min": 0, "max": 100,
          "rollup": {
            "sourceType": "Task", "sourceField": "progress",
            "fn": "wavg", "weight": "effort", "whenNoSource": "input"
          }
        },
        "days":      { "type": "number", "label": "暦日数", "integer": true, "formula": "DAYS(end, start) + 1" },
        "dependsOn": { "type": "ref", "label": "先行タスク", "target": ["Task"], "multiple": true, "onDelete": "clear" }
      },
      "checks": [
        { "id": "dateOrder", "expr": "end >= start", "message": "終了日が開始日より前です" }
      ]
    }
  }
}
```

## 15. MVP の対象外と今後の検討事項

型の共通フィールドをまとめる仕組み（mixin や型の継承）、データファイルの分割（シャーディング。方針は `id` の先頭 1 文字で `data/0.jsonl`〜`data/f.jsonl` の 16 分割）、宣言的なマイグレーション（フィールド名の変更や列挙値の対応付け）、複数軸の汎用ピボット（1 つの子型を 1 つのキーで横展開するクロス集計は View 定義仕様の crosstab モードで扱う）、ルートノードの `data.jsonl` 上のレコード化（v0.1 では `params` として持つ）、条件付き必須（MVP では `checks` と `ISBLANK` で代替する）、多言語ラベル、単位換算、権限管理、CRDT によるリアルタイム同期は、v0.1 では扱わない。

CLI の `export` は、計算済みの実効値を含むフラットな表を出力する。階層は `path`（`titleTemplate` の値を `/` で結合）と `id`・`parentId` の列で表し、型ごとに 1 ファイル（Power Query・Excel のシート分け向け）と、`type` 列＋全型フィールドの和集合による単一の横長テーブルの 2 形式を提供する。出力形式の詳細は CLI 仕様（別紙）で定める。

特に CRDT による同期を導入する場合は、Git のコミットと CRDT の操作ログのどちらを正本とするかを決める必要がある。本仕様の正規化済み JSONL は、どちらの方式を採っても「ある時点のスナップショット」として使えるように設計している。
