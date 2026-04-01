/**
 * Shared typed chainable Supabase mock builder (QA issue 3.1).
 *
 * Usage in a test file:
 *   import { createSupabaseMock } from '__tests__/utils/supabaseMock';
 *
 *   jest.mock('../config/supabase', () => ({
 *     supabase: createSupabaseMock(),
 *   }));
 *
 * To override a specific return value:
 *   const mock = createSupabaseMock();
 *   mock.from('invoices').select().eq().single.mockResolvedValue({ data: makeInvoice(), error: null });
 *   jest.mock('../config/supabase', () => ({ supabase: mock }));
 */

/** Chainable query builder mock. Every method returns `this` for chaining. */
function createQueryBuilder() {
	const builder: Record<string, jest.Mock | undefined> = {
		select: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		eq: jest.fn(),
		neq: jest.fn(),
		gte: jest.fn(),
		lte: jest.fn(),
		ilike: jest.fn(),
		or: jest.fn(),
		in: jest.fn(),
		is: jest.fn(),
		order: jest.fn(),
		range: jest.fn(),
		limit: jest.fn(),
		single: jest.fn().mockResolvedValue({ data: null, error: null }),
		maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
	};

	// All chainable methods return the builder itself
	const chainableMethods = [
		'select',
		'insert',
		'update',
		'delete',
		'upsert',
		'eq',
		'neq',
		'gte',
		'lte',
		'ilike',
		'or',
		'in',
		'is',
		'order',
		'range',
		'limit',
	] as const;

	for (const method of chainableMethods) {
		const m = builder[method];
		if (m) m.mockReturnValue(builder);
	}

	return builder;
}

export interface SupabaseMock {
	from: jest.Mock;
	rpc: jest.Mock;
	auth: {
		getUser: jest.Mock;
		getSession: jest.Mock;
		signInWithPassword: jest.Mock;
		signUp: jest.Mock;
		onAuthStateChange: jest.Mock;
		signOut: jest.Mock;
	};
}

/**
 * Creates a fully typed chainable Supabase client mock.
 * Every `.from()` call returns the same shared query builder instance.
 */
export function createSupabaseMock(): SupabaseMock {
	const queryBuilder = createQueryBuilder();

	return {
		from: jest.fn().mockReturnValue(queryBuilder),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
		auth: {
			getUser: jest
				.fn()
				.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
			getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
			signInWithPassword: jest
				.fn()
				.mockResolvedValue({ data: { user: {}, session: {} }, error: null }),
			signUp: jest.fn().mockResolvedValue({ data: { user: {}, session: null }, error: null }),
			onAuthStateChange: jest
				.fn()
				.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
			signOut: jest.fn().mockResolvedValue({ error: null }),
		},
	};
}
