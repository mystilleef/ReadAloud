import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import summary from "rollup-plugin-summary";
import { terser } from "rollup-plugin-terser";

const INPUT_OPTIONS = { cache: true };

const OUTPUT_OPTIONS = {
  dir: "out",
  compact: true,
  noConflict: true,
  preferConst: true
};

const STANDARD_PLUGINS = [
  resolve(),
  commonjs(),
  terser({ mangle: false }),
  summary()
];

const COPY_PLUGIN = copy({
  targets: [
    { src: "public/*", dest: "dist" },
    { src: "out/*.js", dest: ["public/js", "dist/js"] }
  ],
  hook: "writeBundle",
  copyOnce: true
});

export default {
  input: ["build/background.js", "build/context.js", "build/content.js"],
  output: { format: "esm", ...OUTPUT_OPTIONS },
  plugins: [...STANDARD_PLUGINS, COPY_PLUGIN],
  ...INPUT_OPTIONS
};
