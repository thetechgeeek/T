/**
 * INT-004: Inventory Flow — real Supabase integration tests.
 * Tests inventory item CRUD + stock operations via repository layer.
 * Run with: yarn test:integration
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { inventoryRepository } from '@/src/repositories/inventoryRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('INT-004: Inventory Flow', () => {
	let itemId: string;
	const initialBoxCount = 50;

	it('creates a new inventory item', async () => {
		const input = {
			design_name: `${prefix}Marble Elite`,
			base_item_number: `${prefix}ME-001`,
			category: 'GLOSSY' as const,
			size_name: '60x60',
			box_count: initialBoxCount,
			selling_price: 1500,
			cost_price: 1000,
		};

		const item = await inventoryRepository.create(input);

		expect(item.id).toBeTruthy();
		expect(item.design_name).toBe(input.design_name);
		expect(item.box_count).toBe(initialBoxCount);
		itemId = item.id;
	});

	it('findById returns the created item', async () => {
		const item = await inventoryRepository.findById(itemId);
		expect(item.id).toBe(itemId);
		expect(item.design_name).toContain(prefix);
	});

	it('findMany includes the created item', async () => {
		const result = await inventoryRepository.findMany();
		const found = result.data.find((i) => i.id === itemId);
		expect(found).toBeDefined();
	});

	it('findMany search narrows by design_name', async () => {
		const result = await inventoryRepository.findMany({
			search: { columns: ['design_name'], term: `${prefix}Marble` },
		});
		expect(result.data.length).toBeGreaterThan(0);
		expect(result.data[0].design_name).toContain(prefix);
	});

	it('updates selling price', async () => {
		const updated = await inventoryRepository.update(itemId, { selling_price: 1800 });
		expect(updated.selling_price).toBe(1800);
	});

	it('updates design_name', async () => {
		const updated = await inventoryRepository.update(itemId, {
			design_name: `${prefix}Marble Elite Pro`,
		});
		expect(updated.design_name).toBe(`${prefix}Marble Elite Pro`);
	});

	it('stock_in increases box_count and creates a log', async () => {
		const initialCount = (await inventoryRepository.findById(itemId)).box_count;
		await inventoryRepository.performStockOp(itemId, 'stock_in', 10, `${prefix} Stock-In Test`);

		const updatedItem = await inventoryRepository.findById(itemId);
		expect(updatedItem.box_count).toBe(initialCount + 10);

		const { data: ops } = await supabase
			.from('stock_operations')
			.select('*')
			.eq('item_id', itemId)
			.order('created_at', { ascending: false });

		expect(ops).toHaveLength(1);
		expect(ops![0].operation_type).toBe('stock_in');
		expect(Math.abs(ops![0].quantity_change)).toBe(10);
	});

	it('stock_out decreases box_count (using negative value) and creates a log', async () => {
		const initialCount = (await inventoryRepository.findById(itemId)).box_count;
		await inventoryRepository.performStockOp(
			itemId,
			'stock_out',
			-5,
			`${prefix} Stock-Out Test`,
		);

		const updatedItem = await inventoryRepository.findById(itemId);
		expect(updatedItem.box_count).toBe(initialCount - 5);

		const { data: ops } = await supabase
			.from('stock_operations')
			.select('*')
			.eq('item_id', itemId)
			.order('created_at', { ascending: false });

		expect(ops![0].operation_type).toBe('stock_out');
		expect(ops![0].quantity_change).toBe(-5);
	});

	it('stock_out below zero: throws Insufficient stock error from DB', async () => {
		const current = await inventoryRepository.findById(itemId);
		try {
			await inventoryRepository.performStockOp(itemId, 'stock_out', -(current.box_count + 1));
			throw new Error('Should have thrown');
		} catch (e: any) {
			expect(e.code).toBe('INSUFFICIENT_STOCK');
		}
	});

	it('sequential operations: final box_count reflects all operations accurately', async () => {
		const startCount = (await inventoryRepository.findById(itemId)).box_count;
		await inventoryRepository.performStockOp(itemId, 'stock_in', 5);
		await inventoryRepository.performStockOp(itemId, 'stock_out', -10);
		await inventoryRepository.performStockOp(itemId, 'stock_in', 25);

		const item = await inventoryRepository.findById(itemId);
		expect(item.box_count).toBe(startCount + 5 - 10 + 25);
	});

	it('creates multiple items with same base_item_number (variants)', async () => {
		const variant = await inventoryRepository.create({
			design_name: `${prefix}Marble Elite Matte`,
			base_item_number: `${prefix}ME-001`,
			category: 'MATT' as const,
			size_name: '60x60',
			box_count: 30,
			selling_price: 1400,
			cost_price: 950,
		});

		expect(variant.base_item_number).toBeTruthy();

		// findMany should return both variants
		const result = await inventoryRepository.findMany({
			search: { columns: ['base_item_number'], term: variant.base_item_number! },
		});
		expect(result.data.length).toBeGreaterThanOrEqual(2);
	});

	it('findMany with category filter returns only matching items', async () => {
		const result = await inventoryRepository.findMany({
			filters: { category: 'GLOSSY' },
		});

		result.data.forEach((item) => {
			expect(item.category).toBe('GLOSSY');
		});
	});

	it('throws when findById called with non-existent id', async () => {
		await expect(
			inventoryRepository.findById('00000000-0000-0000-0000-000000000000'),
		).rejects.toThrow();
	});

	it('removes item successfully', async () => {
		const toDelete = await inventoryRepository.create({
			design_name: `${prefix}Delete Me`,
			base_item_number: `${prefix}DEL-001`,
			category: 'OTHER' as const,
			box_count: 5,
			selling_price: 500,
		});

		await expect(inventoryRepository.remove(toDelete.id)).resolves.toBeUndefined();
		await expect(inventoryRepository.findById(toDelete.id)).rejects.toThrow();
	});

	it('total count reflects actual DB rows', async () => {
		const result = await inventoryRepository.findMany({
			search: { columns: ['design_name'], term: prefix },
		});
		expect(result.total).toBeGreaterThanOrEqual(1);
		expect(result.total).toBe(result.data.length);
	});
});
