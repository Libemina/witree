import { expect, test } from "vitest";
import { FORMAT_VERSION, type Diagnostic } from "../src/index.ts";

test("形式のバージョンを公開している", () => {
  expect(FORMAT_VERSION).toBe("0.1");
});

test("エンジン API の型定義を再エクスポートしている", () => {
  const d: Diagnostic = { code: "D01", severity: "error", message: "" };
  expect(d.code).toBe("D01");
});
