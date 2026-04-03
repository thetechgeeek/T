import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';
import { makeCustomer } from '../../../__tests__/fixtures/customerFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { customerRepository } from '../customerRepository';

const mockFrom = supabase.from as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('customerRepository.findById (base)', () => {
	it('success: returns customer matching the id', async () => {
		const customer = makeCustomer();
		const builder = makeBuilder({ data: [], error: null }, { data: customer, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await customerRepository.findById('cust-uuid-001');

		expect(mockFrom).toHaveBeenCalledWith('customers');
		expect(builder.select).toHaveBeenCalledWith('*');
		expect(builder.eq).toHaveBeenCalledWith('id', 'cust-uuid-001');
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(customer);
	});

	it('error: throws when supabase returns an error', async () => {
		const builder = makeBuilder(
			{ data: [], error: null },
			{ data: null, error: { message: 'DB error', code: 'XX000' } },
		);
		mockFrom.mockReturnValue(builder);

		await expect(customerRepository.findById('bad-id')).rejects.toThrow('DB error');
	});
});

describe('customerRepository.search', () => {
	it('calls .or() with ilike pattern containing the search term', async () => {
		const customers = [makeCustomer()];
		const builder = makeBuilder({ data: customers, error: null });
		mockFrom.mockReturnValue(builder);

		const results = await customerRepository.search('Raj');

		expect(mockFrom).toHaveBeenCalledWith('customers');
		expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('%Raj%'));
		expect(results).toEqual(customers);
	});

	it('escapes ILIKE wildcards in search term (% → \\%)', async () => {
		const builder = makeBuilder({ data: [], error: null });
		mockFrom.mockReturnValue(builder);

		await customerRepository.search('50%off');

		const orArg = (builder.or as jest.Mock).mock.calls[0][0] as string;
		expect(orArg).not.toMatch(/%50%/);
		expect(orArg).toContain('\\%');
	});

	it('throws when supabase returns an error', async () => {
		const builder = makeBuilder({
			data: null,
			error: { message: 'search failed', code: 'XX000' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(customerRepository.search('test')).rejects.toThrow('search failed');
	});
});

describe('customerRepository.findMany (base) — filter variations', () => {
	it('eq(type, retail) is called when type filter is set', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await customerRepository.findMany({ filters: { type: 'retail' } });

		expect(builder.eq).toHaveBeenCalledWith('type', 'retail');
	});

	it('returns { data, total } with correct shape', async () => {
		const customers = [makeCustomer()];
		const builder = makeBuilder({ data: customers, count: 1, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await customerRepository.findMany({});

		expect(result.data).toEqual(customers);
		expect(result.total).toBe(1);
	});
});

describe('customerRepository.create (base)', () => {
	it('calls insert(payload).select().single() and returns created customer', async () => {
		const customer = makeCustomer();
		const builder = makeBuilder({ data: [], error: null }, { data: customer, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await customerRepository.create({ name: 'Test Customer' } as Parameters<
			typeof customerRepository.create
		>[0]);

		expect(builder.insert).toHaveBeenCalledWith({ name: 'Test Customer' });
		expect(builder.select).toHaveBeenCalled();
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(customer);
	});
});

describe('customerRepository.update (base)', () => {
	it('calls update(payload).eq(id).select().single() and returns updated customer', async () => {
		const customer = makeCustomer({ name: 'Updated Name' });
		const builder = makeBuilder({ data: [], error: null }, { data: customer, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await customerRepository.update('cust-uuid-001', { name: 'Updated Name' });

		expect(builder.update).toHaveBeenCalledWith({ name: 'Updated Name' });
		expect(builder.eq).toHaveBeenCalledWith('id', 'cust-uuid-001');
		expect(result).toEqual(customer);
	});
});
