/**
 * INT-007: Order Import Flow — real Supabase integration tests.
 * Tests order CRUD and duplicate detection via orderRepository.
 * Run with: yarn test:integration
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { orderRepository } from '@/src/repositories/orderRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('INT-007: Order Import Flow', () => {
	let orderId: string;

	it('creates an order record and returns it', async () => {
		const order = await orderRepository.create({
			notes: `${prefix}Test order from supplier`,
			status: 'ordered' as const,
		});

		expect(order.id).toBeTruthy();
		expect(order.notes).toContain(prefix);
		orderId = order.id;
	});

	it('findById returns the created order', async () => {
		const order = await orderRepository.findById(orderId);
		expect(order.id).toBe(orderId);
	});

	it('findMany includes the created order', async () => {
		const result = await orderRepository.findMany();
		const found = result.data.find((o) => o.id === orderId);
		expect(found).toBeDefined();
	});

	it('updates order status', async () => {
		const updated = await orderRepository.update(orderId, {
			status: 'fully_received' as const,
		});
		expect(updated.status).toBe('fully_received');
	});

	it('findById after update returns updated status', async () => {
		const order = await orderRepository.findById(orderId);
		expect(order.status).toBe('fully_received');
	});

	it('findDuplicates returns empty array for unique design name', async () => {
		const results = await orderRepository.findDuplicates('ZZZ-NonExistent-Design-XYZ-999');
		expect(Array.isArray(results)).toBe(true);
		expect(results.length).toBe(0);
	});

	it('findDuplicates returns results for existing design name', async () => {
		// Create an inventory item to detect as duplicate
		await supabase.from('inventory_items').insert({
			design_name: `${prefix}Duplicate Check Marble`,
			base_item_number: `${prefix}DCM-001`,
			category: 'GLOSSY',
			box_count: 0,
			has_batch_tracking: false,
			has_serial_tracking: false,
			selling_price: 1000,
		});

		const results = await orderRepository.findDuplicates(`${prefix}Duplicate Check Marble`);
		expect(results.length).toBeGreaterThan(0);

		// Cleanup
		await supabase.from('inventory_items').delete().like('design_name', `${prefix}%`);
	});

	it('findMany total is a non-negative number', async () => {
		const result = await orderRepository.findMany();
		expect(result.total).toBeGreaterThanOrEqual(0);
	});

	it('removes order successfully', async () => {
		const toDelete = await orderRepository.create({
			notes: `${prefix}delete me order`,
			status: 'ordered' as const,
		});

		await expect(orderRepository.remove(toDelete.id)).resolves.toBeUndefined();
		await expect(orderRepository.findById(toDelete.id)).rejects.toThrow();
	});

	it('throws for non-existent order id', async () => {
		await expect(
			orderRepository.findById('00000000-0000-0000-0000-000000000000'),
		).rejects.toThrow();
	});
});
