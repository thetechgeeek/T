/**
 * Jest configuration for INTEGRATION tests.
 *
 * These tests hit a REAL Supabase test project (never production).
 * Requires .env.test with:
 *   SUPABASE_TEST_URL=https://your-test-project.supabase.co
 *   SUPABASE_TEST_ANON_KEY=your-anon-key
 *
 * Run: npm run test:integration
 *
 * Key differences from jest.config.js:
 *  - Supabase is NOT mocked — real network calls are made
 *  - Longer timeout (30 s) for network latency
 *  - Only runs files in __tests__/integration/
 *  - Runs serially (--runInBand) to avoid race conditions on shared test DB
 */

require('dotenv').config({ path: '.env.test' });

// Map test variables to EXPO ones so the production client uses the test project
if (process.env.SUPABASE_TEST_URL) {
	process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.SUPABASE_TEST_URL;
}
if (process.env.SUPABASE_TEST_ANON_KEY) {
	process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
}

module.exports = {
	preset: 'jest-expo',
	testMatch: ['<rootDir>/__tests__/integration/**/*.test.{ts,tsx}'],
	testTimeout: 30000,
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^expo-file-system$': '<rootDir>/src/__mocks__/expo-file-system.ts',
		'^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system.ts',
		'^expo-sharing$': '<rootDir>/src/__mocks__/expo-sharing.ts',
		'^expo-print$': '<rootDir>/src/__mocks__/expo-print.ts',
		'^expo-document-picker$': '<rootDir>/src/__mocks__/expo-document-picker.ts',
	},
	transformIgnorePatterns: [
		'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|immer|zustand|lucide-react-native)',
	],
	// Minimal setup — NO Supabase mock, NO RN component mocks
	// Integration tests only need basic env, not React Native UI mocks
	setupFilesAfterEnv: ['<rootDir>/__tests__/utils/integrationSetup.ts'],
};
