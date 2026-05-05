import { RuntimeConfigError, resolveAppRuntimeConfig } from '@/src/config/runtimeConfig';

describe('unit test configuration hygiene', () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
	});

	it('does not require app Supabase env for pure unit tests to start', () => {
		process.env = {
			...originalEnv,
			SUPABASE_TEST_URL: 'https://test-project.supabase.co',
			SUPABASE_TEST_ANON_KEY: 'test-anon',
		};
		delete process.env.EXPO_PUBLIC_SUPABASE_URL;
		delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

		expect(1 + 1).toBe(2);
		expect(() => resolveAppRuntimeConfig(process.env)).toThrow(RuntimeConfigError);
	});
});
