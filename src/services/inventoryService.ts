import { supabase } from '@/src/config/supabase';
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
			query = query.or(
				`design_name.ilike.%${filters.search}%,base_item_number.ilike.%${filters.search}%`,
			);
		}

		if (filters.category && filters.category !== 'ALL') {
			query = query.eq('category', filters.category);
		}

		if (filters.lowStockOnly) {
			// Box count less than or equal to low stock threshold
			query = query.lte('box_count', 'low_stock_threshold');
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

		if (error) throw error;

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

		if (error) throw error;
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

		if (error) throw error;
		return data as InventoryItem;
	},

	/**
	 * Update an existing inventory item
	 */
	async updateItem(id: UUID, updates: Partial<InventoryItemInsert>) {
		const { data, error } = await supabase
			.from('inventory_items')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
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
		const { data, error } = await supabase.rpc('perform_stock_operation', {
			p_item_id: itemId,
			p_operation_type: operationType,
			p_quantity_change: quantityChange,
			p_reason: reason || null,
			p_reference_type: referenceType || null,
			p_reference_id: referenceId || null,
		});

		if (error) throw error;
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

		if (error) throw error;
		return data as StockOperation[];
	},
};
