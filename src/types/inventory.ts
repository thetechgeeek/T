import type { UUID, Timestamps } from './common';

export interface ItemCategory extends Timestamps {
	id: UUID;
	name_hi: string;
	name_en: string;
	color?: string;
	icon?: string;
	sort_order: number;
}

export type TileCategory =
	| 'GLOSSY'
	| 'FLOOR'
	| 'MATT'
	| 'SATIN'
	| 'WOODEN'
	| 'ELEVATION'
	| 'OTHER'
	| 'ALL';

export interface ItemUnit extends Timestamps {
	id: UUID;
	name: string;
	abbreviation: string;
	is_default: boolean;
}

export interface ItemBatch extends Timestamps {
	id: UUID;
	item_id: UUID;
	batch_number: string;
	mfg_date?: string;
	expiry_date?: string;
	initial_quantity: number;
	current_quantity: number;
}

export interface ItemSerial extends Timestamps {
	id: UUID;
	item_id: UUID;
	serial_number: string;
	status: 'in_stock' | 'sold' | 'returned' | 'damaged';
}

export interface ItemPartyRate extends Timestamps {
	id: UUID;
	item_id: UUID;
	customer_id?: UUID;
	supplier_id?: UUID;
	custom_rate: number;
}

export type StockOpType = 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'return';

export interface InventoryItem extends Timestamps {
	id: UUID;
	design_name: string; // the unique item name/code
	base_item_number: string; // auto-extracted
	item_code?: string;
	brand_name?: string;

	category_id?: UUID; // Updated: dynamic link
	unit_id?: UUID; // Updated: dynamic link

	// Legacy / Compatibility (can be phase out later)
	category?: string;
	custom_category?: string;

	size_name?: string;
	grade?: string;
	pcs_per_box?: number;
	weight_per_box?: number;
	sqft_per_box?: number;
	sqm_per_box?: number;
	tile_image_url?: string;
	box_count: number;
	cost_price: number;
	selling_price: number;
	mrp?: number;
	default_discount_pct?: number;
	gst_rate: number;
	hsn_code: string;
	location?: string;
	low_stock_threshold: number;
	supplier_id?: UUID;
	order_id?: UUID;
	party_name?: string;
	last_restocked?: string;
	notes?: string;

	// New Phase 2 Fields
	has_batch_tracking: boolean;
	has_serial_tracking: boolean;
}

export type InventoryItemInsert = Omit<
	InventoryItem,
	'id' | 'created_at' | 'updated_at' | 'base_item_number'
>;

export interface StockOperation extends Pick<Timestamps, 'created_at'> {
	id: UUID;
	item_id: UUID;
	operation_type: StockOpType;
	quantity_change: number;
	previous_quantity: number;
	new_quantity: number;
	reason?: string;
	reference_type?: 'invoice' | 'purchase' | 'adjustment' | 'transfer';
	reference_id?: UUID;
}

export interface InventoryFilters {
	search?: string;
	category?: TileCategory | string; // Legacy support
	category_id?: UUID;
	unit_id?: UUID;
	lowStockOnly?: boolean;
	supplier_id?: UUID;
	sortBy?: 'design_name' | 'box_count' | 'selling_price' | 'created_at';
	sortDir?: 'asc' | 'desc';
}

export interface InventoryStats {
	totalItems: number;
	totalValue: number;
	lowStockCount: number;
	categoryBreakdown: Record<string, number>;
}

export interface TileSetGroup {
	baseItemNumber: string;
	items: InventoryItem[];
}
