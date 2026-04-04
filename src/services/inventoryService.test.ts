import { inventoryService } from './inventoryService';
import { supabase } from '@/src/config/supabase';
import { makeInventoryItem } from '../../__tests__/fixtures/inventoryFixtures';
import { ConflictError, ValidationError } from '../errors/AppError';

/**
 * Chainable + thenable builder.
 * Replaces the broken `then: jest.fn(resolve => resolve({...}))` pattern (QA issue 3.2)
 * that caused fetchItemById to use the wrong mock path.
 */
function makeBuilder(
	result: {
		data: unknown;
		count?: number | null;
		error: { message: string; code?: string } | null;
	} = { data: [], count: 0, error: null },
) {
	const b: Record<string, jest.Mock> = {};
	const chainable = [
		'select',
		'insert',
		'update',
		'delete',
		'eq',
		'or',
		'order',
		'range',
		'limit',
		'lte',
		'ilike',
		'in',
	];
	chainable.forEach((m) => {
		b[m] = jest.fn().mockReturnValue(b);
	});
	// .single() is a real promise (terminal call)
	const singleData = Array.isArray(result.data) ? (result.data[0] ?? null) : result.data;
	b.single = jest.fn().mockResolvedValue({ data: singleData, error: result.error });
	b.maybeSingle = jest.fn().mockResolvedValue({ data: singleData, error: result.error });
	// Thenable for `await query` (fetchItems, fetchStockHistory use this)
	b.then = jest.fn((resolve: (val: unknown) => void) => Promise.resolve(result).then(resolve));
	return b;
}

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

