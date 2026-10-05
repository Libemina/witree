import { describe, expect, test } from "vitest";
import { pack, unpack, type Diagnostic, type PartMap, type UnpackResult } from "../src/index.ts";

// サンプルのワークブック。Node とブラウザの両方で動かすため、node:fs ではなく Vite の glob import で読む。
const exampleFiles = import.meta.glob<string>("../../../examples/**", {
  query: "?raw",
  import: "default",
  eager: true,
});

function exampleParts(name: string): PartMap {
  const prefix = `../../../examples/${name}/`;
  const parts: PartMap = {};
  for (const [file, content] of Object.entries(exampleFiles)) {
    if (file.startsWith(prefix)) parts[file.slice(prefix.length)] = content;
  }
  return parts;
}

function unpackOk(single: string): PartMap {
  const r = unpack(single);
  expect(r.diagnostics).toEqual([]);
  return r.parts;
}

/** D21 が 1 件以上あることを確認し、結果をそのまま返す（parts も検査できるように）。 */
function unpackD21(single: string): UnpackResult {
  const r = unpack(single);
  expect(r.diagnostics.length).toBeGreaterThan(0);
  for (const e of r.diagnostics) {
    expect(e.code).toBe("D21");
    expect(e.severity).toBe("error");
    expect(e.at?.line).toBeGreaterThan(0);
    expect(typeof e.detail?.["reason"]).toBe("string");
  }
  return r;
}

const reasons = (diagnostics: Diagnostic[]): unknown[] => diagnostics.map((e) => e.detail?.["reason"]);

describe("サンプルのワークブック", () => {
  test.each(["param-sheet", "budget"])("%s：pack → unpack → pack が同一のバイト列になる", (name) => {
    const parts = exampleParts(name);
    expect(Object.keys(parts)).toContain("workbook.json");
    expect(Object.keys(parts)).toContain("schema.json");
    expect(Object.keys(parts)).toContain("data.jsonl");
    expect(Object.keys(parts).some((p) => p.startsWith("views/"))).toBe(true);

    const packed = pack(parts);
    const unpacked = unpackOk(packed);
    expect(unpacked).toEqual(parts); // サンプルは正規化済み（LF・末尾改行あり）なので内容も完全に戻る
    const repacked = pack(unpacked);
    expect(repacked).toBe(packed);
    expect(new TextEncoder().encode(repacked)).toEqual(new TextEncoder().encode(packed));
  });

  test("param-sheet：パートの順序が固定されている", () => {
    const packed = pack(exampleParts("param-sheet"));
    const paths = packed.split("\n").filter((l) => l.startsWith("%%part ")).map((l) => l.slice("%%part ".length));
    expect(paths).toEqual([
      "workbook.json",
      "schema.json",
      "views/default.marks.json",
      "views/default.view.json",
      "views/device.view.json",
      "views/interfaces.view.json",
      "data.jsonl",
    ]);
  });

  test.each(["param-sheet", "budget"])("%s：%%end が欠落したファイルからも全パートを取り出せる（D21 missing-end）", (name) => {
    const parts = exampleParts(name);
    const packed = pack(parts);
    expect(packed.endsWith("\n%%end\n")).toBe(true);
    const r = unpackD21(packed.slice(0, -"%%end\n".length));
    expect(reasons(r.diagnostics)).toEqual(["missing-end"]);
    expect(r.parts).toEqual(parts);
  });

  test.each(["param-sheet", "budget"])("%s：途中で途切れたファイルからは、途切れた最後のパートまで取り出せる", (name) => {
    const parts = exampleParts(name);
    const packed = pack(parts);
    // 最後のパート（data.jsonl）の途中で切る
    const lastPart = packed.lastIndexOf("%%part data.jsonl\n");
    const cut = packed.indexOf("\n", lastPart + "%%part data.jsonl\n".length) + 5;
    const truncated = packed.slice(0, cut);
    const r = unpackD21(truncated);
    expect(reasons(r.diagnostics)).toEqual(["missing-end"]);
    expect(Object.keys(r.parts).sort()).toEqual(Object.keys(parts).sort());
    for (const [path, content] of Object.entries(parts)) {
      if (path === "data.jsonl") continue;
      expect(r.parts[path]).toBe(content);
    }
    const data = r.parts["data.jsonl"] ?? "";
    expect(data.endsWith("\n")).toBe(true); // 途切れた最終行にも改行を補う
    expect(data.length).toBeGreaterThan(1);
    expect(parts["data.jsonl"]?.startsWith(data.slice(0, -1))).toBe(true);
  });
});

