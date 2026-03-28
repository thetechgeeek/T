import type { UUID, Timestamps } from './common';

export type OrderStatus = 'ordered' | 'partially_received' | 'fully_received' | 'cancelled';

export interface Order extends Timestamps {
	id: UUID;
	order_number?: string;
	supplier_id?: UUID;
	party_name?: string;
	city?: string;
	order_date: string;
	total_weight?: number;
	total_quantity?: number;
	status: OrderStatus;
	source_pdf_url?: string;
	raw_llm_response?: Record<string, unknown>;
	notes?: string;
}

export interface LLMExtractedOrderHeader {
	order_number?: string;
	party_name?: string;
	city?: string;
	date?: string;
	total_weight?: number;
	total_quantity?: number;
}

export interface LLMExtractedItem {
	brand_name?: string;
	category?: string;
	size_name?: string;
	design_name: string;
	grade?: string;
	quantity?: number;
	pcs_per_box?: number;
	weight_per_box?: number;
	sqft_per_box?: number;
	sqm_per_box?: number;
	image_description?: string;
	confidence?: number; // 0–1, items below 0.7 are flagged
	image_url?: string; // filled in after image extraction step
}

export interface LLMParsedOrder {
	header: LLMExtractedOrderHeader;
	items: LLMExtractedItem[];
}

export interface OrderImportItem extends LLMExtractedItem {
	isDuplicate?: boolean;
	existingItemId?: UUID;
	importAction?: 'create' | 'update_stock' | 'overwrite' | 'skip';
	selected?: boolean;
}

export interface OrderFilters {
	search?: string;
	status?: OrderStatus | 'ALL';
	supplier_id?: UUID;
	sortBy?: 'order_date' | 'created_at';
	sortDir?: 'asc' | 'desc';
}
