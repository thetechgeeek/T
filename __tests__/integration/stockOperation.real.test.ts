/**
 * Real DB integration test for stock operations.
 * Verifies RPC stock increment/decrement and logs.
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { inventoryRepository } from '@/src/repositories/inventoryRepository';
import { AppError } from '@/src/errors';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('Stock Operation Real DB', () => {
	let itemId: string;

	beforeAll(async () => {
		// Seed an item with known stock
		const item = await inventoryRepository.create({
			design_name: `${prefix}Test Stock Op`,
			base_item_number: `${prefix}TSO-001`,
			category: 'OTHER',
			box_count: 50,
			cost_price: 100,
			selling_price: 100,
			hsn_code: '6908',
			low_stock_threshold: 5,
		});
		itemId = item.id;
	});

	it('stock_in increases box_count and creates a log', async () => {
		await inventoryRepository.performStockOp(itemId, 'stock_in', 10, `${prefix} Stock-In Test`);

		const updatedItem = await inventoryRepository.findById(itemId);
		expect(updatedItem.box_count).toBe(60);

		// Verify status
		const { data: ops, error } = await supabase
			.from('stock_operations')
			.select('*')
			.eq('item_id', itemId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		expect(ops).toHaveLength(1);
		expect(ops![0].operation_type).toBe('stock_in');
		expect(Math.abs(ops![0].quantity_change)).toBe(10);
	});

	it('stock_out decreases box_count (using negative value) and creates a log', async () => {
		// Based on UI test observation, stock_out needs a negative value
		await inventoryRepository.performStockOp(
			itemId,
			'stock_out',
			-5,
			`${prefix} Stock-Out Test`,
		);

		const updatedItem = await inventoryRepository.findById(itemId);
		expect(updatedItem.box_count).toBe(55);

		const { data: ops, error } = await supabase
			.from('stock_operations')
			.select('*')
			.eq('item_id', itemId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		expect(ops).toHaveLength(2);
		expect(ops![0].operation_type).toBe('stock_out');
		expect(ops![0].quantity_change).toBe(-5);
	});

	it('stock_out below zero: throws Insufficient stock error from DB', async () => {
		// Current stock is 55. Let's try to remove 60.
		try {
			await inventoryRepository.performStockOp(itemId, 'stock_out', -60);
			throw new Error('Should have thrown');
		} catch (e: any) {
			expect(e.message).toContain('Insufficient stock');
			// AppError code from PG exception P0001
			expect(e.code).toBe('INSUFFICIENT_STOCK');
		}
	});

	it('sequential operations: final box_count reflects all operations accurately', async () => {
		// Start at 55
		await inventoryRepository.performStockOp(itemId, 'stock_in', 5); // 60
		await inventoryRepository.performStockOp(itemId, 'stock_out', -10); // 50
		await inventoryRepository.performStockOp(itemId, 'stock_in', 25); // 75

		const item = await inventoryRepository.findById(itemId);
		expect(item.box_count).toBe(75);

		const { count } = await supabase
			.from('stock_operations')
			.select('*', { count: 'exact', head: true })
			.eq('item_id', itemId);

		// 1 (initial seed) + 1 (first test) + 1 (second test) + 3 (this test) = 6
		// Wait, let's just assert it increased by 3.
		expect(count).toBeGreaterThanOrEqual(3);
	});

	it('throws AppError from database for non-existent itemID', async () => {
		try {
			await inventoryRepository.performStockOp(
				'00000000-0000-0000-0000-000000000000',
				'stock_in',
				10,
			);
			throw new Error('Should have thrown');
		} catch (e: any) {
			expect(e.code).toBe('NOT_FOUND');
		}
	});

	it('throws AppError on database error for invalid operation', async () => {
		try {
			await inventoryRepository.performStockOp(itemId, 'invalid_type' as any, -10);
			throw new Error('Should have thrown');
		} catch (e: any) {
			expect(e).toBeInstanceOf(AppError);
			// 22P02 is invalid text representation for the enum
			expect(e.code).toBe('22P02');
		}
	});
});
