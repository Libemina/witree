import { describe, expect, test } from "vitest";
import { compareOrder, orderBetween, sortSiblings, type Diagnostic } from "../src/index.ts";

const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ORDER_PATTERN = /^[0-9A-Za-z]+$/;

// --- 乱数（依存を増やさないため、固定シードの xorshift32 をテスト内に持つ） -------------------------------

const SEED = 0x2545f491;

function xorshift32(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s;
  };
}

/** 0 以上 n 未満の整数。 */
function pick(next: () => number, n: number): number {
  return next() % n;
}

function randomOrderText(next: () => number, maxLength: number): string {
  const length = 1 + pick(next, maxLength);
  let s = "";
  for (let i = 0; i < length; i++) s += DIGITS.charAt(pick(next, DIGITS.length));
  return s;
}

/** 失敗時にシードと入力が分かるメッセージ付きで a < mid < b を確かめる。 */
function expectBetween(a: string | null, b: string | null, mid: string, context: string): void {
  const info = `${context} seed=${SEED} a=${JSON.stringify(a)} b=${JSON.stringify(b)} mid=${JSON.stringify(mid)}`;
  expect(ORDER_PATTERN.test(mid), `形式違反: ${info}`).toBe(true);
  if (a !== null) expect(compareOrder(a, mid) < 0, `a < mid でない: ${info}`).toBe(true);
  if (b !== null) expect(compareOrder(mid, b) < 0, `mid < b でない: ${info}`).toBe(true);
}

function maxLength(keys: readonly string[]): number {
  return keys.reduce((m, k) => Math.max(m, k.length), 0);
}

// --- サンプルのワークブック（Node とブラウザの両方で動かすため、node:fs ではなく Vite の glob import で読む） ----

const exampleData = import.meta.glob<string>("../../../examples/*/data.jsonl", {
  query: "?raw",
  import: "default",
  eager: true,
});

interface SiblingRecord {
  readonly id: string;
  readonly parent: string | null;
  readonly order: string;
}

/** サンプルごとに、親 → 兄弟（order 昇順）を集める。 */
function exampleSiblings(): { name: string; parent: string | null; siblings: SiblingRecord[] }[] {
  const out: { name: string; parent: string | null; siblings: SiblingRecord[] }[] = [];
  for (const [file, text] of Object.entries(exampleData)) {
    const name = file.split("/").at(-2) ?? file;
    const byParent = new Map<string | null, SiblingRecord[]>();
    for (const line of text.split("\n")) {
      if (line === "") continue;
      const record = JSON.parse(line) as SiblingRecord;
      const list = byParent.get(record.parent) ?? [];
      list.push({ id: record.id, parent: record.parent, order: record.order });
      byParent.set(record.parent, list);
    }
    for (const [parent, siblings] of byParent) {
      siblings.sort((x, y) => compareOrder(x.order, y.order));
      out.push({ name, parent, siblings });
    }
  }
  return out;
}

// =====================================================================================================

