import { ConflictError } from '@/src/errors/AppError';
import { inventoryService } from '@/src/services/inventoryService';
import type { UUID } from '@/src/types/common';
import type { InventoryItem, InventoryItemInsert } from '@/src/types/inventory';

export interface InventoryConflictSnapshot {
	localItem: InventoryItem;
	serverItem: InventoryItem;
}

export function isInventoryVersionConflict(error: unknown): error is ConflictError {
	return error instanceof ConflictError && error.message === 'VERSION_CONFLICT';
}

export async function buildInventoryConflictSnapshot(
	id: UUID,
	localItem: InventoryItem,
	fetchItemById: (itemId: UUID) => Promise<InventoryItem> = inventoryService.fetchItemById,
): Promise<InventoryConflictSnapshot> {
	return {
		localItem,
		serverItem: await fetchItemById(id),
	};
}

export function buildKeepMineResolutionUpdates(
	localItem: InventoryItem,
): Partial<InventoryItemInsert> {
	return {
		design_name: localItem.design_name,
		selling_price: localItem.selling_price,
		cost_price: localItem.cost_price,
		category: localItem.category,
		gst_rate: localItem.gst_rate,
		hsn_code: localItem.hsn_code,
		notes: localItem.notes,
		size_name: localItem.size_name,
		brand_name: localItem.brand_name,
		pcs_per_box: localItem.pcs_per_box,
		sqft_per_box: localItem.sqft_per_box,
		box_count: localItem.box_count,
		has_batch_tracking: false,
		has_serial_tracking: false,
		low_stock_threshold: localItem.low_stock_threshold,
	};
}
