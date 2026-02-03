// eslint.config.js
module.exports = [
  {
    files: ["./**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        $: "readonly",
        bean: "readonly",
        md5: "readonly",
        google: "readonly",
      },
    },
    linterOptions: {
      env: {
        browser: true,
        commonjs: true,
        es2021: true,
      },
    },
    rules: {
      // Add custom rules here
    },
  },
];
