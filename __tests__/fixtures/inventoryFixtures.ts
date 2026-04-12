import type { InventoryItem } from '../../src/types/inventory';

export type InventoryItemInput = Omit<
	InventoryItem,
	'id' | 'created_at' | 'updated_at' | 'base_item_number'
>;

export function makeInventoryItem(overrides?: Partial<InventoryItem>): InventoryItem {
	return {
		id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b5',
		design_name: 'GLOSSY WHITE 60x60',
		base_item_number: '10526',
		category: 'GLOSSY',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
		cost_price: 400,
		selling_price: 500,
		gst_rate: 18,
		hsn_code: '6908',
		low_stock_threshold: 10,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

export function makeInventoryItemInput(
	overrides?: Partial<InventoryItemInput>,
): InventoryItemInput {
	const {
		id: _id,
		created_at: _ca,
		updated_at: _ua,
		base_item_number: _bin,
		...base
	} = makeInventoryItem();
	return { ...base, ...overrides };
}
