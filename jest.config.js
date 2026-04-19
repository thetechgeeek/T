/**
 * Jest configuration for TileMaster (React Native / Expo)
 *
 * Path aliases mirror tsconfig.json "paths". Specific prefixes (@/theme, @/constants, …)
 * must be listed BEFORE the catch-all '^@/(.*)$' — Jest uses first match.
 *   @/theme/...     →  <rootDir>/src/theme/...
 *   @/constants/... →  <rootDir>/src/constants/...
 *   @/src/...        →  <rootDir>/src/...
 *   @/app/...        →  <rootDir>/app/...   (catch-all)
 *
 * Supabase is NOT globally mocked here or in jest.setup.ts.
 * Each test file that needs a Supabase mock must declare its own local
 * jest.mock() using the shared builder in __tests__/utils/supabaseMock.ts.
 */
module.exports = {
	preset: 'jest-expo',

	// Coverage — only collected when --coverage flag is passed
	collectCoverage: false,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/__tests__/**',
		'!src/config/**',
		'!src/types/**',
		'!app/**',
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
			branches: 80,
			functions: 85,
			lines: 85,
			statements: 85,
		},
		'./src/services/': { lines: 85, branches: 75 },
		'./src/repositories/': { lines: 90, branches: 68 },
		'./src/utils/': { lines: 98, branches: 90 },
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