describe("orderBetween：代表的な出力", () => {
  test.each([
    [null, null, "a0"],
    ["a0", null, "a1"],
    ["az", null, "b00"],
    [null, "a0", "Zz"],
    [null, "Zz", "Zy"],
    ["a0", "a1", "a0V"],
    ["a0", "a0V", "a0G"],
    ["a0V", "a1", "a0l"],
    ["a00", "a01", "a00V"],
    ["a1", "a3", "a2"],
    ["a09", "a0a", "a0N"],
    ["Zz", "a0", "ZzV"],
    ["a0", "b00", "a1"],
    ["az", "b00", "azV"],
  ] as const)("(%j, %j) = %j", (a, b, expected) => {
    expect(orderBetween(a, b)).toBe(expected);
    expectBetween(a, b, expected, "代表例");
  });

  test("先頭文字で整数部の桁数が変わる（a は 2 桁、b は 3 桁、Z は 2 桁、Y は 3 桁）", () => {
    expect(orderBetween("azz", null)).toBe("b00");
    expect(orderBetween("bzz", null)).toBe("c000");
    expect(orderBetween(null, "Z0")).toBe("Yzz");
    expect(orderBetween(null, "Y00")).toBe("Xzzz");
  });

  test("整数部が最大（z が 27 桁）なら小数部で伸びる", () => {
    const max = "z".repeat(27);
    expect(orderBetween(max, null)).toBe(`${max}V`);
    expect(orderBetween(`${max}V`, null)).toBe(`${max}l`);
  });

  test("整数部が最小（A の後ろに 0 が 26 桁）の前には構造を持たない値を返す", () => {
    const min = `A${"0".repeat(26)}`;
    const mid = orderBetween(null, min);
    expectBetween(null, min, mid, "最小の整数部");
    expect(orderBetween(null, `${min}V`)).toBe(min);
  });

  test("次の挿入を不可能にする値（候補の後ろに 0 だけを付けた b）を避ける", () => {
    // "a1" を返すと (a1, a10) の間に入る値が無くなるので、a0 の小数部で伸ばす
    expect(orderBetween("a09", "a10")).toBe("a0a");
    // "a0" を返すと (a0, a00) の間に入る値が無くなるので、整数部を 1 減らす
    expect(orderBetween(null, "a00")).toBe("Zz");
    expect(orderBetween(null, "a000")).toBe("Zz");
    // "a01" を返すと (a01, a010) の間に入る値が無くなるので、0 の下に降りる
    expect(orderBetween("a0", "a010")).toBe("a00V");
    // 小数部が 0 以外を含むなら整数部そのものを返してよい
    expect(orderBetween(null, "a01")).toBe("a0");
    expect(orderBetween(null, "a0V")).toBe("a0");
  });

  test("入る値が末尾 0 のものしか無いときはそれを返す", () => {
    expect(orderBetween("a0", "a000")).toBe("a00");
    expect(orderBetween("a0", "a0000")).toBe("a000");
  });

  test("構造に合わないキーも受け付け、a < 結果 < b を満たす", () => {
    const cases: [string | null, string | null][] = [
      [null, "0"],
      [null, "00V"],
      ["0", null],
      ["0", "1"],
      ["9z", null],
      ["b0", null],
      ["a0", "b"],
      ["0", "a0"],
      ["zz", null],
    ];
    for (const [a, b] of cases) {
      if (a === null && b === "0") continue; // 間に入る値が存在しない（下の TypeError の検証で扱う）
      expectBetween(a, b, orderBetween(a, b), "構造に合わないキー");
    }
    // b が null で a < "a0" なら "a0" に戻す
    expect(orderBetween("0", null)).toBe("a0");
    expect(orderBetween("9z", null)).toBe("a0");
    expect(orderBetween("Zz0", null)).toBe("a0");
  });
});

describe("orderBetween：前提違反は TypeError", () => {
  const invalid = "order は英数字（0-9A-Za-z）1 文字以上でなければなりません";
  const notLess = "a は b より小さくなければなりません（コードポイント順）";
  const noRoom = "a と b の間に入る order がありません（b が a の後ろに 0 を付けた形）";

  test.each([["", "a1"], ["a0", ""], ["a-0", null], [null, "a 0"], ["あ", null], [null, "a0\n"], ["a0", "a_1"]] as const)(
    "英数字以外・空文字：(%j, %j)",
    (a, b) => {
      expect(() => orderBetween(a, b)).toThrow(TypeError);
      expect(() => orderBetween(a, b)).toThrow(invalid);
    },
  );

  test.each([["a1", "a0"], ["a0", "a0"], ["a0V", "a0"], ["b00", "az"], ["a0", "Zz"], ["1", "0"]] as const)(
    "a >= b：(%j, %j)",
    (a, b) => {
      expect(() => orderBetween(a, b)).toThrow(TypeError);
      expect(() => orderBetween(a, b)).toThrow(notLess);
    },
  );

  test.each([["a0", "a00"], ["a00", "a000"], ["a0V", "a0V0"], [null, "0"], ["b", "b0"], ["a", "a0"], ["0", "00"]] as const)(
    "間に入る値が存在しない：(%j, %j)",
    (a, b) => {
      expect(() => orderBetween(a, b)).toThrow(TypeError);
      expect(() => orderBetween(a, b)).toThrow(noRoom);
    },
  );

  test("間に入る値が存在する組は TypeError にならない", () => {
    expect(() => orderBetween("a0", "a01")).not.toThrow();
    expect(() => orderBetween("a0", "a000")).not.toThrow();
    expect(() => orderBetween(null, "00")).not.toThrow();
  });
});

