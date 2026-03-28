import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { InventoryItem, StockOpType } from '../types/inventory';
import type { UUID } from '../types/common';

const base = createRepository<InventoryItem>('inventory_items');

export const inventoryRepository = {
	...base,

	/** Uses the low_stock_items view (§17.5) */
	async findLowStock(): Promise<InventoryItem[]> {
		const { data, error } = await supabase
			.from('low_stock_items')
			.select('*')
			.order('box_count', { ascending: true });
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'DB_ERROR',
				'Failed to fetch low stock items',
				error,
			);
		}
		return (data ?? []) as InventoryItem[];
	},

	async performStockOp(
		itemId: UUID,
		operationType: StockOpType,
		quantityChange: number,
		reason?: string,
		referenceType?: string,
		referenceId?: UUID,
	): Promise<void> {
		const { error } = await supabase.rpc('perform_stock_operation_v1', {
			p_item_id: itemId,
			p_operation_type: operationType,
			p_quantity_change: quantityChange,
			p_reason: reason,
			p_reference_type: referenceType,
			p_reference_id: referenceId,
		});
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'RPC_ERROR',
				'Failed to perform stock operation',
				error,
			);
		}
	},
};
