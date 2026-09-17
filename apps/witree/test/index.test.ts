import { expect, test } from "vitest";
import { appInfo } from "../src/index.ts";

test("tsheet-core をワークスペース経由で参照できる", () => {
  expect(appInfo.formatVersion).toBe("0.1");
});
