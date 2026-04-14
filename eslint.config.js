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
			'no-magic-numbers': 'off',
			'@typescript-eslint/no-magic-numbers': [
				'error',
				{
					detectObjects: true,
					enforceConst: false,
					ignore: [
						-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21,
						22, 24, 28, 30, 32, 36, 40, 44, 48, 50, 56, 64, 72, 80, 96, 100, 128, 180,
						200, 255, 300, 360, 400, 500, 600, 800, 999, 1000,
					],
					ignoreArrayIndexes: true,
					ignoreDefaultValues: true,
					ignoreEnums: true,
					ignoreNumericLiteralTypes: true,
					ignoreReadonlyClassProperties: true,
					ignoreTypeIndexes: true,
				},
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
		files: ['app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@/src/theme/palette',
							message:
								'Use `useThemeTokens()`, `theme.colors`, or `theme.collections` instead of importing the palette directly in UI code.',
						},
						{
							name: '@/src/theme/colors',
							importNames: ['lightTheme', 'darkTheme'],
							message:
								'Runtime UI code should read live theme state from `ThemeProvider` or `useThemeTokens()` instead of importing fixed themes.',
						},
					],
				},
			],
			'no-restricted-syntax': [
				'error',
				{
					selector: "Property[key.name='zIndex'][value.type='Literal']",
					message: 'Use `Z_INDEX.*` tokens instead of raw numeric `zIndex` values.',
				},
				{
					selector:
						"Property[key.name='zIndex'][value.type='UnaryExpression'][operator='-']",
					message: 'Use `Z_INDEX.*` tokens instead of raw numeric `zIndex` values.',
				},
			],
		},
	},
	{
		files: ['src/mocks/**/*.{ts,tsx}', 'src/__mocks__/**/*.{ts,tsx}'],
		rules: {
			// Fixture / demo seed data is inherently arbitrary; keep literals in mocks only.
			'@typescript-eslint/no-magic-numbers': 'off',
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
			'@typescript-eslint/no-magic-numbers': 'off',
		},
	},
	prettierConfig,
];
