import { defineProject } from "vitest/config";

export default defineProject({
  test: { name: "witree", include: ["test/**/*.test.ts"] },
});
