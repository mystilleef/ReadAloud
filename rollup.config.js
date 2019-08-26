import ts         from "@wessberg/rollup-plugin-ts";
import copy       from "rollup-plugin-copy";
import del        from "rollup-plugin-delete";
// @ts-ignore
import { eslint } from "rollup-plugin-eslint";
import { terser } from "rollup-plugin-terser";
// @ts-ignore
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
    del({ targets: ["dist", "out", "public/js"] }),
    eslint(),
    tslint(),
    ts(),
    copy({
      targets : [
        {
          src : "public/*",
          dest: "dist"
        },
        {
          src : "out/*",
          dest: ["public/js", "dist/js"]
        }
      ],
      hook    : "writeBundle",
      copyOnce: true
    }),
    terser()
  ]
};
