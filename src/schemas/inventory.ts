import { z } from 'zod';
import { TILE_CATEGORIES } from '../constants/categories';

const TILE_CATEGORY_VALUES = TILE_CATEGORIES.map((c) => c.value) as [string, ...string[]];

export const InventoryItemSchema = z.object({
	design_name: z.string().min(1, 'Design name is required'),
	base_item_number: z.string().optional(),
	category: z.enum(TILE_CATEGORY_VALUES as [string, ...string[]], {
		message: 'Invalid tile category',
	}),
	size: z.string().optional(),
	finish: z.string().optional(),
	box_count: z.number().min(0, 'Stock cannot be negative'),
	pieces_per_box: z.number().positive().optional(),
	coverage_per_box: z.number().positive().optional(),
	cost_price: z.number().positive('Cost price must be positive'),
	selling_price: z.number().positive('Selling price must be positive'),
	gst_rate: z.number().refine((r) => [0, 5, 12, 18, 28].includes(r), 'Invalid GST rate'),
	hsn_code: z.string().optional(),
	low_stock_threshold: z.number().int().min(0, 'Low stock threshold cannot be negative'),
	supplier_id: z.string().uuid().optional(),
	notes: z.string().optional(),
});

export type InventoryItemFormInput = z.infer<typeof InventoryItemSchema>;