describe("orderBetween：サンプルのワークブック", () => {
  const groups = exampleSiblings();

  test("3 つのサンプルの兄弟列を読めている", () => {
    expect(new Set(groups.map((g) => g.name))).toEqual(new Set(["budget", "param-sheet", "wbs"]));
    expect(groups.length).toBeGreaterThan(0);
  });

  test.each(groups.map((g) => [g.name, g.parent, g.siblings] as const))(
    "%s（親 %s）：隣接ペアの間と両端に挿入できる",
    (name, parent, siblings) => {
      const orders = siblings.map((s) => s.order);
      const context = `${name} parent=${String(parent)}`;
      expectBetween(null, orders[0] ?? null, orderBetween(null, orders[0] ?? null), context);
      expectBetween(orders.at(-1) ?? null, null, orderBetween(orders.at(-1) ?? null, null), context);
      for (let i = 0; i + 1 < orders.length; i++) {
        const a = orders[i] ?? null;
        const b = orders[i + 1] ?? null;
        expectBetween(a, b, orderBetween(a, b), context);
      }
    },
  );

  test("サンプルの兄弟列に繰り返し挿入しても TypeError にならず、狭義単調増加を保つ", () => {
    const next = xorshift32(SEED);
    for (const group of groups) {
      const keys = group.siblings.map((s) => s.order);
      for (let step = 0; step < 100; step++) {
        const op = pick(next, 3);
        const context = `${group.name} parent=${String(group.parent)} step=${step}`;
        if (op === 0) {
          const last = keys.at(-1) ?? null;
          const mid = orderBetween(last, null);
          expectBetween(last, null, mid, context);
          keys.push(mid);
        } else if (op === 1) {
          const first = keys[0] ?? null;
          const mid = orderBetween(null, first);
          expectBetween(null, first, mid, context);
          keys.unshift(mid);
        } else if (keys.length >= 2) {
          const i = pick(next, keys.length - 1);
          const a = keys[i] ?? null;
          const b = keys[i + 1] ?? null;
          const mid = orderBetween(a, b);
          expectBetween(a, b, mid, context);
          keys.splice(i + 1, 0, mid);
        }
      }
      for (let i = 0; i + 1 < keys.length; i++) {
        expect(compareOrder(keys[i] ?? "", keys[i + 1] ?? "") < 0, `${group.name} の列が単調でない: ${keys.join(",")}`).toBe(true);
      }
    }
  });

  test.each(groups.map((g) => [g.name, g.parent, g.siblings] as const))(
    "%s（親 %s）：sortSiblings は D16 を返さず order 順に並べる",
    (name, parent, siblings) => {
      const { sorted, diagnostics } = sortSiblings(siblings, parent);
      expect(diagnostics).toEqual([]);
      expect(sorted.map((s) => s.order)).toEqual(siblings.map((s) => s.order));
    },
  );
});

