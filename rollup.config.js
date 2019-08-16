export default {
  input: [
    "build/js/background.js", 
    "build/js/content.js",
  ],
  output: {
    format: "esm",
    dir: "dist/js",
  }
};
