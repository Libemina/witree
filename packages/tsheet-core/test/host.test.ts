import { describe, expect, test } from "vitest";
import {
  createTestHost,
  encodeUtf8,
  isUuidV4,
  sha256,
  sha256Hex,
  UUID_V4_PATTERN,
  type Diagnostic,
  type Host,
} from "../src/index.ts";

const ascii = (text: string): Uint8Array => encodeUtf8(text);
const bytes = (u8: Uint8Array): number[] => Array.from(u8);

describe("sha256 / sha256Hex", () => {
  // 期待値の出典：
  //  - FIPS 180-2 Appendix B（B.1 "abc"、B.2 56 バイト、B.3 "a" × 1,000,000）
  //  - NIST CSRC "Examples with Intermediate Values"（SHA256.pdf：112 バイトの 2 ブロック例、
  //    SHA2_Additional.pdf：空メッセージ）。空メッセージは NIST CAVP SHA256ShortMsg.rsp の Len = 0 とも一致する
  const VECTORS: [label: string, input: string, hex: string][] = [
    ["空文字列", "", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["abc", "abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
    [
      "56 バイト（FIPS 180-2 B.2）",
      "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    ],
    [
      "112 バイト（NIST SHA256.pdf）",
      "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu",
      "cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1",
    ],
  ];

  test.each(VECTORS)("NIST のテストベクタ：%s", (_label, input, hex) => {
    expect(sha256Hex(ascii(input))).toBe(hex);
  });

  test("NIST のテストベクタ：\"a\" を 1,000,000 回（FIPS 180-2 B.3）", () => {
    const input = ascii("a".repeat(1_000_000));
    expect(input.length).toBe(1_000_000);
    expect(sha256Hex(input)).toBe("cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0");
  });

  test("sha256 は 32 バイトを返し、sha256Hex はその 16 進表現", () => {
    const digest = sha256(ascii("abc"));
    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32);
    expect(bytes(digest).slice(0, 4)).toEqual([0xba, 0x78, 0x16, 0xbf]);
    expect(Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("")).toBe(sha256Hex(ascii("abc")));
  });

  // 55・56 はパディングが 1 ブロックに収まるかどうかの境界、63・64・65 はブロック長の境界、119・120 は 2 ブロック目の境界
  const BOUNDARY_LENGTHS = [55, 56, 63, 64, 65, 119, 120];

  test.each(BOUNDARY_LENGTHS)("ブロック境界（%i バイト）でも 64 文字の小文字 16 進を返す", (length) => {
    const input = new Uint8Array(length);
    for (let i = 0; i < length; i++) input[i] = (i * 7 + 3) & 0xff;
    const hex = sha256Hex(input);
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
    expect(sha256Hex(input)).toBe(hex);
    // 最後の 1 バイトを変えると結果が変わる
    const changed = new Uint8Array(input);
    changed[length - 1] = ((changed[length - 1] ?? 0) + 1) & 0xff;
    expect(sha256Hex(changed)).not.toBe(hex);
  });

  test("ブロック境界の各入力は互いに異なるハッシュになる", () => {
    const hashes = BOUNDARY_LENGTHS.map((length) => sha256Hex(new Uint8Array(length)));
    expect(new Set(hashes).size).toBe(BOUNDARY_LENGTHS.length);
  });

  test("同じ入力には同じ結果を返し、入力を変更しない", () => {
    const input = ascii("tsheet");
    const before = bytes(input);
    expect(sha256Hex(input)).toBe(sha256Hex(ascii("tsheet")));
    expect(bytes(input)).toEqual(before);
  });

  test("byteOffset が 0 でないビュー（subarray）でも同じ結果になる", () => {
    const buffer = ascii("xxabcxx");
    const view = buffer.subarray(2, 5);
    expect(view.byteOffset).toBe(2);
    expect(sha256Hex(view)).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("encodeUtf8", () => {
  test("ASCII", () => {
    expect(bytes(encodeUtf8("abc"))).toEqual([0x61, 0x62, 0x63]);
    expect(bytes(encodeUtf8(""))).toEqual([]);
  });

  test("2 バイト文字（U+0080〜U+07FF）", () => {
    expect(bytes(encodeUtf8("\u0080"))).toEqual([0xc2, 0x80]);
    expect(bytes(encodeUtf8("é"))).toEqual([0xc3, 0xa9]);
    expect(bytes(encodeUtf8("߿"))).toEqual([0xdf, 0xbf]);
  });

  test("3 バイト文字（U+0800〜U+FFFF）", () => {
    expect(bytes(encodeUtf8("ࠀ"))).toEqual([0xe0, 0xa0, 0x80]);
    expect(bytes(encodeUtf8("あ"))).toEqual([0xe3, 0x81, 0x82]);
    expect(bytes(encodeUtf8("￿"))).toEqual([0xef, 0xbf, 0xbf]);
  });

  test("4 バイト文字（サロゲートペア）", () => {
    expect(bytes(encodeUtf8("😀"))).toEqual([0xf0, 0x9f, 0x98, 0x80]);
    expect(bytes(encodeUtf8("\u{10000}"))).toEqual([0xf0, 0x90, 0x80, 0x80]);
    expect(bytes(encodeUtf8("\u{10ffff}"))).toEqual([0xf4, 0x8f, 0xbf, 0xbf]);
  });

  test("混在した文字列", () => {
    expect(bytes(encodeUtf8("a¢あ😀"))).toEqual([0x61, 0xc2, 0xa2, 0xe3, 0x81, 0x82, 0xf0, 0x9f, 0x98, 0x80]);
  });

  test("孤立サロゲートは U+FFFD（EF BF BD）に置換する", () => {
    const fffd = [0xef, 0xbf, 0xbd];
    expect(bytes(encodeUtf8("\ud83d"))).toEqual(fffd); // 上位サロゲートだけ（末尾）
    expect(bytes(encodeUtf8("\ud83dx"))).toEqual([...fffd, 0x78]); // 上位サロゲートの後に通常の文字
    expect(bytes(encodeUtf8("\udc00"))).toEqual(fffd); // 下位サロゲートだけ
    expect(bytes(encodeUtf8("a\udc00\ud83d"))).toEqual([0x61, ...fffd, ...fffd]);
    expect(bytes(encodeUtf8("�"))).toEqual(fffd); // U+FFFD そのもの
  });
});

describe("isUuidV4", () => {
  const good = ["413a04d8-4dd6-48d6-8291-37623d5745a3", "00000000-0000-4000-8000-000000000000", "ffffffff-ffff-4fff-bfff-ffffffffffff"];

  test.each(good)("真：%s", (s) => {
    expect(isUuidV4(s)).toBe(true);
    expect(UUID_V4_PATTERN.test(s)).toBe(true);
  });

  const bad: [label: string, value: string][] = [
    ["version が 1", "413a04d8-4dd6-18d6-8291-37623d5745a3"],
    ["variant が c", "413a04d8-4dd6-48d6-c291-37623d5745a3"],
    ["variant が 7", "413a04d8-4dd6-48d6-7291-37623d5745a3"],
    ["大文字", "413A04D8-4DD6-48D6-8291-37623D5745A3"],
    ["短い", "413a04d8-4dd6-48d6-8291-37623d5745a"],
    ["長い", "413a04d8-4dd6-48d6-8291-37623d5745a3f"],
    ["ブレース付き", "{413a04d8-4dd6-48d6-8291-37623d5745a3}"],
    ["ハイフンなし", "413a04d84dd648d6829137623d5745a3"],
    ["16 進でない文字", "413a04d8-4dd6-48d6-8291-37623d5745ag"],
    ["空文字列", ""],
    ["前後の空白", " 413a04d8-4dd6-48d6-8291-37623d5745a3"],
  ];

  test.each(bad)("偽：%s", (_label, s) => {
    expect(isUuidV4(s)).toBe(false);
  });

  test("UUID_V4_PATTERN はメタスキーマ（meta/record.v0.1.json）の uuid と同じ", () => {
    expect(UUID_V4_PATTERN.source).toBe("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
  });
});

describe("createTestHost", () => {
  const ids = (host: Host, n: number): string[] => Array.from({ length: n }, () => host.ids.newId());

  test("既定の時計：today・now・timezone が固定値", () => {
    const host = createTestHost();
    expect(host.clock.today()).toBe("2026-01-31");
    expect(host.clock.now()).toBe("2026-01-31T12:34:56Z");
    expect(host.clock.timezone).toBe("UTC");
    expect(host.clock.now()).toBe(host.clock.now());
  });

  test("clock.now() は RFC 3339・UTC・秒精度・Z 固定の形式", () => {
    expect(createTestHost().clock.now()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  test("options で時計と timezone を差し替えられる", () => {
    const host = createTestHost({ today: "2030-12-31", now: "2030-12-31T23:59:59Z", timezone: "Asia/Tokyo" });
    expect(host.clock.today()).toBe("2030-12-31");
    expect(host.clock.now()).toBe("2030-12-31T23:59:59Z");
    expect(host.clock.timezone).toBe("Asia/Tokyo");
  });

  test("actor 未指定なら actor キー自体を持たない", () => {
    const host = createTestHost();
    expect("actor" in host).toBe(false);
    expect(Object.keys(host)).not.toContain("actor");
  });

  test("actor を指定するとそのまま持つ", () => {
    const host = createTestHost({ actor: "alice@example.com" });
    expect(host.actor).toBe("alice@example.com");
    expect("actor" in host).toBe(true);
  });

  test("連番の ID：00000000-0000-4000-8000-000000000001 から 1 ずつ増え、UUIDv4 の形式を満たす", () => {
    const host = createTestHost();
    const list = ids(host, 3);
    expect(list).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
    ]);
    for (const id of list) expect(isUuidV4(id)).toBe(true);
  });

  test("連番の ID：16 進で桁上がりし、重複しない", () => {
    const host = createTestHost();
    const list = ids(host, 300);
    expect(list[15]).toBe("00000000-0000-4000-8000-000000000010");
    expect(list[255]).toBe("00000000-0000-4000-8000-000000000100");
    expect(new Set(list).size).toBe(300);
    for (const id of list) expect(isUuidV4(id)).toBe(true);
  });

  test("連番の ID：Host ごとに独立して 1 から始まる", () => {
    const a = createTestHost();
    const b = createTestHost();
    expect(ids(a, 2)).toEqual(ids(b, 2));
  });

  test("seed 付きの ID：UUIDv4 の形式を満たし、重複しない", () => {
    const host = createTestHost({ seed: 42 });
    const list = ids(host, 1000);
    for (const id of list) expect(isUuidV4(id)).toBe(true);
    expect(new Set(list).size).toBe(1000);
  });

  test("seed 付きの ID：同じ seed なら同じ列、違う seed なら違う列", () => {
    expect(ids(createTestHost({ seed: 42 }), 10)).toEqual(ids(createTestHost({ seed: 42 }), 10));
    expect(ids(createTestHost({ seed: 42 }), 10)).not.toEqual(ids(createTestHost({ seed: 43 }), 10));
  });

  test("seed 付きの ID：連番とは異なる（固定の接頭辞を持たない）", () => {
    const seeded = ids(createTestHost({ seed: 1 }), 5);
    const sequential = ids(createTestHost(), 5);
    expect(seeded).not.toEqual(sequential);
    expect(seeded.every((id) => !id.startsWith("00000000-0000-4000-8000-"))).toBe(true);
  });

  test("seed が 0 でも ID を返し続ける（xorshift の状態が 0 に固定されない）", () => {
    const list = ids(createTestHost({ seed: 0 }), 10);
    expect(new Set(list).size).toBe(10);
    for (const id of list) expect(isUuidV4(id)).toBe(true);
  });

  test("hash は SHA-256 の小文字 16 進（NIST の \"abc\"）", () => {
    const host = createTestHost();
    expect(host.hash(encodeUtf8("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(host.hash(encodeUtf8(""))).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  test("log に渡した診断が logged に順に貯まる", () => {
    const host = createTestHost();
    expect(host.logged).toEqual([]);
    const d1: Diagnostic = { code: "D01", severity: "error", message: "one" };
    const d2: Diagnostic = { code: "V01", severity: "warning", message: "two", at: { view: "default" } };
    host.log?.(d1);
    host.log?.(d2);
    expect(host.logged).toEqual([d1, d2]);
    expect(host.logged[0]).toBe(d1);
  });

  test("logged は Host ごとに独立している", () => {
    const a = createTestHost();
    const b = createTestHost();
    a.log?.({ code: "D01", severity: "error", message: "" });
    expect(a.logged).toHaveLength(1);
    expect(b.logged).toHaveLength(0);
  });

  test("Host として使える（契約の型を満たす）", () => {
    const host: Host = createTestHost({ actor: "bob", seed: 7 });
    expect(typeof host.clock.today()).toBe("string");
    expect(typeof host.ids.newId()).toBe("string");
    expect(typeof host.hash(new Uint8Array(0))).toBe("string");
  });
});
