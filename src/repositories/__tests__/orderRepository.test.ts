import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';
import { makeOrder } from '../../../../__tests__/fixtures/orderFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { orderRepository } from '../orderRepository';

const mockFrom = supabase.from as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('orderRepository.create (base)', () => {
	it('calls from(orders).insert(payload).select().single() and returns new order', async () => {
		const order = makeOrder();
		const builder = makeBuilder({}, { data: order, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await orderRepository.create({ party_name: 'Test Party' } as any);

		expect(mockFrom).toHaveBeenCalledWith('orders');
		expect(builder.insert).toHaveBeenCalled();
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(order);
	});
});

describe('orderRepository.findMany (base) — filter variations', () => {
	it('applies eq(status) when status filter is set', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await orderRepository.findMany({ filters: { status: 'received' } });

		expect(builder.eq).toHaveBeenCalledWith('status', 'received');
	});

	it('does NOT call eq(status) when no status filter', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await orderRepository.findMany({});

		const eqCalls = (builder.eq as jest.Mock).mock.calls;
		expect(eqCalls.find((c: any[]) => c[0] === 'status')).toBeUndefined();
	});

	it('returns array of orders from the mock data', async () => {
		const orders = [makeOrder()];
		const builder = makeBuilder({ data: orders, count: 1, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await orderRepository.findMany({});

		expect(result.data).toEqual(orders);
	});
});

describe('orderRepository.findDuplicates', () => {
	it('calls from(inventory_items).select(...).ilike(design_name, pattern)', async () => {
		const builder = makeBuilder({ data: [], error: null });
		mockFrom.mockReturnValue(builder);

		await orderRepository.findDuplicates('GLOSSY WHITE 60x60');

		expect(mockFrom).toHaveBeenCalledWith('inventory_items');
		expect(builder.ilike).toHaveBeenCalledWith(
			'design_name',
			expect.stringContaining('GLOSSY WHITE 60x60'),
		);
	});
});
