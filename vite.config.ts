import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import biomePlugin from "vite-plugin-biome";
import { viteStaticCopy } from "vite-plugin-static-copy";
import zipPack from "vite-plugin-zip-pack";
import manifest from "./manifest.json";

const PACKAGE_NAME = `readaloud-${manifest.version}.zip`;

export default defineConfig({
  plugins: [
    biomePlugin({
      mode: "check",
      applyFixes: true,
      failOnError: true,
    }),
    crx({ manifest }),
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
});
