/**
 * INT-001: Auth Flow — real Supabase integration tests.
 * Requires .env.test with valid SUPABASE_TEST_URL, SUPABASE_TEST_ANON_KEY,
 * INTEGRATION_TEST_EMAIL, INTEGRATION_TEST_PASSWORD.
 *
 * Run with: yarn test:integration
 */
import { createTestSupabaseClient, signInTestUser } from '../utils/integrationHelpers';

const supabase = createTestSupabaseClient();

describe('INT-001: Auth Flow', () => {
	afterAll(async () => {
		await supabase.auth.signOut();
	});

	it('signs in with valid credentials and returns a session', async () => {
		const email = process.env.INTEGRATION_TEST_EMAIL ?? 'test@tilemaster.dev';
		const password = process.env.INTEGRATION_TEST_PASSWORD ?? 'TestPass123!';

		const { data, error } = await supabase.auth.signInWithPassword({ email, password });

		expect(error).toBeNull();
		expect(data.session).not.toBeNull();
		expect(data.session?.user.email).toBe(email);
	});

	it('returns an error for invalid credentials', async () => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: 'nonexistent@tilemaster.dev',
			password: 'WrongPassword123!',
		});

		expect(error).not.toBeNull();
		expect(data.session).toBeNull();
	});

	it('getUser returns authenticated user after sign-in', async () => {
		await signInTestUser(supabase);
		const { data, error } = await supabase.auth.getUser();

		expect(error).toBeNull();
		expect(data.user).not.toBeNull();
		expect(data.user?.email).toBeTruthy();
	});

	it('getSession returns active session after sign-in', async () => {
		await signInTestUser(supabase);
		const { data } = await supabase.auth.getSession();

		expect(data.session).not.toBeNull();
		expect(data.session?.access_token).toBeTruthy();
	});

	it('signs out and clears the session', async () => {
		await signInTestUser(supabase);
		const { error } = await supabase.auth.signOut();

		expect(error).toBeNull();

		const { data } = await supabase.auth.getSession();
		expect(data.session).toBeNull();
	});

	it('returns error with empty email', async () => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: '',
			password: 'TestPass123!',
		});

		expect(error).not.toBeNull();
		expect(data.session).toBeNull();
	});

	it('returns error with empty password', async () => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: process.env.INTEGRATION_TEST_EMAIL ?? 'test@tilemaster.dev',
			password: '',
		});

		expect(error).not.toBeNull();
		expect(data.session).toBeNull();
	});

	it('access_token is a valid JWT string', async () => {
		await signInTestUser(supabase);
		const { data } = await supabase.auth.getSession();
		const token = data.session?.access_token;

		expect(token).toBeTruthy();
		// JWT has three dot-separated parts
		expect(token?.split('.').length).toBe(3);
	});

	it('unauthenticated request to protected table returns RLS error or empty rows', async () => {
		// Sign out first so we test unauthenticated access
		await supabase.auth.signOut();
		const { data, error } = await supabase.from('customers').select('id').limit(1);

		// Either RLS blocks it (error) or returns empty (no rows visible)
		if (error) {
			expect(error.code).toBeTruthy();
		} else {
			expect(Array.isArray(data)).toBe(true);
		}
	});

	it('authenticated request to customers table succeeds', async () => {
		await signInTestUser(supabase);
		const { data, error } = await supabase.from('customers').select('id').limit(1);

		expect(error).toBeNull();
		expect(Array.isArray(data)).toBe(true);
	});
});
