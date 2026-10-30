import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: { lib: { entry: resolve(__dirname, "src/main.ts"), formats: ["cjs"] } },
  },
  preload: {
    build: { lib: { entry: resolve(__dirname, "src/preload.ts"), formats: ["cjs"] } },
  },
  renderer: {
    // index.html lives at the app root (not in src/renderer) to keep src/ flat.
    root: ".",
    plugins: [react(), tailwindcss()],
    server: { port: 5174, strictPort: true },
    build: {
      // electron-vite disables minification by default; the renderer should ship minified.
      minify: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: { input: resolve(__dirname, "index.html") },
    },
  },
});
