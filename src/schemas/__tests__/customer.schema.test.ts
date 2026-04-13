import { CustomerSchema } from '../customer';

const validCustomer = {
	name: 'Test Customer',
	phone: '9876543210',
	type: 'retail' as const,
	credit_limit: 0,
};

describe('CustomerSchema', () => {
	it('parses a fully valid customer input', () => {
		const result = CustomerSchema.safeParse(validCustomer);
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = CustomerSchema.safeParse({ ...validCustomer, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid phone number format', () => {
		// Schema: /^[6-9]\d{9}$/ — must be 10 digits starting with 6-9
		const result = CustomerSchema.safeParse({
			...validCustomer,
			phone: 'not-a-phone',
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty phone', () => {
		const result = CustomerSchema.safeParse({ ...validCustomer, phone: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing phone', () => {
		const { phone: _p, ...withoutPhone } = validCustomer;
		const result = CustomerSchema.safeParse(withoutPhone);
		expect(result.success).toBe(false);
	});

	it('accepts valid 15-char GSTIN', () => {
		const result = CustomerSchema.safeParse({
			...validCustomer,
			gstin: '27AAAAA0000A1Z5',
		});
		expect(result.success).toBe(true);
	});

	it('rejects 14-char GSTIN (too short)', () => {
		const result = CustomerSchema.safeParse({
			...validCustomer,
			gstin: '27AAAAA0000A1Z',
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty GSTIN (unregistered customers)', () => {
		const result = CustomerSchema.safeParse({ ...validCustomer, gstin: '' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid customer type', () => {
		const result = CustomerSchema.safeParse({
			...validCustomer,
			type: 'unknown' as unknown as 'retail',
		});
		expect(result.success).toBe(false);
	});
});
