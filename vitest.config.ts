import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside a React Server Component context; no-op it in tests.
      "server-only": path.resolve(__dirname, "tests/stubs/empty.ts"),
    },
  },
});
