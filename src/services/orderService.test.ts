import { orderService } from './orderService';
import { supabase } from '@/src/config/supabase';
import { inventoryService } from './inventoryService';

/**
 * Chainable + thenable query builder mock.
 * Replaced broken `then: jest.fn(resolve => resolve({...}))` singleton pattern (QA issue 3.2).
 * .single() is now a proper jest.fn().mockResolvedValue() so per-test overrides work correctly.
 */
const mockQuery: any = {
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	limit: jest.fn().mockReturnThis(),
	range: jest.fn().mockReturnThis(),
	single: jest.fn().mockResolvedValue({ data: null, error: null }),
	// Thenable for `await query` pattern (fetchOrders, importOrder item search)
	then: jest.fn((resolve) => Promise.resolve({ data: [], error: null }).then(resolve)),
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

	describe('fetchOrders', () => {
		it('applies eq(status) when status filter is set', async () => {
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				Promise.resolve({ data: [{ id: '1' }], error: null }).then(resolve),
			);
			const result = await orderService.fetchOrders({ status: 'ordered' });

			expect(supabase.from).toHaveBeenCalledWith('orders');
			expect(mockQuery.eq).toHaveBeenCalledWith('status', 'ordered');
			expect(result).toHaveLength(1);
		});

		it('does NOT call eq(status) when no status filter provided', async () => {
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			await orderService.fetchOrders({});

			const eqCalls = (mockQuery.eq as jest.Mock).mock.calls;
			expect(eqCalls.find((c: any[]) => c[0] === 'status')).toBeUndefined();
		});
	});

	describe('importOrder', () => {
		it('creates order and calls performStockOperation when item already exists', async () => {
			const partyName = 'Test Party';
			const items = [{ design_name: 'Marble', box_count: 10 }];

			// Mock order creation (insert.select.single)
			mockQuery.single.mockResolvedValueOnce({ data: { id: 'order-123' }, error: null });

			// Mock item search: item exists
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				Promise.resolve({ data: [{ id: 'item-1' }], error: null }).then(resolve),
			);

			await orderService.importOrder(partyName, items as any, {});

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

			// Mock order creation
			mockQuery.single.mockResolvedValueOnce({ data: { id: 'order-456' }, error: null });

			// Mock item search: no existing item
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				Promise.resolve({ data: [], error: null }).then(resolve),
			);

			await orderService.importOrder(partyName, items as any, {});

			// createItem should be called to create the new inventory item
			expect(inventoryService.createItem).toHaveBeenCalled();
			// performStockOperation should still be called for stock_in
			expect(inventoryService.performStockOperation).toHaveBeenCalled();
		});

		it('propagates error when order creation fails (performStockOperation NOT called)', async () => {
			const partyName = 'Fail Party';
			const items = [{ design_name: 'Any Tile', box_count: 3 }];

			// Mock order creation failure
			mockQuery.single.mockResolvedValueOnce({ data: null, error: { message: 'insert failed' } });

			await expect(orderService.importOrder(partyName, items as any, {})).rejects.toBeDefined();
			expect(inventoryService.performStockOperation).not.toHaveBeenCalled();
		});
	});
});
