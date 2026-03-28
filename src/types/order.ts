import type { UUID } from './common';

export interface Order {
	id: UUID;
	order_number: string | null;
	supplier_id: UUID | null;
	party_name: string | null;
	city: string | null;
	order_date: string;
	total_weight: number | null;
	total_quantity: number | null;
	status: 'ordered' | 'partially_received' | 'fully_received' | 'cancelled';
	source_pdf_url: string | null;
	raw_llm_response: unknown | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}
