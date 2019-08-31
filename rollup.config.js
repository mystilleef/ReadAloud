import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input  : ["build/background.js", "build/content.js", "build/context.js"],
  output : { format: "esm", dir: "out" },
  plugins: [
    resolve(),
    commonjs(),
    copy({
      targets : [
        { src: "public/*", dest: "dist" },
        { src: "out/*.js", dest: ["public/js", "dist/js"] }
      ],
      hook    : "writeBundle",
      copyOnce: true
    }),
    terser()
  ]
};
