// eslint.config.js (CommonJS)
//@ts-expect-error
const { defineConfig } = require("eslint/config")
//@ts-expect-error
const stylistic = require("@stylistic/eslint-plugin")

module.exports = defineConfig([
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
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			// 1) No trailing semicolons (auto-fixable)
			// Note: core `semi` is deprecated from ESLint 8.53 but still works in ESLint 9;
			// it may be removed in ESLint 11. For now this will auto-remove semicolons.
			semi: ["error", "never"],                              // [1](https://eslint.org/docs/latest/rules/semi)
			"no-extra-semi": "error",                              // (defensive) [2](https://github.com/eslint/eslint/blob/main/docs/src/rules/curly.md)

			// 2) Put single-statement bodies on their own line (auto-fixable)
			// e.g., `if (x) doThing()` -> 
			//       `if (x)\n  doThing()`
			"nonblock-statement-body-position": ["error", "below"],// [3](https://eslint.org/docs/latest/rules/nonblock-statement-body-position)

			// Strongly recommended along with the above so fixes are unambiguous
			// Require braces for all control statements (auto-fixable)
			curly: ["error", "all"],                               // [4](https://eslint.org/docs/latest/rules/curly)
			// Keep opening braces on the same line as the control statement (auto-fixable)
			"@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": false }], // [5](https://eslint.style/rules/default/brace-style)
			// Enforce consistent indentation (auto-fixable)
			"@stylistic/indent": ["error", "tab", { "SwitchCase": 1 }], // [6](https://eslint.style/rules/default/indent)
		},
	},
])