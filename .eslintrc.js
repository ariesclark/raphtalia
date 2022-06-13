require("@ariesclark/eslint-config/eslint-patch");

module.exports = {
	extends: ["next/core-web-vitals", "@ariesclark/eslint-config"],
	parserOptions: {
		tsconfigRootDir: __dirname
	},
	rules: {
		"@next/next/no-img-element": "off",
		"@next/next/no-sync-scripts": "off",
		"@next/next/no-head-element": "off"
	}
};
