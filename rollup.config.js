import summary from "rollup-plugin-summary";
import typescript from 'rollup-plugin-typescript2';
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { emptyDir } from 'rollup-plugin-empty-dir'
import zip from 'rollup-plugin-zip'

const OUTPUT_OPTIONS = {
  format: "esm",
  dir: "dist",
  compact: true,
  noConflict: true,
  preferConst: true
};

const PLUGINS = [
  chromeExtension(),
  simpleReloader(),
  typescript(),
  emptyDir(),
  summary(),
  zip({ dir: 'releases' }),
];

export default {
  cache: true,
  input: "src/manifest.json",
  output: OUTPUT_OPTIONS,
  plugins: PLUGINS,
};
