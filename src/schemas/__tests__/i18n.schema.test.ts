import { getBusinessProfileSchema } from '../businessProfile';
import { getCustomerSchema } from '../customer';
import { getExpenseSchema } from '../expense';
import { getInventorySchema } from '../inventory';
import { getInvoiceSchema } from '../invoice';
import { getPaymentSchema } from '../payment';

const hi = (key: string) =>
	({
		'validation.inventory.designNameRequired': 'डिज़ाइन नाम आवश्यक है',
		'validation.customer.invalidPhone': 'मान्य फ़ोन नंबर दर्ज करें',
		'validation.businessProfile.addressRequired': 'व्यवसाय पता आवश्यक है',
		'validation.expense.invalidCategory': 'खर्च श्रेणी अमान्य है',
		'validation.invoice.phoneDigits': 'फ़ोन नंबर में केवल अंक होने चाहिए',
		'validation.payment.linkedRequired':
			'भुगतान ग्राहक या सप्लायर में से किसी एक से लिंक होना चाहिए',
	})[key] ?? key;

describe('translatable zod schemas', () => {
	it('uses injected inventory validation copy', () => {
		const result = getInventorySchema(hi).safeParse({
			design_name: '',
			category: 'GLOSSY',
			box_count: 1,
			cost_price: 10,
			selling_price: 12,
			gst_rate: 18,
			low_stock_threshold: 1,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('डिज़ाइन नाम आवश्यक है');
		}
	});

	it('uses injected invoice validation copy', () => {
		const result = getInvoiceSchema(hi).safeParse({
			invoice_date: '2026-01-15',
			customer_name: 'Customer',
			customer_phone: '98 765',
			customer_gstin: '',
			is_inter_state: false,
			line_items: [
				{
					design_name: 'Tile',
					quantity: 1,
					rate_per_unit: 10,
					gst_rate: 18,
				},
			],
			payment_status: 'unpaid',
			amount_paid: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('फ़ोन नंबर में केवल अंक होने चाहिए');
		}
	});

	it('uses injected customer validation copy', () => {
		const result = getCustomerSchema(hi).safeParse({
			name: 'Customer',
			phone: '12345',
			type: 'retail',
			credit_limit: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('मान्य फ़ोन नंबर दर्ज करें');
		}
	});

	it('uses injected business profile validation copy', () => {
		const result = getBusinessProfileSchema(hi).safeParse({
			business_name: 'Tiles',
			address: '',
			city: 'Ahmedabad',
			state: 'Gujarat',
			invoice_prefix: 'TM',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('व्यवसाय पता आवश्यक है');
		}
	});

	it('uses injected expense validation copy', () => {
		const result = getExpenseSchema(hi).safeParse({
			amount: 100,
			category: 'Coffee',
			expense_date: '2026-01-15',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('खर्च श्रेणी अमान्य है');
		}
	});

	it('uses injected payment validation copy', () => {
		const result = getPaymentSchema(hi).safeParse({
			amount: 100,
			payment_mode: 'cash',
			direction: 'received',
			payment_date: '2026-01-15',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				'भुगतान ग्राहक या सप्लायर में से किसी एक से लिंक होना चाहिए',
			);
		}
	});
});
