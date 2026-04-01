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

	it('stock increase: update box_count to higher value', async () => {
		const current = await inventoryRepository.findById(itemId);
		const newCount = current.box_count + 20;

		const updated = await inventoryRepository.update(itemId, { box_count: newCount });
		expect(updated.box_count).toBe(newCount);
	});

	it('stock decrease: update box_count to lower value', async () => {
		const current = await inventoryRepository.findById(itemId);
		const newCount = Math.max(0, current.box_count - 10);

		const updated = await inventoryRepository.update(itemId, { box_count: newCount });
		expect(updated.box_count).toBe(newCount);
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

		expect(variant.base_item_number).toBe(`${prefix}ME-001`);

		// findMany should return both variants
		const result = await inventoryRepository.findMany({
			search: { columns: ['base_item_number'], term: `${prefix}ME-001` },
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
