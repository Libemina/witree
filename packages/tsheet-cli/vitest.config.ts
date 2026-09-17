import { defineProject } from "vitest/config";

export default defineProject({
  test: { name: "tsheet-cli", include: ["test/**/*.test.ts"] },
});
