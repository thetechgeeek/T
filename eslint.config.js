const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierConfig = require('eslint-config-prettier');

const globals = {
	__DEV__: 'readonly',
	require: 'readonly',
	module: 'readonly',
	exports: 'readonly',
	process: 'readonly',
	console: 'readonly',
	setTimeout: 'readonly',
	clearTimeout: 'readonly',
	setInterval: 'readonly',
	clearInterval: 'readonly',
	fetch: 'readonly',
	Promise: 'readonly',
	FormData: 'readonly',
	URL: 'readonly',
	URLSearchParams: 'readonly',
	global: 'readonly',
	Buffer: 'readonly',
	__dirname: 'readonly',
	__filename: 'readonly',
};

const testGlobals = {
	...globals,
	describe: 'readonly',
	it: 'readonly',
	test: 'readonly',
	expect: 'readonly',
	beforeEach: 'readonly',
	afterEach: 'readonly',
	beforeAll: 'readonly',
	afterAll: 'readonly',
	jest: 'readonly',
};

module.exports = [
	js.configs.recommended,
	{
		ignores: ['supabase/functions/**', 'node_modules/**', 'dist/**', '.expo/**', 'scripts/**'],
	},
	{
		files: ['*.js', 'supabase/migrations/*.js'],
		languageOptions: {
			globals: {
				...globals,
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
			},
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals,
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'react-native': reactNativePlugin,
		},
		settings: {
			react: { version: 'detect' },
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'react-hooks/exhaustive-deps': 'warn',
			'react-native/no-unused-styles': 'error',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			// Disable base rule in favour of TypeScript-aware version
			'no-undef': 'off',
		},
	},
	{
		files: [
			'**/*.test.{ts,tsx}',
			'**/*.spec.{ts,tsx}',
			'**/__tests__/**/*.{ts,tsx}',
			'jest.setup.ts',
		],
		languageOptions: {
			globals: testGlobals,
		},
		rules: {
			// Relax rules for test files
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-require-imports': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
	prettierConfig,
];