describe("orderBetween：プロパティ", () => {
  /** 構造の有無を混ぜたキーの集合。 */
  function buildPool(next: () => number): string[] {
    const pool = ["a0", "a00", "a10", "a0V0", "Zz", "Z0", "Yzz", `A${"0".repeat(26)}`, "z".repeat(27), "0", "9z", "b0", "b", "zz"];
    // orderBetween の出力（構造を持つキー）
    const seq = ["a0"];
    for (let i = 0; i < 400; i++) {
      const op = pick(next, 3);
      if (op === 0 || seq.length < 2) seq.push(orderBetween(seq.at(-1) ?? null, null));
      else if (op === 1) seq.unshift(orderBetween(null, seq[0] ?? null));
      else {
        const k = pick(next, seq.length - 1);
        seq.splice(k + 1, 0, orderBetween(seq[k] ?? null, seq[k + 1] ?? null));
      }
    }
    pool.push(...seq);
    // ランダムな英数字列（構造を持たないものを含む）
    for (let i = 0; i < 400; i++) pool.push(randomOrderText(next, 5));
    return pool;
  }

  test("ランダムな a < b に対して a < mid < b（5,000 ケース）", () => {
    const next = xorshift32(SEED);
    const pool = buildPool(next);
    let cases = 0;
    let attempts = 0;
    while (cases < 5000) {
      attempts++;
      expect(attempts, "有効なケースが集まらない").toBeLessThan(100_000);
      let a = pool[pick(next, pool.length)] ?? "a0";
      let b = pool[pick(next, pool.length)] ?? "a1";
      const cmp = compareOrder(a, b);
      if (cmp === 0) continue;
      if (cmp > 0) [a, b] = [b, a];
      if (b === `${a}0`) continue; // 間に入る値が存在しない組
      expectBetween(a, b, orderBetween(a, b), `case=${cases}`);
      cases++;
    }
  });

  test("ランダムな a に対して (null, a) と (a, null)", () => {
    const next = xorshift32(SEED ^ 0x9e3779b9);
    const pool = buildPool(next);
    for (let i = 0; i < 1000; i++) {
      const a = pool[pick(next, pool.length)] ?? "a0";
      expectBetween(a, null, orderBetween(a, null), `case=${i} 末尾`);
      if (a === "0") continue; // (null, "0") は間に入る値が存在しない
      expectBetween(null, a, orderBetween(null, a), `case=${i} 先頭`);
    }
  });

  /** 末尾追加・先頭追加・隣接 2 キーの間への挿入をランダムに行い、列を返す。 */
  function randomSequence(seed: number, steps: number): string[] {
    const next = xorshift32(seed);
    const keys = ["a0"];
    for (let step = 0; step < steps; step++) {
      const op = pick(next, 3);
      const context = `step=${step}`;
      if (op === 0 || keys.length < 2) {
        const last = keys.at(-1) ?? null;
        const mid = orderBetween(last, null);
        expectBetween(last, null, mid, context);
        keys.push(mid);
      } else if (op === 1) {
        const first = keys[0] ?? null;
        const mid = orderBetween(null, first);
        expectBetween(null, first, mid, context);
        keys.unshift(mid);
      } else {
        const i = pick(next, keys.length - 1);
        const a = keys[i] ?? null;
        const b = keys[i + 1] ?? null;
        const mid = orderBetween(a, b);
        expectBetween(a, b, mid, context);
        keys.splice(i + 1, 0, mid);
      }
    }
    return keys;
  }

  test("ランダムな操作列（2,000 回）で狭義単調増加", () => {
    const keys = randomSequence(SEED, 2000);
    expect(keys).toHaveLength(2001);
    for (let i = 0; i + 1 < keys.length; i++) {
      expect(compareOrder(keys[i] ?? "", keys[i + 1] ?? "") < 0, `seed=${SEED} i=${i} ${keys[i]} >= ${keys[i + 1]}`).toBe(true);
      expect(ORDER_PATTERN.test(keys[i] ?? "")).toBe(true);
    }
  });

  test("決定性：同じシードの操作列は同じ結果になる", () => {
    expect(randomSequence(SEED, 500)).toEqual(randomSequence(SEED, 500));
    expect(orderBetween("a0", "a1")).toBe(orderBetween("a0", "a1"));
  });

  test("成長：末尾追加 1,000 回で長さ ≤ 3", () => {
    const keys = ["a0"];
    for (let i = 0; i < 1000; i++) keys.push(orderBetween(keys.at(-1) ?? null, null));
    expect(maxLength(keys)).toBeLessThanOrEqual(3);
    expect(keys[62]).toBe("b00");
  });

  test("成長：先頭追加 1,000 回で長さ ≤ 3", () => {
    const keys = ["a0"];
    for (let i = 0; i < 1000; i++) keys.unshift(orderBetween(null, keys[0] ?? null));
    expect(maxLength(keys)).toBeLessThanOrEqual(3);
    expect(keys.at(-2)).toBe("Zz");
    expect(keys.at(-63)).toBe("Z0");
    expect(keys.at(-64)).toBe("Yzz");
  });

  test("成長：同じ位置（a0 の直後）に 100 回挿入で長さ ≤ 20", () => {
    const keys = ["a0", "a1"];
    for (let i = 0; i < 100; i++) keys.splice(1, 0, orderBetween("a0", keys[1] ?? null));
    for (let i = 0; i + 1 < keys.length; i++) expect(compareOrder(keys[i] ?? "", keys[i + 1] ?? "")).toBeLessThan(0);
    expect(maxLength(keys)).toBeLessThanOrEqual(20);
  });

  test("成長：同じ位置（a1 の直前）に 100 回挿入で長さ ≤ 22", () => {
    const keys = ["a0", "a1"];
    for (let i = 0; i < 100; i++) keys.splice(keys.length - 1, 0, orderBetween(keys.at(-2) ?? null, "a1"));
    for (let i = 0; i + 1 < keys.length; i++) expect(compareOrder(keys[i] ?? "", keys[i + 1] ?? "")).toBeLessThan(0);
    expect(maxLength(keys)).toBeLessThanOrEqual(22);
  });
});

describe("compareOrder", () => {
  test("コードポイント順（0-9 < A-Z < a-z、接頭辞が先）", () => {
    expect(compareOrder("a0", "a1")).toBeLessThan(0);
    expect(compareOrder("Zz", "a0")).toBeLessThan(0);
    expect(compareOrder("9", "A")).toBeLessThan(0);
    expect(compareOrder("a0", "a0V")).toBeLessThan(0);
    expect(compareOrder("a0", "a0")).toBe(0);
    expect(compareOrder("b00", "az")).toBeGreaterThan(0);
  });
});

