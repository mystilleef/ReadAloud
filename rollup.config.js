import ts         from "@wessberg/rollup-plugin-ts";
import copy       from "rollup-plugin-copy";
import del        from "rollup-plugin-delete";
import { terser } from "rollup-plugin-terser";
import tslint     from "rollup-plugin-tslint";

// noinspection JSUnusedGlobalSymbols
export default {
  input  : [
    "src/background.ts",
    "src/content.ts",
    "src/context.ts"
  ],
  output : {
    format: "esm",
    dir   : "out"
  },
  plugins: [
    tslint(),
    del({ targets: ["dist", "out", "public/js"] }),
    copy({
      targets : [
        {
          src : "public/*",
          dest: "dist"
        },
        {
          src : "out/*.js",
          dest: ["public/js", "dist/js"]
        }
      ],
      hook    : "writeBundle",
      copyOnce: true
    }),
    ts(),
    terser()
  ]
};