describe("pack", () => {
  test("先頭行・パート・%%end を LF・BOM なしで出力する", () => {
    expect(pack({ "workbook.json": "{}\n", "schema.json": "{\n}\n" })).toBe(
      "%%tsheet 0.1\n%%part workbook.json\n{}\n%%part schema.json\n{\n}\n%%end\n",
    );
  });

  test("パートがなくても先頭行と %%end を出力する", () => {
    expect(pack({})).toBe("%%tsheet 0.1\n%%end\n");
  });

  test("PartMap の挿入順によらず、パートの順序が固定される", () => {
    const a: PartMap = {
      "docs/b/notes.md": "b\n",
      "data.jsonl": "d\n",
      "views/z.view.json": "z\n",
      "docs/a/notes.md": "a\n",
      "schema.json": "s\n",
      "views/a.view.json": "v\n",
      "views/a.marks.json": "m\n",
      "workbook.json": "w\n",
    };
    const b: PartMap = {};
    for (const key of Object.keys(a).reverse()) b[key] = a[key] ?? "";

    const expected =
      "%%tsheet 0.1\n" +
      "%%part workbook.json\nw\n" +
      "%%part schema.json\ns\n" +
      "%%part views/a.marks.json\nm\n" +
      "%%part views/a.view.json\nv\n" +
      "%%part views/z.view.json\nz\n" +
      "%%part data.jsonl\nd\n" +
      "%%part docs/a/notes.md\na\n" +
      "%%part docs/b/notes.md\nb\n" +
      "%%end\n";
    expect(pack(a)).toBe(expected);
    expect(pack(b)).toBe(expected);
  });

  test("パスはコードポイント順に並べる（UTF-16 のコード単位順ではない）", () => {
    // U+FF5E（～）< U+1F600（😀）。コード単位順ではサロゲート（0xD83D）が先に来てしまう。
    const packed = pack({ "docs/\u{1F600}/a.md": "x\n", "docs/\uFF5E/a.md": "y\n" });
    expect(packed.indexOf("docs/\uFF5E/a.md")).toBeLessThan(packed.indexOf("docs/\u{1F600}/a.md"));
    expect(pack(unpackOk(packed))).toBe(packed);
  });

  test("%% で始まる行の行頭に % を 1 つ追加する（% 1 つの行はそのまま）", () => {
    const md = "# 備考\n%%part data.jsonl\n%%end\n%%\n%%%three\n%single\n 50%% off\n";
    expect(pack({ "docs/x/notes.md": md })).toBe(
      "%%tsheet 0.1\n%%part docs/x/notes.md\n# 備考\n%%%part data.jsonl\n%%%end\n%%%\n%%%%three\n%single\n 50%% off\n%%end\n",
    );
  });

  test("パートの内容の CRLF と BOM を正規化する", () => {
    expect(pack({ "workbook.json": "\uFEFF{\r\n}\r\n" })).toBe("%%tsheet 0.1\n%%part workbook.json\n{\n}\n%%end\n");
  });

  test("空のパートは 0 行として出力する", () => {
    expect(pack({ "workbook.json": "{}\n", "data.jsonl": "" })).toBe(
      "%%tsheet 0.1\n%%part workbook.json\n{}\n%%part data.jsonl\n%%end\n",
    );
  });

  test("改行で終わらない内容には改行を 1 つ補う", () => {
    const packed = pack({ "docs/x/notes.md": "本文" });
    expect(packed).toBe("%%tsheet 0.1\n%%part docs/x/notes.md\n本文\n%%end\n");
    expect(unpackOk(packed)).toEqual({ "docs/x/notes.md": "本文\n" });
    expect(pack(unpackOk(packed))).toBe(packed);
  });

  test("末尾の空行は保持する", () => {
    const parts = { "docs/x/notes.md": "本文\n\n\n" };
    expect(unpackOk(pack(parts))).toEqual(parts);
  });

  test.each([
    ["`..` のセグメント", "docs/../secret.md"],
    ["先頭の `..`", "../workbook.json"],
    ["`..` を含む名前", "docs/a..b/notes.md"],
    ["絶対パス", "/workbook.json"],
    ["ドライブ名", "C:/workbook.json"],
    ["バックスラッシュ", "views\\default.view.json"],
    ["バックスラッシュを含む", "views/a\\b.view.json"],
    ["空のセグメント", "docs//notes.md"],
    ["末尾の /", "docs/x/"],
    ["`.` のセグメント", "views/./default.view.json"],
    ["改行を含む", "docs/x\n%%end"],
    ["順序の定まらないパス", "README.md"],
    ["空文字列", ""],
  ])("不正なパートパスでは例外を投げる：%s", (_label, path) => {
    expect(() => pack({ [path]: "x\n" })).toThrow(TypeError);
  });

  test("正しいパスでは例外を投げない", () => {
    expect(() =>
      pack({ "workbook.json": "", "schema.json": "", "data.jsonl": "", "views/a.view.json": "", "docs/413a/notes.md": "", "docs/.hidden/a.b.md": "" }),
    ).not.toThrow();
  });
});

