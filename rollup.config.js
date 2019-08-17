export default {
  input: [
    "build/js/background.js",
    "build/js/content.js",
    "build/js/icon.js"
  ],
  output: {
    format: "esm",
    dir: "dist/js"
  }
};
