import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "/albireo/",
  plugins: [react()],
  resolve: {
    alias: {
      xlsx: fileURLToPath(new URL("./vendor/xlsx.mjs", import.meta.url)),
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
