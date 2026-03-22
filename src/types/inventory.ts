import type { UUID, Timestamps } from './common';

export type TileCategory = 'GLOSSY' | 'FLOOR' | 'MATT' | 'SATIN' | 'WOODEN' | 'ELEVATION' | 'OTHER';

export type StockOpType = 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'return';

export interface InventoryItem extends Timestamps {
  id: UUID;
  design_name: string;          // e.g. "10526-HL-1-A" – the unique item number
  base_item_number: string;     // e.g. "10526" – auto-extracted by DB trigger
  brand_name?: string;
  category: TileCategory;
  size_name?: string;           // e.g. "600x600"
  grade?: string;               // A, B, C
  pcs_per_box?: number;
  weight_per_box?: number;
  sqft_per_box?: number;
  sqm_per_box?: number;
  tile_image_url?: string;
  box_count: number;
  cost_price: number;
  selling_price: number;
  gst_rate: number;             // 5 | 12 | 18 | 28
  hsn_code: string;             // Default: "6908"
  location?: string;
  low_stock_threshold: number;
  supplier_id?: UUID;
  order_id?: UUID;
  party_name?: string;
  last_restocked?: string;
  notes?: string;
}

export interface InventoryItemInsert extends Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'base_item_number'> {}

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
  category?: TileCategory | 'ALL';
  lowStockOnly?: boolean;
  supplier_id?: UUID;
  sortBy?: 'design_name' | 'box_count' | 'created_at';
  sortDir?: 'asc' | 'desc';
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categoryBreakdown: Record<TileCategory, number>;
}

export interface TileSetGroup {
  baseItemNumber: string;
  items: InventoryItem[];
}
