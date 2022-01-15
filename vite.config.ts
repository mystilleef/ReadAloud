import { chromeExtension } from "rollup-plugin-chrome-extension";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: { outDir: "../dist" },
  plugins: [chromeExtension()]
});
