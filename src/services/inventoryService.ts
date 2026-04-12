import { supabase } from '@/src/config/supabase';
import { toAppError, ValidationError } from '@/src/errors/AppError';
import type {
	InventoryItem,
	InventoryItemInsert,
	InventoryFilters,
	StockOpType,
	StockOperation,
} from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';

export const inventoryService = {
	/**
	 * Fetch paginated inventory items with optional filters
	 */
	async fetchItems(filters: InventoryFilters, page = 1, pageSize = 20) {
		let query = supabase.from('inventory_items').select('*', { count: 'exact' });

		if (filters.search) {
			// Escape ILIKE special chars before interpolating into filter string (§10.1)
			const escaped = filters.search.replace(/[%_\\]/g, (c) => `\\${c}`);
			query = query.or(`design_name.ilike.%${escaped}%,base_item_number.ilike.%${escaped}%`);
		}

		if (filters.category && filters.category !== 'ALL') {
			query = query.eq('category', filters.category);
		}

		if (filters.lowStockOnly) {
			// Use the low_stock_items view which does the column comparison correctly (§17.5)
			// Direct .lte() can't compare two columns — delegate to the view via a separate query
			const { data: lowStockData, error: lowStockError } = await supabase
				.from('low_stock_items')
				.select('id');
			if (lowStockError) throw lowStockError;
			const lowStockIds = (lowStockData ?? []).map((r: { id: string }) => r.id);
			if (lowStockIds.length === 0) {
				return { data: [], count: 0 };
			}
			query = query.in('id', lowStockIds);
		}

		if (filters.supplier_id) {
			query = query.eq('supplier_id', filters.supplier_id);
		}

		const sortField = filters.sortBy || 'created_at';
		const sortAsc = filters.sortDir === 'asc';

		query = query.order(sortField, { ascending: sortAsc });

		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) throw toAppError(error);

		return {
			data: data as InventoryItem[],
			count: count || 0,
		};
	},

	/**
	 * Fetch a single item by ID
	 */
	async fetchItemById(id: UUID) {
		const { data, error } = await supabase
			.from('inventory_items')
			.select('*')
			.eq('id', id)
			.single();

		if (error) throw toAppError(error);
		return data as InventoryItem;
	},

	/**
	 * Create a new inventory item
	 */
	async createItem(item: InventoryItemInsert) {
		const { data, error } = await supabase
			.from('inventory_items')
			.insert(item)
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as InventoryItem;
	},

	/**
	 * Create multiple inventory items in a single transaction
	 */
	async bulkCreateItems(items: InventoryItemInsert[]) {
		const { data, error } = await supabase.from('inventory_items').insert(items).select();

		if (error) throw toAppError(error);
		return data as InventoryItem[];
	},

	/**
	 * Update an existing inventory item.
	 * Supports optimistic concurrency via expectedUpdatedAt.
	 */
	async updateItem(id: UUID, updates: Partial<InventoryItemInsert>, expectedUpdatedAt?: string) {
		let query = supabase.from('inventory_items').update(updates).eq('id', id);

		if (expectedUpdatedAt) {
			query = query.eq('updated_at', expectedUpdatedAt);
		}

		const { data, error } = await query.select().single();

		if (error) {
			// If it's a 'single' failure but the error code indicates it found 0 rows despite ID match,
			// it usually means the updated_at filter didn't match (conflict).
			if (expectedUpdatedAt && error.code === 'PGRST116') {
				throw new Error('VERSION_CONFLICT');
			}
			throw toAppError(error);
		}
		return data as InventoryItem;
	},

	/**
	 * Perform an atomic stock operation via Supabase RPC function (Migration 4)
	 */
	async performStockOperation(
		itemId: UUID,
		operationType: StockOpType,
		quantityChange: number,
		reason?: string,
		referenceType?: string,
		referenceId?: UUID,
	) {
		if (quantityChange <= 0) {
			throw new ValidationError('Quantity must be positive', { quantity_change: ['min'] });
		}
		const { data, error } = await supabase.rpc('perform_stock_operation_v1', {
			p_item_id: itemId,
			p_operation_type: operationType,
			p_quantity_change: quantityChange,
			p_reason: reason || null,
			p_reference_type: referenceType || null,
			p_reference_id: referenceId || null,
		});

		if (error) throw toAppError(error);
		return data;
	},

	/**
	 * Fetch the stock history (operations) for a specific item
	 */
	async fetchStockHistory(itemId: UUID, limit = 50) {
		const { data, error } = await supabase
			.from('stock_operations')
			.select('*')
			.eq('item_id', itemId)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw toAppError(error);
		return data as StockOperation[];
	},
	/**
	 * Delete an inventory item
	 */
	async deleteItem(id: UUID) {
		const { error } = await supabase.from('inventory_items').delete().eq('id', id);

		if (error) throw toAppError(error);
		return true;
	},

	/**
	 * Export entire inventory to Excel format
	 */
	async exportToExcel() {
		const { data, error } = await supabase
			.from('inventory_items')
			.select(
				'design_name, item_code, selling_price, cost_price, mrp, default_discount_pct, box_count, low_stock_threshold, hsn_code, gst_rate, has_batch_tracking, has_serial_tracking, notes',
			)
			.order('design_name', { ascending: true });

		if (error) throw toAppError(error);
		return data;
	},
};
