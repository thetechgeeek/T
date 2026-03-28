import { inventoryService } from './inventoryService';
import { supabase } from '@/src/config/supabase';

// A mock query object that is both chainable and awaitable
const mockQuery: any = {
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	or: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	range: jest.fn().mockReturnThis(),
	single: jest.fn().mockReturnThis(),
	maybeSingle: jest.fn().mockReturnThis(),
	limit: jest.fn().mockReturnThis(),
	lte: jest.fn().mockReturnThis(),
	// Final result handling
	then: jest.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
};

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		from: jest.fn(() => mockQuery),
		rpc: jest.fn(),
	},
}));

describe('inventoryService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset the default then behavior
		mockQuery.then.mockImplementation((resolve: any) =>
			resolve({ data: [], error: null, count: 0 }),
		);
	});

	describe('fetchItems', () => {
		it('fetches items with default filters', async () => {
			const mockData = [{ id: '1', design_name: 'Test' }];
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				resolve({ data: mockData, error: null, count: 1 }),
			);

			const result = await inventoryService.fetchItems({});

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(mockQuery.select).toHaveBeenCalled();
			expect(result.data).toEqual(mockData);
			expect(result.count).toBe(1);
		});

		it('applies search filters correctly', async () => {
			await inventoryService.fetchItems({ search: 'marble' });
			expect(mockQuery.or).toHaveBeenCalledWith(expect.stringContaining('marble'));
		});

		it('throws error when supabase returns an error', async () => {
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				resolve({ data: null, error: { message: 'DB Error' } }),
			);

			await expect(inventoryService.fetchItems({})).rejects.toEqual({ message: 'DB Error' });
		});
	});

	describe('fetchItemById', () => {
		it('fetches a single item by id', async () => {
			const mockItem = { id: '123', design_name: 'Product' };
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				resolve({ data: mockItem, error: null }),
			);

			const result = await inventoryService.fetchItemById('123');

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
			expect(mockQuery.single).toHaveBeenCalled();
			expect(result).toEqual(mockItem);
		});
	});

	describe('createItem', () => {
		it('successfully creates an item', async () => {
			const newItem = { design_name: 'New' };
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				resolve({ data: { id: '1', ...newItem }, error: null }),
			);

			const result = await inventoryService.createItem(newItem as any);

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(mockQuery.insert).toHaveBeenCalledWith(newItem);
			expect(result.id).toBe('1');
		});
	});

	describe('performStockOperation', () => {
		it('calls the supabase RPC correctly', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: 100, error: null });

			const result = await inventoryService.performStockOperation(
				'item1',
				'stock_in',
				10,
				'Restock',
			);

			expect(supabase.rpc).toHaveBeenCalledWith('perform_stock_operation', {
				p_item_id: 'item1',
				p_operation_type: 'stock_in',
				p_quantity_change: 10,
				p_reason: 'Restock',
				p_reference_id: null,
				p_reference_type: null,
			});
			expect(result).toBe(100);
		});
	});
});
