/// <reference types="vitest" />
import { crx } from "@crxjs/vite-plugin";
import biomePlugin from "vite-plugin-biome";
import { viteStaticCopy } from "vite-plugin-static-copy";
import zipPack from "vite-plugin-zip-pack";
import { defineConfig } from "vitest/config";
import manifest from "./manifest.json";
import { version } from "./package.json";

// Create a new manifest object with the correct version
const manifestWithVersion = {
  ...manifest,
  version,
};

const PACKAGE_NAME = `readaloud-${version}.zip`;

export default defineConfig({
  plugins: [
    biomePlugin({
      mode: "check",
      applyFixes: true,
      failOnError: true,
    }),
    crx({ manifest: manifestWithVersion }),
    viteStaticCopy({
      targets: [
        { dest: "images", src: "images/default.png" },
        { dest: "images", src: "images/default.svg" },
        { dest: "images", src: "images/stop.png" },
        { dest: "images", src: "images/stop.svg" },
      ],
    }),
    zipPack({ outDir: "releases", outFileName: PACKAGE_NAME }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/__tests__/setup.ts",
    pool: "threads",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
    },
  },
});
