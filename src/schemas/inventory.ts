import { z } from 'zod';
import { TILE_CATEGORIES } from '../constants/categories';

const TILE_CATEGORY_VALUES = TILE_CATEGORIES.map((c) => c.value) as [string, ...string[]];

type SchemaTranslator = (key: string) => string;

const DEFAULT_MESSAGES: Record<string, string> = {
	'validation.inventory.designNameRequired': 'Design name is required',
	'validation.inventory.invalidTileCategory': 'Invalid tile category',
	'validation.inventory.stockNonNegative': 'Stock cannot be negative',
	'validation.inventory.costPricePositive': 'Cost price must be positive',
	'validation.inventory.sellingPricePositive': 'Selling price must be positive',
	'validation.inventory.invalidGstRate': 'Invalid GST rate',
	'validation.inventory.lowStockThresholdNonNegative': 'Low stock threshold cannot be negative',
};

const defaultT: SchemaTranslator = (key) => DEFAULT_MESSAGES[key] ?? key;

export function getInventorySchema(t: SchemaTranslator = defaultT) {
	return z.object({
		design_name: z.string().min(1, t('validation.inventory.designNameRequired')),
		base_item_number: z.string().optional(),
		category: z.enum(TILE_CATEGORY_VALUES as [string, ...string[]], {
			message: t('validation.inventory.invalidTileCategory'),
		}),
		size: z.string().optional(),
		finish: z.string().optional(),
		box_count: z.number().min(0, t('validation.inventory.stockNonNegative')),
		has_batch_tracking: z.boolean().default(false),
		has_serial_tracking: z.boolean().default(false),
		pieces_per_box: z.number().positive().optional(),
		coverage_per_box: z.number().positive().optional(),
		cost_price: z.number().positive(t('validation.inventory.costPricePositive')),
		selling_price: z.number().positive(t('validation.inventory.sellingPricePositive')),
		gst_rate: z
			.number()
			.refine(
				(r) => [0, 5, 12, 18, 28].includes(r),
				t('validation.inventory.invalidGstRate'),
			),
		hsn_code: z.string().optional(),
		low_stock_threshold: z
			.number()
			.int()
			.min(0, t('validation.inventory.lowStockThresholdNonNegative')),
		supplier_id: z.string().uuid().optional(),
		notes: z.string().optional(),
	});
}

export const InventoryItemSchema = getInventorySchema();

export type InventoryItemFormInput = z.infer<typeof InventoryItemSchema>;
