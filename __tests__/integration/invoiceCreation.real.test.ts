/**
 * Real DB integration test for invoice creation.
 * Verifies RPC atomicity, sequence generation, and stock decrement.
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { invoiceRepository } from '@/src/repositories/invoiceRepository';
import { inventoryRepository } from '@/src/repositories/inventoryRepository';
import { customerRepository } from '@/src/repositories/customerRepository';
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

describe('Invoice Creation Real DB', () => {
	let customerId: string;
	let itemId: string;

	beforeAll(async () => {
		// Clean start for business profile to avoid sequence collisions
		await supabase
			.from('business_profile')
			.delete()
			.neq('id', '00000000-0000-0000-0000-000000000000');
		await supabase.from('business_profile').insert({
			business_name: `${prefix} Test Business`,
			invoice_prefix: `T${Date.now().toString().slice(-6)}`,
			invoice_sequence: 0,
		});

		// Seed a customer
		const customer = await customerRepository.create({
			name: `${prefix}Test Customer`,
			phone: '1234567890',
		});
		customerId = customer.id;

		// Seed an item with known stock
		const item = await inventoryRepository.create({
			design_name: `${prefix}Test Tile`,
			base_item_number: `${prefix}TT-001`,
			category: 'GLOSSY',
			box_count: 100,
			cost_price: 1000,
			selling_price: 1000,
			hsn_code: '6908',
			low_stock_threshold: 10,
		});
		itemId = item.id;
	});

	it('creates invoice and decrements stock atomically', async () => {
		const invoiceInput = {
			customer_id: customerId,
			customer_name: `${prefix}Test Customer`,
			customer_phone: '1234567890',
			invoice_date: new Date().toISOString().split('T')[0],
			subtotal: 5000,
			cgst_total: 0,
			sgst_total: 0,
			igst_total: 0,
			discount_total: 0,
			grand_total: 5000,
			is_inter_state: false,
			payment_status: 'unpaid' as const,
			amount_paid: 0,
			notes: prefix,
		} as any;

		const lineItems = [
			{
				item_id: itemId,
				design_name: `${prefix}Test Tile`,
				quantity: 5,
				rate_per_unit: 1000,
				taxable_amount: 5000,
				line_total: 5000,
				gst_rate: 0,
				cgst_amount: 0,
				sgst_amount: 0,
				igst_amount: 0,
				discount: 0,
				sort_order: 1, // Required by not-null constraint
			} as any,
		];

		const result = await invoiceRepository.createAtomic(invoiceInput, lineItems);

		expect(result.id).toBeTruthy();
		expect(result.invoice_number).toMatch(/^T\d*\/202\d-\d{2}\/\d{4}$/);

		const fullInvoice = await invoiceRepository.findWithLineItems(result.id);
		expect(fullInvoice.line_items).toBeDefined();
		expect(fullInvoice.line_items?.length).toBe(1);

		const updatedItem = await inventoryRepository.findById(itemId);
		expect(updatedItem.box_count).toBe(100 - 5);
	});

	it('generates sequential invoice numbers for same business', async () => {
		const invoiceInput = {
			customer_id: customerId,
			customer_name: `${prefix}Seq Test`,
			customer_phone: '1234567890',
			invoice_date: new Date().toISOString().split('T')[0],
			subtotal: 1000,
			cgst_total: 0,
			sgst_total: 0,
			igst_total: 0,
			discount_total: 0,
			grand_total: 1000,
			is_inter_state: false,
			payment_status: 'unpaid' as const,
			amount_paid: 0,
			notes: prefix,
		} as any;

		const res1 = await invoiceRepository.createAtomic(invoiceInput, []);
		const res2 = await invoiceRepository.createAtomic(invoiceInput, []);

		const num1 = parseInt(res1.invoice_number.split('/').pop()!);
		const num2 = parseInt(res2.invoice_number.split('/').pop()!);
		expect(num2).toBe(num1 + 1);
	});

	it('fails and rolls back if a line item is invalid', async () => {
		const beforeItem = await inventoryRepository.findById(itemId);
		const invoiceInput = {
			customer_id: customerId,
			customer_name: `${prefix}Fail Test`,
			customer_phone: '1234567890',
			invoice_date: new Date().toISOString().split('T')[0],
			subtotal: 100,
			grand_total: 100,
			payment_status: 'unpaid' as const,
			notes: prefix,
		} as any;

		const invalidLineItems = [
			{
				item_id: '00000000-0000-0000-0000-000000000000',
				design_name: 'Invalid',
				quantity: 1,
				rate_per_unit: 100,
				taxable_amount: 100,
				line_total: 100,
				gst_rate: 0,
				sort_order: 1,
			} as any,
		];

		await expect(
			invoiceRepository.createAtomic(invoiceInput, invalidLineItems),
		).rejects.toThrow();

		const afterItem = await inventoryRepository.findById(itemId);
		expect(afterItem.box_count).toBe(beforeItem.box_count);
	});

	it('throws AppError from database on failure', async () => {
		const invoiceInput = {
			customer_id: '00000000-0000-0000-0000-000000000000',
			customer_name: 'Ghost',
			customer_phone: '1234567890',
			invoice_date: new Date().toISOString().split('T')[0],
			grand_total: 100,
		} as any;

		try {
			await invoiceRepository.createAtomic(invoiceInput, []);
			throw new Error('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(AppError);
			if (e instanceof AppError) {
				expect([
					'RPC_ERROR',
					'FK_VIOLATION',
					'VALIDATION_ERROR',
					'NOT_FOUND',
					'23503',
					'23502',
					'P0001',
					'UNKNOWN',
				]).toContain(e.code);
			}
		}
	});
});
