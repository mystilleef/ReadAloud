import path from 'path'
import replace from '@rollup/plugin-replace'
import summary from "rollup-plugin-summary";
import typescript from 'rollup-plugin-typescript2';
import zip from 'rollup-plugin-zip'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { emptyDir } from 'rollup-plugin-empty-dir'

const isProduction = process.env.NODE_ENV === 'production'

const OUTPUT_OPTIONS = {
  chunkFileNames: path.join('chunks', '[name]-[hash].js'),
  compact: true,
  dir: "dist",
  format: "esm",
  noConflict: true,
  preferConst: true
};

const PLUGINS = [
  chromeExtension(),
  simpleReloader(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': isProduction
      ? JSON.stringify('production')
      : JSON.stringify('development'),
  }),
  typescript(),
  emptyDir(),
  isProduction && summary(),
  isProduction && zip({ dir: 'releases' }),
];

export default {
  cache: true,
  input: "src/manifest.ts",
  output: OUTPUT_OPTIONS,
  plugins: PLUGINS,
};
