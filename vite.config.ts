import { chromeExtension } from "rollup-plugin-chrome-extension";
import { defineConfig } from "vite";
import zip from "rollup-plugin-zip";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [chromeExtension(), isProduction && zip({ dir: "releases" })]
});
