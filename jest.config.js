/**
 * Jest configuration for TileMaster (React Native / Expo)
 *
 * Alias convention (canonical):
 *   @/src/...  →  <rootDir>/src/...   (covers all src imports)
 *   @/app/...  →  <rootDir>/app/...   (covers all app route imports in tests)
 *
 * The single mapping '^@/(.*)$': '<rootDir>/$1' handles BOTH patterns correctly.
 * Do NOT add a second '^@/(.*)$' entry — moduleNameMapper keys must be unique.
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
	testPathIgnorePatterns: [
		'/node_modules/',
		'<rootDir>/__tests__/integration/',
	],

	moduleNameMapper: {
		// Canonical alias: @/src/hooks/useLocale → src/hooks/useLocale
		//                  @/app/(app)/...       → app/(app)/...
		'^@/(.*)$': '<rootDir>/$1',
		// Module stubs for native-only packages not available in Jest
		'^expo-file-system$': '<rootDir>/src/__mocks__/expo-file-system.ts',
		'^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system.ts',
		'^expo-sharing$': '<rootDir>/src/__mocks__/expo-sharing.ts',
		'^expo-print$': '<rootDir>/src/__mocks__/expo-print.ts',
		'^expo-document-picker$': '<rootDir>/src/__mocks__/expo-document-picker.ts',
	},

	transformIgnorePatterns: [
		'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|immer|zustand|lucide-react-native)',
	],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
