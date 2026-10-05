// テスト用の Host（エンジン API 仕様 §3）。時計・利用者・ID の採番をすべて固定し、同じ options から作った Host が
// 同じ応答を返すようにする。ゴールデンテスト（同 §14）とエンジンの単体テストで使う。
//
// 仕様に明記がなく、ここで決めた点（PR の「仕様の確認事項」にも記載）：
//  1. `hash` のアルゴリズムは Host が選ぶ（推奨 SHA-256）とされているので、SHA-256 の小文字 16 進に固定する。
//  2. `ids.newId()` は `seed` 省略時は連番（`00000000-0000-4000-8000-000000000001` から 1 ずつ増える）、
//     `seed` 指定時は xorshift32 による擬似乱数で、どちらも version 4・variant 10 のビットを立てて UUIDv4 の形式にする。
import type { Diagnostic, Host, NodeId } from "../api.ts";
import { sha256Hex } from "./sha256.ts";

export interface TestHostOptions {
  /** `clock.today()` の値。既定は `"2026-01-31"` */
  today?: string;
  /** `clock.now()` の値（RFC 3339、UTC、秒精度、`Z` 固定）。既定は `"2026-01-31T12:34:56Z"` */
  now?: string;
  /** `clock.timezone`（IANA 名）。既定は `"UTC"` */
  timezone?: string;
  /** `actor`。省略すると `Host.actor` キー自体を持たない（本体仕様 §11.2「識別子が未設定なら書かない」） */
  actor?: string;
  /**
   * ID の採番の種。省略すると連番（`00000000-0000-4000-8000-000000000001` から増加）。指定すると xorshift32 による
   * 擬似乱数（同じ種なら同じ列）。32 ビット符号なし整数として扱い、0 は固定の非零の値に読み替える。
   */
  seed?: number;
}

/** テスト用の Host。`log` に渡された診断を `logged` に貯める。 */
export type TestHost = Host & { logged: Diagnostic[] };

const DEFAULT_TODAY = "2026-01-31";
const DEFAULT_NOW = "2026-01-31T12:34:56Z";
const DEFAULT_TIMEZONE = "UTC";

/** 連番の ID。下位 12 桁（48 ビット）を 16 進で埋める。 */
function sequentialIds(): () => NodeId {
  let counter = 0;
  return () => {
    counter++;
    return `00000000-0000-4000-8000-${counter.toString(16).padStart(12, "0")}`;
  };
}

/** xorshift32 による擬似乱数の ID。16 バイトを生成し、version 4・variant 10 のビットを立てる（RFC 9562 §5.4）。 */
function seededIds(seed: number): () => NodeId {
  // xorshift の状態は 0 であってはならない
  let state = seed >>> 0 || 0x9e3779b9;
  const next = (): number => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state;
  };
  return () => {
    const bytes = new Uint8Array(16);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < 4; i++) view.setUint32(i * 4, next(), false);
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    let hex = "";
    for (const b of bytes) hex += b.toString(16).padStart(2, "0");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
}

/**
 * テスト用の Host を作る。時計は固定、ID は決定的（連番または種付きの擬似乱数）、`hash` は SHA-256 の小文字 16 進。
 * 同じ `options` から作った Host は同じ ID 列を返す。`actor` を省略すると `actor` キー自体を持たない。
 */
export function createTestHost(options: TestHostOptions = {}): TestHost {
  const today = options.today ?? DEFAULT_TODAY;
  const now = options.now ?? DEFAULT_NOW;
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;
  const newId = options.seed === undefined ? sequentialIds() : seededIds(options.seed);
  const logged: Diagnostic[] = [];

  const host: TestHost = {
    clock: {
      today: () => today,
      now: () => now,
      timezone,
    },
    ids: { newId },
    hash: sha256Hex,
    log: (d) => {
      logged.push(d);
    },
    logged,
  };
  if (options.actor !== undefined) host.actor = options.actor;
  return host;
}