describe('inventoryService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('fetchItems', () => {
		it('fetches items with default filters', async () => {
			const items = [makeInventoryItem()];
			const builder = makeBuilder({ data: items, count: 1, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await inventoryService.fetchItems({});

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(builder.select).toHaveBeenCalled();
			expect(result.data).toEqual(items);
			expect(result.count).toBe(1);
		});

		it('applies search .or() on design_name and base_item_number', async () => {
			const builder = makeBuilder({ data: [], count: 0, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await inventoryService.fetchItems({ search: 'marble' });

			expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('marble'));
		});

		it('applies eq(category) when category filter is set and not ALL', async () => {
			const builder = makeBuilder({ data: [], count: 0, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await inventoryService.fetchItems({ category: 'GLOSSY' });

			expect(builder.eq).toHaveBeenCalledWith('category', 'GLOSSY');
		});

		it('does NOT call eq(category) when category is "ALL"', async () => {
			const builder = makeBuilder({ data: [], count: 0, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await inventoryService.fetchItems({ category: 'ALL' });

			const eqCalls = (builder.eq as jest.Mock).mock.calls;
			expect(
				eqCalls.find((c: unknown[]) => (c as string[])[0] === 'category'),
			).toBeUndefined();
		});

		it('throws ConflictError when supabase returns 23505 (unique violation)', async () => {
			const builder = makeBuilder({
				data: null,
				error: { message: 'Already exists', code: '23505' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(inventoryService.fetchItems({})).rejects.toThrow(ConflictError);
		});

		it('throws ValidationError when supabase returns 23502 (not null violation)', async () => {
			const builder = makeBuilder({
				data: null,
				error: { message: 'Required', code: '23502', column: 'name' } as any,
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(inventoryService.fetchItems({})).rejects.toThrow(ValidationError);
		});

		it('handles lowStockOnly filter by querying low_stock_items view first', async () => {
			const lowStockBuilder = makeBuilder({ data: [{ id: 'low-1' }], error: null });
			const itemsBuilder = makeBuilder({ data: [], error: null });

			(supabase.from as jest.Mock)
				.mockReturnValueOnce(itemsBuilder) // inventory_items
				.mockReturnValueOnce(lowStockBuilder); // low_stock_items

			await inventoryService.fetchItems({ lowStockOnly: true });

			expect(supabase.from).toHaveBeenCalledWith('low_stock_items');
			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(itemsBuilder.in).toHaveBeenCalledWith('id', ['low-1']);
		});
	});

	describe('fetchItemById', () => {
		// Fixed: proper .single().mockResolvedValue() replaces broken `then` mock (QA issue 3.2)
		it('fetches a single item by id via .eq(id).single()', async () => {
			const item = makeInventoryItem();
			const builder = makeBuilder({ data: item, error: null });
			builder.single.mockResolvedValue({ data: item, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await inventoryService.fetchItemById('item-uuid-001');

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(builder.eq).toHaveBeenCalledWith('id', 'item-uuid-001');
			expect(builder.single).toHaveBeenCalled();
			expect(result).toEqual(item);
		});

		it('throws NotFoundError when item is missing (PGRST116)', async () => {
			const builder = makeBuilder({
				data: null,
				error: { message: 'Not found', code: 'PGRST116' },
			});
			builder.single.mockResolvedValue({
				data: null,
				error: { message: 'Not found', code: 'PGRST116' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(inventoryService.fetchItemById('missing-uuid')).rejects.toMatchObject({
				code: 'NOT_FOUND',
			});
		});
	});

	describe('createItem', () => {
		it('calls insert(payload).select().single() and returns created item', async () => {
			const item = makeInventoryItem();
			const builder = makeBuilder({ data: item, error: null });
			builder.single.mockResolvedValue({ data: item, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await inventoryService.createItem({
				design_name: 'GLOSSY WHITE 60x60',
			} as Parameters<typeof inventoryService.createItem>[0]);

			expect(supabase.from).toHaveBeenCalledWith('inventory_items');
			expect(builder.insert).toHaveBeenCalled();
			expect(result).toEqual(item);
		});
	});

	describe('updateItem', () => {
		it('calls update(data).eq(id).select().single() and returns updated item', async () => {
			const updated = makeInventoryItem({ box_count: 99 });
			const builder = makeBuilder({ data: updated, error: null });
			builder.single.mockResolvedValue({ data: updated, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await inventoryService.updateItem('item-uuid-001', { box_count: 99 });

			expect(builder.update).toHaveBeenCalledWith({ box_count: 99 });
			expect(builder.eq).toHaveBeenCalledWith('id', 'item-uuid-001');
			expect(result).toEqual(updated);
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

			expect(supabase.rpc).toHaveBeenCalledWith('perform_stock_operation_v1', {
				p_item_id: 'item1',
				p_operation_type: 'stock_in',
				p_quantity_change: 10,
				p_reason: 'Restock',
				p_reference_id: null,
				p_reference_type: null,
			});
			expect(result).toBe(100);
		});

		it('throws ValidationError for qty=0', async () => {
			await expect(
				inventoryService.performStockOperation('item1', 'stock_in', 0),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('throws AppError with INSUFFICIENT_STOCK when RPC returns P0001 with stock message', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: null,
				error: { message: 'Insufficient stock for item', code: 'P0001' },
			});

			try {
				await inventoryService.performStockOperation('item1', 'stock_out', 100);
				fail('Should have thrown');
			} catch (err: any) {
				expect(err.code).toBe('INSUFFICIENT_STOCK');
			}
		});

		it('propagates other RPC errors as ValidationError', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: null,
				error: { message: 'Some other error', code: 'P0001' },
			});

			await expect(
				inventoryService.performStockOperation('item1', 'stock_in', 10),
			).rejects.toThrow(ValidationError);
		});
	});

	describe('fetchStockHistory', () => {
		it('queries stock_operations table with eq(item_id) and order(created_at desc)', async () => {
			const builder = makeBuilder({ data: [], error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await inventoryService.fetchStockHistory('item-uuid-001');

			expect(supabase.from).toHaveBeenCalledWith('stock_operations');
			expect(builder.eq).toHaveBeenCalledWith('item_id', 'item-uuid-001');
			expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
		});
	});
});
