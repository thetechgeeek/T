import { InvoiceLineItemSchema, InvoiceInputSchema } from '../invoice';

const validLineItem = {
	item_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
	design_name: 'GLOSSY WHITE 60x60',
	quantity: 10,
	rate_per_unit: 500,
	gst_rate: 18,
	discount: 0,
};

const validInvoiceInput = {
	invoice_date: '2026-01-15',
	customer_name: 'Test Customer',
	customer_phone: '9876543210',
	customer_gstin: '',
	is_inter_state: false,
	line_items: [validLineItem],
	payment_status: 'unpaid' as const,
	amount_paid: 0,
};

describe('InvoiceLineItemSchema', () => {
	it('parses a fully valid line item without throwing', () => {
		const result = InvoiceLineItemSchema.parse(validLineItem);
		expect(result.design_name).toBe('GLOSSY WHITE 60x60');
		expect(result.quantity).toBe(10);
	});

	it('rejects non-UUID item_id', () => {
		const result = InvoiceLineItemSchema.safeParse({ ...validLineItem, item_id: 'not-a-uuid' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('item_id');
		}
	});

	it('rejects quantity = 0', () => {
		const result = InvoiceLineItemSchema.safeParse({ ...validLineItem, quantity: 0 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/positive/i);
		}
	});

	it('rejects quantity = -1', () => {
		const result = InvoiceLineItemSchema.safeParse({ ...validLineItem, quantity: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects rate_per_unit = 0', () => {
		const result = InvoiceLineItemSchema.safeParse({ ...validLineItem, rate_per_unit: 0 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/positive/i);
		}
	});

	it('rejects gst_rate = 7 (not in allowed enum)', () => {
		const result = InvoiceLineItemSchema.safeParse({ ...validLineItem, gst_rate: 7 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/GST rate|enum/i);
		}
	});

	it('accepts gst_rate = 0 (zero-rated supply)', () => {
		const result = InvoiceLineItemSchema.safeParse({ ...validLineItem, gst_rate: 0 });
		expect(result.success).toBe(true);
	});

	it('applies default discount = 0 when discount is undefined', () => {
		const { discount: _d, ...withoutDiscount } = validLineItem;
		const result = InvoiceLineItemSchema.safeParse(withoutDiscount);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.discount).toBe(0);
		}
	});
});

describe('InvoiceInputSchema', () => {
	it('parses a fully valid invoice input', () => {
		const result = InvoiceInputSchema.safeParse(validInvoiceInput);
		expect(result.success).toBe(true);
	});

	it('rejects wrong date format DD-MM-YYYY', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			invoice_date: '28-03-2026',
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/YYYY-MM-DD/);
		}
	});

	it('rejects empty customer_name', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			customer_name: '',
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid GSTIN format', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			customer_gstin: 'INVALIDGSTIN',
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty GSTIN (unregistered customers)', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			customer_gstin: '',
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid 15-char GSTIN', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			customer_gstin: '27AAAAA0000A1Z5',
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty line_items array', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			line_items: [],
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid payment_status enum value', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			payment_status: 'bounced' as unknown as 'unpaid',
		});
		expect(result.success).toBe(false);
	});

	it('rejects notes exceeding 1000 characters', () => {
		const result = InvoiceInputSchema.safeParse({
			...validInvoiceInput,
			notes: 'x'.repeat(1001),
		});
		expect(result.success).toBe(false);
	});

	it('applies default amount_paid = 0 when undefined', () => {
		const { amount_paid: _ap, ...withoutAmountPaid } = validInvoiceInput;
		const result = InvoiceInputSchema.safeParse(withoutAmountPaid);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.amount_paid).toBe(0);
		}
	});
});
