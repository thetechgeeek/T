describe('supabase config', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...originalEnv };
		delete process.env.EXPO_PUBLIC_SUPABASE_URL;
		delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
		delete process.env.SUPABASE_TEST_URL;
		delete process.env.SUPABASE_TEST_ANON_KEY;
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it('fails fast at module startup when no Supabase URL or anon key is configured', () => {
		expect(() => {
			jest.isolateModules(() => {
				jest.requireActual('./supabase');
			});
		}).toThrow('Missing Supabase configuration');
	});

	it('validates missing URL with the typed startup health check', () => {
		jest.isolateModules(() => {
			process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
			const { validateSupabaseConfig, SupabaseConfigError } =
				jest.requireActual('./supabase');

			expect(() =>
				validateSupabaseConfig({
					EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
				}),
			).toThrow(SupabaseConfigError);
		});
	});

	it('validates missing anon key with the typed startup health check', () => {
		jest.isolateModules(() => {
			process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
			const { validateSupabaseConfig, SupabaseConfigError } =
				jest.requireActual('./supabase');

			expect(() =>
				validateSupabaseConfig({
					EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
				}),
			).toThrow(SupabaseConfigError);
		});
	});

	it('returns the resolved runtime config when URL and anon key are present', () => {
		jest.isolateModules(() => {
			process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
			const { validateSupabaseConfig } = jest.requireActual('./supabase');

			expect(validateSupabaseConfig(process.env)).toEqual({
				url: 'https://example.supabase.co',
				anonKey: 'anon-key',
			});
		});
	});

	it('does not fall back from app runtime config to SUPABASE_TEST_* variables', () => {
		jest.isolateModules(() => {
			process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
			process.env.SUPABASE_TEST_URL = 'https://test-project.supabase.co';
			process.env.SUPABASE_TEST_ANON_KEY = 'test-anon-key';
			const { validateSupabaseConfig, SupabaseConfigError } =
				jest.requireActual('./supabase');

			expect(() =>
				validateSupabaseConfig({
					SUPABASE_TEST_URL: 'https://test-project.supabase.co',
					SUPABASE_TEST_ANON_KEY: 'test-anon-key',
				}),
			).toThrow(SupabaseConfigError);
		});
	});
});
