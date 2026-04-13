import { PaymentSchema } from '../payment';

const validPayment = {
	amount: 1000,
	payment_mode: 'cash' as const,
	direction: 'received' as const,
	payment_date: '2026-01-15',
	customer_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};

describe('PaymentSchema', () => {
	it('parses a fully valid payment input', () => {
		const result = PaymentSchema.safeParse(validPayment);
		expect(result.success).toBe(true);
	});

	it('rejects amount = 0 (business rule: payments must be positive)', () => {
		// The schema uses z.number().positive() — 0 is not positive
		const result = PaymentSchema.safeParse({ ...validPayment, amount: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects amount = -1', () => {
		const result = PaymentSchema.safeParse({ ...validPayment, amount: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects invalid payment_mode', () => {
		const result = PaymentSchema.safeParse({
			...validPayment,
			payment_mode: 'bitcoin' as unknown as 'cash',
		});
		expect(result.success).toBe(false);
	});

	it('rejects wrong date format DD-MM-YYYY', () => {
		const result = PaymentSchema.safeParse({
			...validPayment,
			payment_date: '29-03-2026',
		});
		expect(result.success).toBe(false);
	});

	it('rejects payment linked to both customer and supplier (mutual exclusion)', () => {
		// The schema enforces this via .refine() — both IDs cannot be present simultaneously
		const result = PaymentSchema.safeParse({
			...validPayment,
			customer_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
			supplier_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
		});
		expect(result.success).toBe(false);
	});

	it('accepts payment with only customer_id (no supplier_id)', () => {
		const result = PaymentSchema.safeParse({
			...validPayment,
			customer_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
			supplier_id: undefined,
		});
		expect(result.success).toBe(true);
	});

	it('accepts payment with only supplier_id (no customer_id)', () => {
		const result = PaymentSchema.safeParse({
			amount: 2000,
			payment_mode: 'bank_transfer' as const,
			direction: 'made' as const,
			payment_date: '2026-01-15',
			supplier_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
		});
		expect(result.success).toBe(true);
	});

	it('rejects when neither customer_id nor supplier_id is set', () => {
		const result = PaymentSchema.safeParse({
			...validPayment,
			customer_id: undefined,
		});
		expect(result.success).toBe(false);
	});

	it('rejects notes longer than 500 characters', () => {
		const result = PaymentSchema.safeParse({
			...validPayment,
			notes: 'x'.repeat(501),
		});
		expect(result.success).toBe(false);
	});
});