describe("unpack", () => {
  test("パートを取り出す", () => {
    const single = "%%tsheet 0.1\n%%part workbook.json\n{}\n%%part schema.json\n{\n}\n%%part data.jsonl\n%%end\n";
    expect(unpackOk(single)).toEqual({ "workbook.json": "{}\n", "schema.json": "{\n}\n", "data.jsonl": "" });
  });

  test("パートのないファイルを受理する", () => {
    expect(unpackOk("%%tsheet 0.1\n%%end\n")).toEqual({});
  });

  test("%%end の後ろの改行はなくてもよい", () => {
    expect(unpackOk("%%tsheet 0.1\n%%part workbook.json\n{}\n%%end")).toEqual({ "workbook.json": "{}\n" });
  });

  test("CRLF と BOM を受理し、内容は LF にする", () => {
    const single = "\uFEFF%%tsheet 0.1\r\n%%part workbook.json\r\n{\r\n}\r\n%%part docs/x/notes.md\r\n%%%a\r\n%%end\r\n";
    const parts = unpackOk(single);
    expect(parts).toEqual({ "workbook.json": "{\n}\n", "docs/x/notes.md": "%%a\n" });
    expect(pack(parts)).toBe("%%tsheet 0.1\n%%part workbook.json\n{\n}\n%%part docs/x/notes.md\n%%%a\n%%end\n");
  });

  test("%%% 以上で始まる行から % を 1 つ除去する（% 1 つの行はそのまま）", () => {
    const single = "%%tsheet 0.1\n%%part docs/x/notes.md\n%%%part data.jsonl\n%%%end\n%%%\n%%%%three\n%single\n 50%% off\n%%end\n";
    expect(unpackOk(single)).toEqual({
      "docs/x/notes.md": "%%part data.jsonl\n%%end\n%%\n%%%three\n%single\n 50%% off\n",
    });
  });

  test("%% で始まる Markdown 行が往復で保たれる", () => {
    const parts: PartMap = {
      "workbook.json": "{}\n",
      "docs/413a/notes.md": "# 備考\n%%tsheet 0.1\n%%part workbook.json\n%%end\n%%%\n%\n\n%% コメント\n",
    };
    const packed = pack(parts);
    expect(unpackOk(packed)).toEqual(parts);
    expect(pack(unpackOk(packed))).toBe(packed);
  });

  test("docs/ 配下のパートを data.jsonl の後ろで受理する", () => {
    const single = "%%tsheet 0.1\n%%part data.jsonl\n{}\n%%part docs/a/notes.md\n# a\n%%part docs/b/notes.md\n# b\n%%end\n";
    expect(unpackOk(single)).toEqual({ "data.jsonl": "{}\n", "docs/a/notes.md": "# a\n", "docs/b/notes.md": "# b\n" });
  });

  describe("D21（構造不正でも解析できた範囲のパートを返す）", () => {
    test("どんな入力でも例外を投げない", () => {
      for (const single of ["", "\n", "%%", "%%%", "\uFEFF", "%%end", "%%part", "%%tsheet 0.1\n%%part \n"]) {
        expect(() => unpack(single)).not.toThrow();
      }
    });

    describe("missing-end：%%end がない（途中で途切れている）", () => {
      test.each<[string, PartMap]>([
        ["%%tsheet 0.1\n%%part workbook.json\n{}\n", { "workbook.json": "{}\n" }],
        ["%%tsheet 0.1\n%%part workbook.json\n{}", { "workbook.json": "{}\n" }],
        ["%%tsheet 0.1\n%%part workbook.json\n{\n  \"spec", { "workbook.json": "{\n  \"spec\n" }], // 途切れた最終行にも改行を補う
        ["%%tsheet 0.1\n%%part workbook.json\n{}\n%%part schema.json\n{\n", { "workbook.json": "{}\n", "schema.json": "{\n" }],
        ["%%tsheet 0.1\n%%part workbook.json\n{}\n%%part schema.json\n", { "workbook.json": "{}\n", "schema.json": "" }],
        ["%%tsheet 0.1\n%%part workbook.json\n{}\n%%part schema.json", { "workbook.json": "{}\n", "schema.json": "" }],
        ["%%tsheet 0.1\n", {}],
        ["%%tsheet 0.1", {}],
      ])("%j", (single, parts) => {
        const r = unpackD21(single);
        expect(reasons(r.diagnostics)).toEqual(["missing-end"]);
        expect(r.parts).toEqual(parts);
      });

      test("途切れた %%en は区切り行として解釈できず、missing-end にもなる", () => {
        const r = unpackD21("%%tsheet 0.1\n%%part workbook.json\n{}\n%%en");
        expect(reasons(r.diagnostics)).toEqual(["unknown-directive", "missing-end"]);
        expect(r.parts).toEqual({ "workbook.json": "{}\n" });
      });

      test("スタッフィングされた %%%end は終端ではない", () => {
        const r = unpackD21("%%tsheet 0.1\n%%part docs/x/notes.md\n%%%end\n");
        expect(reasons(r.diagnostics)).toEqual(["missing-end"]);
        expect(r.parts).toEqual({ "docs/x/notes.md": "%%end\n" });
      });

      test("行番号は最終行を指す", () => {
        const [e] = unpackD21("%%tsheet 0.1\n%%part workbook.json\n{}\n").diagnostics;
        expect(e?.at).toEqual({ line: 4 });
      });
    });

    describe("missing-header：先頭行がない・不正", () => {
      test.each<[string, unknown[], PartMap]>([
        ["", ["missing-header", "missing-end"], {}],
        ["{}\n", ["missing-header", "content-outside-part", "missing-end"], {}],
        ["\n%%tsheet 0.1\n%%end\n", ["missing-header", "content-outside-part", "unknown-directive"], {}],
        [" %%tsheet 0.1\n%%end\n", ["missing-header", "content-outside-part"], {}],
        ["%%tsheet\n%%end\n", ["missing-header", "unknown-directive"], {}],
        ["%%tsheet0.1\n%%end\n", ["missing-header", "unknown-directive"], {}],
        // 1 行目から区切り行として解析するので、先頭行だけがないファイルからはパートを取り出せる
        ["%%part workbook.json\n{}\n%%end\n", ["missing-header"], { "workbook.json": "{}\n" }],
        ["%%part workbook.json\n{}\n%%part schema.json\n[]\n", ["missing-header", "missing-end"], { "workbook.json": "{}\n", "schema.json": "[]\n" }],
      ])("%j", (single, expected, parts) => {
        const r = unpackD21(single);
        expect(reasons(r.diagnostics)).toEqual(expected);
        expect(r.diagnostics[0]?.at).toEqual({ line: 1 });
        expect(r.parts).toEqual(parts);
      });
    });

    describe("unsupported-version：対応していないバージョン", () => {
      test.each(["0.2", "1.0", "0.1 ", " 0.1", "0.10", ""])("%j でもパートは取り出す", (version) => {
        const r = unpackD21(`%%tsheet ${version}\n%%part workbook.json\n{}\n%%part data.jsonl\n%%end\n`);
        expect(reasons(r.diagnostics)).toEqual(["unsupported-version"]);
        expect(r.diagnostics[0]?.at).toEqual({ line: 1 });
        expect(r.diagnostics[0]?.message).toContain(JSON.stringify(version));
        expect(r.parts).toEqual({ "workbook.json": "{}\n", "data.jsonl": "" });
      });
    });

    describe("invalid-path：不正なパートパス", () => {
      test.each([
        ["`..` のセグメント", "docs/../secret.md"],
        ["先頭の `..`", "../workbook.json"],
        ["`..` を含む名前", "docs/a..b/notes.md"],
        ["絶対パス", "/workbook.json"],
        ["ドライブ名", "C:/workbook.json"],
        ["バックスラッシュ", "views\\default.view.json"],
        ["バックスラッシュを含む", "views/a\\b.view.json"],
        ["空のセグメント", "docs//notes.md"],
        ["末尾の /", "docs/x/"],
        ["`.` のセグメント", "views/./default.view.json"],
        ["タブを含む", "docs/x\ty.md"],
        ["順序の定まらないパス", "README.md"],
        ["前に余分な空白", " workbook.json"],
        ["後ろに余分な空白", "workbook.json "],
        ["空文字列", ""],
      ])("%s：そのパートの内容だけを読み飛ばす", (_label, path) => {
        const r = unpackD21(`%%tsheet 0.1\n%%part workbook.json\n{}\n%%part ${path}\nx\n%%part data.jsonl\n{}\n%%end\n`);
        expect(reasons(r.diagnostics)).toEqual(["invalid-path"]);
        expect(r.diagnostics[0]?.at).toEqual({ line: 4 });
        expect(r.parts).toEqual({ "workbook.json": "{}\n", "data.jsonl": "{}\n" });
      });

      test("不正なパスは順序の検査に使わない", () => {
        // ../x を読み飛ばした後、schema.json は workbook.json と比較される
        const r = unpackD21("%%tsheet 0.1\n%%part workbook.json\n{}\n%%part ../x\nx\n%%part schema.json\n[]\n%%end\n");
        expect(reasons(r.diagnostics)).toEqual(["invalid-path"]);
        expect(r.parts).toEqual({ "workbook.json": "{}\n", "schema.json": "[]\n" });
      });

      test("パスのない %%part 行は区切り行として解釈できない", () => {
        const r = unpackD21("%%tsheet 0.1\n%%part\n%%end\n");
        expect(reasons(r.diagnostics)).toEqual(["unknown-directive"]);
        expect(r.parts).toEqual({});
      });
    });

    describe("part-order：パート順序の違反・重複", () => {
      test.each([
        ["schema.json", "workbook.json"],
        ["data.jsonl", "schema.json"],
        ["data.jsonl", "views/default.view.json"],
        ["docs/a/notes.md", "data.jsonl"],
        ["views/b.view.json", "views/a.view.json"],
        ["docs/b/notes.md", "docs/a/notes.md"],
      ])("%s の後ろの %s：両方のパートを返す", (first, second) => {
        const r = unpackD21(`%%tsheet 0.1\n%%part ${first}\nx\n%%part ${second}\ny\n%%end\n`);
        expect(reasons(r.diagnostics)).toEqual(["part-order"]);
        expect(r.diagnostics[0]?.at).toEqual({ part: second, line: 4 });
        expect(r.parts).toEqual({ [first]: "x\n", [second]: "y\n" });
      });

      test("重複したパートは最初のものを残し、後のものの内容を読み飛ばす", () => {
        const r = unpackD21("%%tsheet 0.1\n%%part workbook.json\n{}\n%%part workbook.json\n[]\n%%part schema.json\n{}\n%%end\n");
        expect(reasons(r.diagnostics)).toEqual(["part-order"]);
        expect(r.diagnostics[0]?.message).toContain("重複");
        expect(r.diagnostics[0]?.at).toEqual({ part: "workbook.json", line: 4 });
        expect(r.parts).toEqual({ "workbook.json": "{}\n", "schema.json": "{}\n" });
      });

      test("順序違反の後ろも、直前のパートと比較する", () => {
        const r = unpackD21("%%tsheet 0.1\n%%part schema.json\ns\n%%part workbook.json\nw\n%%part data.jsonl\nd\n%%end\n");
        expect(reasons(r.diagnostics)).toEqual(["part-order"]);
        expect(r.parts).toEqual({ "schema.json": "s\n", "workbook.json": "w\n", "data.jsonl": "d\n" });
      });
    });

    describe("unknown-directive：解釈できない区切り行", () => {
      test.each(["%%foo", "%%", "%%end ", "%%END", "%%endx", "%%tsheet 0.1", "%%part", "%%partx workbook.json"])(
        "%j：その行だけを読み飛ばす",
        (line) => {
          const r = unpackD21(`%%tsheet 0.1\n%%part docs/x/notes.md\na\n${line}\nb\n%%end\n`);
          expect(reasons(r.diagnostics)).toEqual(["unknown-directive"]);
          expect(r.diagnostics[0]?.at).toEqual({ part: "docs/x/notes.md", line: 4 });
          expect(r.parts).toEqual({ "docs/x/notes.md": "a\nb\n" });
        },
      );

      test("パートの外では at.part を持たない", () => {
        const r = unpackD21("%%tsheet 0.1\n%%foo\n%%part workbook.json\n{}\n%%end\n");
        expect(reasons(r.diagnostics)).toEqual(["unknown-directive"]);
        expect(r.diagnostics[0]?.at).toEqual({ line: 2 });
        expect(r.parts).toEqual({ "workbook.json": "{}\n" });
      });
    });

    describe("content-outside-part：最初の %%part より前に内容がある", () => {
      test.each<[string, PartMap]>([
        ["%%tsheet 0.1\n{}\n%%part workbook.json\n{}\n%%end\n", { "workbook.json": "{}\n" }],
        ["%%tsheet 0.1\n\n%%end\n", {}],
        ["%%tsheet 0.1\na\nb\nc\n%%part data.jsonl\n%%end\n", { "data.jsonl": "" }], // 同じ原因の診断は 1 件にまとめる
      ])("%j：その内容を読み飛ばす", (single, parts) => {
        const r = unpackD21(single);
        expect(reasons(r.diagnostics)).toEqual(["content-outside-part"]);
        expect(r.diagnostics[0]?.at).toEqual({ line: 2 });
        expect(r.parts).toEqual(parts);
      });
    });

    describe("content-after-end：%%end の後ろに内容がある", () => {
      test.each(["\n", "x", "x\n", "%%part data.jsonl\n%%end\n", " "])("%j：後ろをすべて読み飛ばす", (tail) => {
        const r = unpackD21(`%%tsheet 0.1\n%%part workbook.json\n{}\n%%end\n${tail}`);
        expect(reasons(r.diagnostics)).toEqual(["content-after-end"]);
        expect(r.diagnostics[0]?.at).toEqual({ line: 5 });
        expect(r.parts).toEqual({ "workbook.json": "{}\n" });
      });
    });

    test("複数の構造不正をまとめて報告し、解析できたパートを返す", () => {
      const r = unpackD21("%%tsheet 0.1\n%%part schema.json\n%%part ../x\n%%part workbook.json\n%%bad\n");
      expect(reasons(r.diagnostics)).toEqual(["invalid-path", "part-order", "unknown-directive", "missing-end"]);
      expect(r.diagnostics.map((e) => e.at?.line)).toEqual([3, 4, 5, 6]);
      expect(r.parts).toEqual({ "schema.json": "", "workbook.json": "" });
    });

    test("正しいファイルでは発生しない", () => {
      const single =
        "%%tsheet 0.1\n" +
        "%%part workbook.json\n{}\n" +
        "%%part schema.json\n{}\n" +
        "%%part views/a.marks.json\n{}\n" +
        "%%part views/a.view.json\n{}\n" +
        "%%part data.jsonl\n" +
        "%%part docs/a/n.md\n" +
        "%%%end\n%single\n\n" +
        "%%end\n";
      const r = unpack(single);
      expect(r.diagnostics).toEqual([]);
      expect(pack(r.parts)).toBe(single);
    });
  });
});
