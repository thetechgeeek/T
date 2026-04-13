import { InvoiceInputSchema } from '@/src/schemas/invoice';
import { buildInvoiceCreatePayload } from '../buildInvoiceCreatePayload';
import type { InvoiceLineItemInput } from '@/src/types/invoice';

const itemId = '123e4567-e89b-12d3-a456-426614174000';

const baseLineItem = (overrides: Partial<InvoiceLineItemInput> = {}): InvoiceLineItemInput => ({
	item_id: itemId,
	design_name: 'Tile',
	quantity: 1,
	rate_per_unit: 500,
	gst_rate: 18,
	discount: 0,
	...overrides,
});

describe('buildInvoiceCreatePayload', () => {
	it('produces input that passes InvoiceInputSchema for a typical credit sale', () => {
		const parsed = InvoiceInputSchema.safeParse(
			buildInvoiceCreatePayload({
				isCashSale: false,
				customer: { name: 'Rahul', phone: '9876543210' },
				isInterState: false,
				lineItems: [baseLineItem()],
				invoiceDate: '2026-04-01',
				invoiceNumber: 'INV-001',
				amountPaidNum: 0,
				grandTotal: 590,
				paymentMode: 'cash',
			}),
		);
		expect(parsed.success).toBe(true);
	});

	it('fails schema when phone is empty (non–cash-sale path mirrors hook: empty string)', () => {
		const payload = buildInvoiceCreatePayload({
			isCashSale: false,
			customer: { name: 'No Phone', phone: '' },
			isInterState: false,
			lineItems: [baseLineItem()],
			invoiceDate: '2026-04-01',
			invoiceNumber: 'INV-001',
			amountPaidNum: 0,
			grandTotal: 590,
			paymentMode: 'cash',
		});
		const parsed = InvoiceInputSchema.safeParse(payload);
		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			const paths = parsed.error.issues.map((i) => i.path.join('.'));
			expect(paths).toContain('customer_phone');
		}
	});

	it('fails schema when line item has rate_per_unit 0 (inventory selling_price missing)', () => {
		const result = InvoiceInputSchema.safeParse(
			buildInvoiceCreatePayload({
				isCashSale: false,
				customer: { name: 'A', phone: '9876543210' },
				isInterState: false,
				lineItems: [baseLineItem({ rate_per_unit: 0 })],
				invoiceDate: '2026-04-01',
				invoiceNumber: 'INV-001',
				amountPaidNum: 0,
				grandTotal: 0,
				paymentMode: 'cash',
			}),
		);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(
				result.error.issues.some((i) => i.path.join('.') === 'line_items.0.rate_per_unit'),
			).toBe(true);
		}
	});

	it('sets paid when amountPaidNum >= grandTotal', () => {
		const payload = buildInvoiceCreatePayload({
			isCashSale: true,
			customer: null,
			isInterState: false,
			lineItems: [baseLineItem()],
			invoiceDate: '2026-04-01',
			invoiceNumber: 'INV-001',
			amountPaidNum: 1000,
			grandTotal: 590,
			paymentMode: 'upi',
		});
		expect(payload.payment_status).toBe('paid');
		expect(payload.payment_mode).toBe('upi');
	});

	it('omit payment_mode when amountPaidNum is 0', () => {
		const payload = buildInvoiceCreatePayload({
			isCashSale: false,
			customer: { name: 'A', phone: '9876543210' },
			isInterState: false,
			lineItems: [baseLineItem()],
			invoiceDate: '2026-04-01',
			invoiceNumber: 'INV-001',
			amountPaidNum: 0,
			grandTotal: 590,
			paymentMode: 'cash',
		});
		expect(payload.payment_mode).toBeUndefined();
	});

	it('cash walk-in payload (empty phone) passes InvoiceInputSchema', () => {
		const parsed = InvoiceInputSchema.safeParse(
			buildInvoiceCreatePayload({
				isCashSale: true,
				customer: null,
				isInterState: false,
				lineItems: [baseLineItem()],
				invoiceDate: '2026-04-01',
				invoiceNumber: 'INV-001',
				amountPaidNum: 0,
				grandTotal: 590,
				paymentMode: 'cash',
			}),
		);
		expect(parsed.success).toBe(true);
	});
});
