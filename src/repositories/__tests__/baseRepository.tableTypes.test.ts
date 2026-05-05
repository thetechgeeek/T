import { createRepository } from '../baseRepository';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

describe('createRepository table typing', () => {
	it('only accepts registered public table names at compile time', () => {
		createRepository<{ id: string }>('customers');
		// @ts-expect-error Intentional: singular table names must fail before runtime.
		createRepository<{ id: string }>('customer');

		expect(true).toBe(true);
	});
});
