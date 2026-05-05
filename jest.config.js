/**
 * Jest configuration for EasyDesign (React Native / Expo)
 *
 * Path aliases mirror tsconfig.json "paths". Specific prefixes (@/theme, @/constants, …)
 * must be listed BEFORE the catch-all '^@/(.*)$' — Jest uses first match.
 *   @/theme/...     →  <rootDir>/src/theme/...
 *   @/constants/... →  <rootDir>/src/constants/...
 *   @/src/...        →  <rootDir>/src/...
 *   @/app/...        →  <rootDir>/app/...   (catch-all)
 *
 * Unit tests receive a default Supabase mock from jest.setup.ts so they stay
 * env-free. Tests that assert Supabase behavior should override it locally with
 * the shared builder in __tests__/utils/supabaseMock.ts. Integration tests use
 * jest.integration.config.js and do not load this setup.
 */
module.exports = {
	preset: 'jest-expo',

	// Coverage — only collected when --coverage flag is passed
	collectCoverage: false,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'app/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!app/**/*.d.ts',
		'!src/**/__tests__/**',
		'!app/**/__tests__/**',
		'!src/config/**',
		'!src/types/**',
		'!app/**/_layout.tsx',
		'!app/design-system/**',
		// Barrel re-export files — no logic to test
		'!src/**/index.ts',
		'!src/theme/index.ts',
		'!src/i18n/index.ts',
		// PDF generation uses native modules (expo-print, expo-sharing) — covered by mock-level tests
		'!src/services/pdfService.ts',
		// Static constant files — no branches / functions
		'!src/constants/gst.ts',
	],
	coverageDirectory: '<rootDir>/coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	coverageThreshold: {
		global: {
			branches: 60,
			functions: 54,
			lines: 65,
			statements: 64,
		},
		'./src/services/': { lines: 75, branches: 70 },
		'./src/repositories/': { lines: 90, branches: 68 },
		'./src/utils/': { lines: 90, branches: 85 },
		'./app/(auth)/login.tsx': { lines: 60, branches: 40 },
		'./app/(app)/(tabs)/inventory.tsx': { lines: 55, branches: 35 },
		'./app/(app)/(tabs)/invoices.tsx': { lines: 45, branches: 25 },
		'./app/(app)/customers/': { lines: 45, branches: 25 },
		'./app/(app)/invoices/': { lines: 45, branches: 25 },
		'./app/(app)/finance/payments/': { lines: 40, branches: 20 },
	},

	// Explicit test discovery — prevents accidental collection of non-test files
	// Integration tests live in __tests__/integration/ and run via jest.integration.config.js
	testMatch: [
		'<rootDir>/__tests__/**/*.test.{ts,tsx}',
		'<rootDir>/src/**/*.test.{ts,tsx}',
		'<rootDir>/__tests__/chain/**/*.test.{ts,tsx}',
		'!<rootDir>/__tests__/integration/**',
	],
	testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/integration/'],

	moduleNameMapper: {
		'^@easydesign/design-system/foundation$': '<rootDir>/src/design-system/foundation/index.ts',
		'^@easydesign/design-system$': '<rootDir>/src/design-system/index.ts',
		'^@easydesign/design-system/(.*)$': '<rootDir>/src/design-system/$1',
		'^@easydesign/ui-shell$': '<rootDir>/src/ui-shell/index.ts',
		'^@easydesign/ui-shell/(.*)$': '<rootDir>/src/ui-shell/$1',
		'^@easydesign/ops-console$': '<rootDir>/examples/ops-console/src/index.ts',
		'^@easydesign/ops-console/(.*)$': '<rootDir>/examples/ops-console/src/$1',
		'^@/theme/(.*)$': '<rootDir>/src/theme/$1',
		'^@/constants/(.*)$': '<rootDir>/src/constants/$1',
		'^@/components/(.*)$': '<rootDir>/src/components/$1',
		'^@/services/(.*)$': '<rootDir>/src/services/$1',
		'^@/stores/(.*)$': '<rootDir>/src/stores/$1',
		'^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
		'^@/utils/(.*)$': '<rootDir>/src/utils/$1',
		'^@/types/(.*)$': '<rootDir>/src/types/$1',
		'^@/config/(.*)$': '<rootDir>/src/config/$1',
		'^@/i18n/(.*)$': '<rootDir>/src/i18n/$1',
		'^@/src/(.*)$': '<rootDir>/src/$1',
		'^@/(.*)$': '<rootDir>/$1',
		'^@formatjs/(.*)$': '<rootDir>/src/__mocks__/noop.ts',
		// Module stubs for native-only packages not available in Jest
		'^expo-file-system$': '<rootDir>/src/__mocks__/expo-file-system.ts',
		'^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system.ts',
		'^expo-sharing$': '<rootDir>/src/__mocks__/expo-sharing.ts',
		'^expo-print$': '<rootDir>/src/__mocks__/expo-print.ts',
		'^expo-document-picker$': '<rootDir>/src/__mocks__/expo-document-picker.ts',
	},

	transformIgnorePatterns: [
		'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@formatjs/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|immer|zustand|lucide-react-native|color|color-string)',
	],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
