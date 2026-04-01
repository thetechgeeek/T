/**
 * Helpers for integration tests that hit real Supabase.
 *
 * Pattern:
 *   const prefix = testPrefix();
 *   // Use prefix in names to identify test-created rows
 *   afterAll(() => cleanupTestData(supabase, prefix));
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as singletonSupabase } from '@/src/config/supabase';

/** Creates a Supabase client pointing at the TEST project (from .env.test). */
export function createTestSupabaseClient() {
	const url = process.env.SUPABASE_TEST_URL;
	const key = process.env.SUPABASE_TEST_ANON_KEY;
	if (!url || !key) {
		throw new Error(
			'Missing SUPABASE_TEST_URL or SUPABASE_TEST_ANON_KEY in .env.test.\n' +
				'Copy .env.test.example to .env.test and fill in your test project credentials.',
		);
	}
	return createClient(url, key);
}

/** Returns a unique prefix for this test run so rows can be identified and cleaned up. */
export function testPrefix(): string {
	return `it-${Date.now()}-`;
}

/**
 * Delete all rows created during this test run across common tables.
 * Each table is filtered by a name/title/design_name column that starts with the prefix.
 */
export async function cleanupByPrefix(
	supabase: ReturnType<typeof createTestSupabaseClient>,
	prefix: string,
): Promise<void> {
	const cleanupOps = [
		supabase.from('invoice_line_items').delete().like('design_name', `${prefix}%`),
		supabase.from('invoices').delete().like('notes', `${prefix}%`),
		supabase.from('payments').delete().like('notes', `${prefix}%`),
		supabase.from('customers').delete().like('name', `${prefix}%`),
		supabase.from('inventory_items').delete().like('design_name', `${prefix}%`),
		supabase.from('expenses').delete().like('description', `${prefix}%`),
		supabase.from('suppliers').delete().like('name', `${prefix}%`),
		supabase.from('orders').delete().like('notes', `${prefix}%`),
		supabase.from('notifications').delete().like('title', `${prefix}%`),
	];

	await Promise.allSettled(cleanupOps);
}

/** Signs in with the integration test user and returns the session. */
export async function signInTestUser(
	supabase: ReturnType<typeof createTestSupabaseClient>,
): Promise<void> {
	const email = process.env.INTEGRATION_TEST_EMAIL ?? 'test@tilemaster.dev';
	const password = process.env.INTEGRATION_TEST_PASSWORD ?? 'TestPass123!';

	// Sign in both the passed client and the app's singleton client
	const [res1, res2] = await Promise.all([
		supabase.auth.signInWithPassword({ email, password }),
		singletonSupabase.auth.signInWithPassword({ email, password }),
	]);

	if (res1.error) {
		throw new Error(`Integration test sign-in failed (test client): ${res1.error.message}`);
	}
	if (res2.error) {
		throw new Error(
			`Integration test sign-in failed (singleton client): ${res2.error.message}`,
		);
	}
}
