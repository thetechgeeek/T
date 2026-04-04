/**
 * Phase 6: Concurrency and Race Condition Tests.
 * Verifies that the database correctly handles parallel requests
 * using row-level locks (FOR UPDATE) in RPCs.
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { inventoryRepository } from '@/src/repositories/inventoryRepository';
import { invoiceRepository } from '@/src/repositories/invoiceRepository';
import { paymentRepository } from '@/src/repositories/paymentRepository';
import { customerRepository } from '@/src/repositories/customerRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('Concurrency Real DB', () => {
	let itemId: string;
	let customerId: string;

	beforeAll(async () => {
		// Clean start for business profile
		await supabase
			.from('business_profile')
			.delete()
			.neq('id', '00000000-0000-0000-0000-000000000000');
		await supabase.from('business_profile').insert({
			business_name: `${prefix} Concurrency Ltd`,
			invoice_prefix: `C${Date.now().toString().slice(-4)}`,
			invoice_sequence: 0,
		});

		const item = await inventoryRepository.create({
			design_name: `${prefix}Concurrent Tile`,
			base_item_number: 'CONC-01',
			box_count: 100,
			cost_price: 100,
			selling_price: 100,
		});
		itemId = item.id;

		const customer = await customerRepository.create({
			name: `${prefix}Concurrent Customer`,
			phone: '9999999999',
		});
		customerId = customer.id;
	});

	it('parallel stock operations: final count is correct despite high concurrency', async () => {
		// Perform 5 parallel stock_in operations of 10 each
		const operations = Array(5)
			.fill(0)
			.map(() => inventoryRepository.performStockOp(itemId, 'stock_in', 10));

		await Promise.all(operations);

		const item = await inventoryRepository.findById(itemId);
		// 100 (initial) + (5 * 10) = 150
		expect(item.box_count).toBe(150);
	});

	it('parallel invoice creations: unique sequential numbers assigned without collision', async () => {
		const inputBase = {
			customer_id: customerId,
			customer_name: 'Concurrent',
			invoice_date: new Date().toISOString().split('T')[0],
			subtotal: 100,
			cgst_total: 0,
			sgst_total: 0,
			igst_total: 0,
			discount_total: 0,
			grand_total: 100,
			is_inter_state: false,
			payment_status: 'unpaid' as const,
			amount_paid: 0,
		} as any;

		// Create 3 invoices in parallel
		const creations = Array(3)
			.fill(0)
			.map(() => invoiceRepository.createAtomic(inputBase, []));

		const results = await Promise.all(creations);
		const invoiceNumbers = results.map((r) => r.invoice_number).sort();

		// Verify uniqueness
		const uniqueNumbers = new Set(invoiceNumbers);
		expect(uniqueNumbers.size).toBe(3);

		// Verify strictly increasing (since they are generated under a row lock)
		const numericParts = invoiceNumbers.map((n) => parseInt(n.split('/').pop()!, 10));
		expect(numericParts[1]).toBeGreaterThan(numericParts[0]);
		expect(numericParts[2]).toBeGreaterThan(numericParts[1]);
	});

	it('parallel payments on same invoice: correct final amount_paid', async () => {
		const inv = await invoiceRepository.createAtomic(
			{
				customer_id: customerId,
				customer_name: 'Concurrent Pay',
				invoice_date: new Date().toISOString().split('T')[0],
				subtotal: 1000,
				cgst_total: 0,
				sgst_total: 0,
				igst_total: 0,
				discount_total: 0,
				grand_total: 1000,
				is_inter_state: false,
				payment_status: 'unpaid',
				amount_paid: 0,
			} as any,
			[],
		);

		// 4 parallel payments of 200 each
		const payments = Array(4)
			.fill(0)
			.map(() =>
				paymentRepository.recordWithInvoiceUpdate({
					customer_id: customerId,
					invoice_id: inv.id,
					amount: 200,
					payment_mode: 'cash',
					payment_date: new Date().toISOString(),
					direction: 'received',
				}),
			);

		await Promise.all(payments);

		const updatedInv = await invoiceRepository.findById(inv.id);
		expect(updatedInv.amount_paid).toBe(800);
		expect(updatedInv.payment_status).toBe('partial');
	});
});
