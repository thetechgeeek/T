/**
 * Real DB integration test for payment recording.
 * Verifies RPC status transitions.
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { paymentRepository } from '@/src/repositories/paymentRepository';
import { invoiceRepository } from '@/src/repositories/invoiceRepository';
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

describe('Payment Recording Real DB', () => {
	let customerId: string;
	let invoiceId: string;

	beforeAll(async () => {
		// Seed a customer
		const customer = await customerRepository.create({
			name: `${prefix}Pay Customer`,
			phone: '1234567890',
		});
		customerId = customer.id;

		// Seed an invoice with all required fields
		const res = await invoiceRepository.createAtomic(
			{
				customer_id: customerId,
				customer_name: `${prefix}Pay Customer`,
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
			} as any,
			[],
		);
		invoiceId = res.id;
	});

	it('records payment and updates status to partial', async () => {
		const paymentInput = {
			customer_id: customerId,
			invoice_id: invoiceId,
			amount: 400,
			payment_mode: 'cash' as const,
			payment_date: new Date().toISOString(),
			notes: prefix,
			direction: 'received' as const,
		};

		const result = await paymentRepository.recordWithInvoiceUpdate(paymentInput);

		expect(result.id).toBeTruthy();
		expect(result.new_status).toBe('partial');

		const updatedInvoice = await invoiceRepository.findById(invoiceId);
		expect(updatedInvoice.payment_status).toBe('partial');
		expect(updatedInvoice.amount_paid).toBe(400);
	});

	it('updates status to paid after full payment', async () => {
		const paymentInput = {
			customer_id: customerId,
			invoice_id: invoiceId,
			amount: 600,
			payment_mode: 'upi' as const,
			payment_date: new Date().toISOString(),
			notes: prefix,
			direction: 'received' as const,
		};

		const result = await paymentRepository.recordWithInvoiceUpdate(paymentInput);

		expect(result.new_status).toBe('paid');

		const updatedInvoice = await invoiceRepository.findById(invoiceId);
		expect(updatedInvoice.payment_status).toBe('paid');
		expect(updatedInvoice.amount_paid).toBe(1000);
	});

	it('records payment without invoice_id (customer level)', async () => {
		const paymentInput = {
			customer_id: customerId,
			amount: 500,
			payment_mode: 'bank_transfer' as const,
			payment_date: new Date().toISOString(),
			notes: prefix,
			direction: 'received' as const,
		};

		const result = await paymentRepository.recordWithInvoiceUpdate(paymentInput);

		expect(result.id).toBeTruthy();
		expect(result.new_status).toBeNull();
	});

	it('throws AppError on database failure if parameters are invalid', async () => {
		const paymentInput = {
			customer_id: '00000000-0000-0000-0000-000000000000',
			amount: 100,
		} as any;

		try {
			await paymentRepository.recordWithInvoiceUpdate(paymentInput);
			fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(AppError);
			if (e instanceof AppError) {
				expect([
					'RPC_ERROR',
					'FK_VIOLATION',
					'VALIDATION_ERROR',
					'NOT_FOUND',
					'23503',
					'22P02',
					'P0001',
					'23502',
					'UNKNOWN',
				]).toContain(e.code);
			}
		}
	});
});
