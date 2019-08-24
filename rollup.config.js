import commonjs   from "rollup-plugin-commonjs";
// @ts-ignore
import { eslint } from "rollup-plugin-eslint";
import resolve    from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
// @ts-ignore
import tslint     from "rollup-plugin-tslint";
import typescript from "rollup-plugin-typescript2";

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
    resolve({
      browser: true
    }),
    commonjs(),
    eslint(),
    tslint(),
    typescript(),
    terser()
  ]
};
