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
});
