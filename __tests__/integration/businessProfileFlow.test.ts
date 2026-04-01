/**
 * INT-002: Business Profile Setup Flow — real Supabase integration tests.
 * Tests businessProfileService.upsert() and fetch() against real Supabase.
 * Run with: yarn test:integration
 */
import { createTestSupabaseClient, signInTestUser } from '../utils/integrationHelpers';
import { businessProfileService } from '@/src/services/businessProfileService';

const supabase = createTestSupabaseClient();

const TEST_PROFILE = {
	business_name: 'IT-Test Tiles & Ceramics',
	phone: '9876543210',
	gstin: '22AAAAA0000A1Z5',
	address: '12, Industrial Estate',
	city: 'Morbi',
	state: 'Gujarat',
	invoice_prefix: 'TM',
	invoice_sequence: 1,
};

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	// Restore a minimal profile so the app still works after test run
	await businessProfileService.upsert({
		business_name: 'TileMaster Demo',
		invoice_prefix: 'TM',
	});
	await supabase.auth.signOut();
});

describe('INT-002: Business Profile Flow', () => {
	it('upsert creates/updates business profile without error', async () => {
		await expect(businessProfileService.upsert(TEST_PROFILE)).resolves.toBeUndefined();
	});

	it('fetch returns the upserted profile', async () => {
		await businessProfileService.upsert(TEST_PROFILE);
		const profile = await businessProfileService.fetch();

		expect(profile).not.toBeNull();
		expect(profile.business_name).toBe(TEST_PROFILE.business_name);
	});

	it('fetch returns city correctly', async () => {
		const profile = await businessProfileService.fetch();
		expect(profile.city).toBe('Morbi');
	});

	it('fetch returns GSTIN correctly', async () => {
		const profile = await businessProfileService.fetch();
		expect(profile.gstin).toBe('22AAAAA0000A1Z5');
	});

	it('fetch returns invoice_prefix correctly', async () => {
		const profile = await businessProfileService.fetch();
		expect(profile.invoice_prefix).toBe('TM');
	});

	it('upsert updates business_name on second call', async () => {
		await businessProfileService.upsert({ business_name: 'Updated Tiles Ltd' });
		const profile = await businessProfileService.fetch();
		expect(profile.business_name).toBe('Updated Tiles Ltd');
	});

	it('upsert with minimal fields (only business_name) succeeds', async () => {
		await expect(
			businessProfileService.upsert({ business_name: 'Minimal Co' }),
		).resolves.toBeUndefined();
	});

	it('fetch returns null or object (not throwing) when profile may not exist', async () => {
		// PGRST116 (no rows) should not throw — returns null
		const profile = await businessProfileService.fetch();
		expect(profile === null || typeof profile === 'object').toBe(true);
	});
});
