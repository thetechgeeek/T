import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';
import { makeInventoryItem } from '../../../__tests__/fixtures/inventoryFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { inventoryRepository } from '../inventoryRepository';

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('inventoryRepository.findById (base)', () => {
	it('calls from(inventory_items).select(*).eq(id).single()', async () => {
		const item = makeInventoryItem();
		const builder = makeBuilder({ data: [], error: null }, { data: item, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await inventoryRepository.findById('item-uuid-001');

		expect(mockFrom).toHaveBeenCalledWith('inventory_items');
		expect(builder.eq).toHaveBeenCalledWith('id', 'item-uuid-001');
		expect(result).toEqual(item);
	});
});

describe('inventoryRepository.findMany (base) — filter variations', () => {
	it('applies eq(category) when category filter is set', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await inventoryRepository.findMany({ filters: { category: 'GLOSSY' } });

		expect(builder.eq).toHaveBeenCalledWith('category', 'GLOSSY');
	});

	it('does NOT call eq(category) when no category filter (ALL)', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await inventoryRepository.findMany({});

		const eqCalls = (builder.eq as jest.Mock).mock.calls;
		const categoryCall = eqCalls.find((c: unknown[]) => (c as string[])[0] === 'category');
		expect(categoryCall).toBeUndefined();
	});

	it('applies or() with both design_name and base_item_number when search is set', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await inventoryRepository.findMany({
			search: { columns: ['design_name', 'base_item_number'], term: 'white' },
		});

		expect(builder.or).toHaveBeenCalledWith(
			expect.stringMatching(
				/design_name.*white.*base_item_number|base_item_number.*white.*design_name/,
			),
		);
	});
});

describe('inventoryRepository.findLowStock', () => {
	it('queries the low_stock_items view (not inventory_items directly)', async () => {
		const items = [makeInventoryItem({ box_count: 3 })];
		const builder = makeBuilder({ data: items, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await inventoryRepository.findLowStock();

		expect(mockFrom).toHaveBeenCalledWith('low_stock_items');
		expect(builder.order).toHaveBeenCalledWith('box_count', { ascending: true });
		expect(result).toEqual(items);
	});

	it('throws when supabase returns an error', async () => {
		const builder = makeBuilder({
			data: null,
			error: { message: 'view error', code: 'XX000' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(inventoryRepository.findLowStock()).rejects.toMatchObject({
			message: 'view error',
		});
	});
});

describe('inventoryRepository.create (base)', () => {
	it('calls insert(payload).select().single() and returns created item', async () => {
		const item = makeInventoryItem();
		const builder = makeBuilder({ data: [], error: null }, { data: item, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await inventoryRepository.create({
			design_name: 'GLOSSY WHITE 60x60',
		} as Parameters<typeof inventoryRepository.create>[0]);

		expect(builder.insert).toHaveBeenCalled();
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(item);
	});
});

describe('inventoryRepository.update (base)', () => {
	it('calls update(payload).eq(id).select().single()', async () => {
		const updated = makeInventoryItem({ box_count: 99 });
		const builder = makeBuilder({ data: [], error: null }, { data: updated, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await inventoryRepository.update('item-uuid-001', { box_count: 99 });

		expect(builder.update).toHaveBeenCalledWith({ box_count: 99 });
		expect(builder.eq).toHaveBeenCalledWith('id', 'item-uuid-001');
		expect(result).toEqual(updated);
	});
});

describe('inventoryRepository.remove (base)', () => {
	it('calls delete().eq(id)', async () => {
		const builder = makeBuilder({ data: null, error: null });
		mockFrom.mockReturnValue(builder);

		await inventoryRepository.remove('item-uuid-001');

		expect(builder.delete).toHaveBeenCalled();
		expect(builder.eq).toHaveBeenCalledWith('id', 'item-uuid-001');
	});
});

describe('inventoryRepository.performStockOp', () => {
	it('calls rpc(perform_stock_operation_v1, { p_item_id, p_operation_type, ... })', async () => {
		mockRpc.mockResolvedValue({ data: null, error: null });

		await inventoryRepository.performStockOp(
			'item-uuid-001',
			'stock_in',
			10,
			'Test',
			'purchase',
			'ref-001',
		);

		expect(mockRpc).toHaveBeenCalledWith('perform_stock_operation_v1', {
			p_item_id: 'item-uuid-001',
			p_operation_type: 'stock_in',
			p_quantity_change: 10,
			p_reason: 'Test',
			p_reference_type: 'purchase',
			p_reference_id: 'ref-001',
		});
	});

	it('throws when RPC returns an error', async () => {
		mockRpc.mockResolvedValue({
			data: null,
			error: { message: 'stock op failed', code: 'P0001' },
		});

		await expect(
			inventoryRepository.performStockOp('item-uuid-001', 'stock_in', 5),
		).rejects.toMatchObject({ message: 'stock op failed' });
	});
});
