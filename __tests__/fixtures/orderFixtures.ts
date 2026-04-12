import type { Order } from '../../src/types/order';
import type { ParsedOrderItem } from '../../src/services/pdfService';

/** Alias for use in fixture factories — matches ParsedOrderItem shape */
export type OrderItem = ParsedOrderItem;

export function makeOrderItem(overrides?: Partial<OrderItem>): OrderItem {
	return {
		design_name: 'GLOSSY WHITE 60x60',
		base_item_number: '10526',
		box_count: 5,
		has_batch_tracking: false,
		has_serial_tracking: false,
		...overrides,
	};
}

export function makeOrder(overrides?: Partial<Order>): Order {
	return {
		id: 'order-uuid-001',
		order_number: 'ORD-001',
		supplier_id: null,
		party_name: 'Test Party',
		city: null,
		order_date: '2026-01-01',
		total_weight: null,
		total_quantity: null,
		status: 'ordered',
		source_pdf_url: null,
		raw_llm_response: null,
		notes: null,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}
