import { describe, expect, test } from "vitest";
import { pack, unpack, type Diagnostic, type PartMap } from "../src/index.ts";

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
  if (!r.ok) throw new Error(`unpack に失敗: ${JSON.stringify(r.errors)}`);
  expect(r.diagnostics).toEqual([]);
  return r.value;
}

function unpackErrors(single: string): Diagnostic[] {
  const r = unpack(single);
  if (r.ok) throw new Error("unpack が成功してしまった");
  expect(r.errors.length).toBeGreaterThan(0);
  for (const e of r.errors) {
    expect(e.code).toBe("D21");
    expect(e.severity).toBe("error");
  }
  return r.errors;
}

const reasons = (errors: Diagnostic[]): unknown[] => errors.map((e) => e.detail?.["reason"]);

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

  describe("D21", () => {
    test("%%end がない（途中で途切れている）", () => {
      for (const single of [
        "%%tsheet 0.1\n%%part workbook.json\n{}\n",
        "%%tsheet 0.1\n%%part workbook.json\n{}",
        "%%tsheet 0.1\n%%part workbook.json\n{\n  \"spec",
        "%%tsheet 0.1\n",
        "%%tsheet 0.1",
        "%%tsheet 0.1\n%%part workbook.json\n{}\n%%en",
      ]) {
        expect(reasons(unpackErrors(single))).toContain("missing-end");
      }
    });

    test("%%end がない：スタッフィングされた %%%end は終端ではない", () => {
      expect(reasons(unpackErrors("%%tsheet 0.1\n%%part docs/x/notes.md\n%%%end\n"))).toEqual(["missing-end"]);
    });

    test("%%end がない：行番号は最終行を指す", () => {
      const [e] = unpackErrors("%%tsheet 0.1\n%%part workbook.json\n{}\n");
      expect(e?.at?.line).toBe(4);
    });

    test("先頭行がない・不正", () => {
      for (const single of [
        "",
        "\n%%tsheet 0.1\n%%end\n",
        "%%part workbook.json\n{}\n%%end\n",
        "{}\n",
        "%%tsheet\n%%end\n",
        "%%tsheet0.1\n%%end\n",
        " %%tsheet 0.1\n%%end\n",
      ]) {
        const errors = unpackErrors(single);
        expect(reasons(errors)).toEqual(["missing-header"]);
        expect(errors[0]?.at?.line).toBe(1);
      }
    });

    test("対応していないバージョン", () => {
      for (const single of ["%%tsheet 0.2\n%%end\n", "%%tsheet 1.0\n%%end\n", "%%tsheet 0.1 \n%%end\n", "%%tsheet  0.1\n%%end\n"]) {
        expect(reasons(unpackErrors(single))).toEqual(["unsupported-version"]);
      }
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
      ["タブを含む", "docs/x\ty.md"],
      ["順序の定まらないパス", "README.md"],
      ["前に余分な空白", " workbook.json"],
      ["後ろに余分な空白", "workbook.json "],
      ["空文字列", ""],
    ])("不正なパートパス：%s", (_label, path) => {
      const errors = unpackErrors(`%%tsheet 0.1\n%%part workbook.json\n{}\n%%part ${path}\nx\n%%end\n`);
      expect(reasons(errors)).toEqual(["invalid-path"]);
      expect(errors[0]?.at?.line).toBe(4);
    });

    test("不正なパートパス：パスのない %%part 行は区切り行として解釈できない", () => {
      expect(reasons(unpackErrors("%%tsheet 0.1\n%%part\n%%end\n"))).toEqual(["unknown-directive"]);
    });

    test("パート順序の違反", () => {
      const cases = [
        ["schema.json", "workbook.json"],
        ["data.jsonl", "schema.json"],
        ["data.jsonl", "views/default.view.json"],
        ["docs/a/notes.md", "data.jsonl"],
        ["views/b.view.json", "views/a.view.json"],
        ["docs/b/notes.md", "docs/a/notes.md"],
      ];
      for (const [first, second] of cases) {
        const errors = unpackErrors(`%%tsheet 0.1\n%%part ${first ?? ""}\nx\n%%part ${second ?? ""}\ny\n%%end\n`);
        expect(reasons(errors)).toEqual(["part-order"]);
        expect(errors[0]?.at).toEqual({ part: second, line: 4 });
      }
    });

    test("パートの重複", () => {
      const errors = unpackErrors("%%tsheet 0.1\n%%part workbook.json\n{}\n%%part workbook.json\n[]\n%%end\n");
      expect(reasons(errors)).toEqual(["part-order"]);
      expect(errors[0]?.message).toContain("重複");
    });

    test("解釈できない区切り行", () => {
      for (const line of ["%%foo", "%%", "%%end ", "%%END", "%%endx", "%%tsheet 0.1", "%%part", "%%partx workbook.json"]) {
        const errors = unpackErrors(`%%tsheet 0.1\n%%part docs/x/notes.md\n${line}\n%%end\n`);
        expect(reasons(errors)).toEqual(["unknown-directive"]);
        expect(errors[0]?.at).toEqual({ part: "docs/x/notes.md", line: 3 });
      }
    });

    test("最初の %%part より前に内容がある", () => {
      expect(reasons(unpackErrors("%%tsheet 0.1\n{}\n%%part workbook.json\n{}\n%%end\n"))).toEqual(["content-outside-part"]);
      expect(reasons(unpackErrors("%%tsheet 0.1\n\n%%end\n"))).toEqual(["content-outside-part"]);
      // 同じ原因の診断は 1 件にまとめる
      expect(reasons(unpackErrors("%%tsheet 0.1\na\nb\nc\n%%end\n"))).toEqual(["content-outside-part"]);
    });

    test("%%end の後ろに内容がある", () => {
      for (const tail of ["\n", "x", "x\n", "%%part data.jsonl\n%%end\n", " "]) {
        const errors = unpackErrors(`%%tsheet 0.1\n%%part workbook.json\n{}\n%%end\n${tail}`);
        expect(reasons(errors)).toEqual(["content-after-end"]);
        expect(errors[0]?.at?.line).toBe(5);
      }
    });

    test("複数の構造不正をまとめて報告する", () => {
      const errors = unpackErrors("%%tsheet 0.1\n%%part schema.json\n%%part ../x\n%%part workbook.json\n%%bad\n");
      expect(reasons(errors)).toEqual(["invalid-path", "part-order", "unknown-directive", "missing-end"]);
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
      expect(r.ok).toBe(true);
      expect(r.ok && r.diagnostics).toEqual([]);
      expect(pack(unpackOk(single))).toBe(single);
    });
  });
});
