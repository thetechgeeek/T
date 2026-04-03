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

	it('throws AppError from database for non-existent itemID', async () => {
		try {
			await inventoryRepository.performStockOp(
				'00000000-0000-0000-0000-000000000000',
				'stock_in',
				10,
			);
			fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(AppError);
			if (e instanceof AppError) {
				expect([
					'RPC_ERROR',
					'FK_VIOLATION',
					'VALIDATION_ERROR',
					'NOT_FOUND',
					'P0001',
					'22P02',
					'UNKNOWN',
				]).toContain(e.code);
			}
		}
	});

	it('throws AppError on database error for invalid operation', async () => {
		try {
			await inventoryRepository.performStockOp(itemId, 'invalid_type' as any, -10);
			fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(AppError);
			if (e instanceof AppError) {
				expect([
					'RPC_ERROR',
					'VALIDATION_ERROR',
					'NOT_FOUND',
					'22P02',
					'UNKNOWN',
				]).toContain(e.code);
			}
		}
	});
});
