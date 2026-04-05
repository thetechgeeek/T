import { supabase } from '@/src/config/supabase';
import type { ParsedOrderItem } from './pdfService';
import type { UUID } from '@/src/types/common';
import { inventoryService } from './inventoryService';
import type { Order } from '../types/order';
import type { TileCategory } from '../types/inventory';
export type { Order };

export const orderService = {
	async fetchOrders(options?: { status?: string; limit?: number; offset?: number }) {
		let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

		if (options?.status) {
			query = query.eq('status', options.status);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
			if (options?.offset)
				query = query.range(options.offset, options.offset + options.limit - 1);
		}

		const { data, error } = await query;
		if (error) throw error;
		return data as Order[];
	},

	async fetchOrderById(id: UUID) {
		const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

		if (error) throw error;
		return data as Order;
	},

	async fetchItemsByOrderId(orderId: UUID) {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.eq('order_id', orderId);

		if (error) throw error;
		return data;
	},

	async importOrder(partyName: string, items: ParsedOrderItem[], rawLlmResponse: unknown) {
		const totalQty = items.reduce((sum, item) => sum + (item.box_count || 0), 0);

		// 1. Create order record
		const { data: orderData, error: orderError } = await supabase
			.from('orders')
			.insert({
				party_name: partyName,
				total_quantity: totalQty,
				status: 'fully_received',
				raw_llm_response: rawLlmResponse,
			})
			.select()
			.single();

		if (orderError) throw orderError;
		const orderId = orderData.id;

		const normalizeCategory = (cat?: string): TileCategory => {
			const upper = (cat || '').toUpperCase();
			const valid: TileCategory[] = [
				'GLOSSY',
				'FLOOR',
				'MATT',
				'SATIN',
				'WOODEN',
				'ELEVATION',
				'OTHER',
			];
			return valid.includes(upper as TileCategory) ? (upper as TileCategory) : 'OTHER';
		};

		// 2. Process each item (Find/Create + Stock In)
		for (const item of items) {
			if (!item.design_name || !item.box_count) continue;

			// Check if item exists
			const { data: existingItems } = await supabase
				.from('inventory_items')
				.select('id')
				.eq('design_name', item.design_name);

			if (existingItems && existingItems.length > 0) {
				// Item exists, just perform stock_in
				const existingId = existingItems[0].id;
				await inventoryService.performStockOperation(
					existingId,
					'stock_in',
					item.box_count,
					`Imported from Order ${orderId}`,
					'purchase',
					orderId,
				);
			} else {
				// Item does not exist, use inventoryService to create it
				const newItem = await inventoryService.createItem({
					design_name: item.design_name,
					category: normalizeCategory(item.category as string),
					size_name: item.size || undefined,
					brand_name: item.brand || undefined,
					box_count: 0, // Set to 0, let performStockOperation handle it
					selling_price: item.price_per_box || 0,
					cost_price: item.price_per_box || 0,
					gst_rate: 18,
					hsn_code: '6908',
					low_stock_threshold: 10,
					order_id: orderId,
					party_name: partyName,
				});

				// Also perform stock_in for the new item to ensure consistent logging
				await inventoryService.performStockOperation(
					newItem.id,
					'stock_in',
					item.box_count,
					`Imported from Order ${orderId}`,
					'purchase',
					orderId,
				);
			}
		}

		return orderData;
	},
};
