import { customerService } from './customerService';
import { supabase } from '../config/supabase';
import { makeCustomer } from '../../__tests__/fixtures/customerFixtures';

// Mock the Supabase client
jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

/** Chainable + thenable builder for query-awaiting service methods. */
function makeListBuilder(result = { data: [] as any[], count: 0, error: null }) {
	const b: any = {};
	['select', 'insert', 'update', 'or', 'eq', 'gte', 'lte', 'ilike', 'order', 'range'].forEach((m) => {
		b[m] = jest.fn().mockReturnValue(b);
	});
	b.single = jest.fn().mockResolvedValue({ data: result.data?.[0] ?? null, error: result.error });
	b.then = jest.fn((resolve: any) => Promise.resolve(result).then(resolve));
	return b;
}

describe('customerService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createCustomer', () => {
		it('handles and throws database errors (QA 7.5 fix: match on code, not full object)', async () => {
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({
				data: null,
				error: {
					code: 'PGRST205',
					message: "Could not find the table 'public.customers' in the schema cache",
				},
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			// Fixed: use toMatchObject instead of toEqual to avoid brittle equality on error shape
			await expect(customerService.createCustomer({ name: 'Test' } as any)).rejects.toMatchObject({
				code: 'PGRST205',
			});
			expect(supabase.from).toHaveBeenCalledWith('customers');
		});

		it('successfully returns created customer', async () => {
			const customer = makeCustomer();
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: customer, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.createCustomer({ name: 'Test Customer' } as any);
			expect(result).toEqual(customer);
		});
	});

	describe('fetchCustomers', () => {
		it('calls from(customers) with no filters by default', async () => {
			const builder = makeListBuilder({ data: [], count: 0, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.fetchCustomers({});

			expect(supabase.from).toHaveBeenCalledWith('customers');
			expect(builder.select).toHaveBeenCalled();
			expect(result).toHaveProperty('data');
			expect(result).toHaveProperty('count');
		});

		it('applies .or() ILIKE search for name and phone when search is provided', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await customerService.fetchCustomers({ search: 'John' });

			expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('%John%'));
		});

		it('error path: rejects when supabase returns an error', async () => {
			const builder = makeListBuilder({ data: null as any, count: null as any, error: { message: 'DB error' } });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(customerService.fetchCustomers({})).rejects.toBeDefined();
		});
	});

	describe('updateCustomer', () => {
		it('calls from(customers).update(data).eq(id).select().single() and returns updated customer', async () => {
			const updated = makeCustomer({ name: 'Updated Name' });
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: updated, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.updateCustomer('cust-uuid-001', { name: 'Updated Name' });

			expect(builder.update).toHaveBeenCalledWith({ name: 'Updated Name' });
			expect(builder.eq).toHaveBeenCalledWith('id', 'cust-uuid-001');
			expect(result).toEqual(updated);
		});
	});
});
