# ADR-0002 Engine の同期メソッドと「すべて Promise」原則の整合

- ステータス：採用
- 日付：2026-10-05
- 関連 Issue：#3（P-03）、#21（L-09）

## 背景

エンジン API 仕様 §1 は「外部インターフェースはすべて `Promise` を返す」を原則とする。UI は tsheet-core を Web Worker で動かし、§12 のメッセージ（要求 → 応答）で呼ぶため、Worker 越しに同期で値を受け取る手段がない。

一方、契約 `engine/engine-api.v0.1.ts` の `Engine` には同期のメソッドが 3 つあった。

| メソッド | 性質 |
|---|---|
| `orderBetween(a, b): Order` | 隣接する 2 つの `order` の間の値を返す純粋関数。エンジンの状態（読み込んだワークブック）に依存しない（本体仕様 §11「order の扱い」） |
| `newId(): NodeId` | UUIDv4 の採番。エンジン自身は `Host.ids.newId()` から取っており、乱数は Host の責務（ADR-0001 の決定性の強制） |
| `version(): { engine, spec }` | エンジンのバージョン。状態に依存しないが、Worker 内のエンジンに問い合わせる必要がある |

`orderBetween` と `newId` は Op を組み立てるたびに呼ばれる（入力 1 回ごとに `create` / `move` の `order` と `id` を確定させる）ため、Worker との往復を挟むと応答待ちが積み重なる。

## 決定

| メソッド | 決定 | 理由 |
|---|---|---|
| `orderBetween` | `Engine` から外し、tsheet-core の単独エクスポート `orderBetween(a: Order \| null, b: Order \| null): Order` とする。契約には `OrderBetween` 型として署名を置き、UI はメインスレッドで直接（同期に）呼ぶ | エンジンの状態に依存しない純粋関数なので Worker 内にある必要がない。同じ実装をメインスレッドで動かせば、Worker 越しの非同期化もメッセージの追加も不要 |
| `newId` | `Engine` から外す。呼び出し側（UI・CLI）は自分の `Host.ids.newId()` で採番する | ID の採番はすでに `Host` の責務であり、エンジンに同じものを二重に持たせる理由がない |
| `version` | `Promise<{ engine, spec }>` に変える | 他のメソッドと同じく Worker 内のエンジンに問い合わせるものなので、原則どおり `Promise` にする |

これにより `Engine` のメソッドはすべて `Promise` を返し、§12 の `Request.method`（`keyof Engine`）はすべての要求を同じ形式で扱える。

## 影響

- 仕様 §1 の原則を「`Engine` のメソッドはすべて `Promise` を返す。状態に依存しない純粋関数は `Engine` に含めず単独エクスポートにする」と明確化し、§5.2・§12・§14 を更新した。
- `orderBetween` の実装（文字集合、先頭・末尾への挿入、長さの増え方）とプロパティテストは #21（L-09）で行う。本 ADR は署名と置き場所だけを決める。
- UI（witree）は `Host` を自前で持つことが前提になる。Worker 内のエンジンに渡す `Host` と、UI 側で `newId()` に使う `Host` が同じ採番方式（UUIDv4）であればよく、同一のオブジェクトである必要はない。
- CLI はプロセス内でエンジンを直接呼ぶので影響は小さいが、`version()` の呼び出しは `await` が必要になる。
