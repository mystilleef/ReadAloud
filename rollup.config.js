import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";

export default {
  input  : [
    "build/src/background.js",
    "build/src/content.js",
    "build/src/context.js"
  ],
  output : { format: "esm", dir: "out" },
  plugins: [
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
