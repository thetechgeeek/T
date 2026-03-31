import { ExpenseSchema } from '../expense';

const validExpense = {
	amount: 1500,
	category: 'Rent',
	expense_date: '2026-03-01',
};

describe('ExpenseSchema', () => {
	it('parses a minimal valid expense', () => {
		const result = ExpenseSchema.safeParse(validExpense);
		expect(result.success).toBe(true);
	});

	it('parses a fully populated expense with all optional fields', () => {
		const full = {
			...validExpense,
			description: 'March rent for shop',
			notes: 'Paid via bank transfer',
			receipt_image_url: 'https://storage.example.com/receipts/mar.jpg',
		};
		const result = ExpenseSchema.safeParse(full);
		expect(result.success).toBe(true);
	});

	it('rejects amount = 0 (must be positive)', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, amount: 0 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/positive/i);
		}
	});

	it('rejects negative amount', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, amount: -100 });
		expect(result.success).toBe(false);
	});

	it('rejects amount as string (type safety)', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, amount: '1500' as any });
		expect(result.success).toBe(false);
	});

	it('accepts all valid expense categories', () => {
		const categories = [
			'Rent',
			'Transport',
			'Labor',
			'Utilities',
			'Packaging',
			'Maintenance',
			'Misc',
		];
		for (const category of categories) {
			const result = ExpenseSchema.safeParse({ ...validExpense, category });
			expect(result.success).toBe(true);
		}
	});

	it('rejects an invalid category', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, category: 'Coffee' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/expense category/i);
		}
	});

	it('rejects empty category', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, category: '' });
		expect(result.success).toBe(false);
	});

	it('accepts YYYY-MM-DD date format', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, expense_date: '2026-03-31' });
		expect(result.success).toBe(true);
	});

	it('rejects DD-MM-YYYY date format', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, expense_date: '31-03-2026' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toMatch(/YYYY-MM-DD/);
		}
	});

	it('rejects MM/DD/YYYY date format', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, expense_date: '03/31/2026' });
		expect(result.success).toBe(false);
	});

	it('rejects empty date string', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, expense_date: '' });
		expect(result.success).toBe(false);
	});

	it('description is optional and can be omitted', () => {
		const { description: _d, ...withoutDesc } = { ...validExpense, description: undefined };
		const result = ExpenseSchema.safeParse(validExpense);
		expect(result.success).toBe(true);
	});

	it('notes is optional and limited to 500 characters', () => {
		const result = ExpenseSchema.safeParse({
			...validExpense,
			notes: 'x'.repeat(501),
		});
		expect(result.success).toBe(false);
	});

	it('accepts notes up to 500 characters', () => {
		const result = ExpenseSchema.safeParse({
			...validExpense,
			notes: 'x'.repeat(500),
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid receipt_image_url', () => {
		const result = ExpenseSchema.safeParse({
			...validExpense,
			receipt_image_url: 'https://example.com/receipt.jpg',
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid receipt_image_url (not a URL)', () => {
		const result = ExpenseSchema.safeParse({
			...validExpense,
			receipt_image_url: 'not-a-url',
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty string receipt_image_url (clear the image)', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, receipt_image_url: '' });
		expect(result.success).toBe(true);
	});

	it('accepts fractional amounts (e.g. 1500.50)', () => {
		const result = ExpenseSchema.safeParse({ ...validExpense, amount: 1500.5 });
		expect(result.success).toBe(true);
	});
});
