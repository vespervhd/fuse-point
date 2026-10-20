import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// تست واحد منطق خالص (بدون DB/شبکه) — npm run test:unit
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
