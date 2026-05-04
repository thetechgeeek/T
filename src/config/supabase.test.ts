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

	it('fails fast when no Supabase URL or anon key is configured', () => {
		expect(() => {
			jest.isolateModules(() => {
				jest.requireActual('./supabase');
			});
		}).toThrow('Missing Supabase configuration');
	});
});
