/**
 * Real DB integration test for ledger summary updates.
 * Verifies that creating an invoice correctly refreshes the materialized views.
 * Part of TDD workflow for fixing stale customer balances.
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { invoiceService } from '@/src/services/invoiceService';
import { customerService } from '@/src/services/customerService';
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

describe('Ledger Summary Update Real DB (TDD)', () => {
	let customerId: string;

	beforeEach(async () => {
		// Seed business profile if missing (required for invoice numbering)
		const { data: profile } = await supabase.from('business_profile').select('id').limit(1);
		if (!profile || profile.length === 0) {
			await supabase.from('business_profile').insert({
				business_name: 'Test Business',
				invoice_prefix: 'T',
				invoice_sequence: 1,
			});
		}

		// Create a fresh customer for each test
		const customer = await customerRepository.create({
			name: `${prefix} Ledger Test ${Date.now()}`,
			phone:
				'98' +
				Math.floor(Math.random() * 100000000)
					.toString()
					.padStart(8, '0'),
		});
		customerId = customer.id;
	});

	it('immediately updates outstanding balance after invoice creation', async () => {
		// 1. Initial balance should be 0
		const initialSummary = await customerService.getLedgerSummary(customerId);
		expect(Number(initialSummary.outstanding_balance)).toBe(0);

		// 2. Create an invoice with 590 outstanding (500 + 18% GST)
		await invoiceService.createInvoice({
			customer_id: customerId,
			customer_name: 'Test Customer',
			customer_phone: '9876543210',
			invoice_date: new Date().toISOString().split('T')[0],
			is_inter_state: false,
			line_items: [
				{
					design_name: 'Test Tile',
					quantity: 1,
					rate_per_unit: 500,
					gst_rate: 18,
					discount: 0,
				},
			],
			payment_status: 'unpaid',
			amount_paid: 0,
		} as any);

		// 3. Fetch summary again - EXPECTED TO FAIL until DB fix is applied
		const updatedSummary = await customerService.getLedgerSummary(customerId);

		// 500 + 18% GST (90) = 590
		// If the refresh is missing, this will likely still be 0
		expect(Number(updatedSummary.outstanding_balance)).toBe(590);
	});
});
