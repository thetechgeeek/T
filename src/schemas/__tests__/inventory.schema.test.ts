import { InventoryItemSchema } from '../inventory';

const validItem = {
	design_name: 'GLOSSY WHITE 60x60',
	category: 'GLOSSY',
	box_count: 50,
	cost_price: 400,
	selling_price: 500,
	gst_rate: 18,
	hsn_code: '6908',
	low_stock_threshold: 10,
};

describe('InventoryItemSchema', () => {
	it('parses a fully valid inventory item', () => {
		const result = InventoryItemSchema.safeParse(validItem);
		expect(result.success).toBe(true);
	});

	it('rejects empty design_name', () => {
		const result = InventoryItemSchema.safeParse({ ...validItem, design_name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects box_count = -1 (stock cannot be negative)', () => {
		const result = InventoryItemSchema.safeParse({ ...validItem, box_count: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects selling_price = -100', () => {
		const result = InventoryItemSchema.safeParse({ ...validItem, selling_price: -100 });
		expect(result.success).toBe(false);
	});

	it('rejects invalid gst_rate (e.g. 7)', () => {
		const result = InventoryItemSchema.safeParse({ ...validItem, gst_rate: 7 });
		expect(result.success).toBe(false);
	});

	it('accepts gst_rate = 0 (zero-rated)', () => {
		const result = InventoryItemSchema.safeParse({ ...validItem, gst_rate: 0 });
		expect(result.success).toBe(true);
	});

	it('accepts box_count = 0 (out of stock is valid)', () => {
		const result = InventoryItemSchema.safeParse({ ...validItem, box_count: 0 });
		expect(result.success).toBe(true);
	});
});
