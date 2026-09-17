import { expect, test } from "vitest";
import { versionText } from "../src/index.ts";

test("tsheet-core をワークスペース経由で参照できる", () => {
  expect(versionText("0.0.0")).toBe("tsheet-cli 0.0.0 (tsheet 0.1)");
});
