/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard'],
	rules: {
		// Built-in rule (there is no separate `stylelint-color-no-hex` package)
		'color-no-hex': true,
	},
	ignoreFiles: [
		'**/node_modules/**',
		'**/.expo/**',
		'**/dist/**',
		'**/coverage/**',
	],
};
