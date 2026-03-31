import { BusinessProfileSchema } from '../businessProfile';

const validProfile = {
	business_name: 'Rupesh Tiles',
	address: '12 MG Road, Ahmedabad',
	city: 'Ahmedabad',
	state: 'Gujarat',
	invoice_prefix: 'TM',
};

describe('BusinessProfileSchema', () => {
	it('parses a minimal valid profile (required fields only)', () => {
		const result = BusinessProfileSchema.safeParse(validProfile);
		expect(result.success).toBe(true);
	});

	it('parses a fully populated profile with all optional fields', () => {
		const full = {
			...validProfile,
			gstin: '27AABCU9603R1ZX',
			state_code: '27',
			pincode: '380001',
			phone: '9876543210',
			email: 'owner@tiles.com',
			terms_and_conditions: 'Payment due within 30 days.',
		};
		const result = BusinessProfileSchema.safeParse(full);
		expect(result.success).toBe(true);
	});

	it('rejects empty business_name', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, business_name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path[0]);
			expect(paths).toContain('business_name');
		}
	});

	it('rejects empty address', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, address: '' });
		expect(result.success).toBe(false);
	});

	it('rejects empty city', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, city: '' });
		expect(result.success).toBe(false);
	});

	it('rejects empty state', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, state: '' });
		expect(result.success).toBe(false);
	});

	it('accepts valid 15-char GSTIN with correct format', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			gstin: '27AABCU9603R1ZX',
		});
		expect(result.success).toBe(true);
	});

	it('rejects GSTIN with wrong format (too short)', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			gstin: '27AABCU9603R',
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/GSTIN/i);
		}
	});

	it('rejects GSTIN with invalid characters', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			gstin: '27AABCU9603R1!!',
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty GSTIN (unregistered business)', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, gstin: '' });
		expect(result.success).toBe(true);
	});

	it('accepts undefined GSTIN (optional)', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile });
		expect(result.success).toBe(true);
	});

	it('accepts valid 6-digit pincode', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, pincode: '380001' });
		expect(result.success).toBe(true);
	});

	it('rejects pincode with fewer than 6 digits', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, pincode: '38001' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/6 digits/i);
		}
	});

	it('rejects pincode with letters', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, pincode: '38000A' });
		expect(result.success).toBe(false);
	});

	it('accepts valid 10-digit Indian mobile number (starts with 9)', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, phone: '9876543210' });
		expect(result.success).toBe(true);
	});

	it('accepts valid phone starting with 6', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, phone: '6000000000' });
		expect(result.success).toBe(true);
	});

	it('rejects phone starting with 5 (not Indian mobile range)', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, phone: '5876543210' });
		expect(result.success).toBe(false);
	});

	it('rejects phone with fewer than 10 digits', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, phone: '987654321' });
		expect(result.success).toBe(false);
	});

	it('accepts empty phone (optional field)', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, phone: '' });
		expect(result.success).toBe(true);
	});

	it('accepts valid email address', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, email: 'shop@tiles.in' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid email format', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, email: 'not-an-email' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/email/i);
		}
	});

	it('accepts empty email (optional)', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, email: '' });
		expect(result.success).toBe(true);
	});

	it('rejects invoice_prefix longer than 5 characters', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			invoice_prefix: 'TOOLONG',
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/5 characters/i);
		}
	});

	it('rejects empty invoice_prefix', () => {
		const result = BusinessProfileSchema.safeParse({ ...validProfile, invoice_prefix: '' });
		expect(result.success).toBe(false);
	});

	it('accepts invoice_prefix of exactly 5 characters', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			invoice_prefix: 'TILES',
		});
		expect(result.success).toBe(true);
	});

	it('rejects terms_and_conditions exceeding 2000 characters', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			terms_and_conditions: 'x'.repeat(2001),
		});
		expect(result.success).toBe(false);
	});

	it('accepts terms_and_conditions of exactly 2000 characters', () => {
		const result = BusinessProfileSchema.safeParse({
			...validProfile,
			terms_and_conditions: 'x'.repeat(2000),
		});
		expect(result.success).toBe(true);
	});
});
