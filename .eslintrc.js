require("@ariesclark/eslint-config/modern-module-resolution");

module.exports = {
  extends: [
    "next/core-web-vitals", 
    "@ariesclark/eslint-config"
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
  }
}
