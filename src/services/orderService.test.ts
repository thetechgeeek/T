import { orderService } from './orderService';
import { supabase } from '@/src/config/supabase';
import { inventoryService } from './inventoryService';

/**
 * Chainable + thenable query builder mock.
 */
const mockQuery: Record<string, jest.Mock> = {
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	limit: jest.fn().mockReturnThis(),
	range: jest.fn().mockReturnThis(),
	single: jest.fn().mockResolvedValue({ data: null, error: null }),
	then: jest.fn((resolve: (val: unknown) => void) =>
		Promise.resolve({ data: [], error: null }).then(resolve),
	),
};

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		from: jest.fn(() => mockQuery),
	},
}));

jest.mock('./inventoryService', () => ({
	inventoryService: {
		performStockOperation: jest.fn().mockResolvedValue(undefined),
		createItem: jest.fn().mockResolvedValue({ id: 'new-item-id', design_name: 'New Item' }),
	},
}));

describe('orderService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// ─── fetchOrders ──────────────────────────────────────────────────────────
	describe('fetchOrders', () => {
		it('applies eq(status) when status filter is provided', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [{ id: '1' }], error: null }).then(resolve),
			);
			const result = await orderService.fetchOrders({ status: 'ordered' });

			expect(supabase.from).toHaveBeenCalledWith('orders');
			expect(mockQuery.eq).toHaveBeenCalledWith('status', 'ordered');
			expect(result).toHaveLength(1);
		});

		it('does NOT call eq(status) when no status filter is provided', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			await orderService.fetchOrders({});

			const eqCalls = (mockQuery.eq as jest.Mock).mock.calls;
			expect(eqCalls.find((c: unknown[]) => (c as string[])[0] === 'status')).toBeUndefined();
		});

		it('applies limit when limit option is provided', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			await orderService.fetchOrders({ limit: 10 });

			expect(mockQuery.limit).toHaveBeenCalledWith(10);
		});

		it('applies range when both limit and offset are provided', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			await orderService.fetchOrders({ limit: 10, offset: 20 });

			expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
		});

		it('throws when supabase returns an error', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: null, error: { message: 'DB error' } }).then(resolve),
			);

			await expect(orderService.fetchOrders({})).rejects.toMatchObject({
				message: 'DB error',
			});
		});

		it('works with no options argument (undefined)', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			const result = await orderService.fetchOrders();
			expect(result).toEqual([]);
		});
	});

	// ─── fetchOrderById ───────────────────────────────────────────────────────
	describe('fetchOrderById', () => {
		it('returns order when found', async () => {
			const order = { id: 'order-1', party_name: 'Test Party', status: 'fully_received' };
			mockQuery.single.mockResolvedValueOnce({ data: order, error: null });

			const result = await orderService.fetchOrderById('order-1');

			expect(supabase.from).toHaveBeenCalledWith('orders');
			expect(mockQuery.eq).toHaveBeenCalledWith('id', 'order-1');
			expect(result).toEqual(order);
		});

		it('throws when order not found', async () => {
			mockQuery.single.mockResolvedValueOnce({
				data: null,
				error: { message: 'Row not found' },
			});

			await expect(orderService.fetchOrderById('bad-id')).rejects.toMatchObject({
				message: 'Row not found',
			});
		});
	});

	// ─── fetchItemsByOrderId ──────────────────────────────────────────────────
	describe('fetchItemsByOrderId', () => {
		it('queries inventory_items by order_id', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [{ id: 'item-1' }], error: null }).then(resolve),
			);

			const result = await orderService.fetchItemsByOrderId('order-1');

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(mockQuery.eq).toHaveBeenCalledWith('order_id', 'order-1');
			expect(result).toHaveLength(1);
		});

		it('throws when supabase returns an error', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: null, error: { message: 'Items error' } }).then(resolve),
			);

			await expect(orderService.fetchItemsByOrderId('order-1')).rejects.toMatchObject({
				message: 'Items error',
			});
		});
	});

	// ─── importOrder ──────────────────────────────────────────────────────────
	describe('importOrder', () => {
		it('creates order and calls performStockOperation when item already exists', async () => {
			const partyName = 'Test Party';
			const items = [{ design_name: 'Marble', box_count: 10 }];

			mockQuery.single.mockResolvedValueOnce({ data: { id: 'order-123' }, error: null });

			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [{ id: 'item-1' }], error: null }).then(resolve),
			);

			await orderService.importOrder(
				partyName,
				items as Parameters<typeof orderService.importOrder>[1],
				{},
			);

			expect(supabase.from).toHaveBeenCalledWith('orders');
			expect(inventoryService.performStockOperation).toHaveBeenCalledWith(
				'item-1',
				'stock_in',
				10,
				expect.stringContaining('order-123'),
				'purchase',
				'order-123',
			);
		});

		it('calls createItem when inventory item does NOT exist, then performStockOperation', async () => {
			const partyName = 'New Party';
			const items = [{ design_name: 'New Tile', box_count: 5 }];

			mockQuery.single.mockResolvedValueOnce({ data: { id: 'order-456' }, error: null });

			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			await orderService.importOrder(
				partyName,
				items as Parameters<typeof orderService.importOrder>[1],
				{},
			);

			expect(inventoryService.createItem).toHaveBeenCalled();
			expect(inventoryService.performStockOperation).toHaveBeenCalled();
		});

		it('skips items without design_name or box_count', async () => {
			const items = [{ design_name: '', box_count: 0 }];
			mockQuery.single.mockResolvedValueOnce({ data: { id: 'order-789' }, error: null });

			await orderService.importOrder(
				'Party',
				items as Parameters<typeof orderService.importOrder>[1],
				{},
			);

			expect(inventoryService.performStockOperation).not.toHaveBeenCalled();
			expect(inventoryService.createItem).not.toHaveBeenCalled();
		});

		it('propagates error when order creation fails', async () => {
			mockQuery.single.mockResolvedValueOnce({
				data: null,
				error: { message: 'insert failed' },
			});

			await expect(
				orderService.importOrder(
					'Fail Party',
					[{ design_name: 'Tile', box_count: 3 }] as Parameters<
						typeof orderService.importOrder
					>[1],
					{},
				),
			).rejects.toBeDefined();
			expect(inventoryService.performStockOperation).not.toHaveBeenCalled();
		});
	});
});