describe("sortSiblings（D16）", () => {
  const node = (id: string, order: string): { id: string; order: string; label: string } => ({ id, order, label: `${id}/${order}` });
  const parent = "0f6a1a8a-7a9f-4c43-9f0b-2a9b7a7e4c10";

  test("重複がなければ D16 は無く、order のコードポイント順に並ぶ", () => {
    const input = [node("i3", "a1"), node("i1", "Zz"), node("i2", "a0V"), node("i4", "a0")];
    const { sorted, diagnostics } = sortSiblings(input, parent);
    expect(diagnostics).toEqual([]);
    expect(sorted.map((n) => n.id)).toEqual(["i1", "i4", "i2", "i3"]);
    expect(sorted.map((n) => n.label)).toEqual(["i1/Zz", "i4/a0", "i2/a0V", "i3/a1"]);
  });

  test("重複する order を持つノード 1 件につき 1 個の D16（at.node と detail.ids）", () => {
    const input = [node("c", "a1"), node("b", "a0"), node("a", "a1"), node("d", "a2"), node("e", "a1")];
    const { sorted, diagnostics } = sortSiblings(input, parent);
    expect(sorted.map((n) => n.id)).toEqual(["b", "a", "c", "e", "d"]);
    expect(diagnostics).toHaveLength(3);
    expect(diagnostics.map((d) => d.at?.node)).toEqual(["a", "c", "e"]);
    for (const d of diagnostics) {
      expect(d.code).toBe("D16");
      expect(d.severity).toBe("warning");
      expect(d.message).not.toBe("");
      expect(d.detail).toEqual({ reason: "duplicate-order", order: "a1", parent, ids: ["a", "c", "e"] });
    }
  });

  test("複数の order が重複していれば、それぞれの組で D16", () => {
    const input = [node("x2", "a0"), node("y2", "a1"), node("x1", "a0"), node("y1", "a1"), node("z", "a2")];
    const { diagnostics } = sortSiblings(input, null);
    expect(diagnostics.map((d) => [d.at?.node, d.detail?.["order"], d.detail?.["parent"]])).toEqual([
      ["x1", "a0", null],
      ["x2", "a0", null],
      ["y1", "a1", null],
      ["y2", "a1", null],
    ]);
  });

  test("同点は id のコードポイント順", () => {
    const input = [node("b", "a0"), node("B", "a0"), node("a", "a0"), node("0", "a0")];
    const { sorted, diagnostics } = sortSiblings(input, parent);
    expect(sorted.map((n) => n.id)).toEqual(["0", "B", "a", "b"]);
    expect(diagnostics.map((d) => d.at?.node)).toEqual(["0", "B", "a", "b"]);
    expect(diagnostics[0]?.detail?.["ids"]).toEqual(["0", "B", "a", "b"]);
  });

  test("結果は入力順に依存しない", () => {
    const base = [node("n1", "a1"), node("n2", "a0"), node("n3", "a1"), node("n4", "a0V"), node("n5", "a1"), node("n6", "Zz")];
    const expected = sortSiblings(base, parent);
    const next = xorshift32(SEED);
    for (let trial = 0; trial < 20; trial++) {
      const shuffled = [...base];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = pick(next, i + 1);
        const x = shuffled[i];
        const y = shuffled[j];
        if (x !== undefined && y !== undefined) {
          shuffled[i] = y;
          shuffled[j] = x;
        }
      }
      expect(sortSiblings(shuffled, parent)).toEqual(expected);
    }
  });

  test("入力を変更しない", () => {
    const input = [node("c", "a1"), node("a", "a0"), node("b", "a1")];
    const snapshot = structuredClone(input);
    const { sorted } = sortSiblings(input, parent);
    expect(input).toEqual(snapshot);
    expect(sorted).not.toBe(input);
    expect(input.map((n) => n.id)).toEqual(["c", "a", "b"]);
  });

  test("空の兄弟列", () => {
    expect(sortSiblings([], null)).toEqual({ sorted: [], diagnostics: [] });
  });

  test("order の形式は検査しない（D01 の役割）", () => {
    const { diagnostics } = sortSiblings([node("a", "a-0"), node("b", "")], parent);
    expect(diagnostics).toEqual([]);
  });

  test("D16 は Diagnostic 型の形を満たす", () => {
    const { diagnostics } = sortSiblings([node("a", "a0"), node("b", "a0")], parent);
    const d: Diagnostic | undefined = diagnostics[0];
    expect(d).toMatchObject({ code: "D16", severity: "warning", at: { node: "a" } });
  });
});
