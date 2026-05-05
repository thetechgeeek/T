import { z } from 'zod';
import type { InventoryItem, InventoryItemInsert, TileCategory } from '@/src/types/inventory';

export const INVENTORY_ADD_CATEGORIES: Exclude<TileCategory, 'ALL'>[] = [
	'GLOSSY',
	'FLOOR',
	'MATT',
	'SATIN',
	'WOODEN',
	'ELEVATION',
	'OTHER',
];

export const INVENTORY_ADD_GST_RATES = ['0', '5', '12', '18', '28'] as const;

export const INVENTORY_PRIMARY_UNITS = [
	'Pcs',
	'Box',
	'Kg',
	'Meter',
	'Sq.ft',
	'Sq.meter',
	'Set',
] as const;

export const getInventoryAddSchema = (t: (key: string) => string) =>
	z.object({
		design_name: z.string().min(1, t('common.required')),
		item_code: z.string().optional(),
		category: z.enum(INVENTORY_ADD_CATEGORIES),
		custom_category: z.string().optional(),
		item_description: z.string().max(500).optional(),
		selling_price: z.string().min(1, t('common.required')),
		cost_price: z.string().optional(),
		mrp: z.string().optional(),
		default_discount_pct: z.string().optional(),
		gst_rate: z.string().min(1, t('common.required')),
		hsn_code: z.string().optional(),
		track_stock: z.boolean(),
		primary_unit: z.string().optional(),
		box_count: z.string().optional(),
		has_batch_tracking: z.boolean(),
		has_serial_tracking: z.boolean(),
		low_stock_threshold: z.string().optional(),
		use_secondary_unit: z.boolean(),
		secondary_unit_name: z.string().optional(),
		secondary_unit_conversion: z.string().optional(),
		size_name: z.string().optional(),
		brand_name: z.string().optional(),
		pcs_per_box: z.string().optional(),
		sqft_per_box: z.string().optional(),
	});

export type InventoryAddFormData = z.infer<ReturnType<typeof getInventoryAddSchema>>;

export type InventoryItemDraftPayload = InventoryItemInsert & {
	track_stock: boolean;
	primary_unit: string;
	secondary_unit_name?: string;
	secondary_unit_conversion?: number;
};

export const INVENTORY_ADD_DEFAULT_VALUES: InventoryAddFormData = {
	design_name: '',
	item_code: '',
	category: 'GLOSSY',
	custom_category: '',
	item_description: '',
	selling_price: '',
	cost_price: '',
	mrp: '',
	default_discount_pct: '',
	gst_rate: '18',
	hsn_code: '6908',
	track_stock: true,
	primary_unit: 'Box',
	box_count: '0',
	has_batch_tracking: false,
	has_serial_tracking: false,
	low_stock_threshold: '5',
	use_secondary_unit: false,
	secondary_unit_name: '',
	secondary_unit_conversion: '',
	size_name: '',
	brand_name: '',
	pcs_per_box: '',
	sqft_per_box: '',
};

export function generateInventoryItemCode(
	now = new Date(),
	random: () => number = Math.random,
): string {
	const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
		now.getDate(),
	).padStart(2, '0')}`;
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let rand = '';
	for (let i = 0; i < 4; i += 1) {
		rand += chars.charAt(Math.floor(random() * chars.length));
	}
	return `${datePart}-${rand}`;
}

export function buildInventoryAddFormValues(item: InventoryItem): InventoryAddFormData {
	return {
		...INVENTORY_ADD_DEFAULT_VALUES,
		design_name: item.design_name,
		category: (item.category === 'ALL' || !item.category ? 'OTHER' : item.category) as Exclude<
			TileCategory,
			'ALL'
		>,
		custom_category: item.custom_category || '',
		item_description: item.notes || '',
		selling_price: item.selling_price.toString(),
		cost_price: item.cost_price?.toString() || '',
		gst_rate: item.gst_rate.toString(),
		hsn_code: item.hsn_code || '6908',
		box_count: item.box_count.toString(),
		low_stock_threshold: item.low_stock_threshold.toString(),
		size_name: item.size_name || '',
		brand_name: item.brand_name || '',
		pcs_per_box: item.pcs_per_box?.toString() || '',
		sqft_per_box: item.sqft_per_box?.toString() || '',
	};
}

export function buildInventoryItemPayload(data: InventoryAddFormData): InventoryItemDraftPayload {
	return {
		design_name: data.design_name,
		category: data.category,
		size_name: data.size_name || undefined,
		brand_name: data.brand_name || undefined,
		pcs_per_box: data.pcs_per_box ? parseInt(data.pcs_per_box, 10) : undefined,
		sqft_per_box: data.sqft_per_box ? parseFloat(data.sqft_per_box) : undefined,
		box_count: data.track_stock ? parseFloat(data.box_count || '0') || 0 : 0,
		has_batch_tracking: false,
		has_serial_tracking: false,
		selling_price: parseFloat(data.selling_price) || 0,
		cost_price: parseFloat(data.cost_price || '0') || 0,
		low_stock_threshold: data.track_stock
			? parseInt(data.low_stock_threshold || '5', 10) || 5
			: 0,
		gst_rate: parseInt(data.gst_rate, 10) || 18,
		hsn_code: data.hsn_code || '6908',
		notes: data.item_description || undefined,
		item_code: data.item_code || undefined,
		mrp: data.mrp ? parseFloat(data.mrp) : undefined,
		default_discount_pct: data.default_discount_pct
			? parseFloat(data.default_discount_pct)
			: undefined,
		track_stock: data.track_stock,
		primary_unit: data.primary_unit || 'Box',
		secondary_unit_name: data.use_secondary_unit
			? data.secondary_unit_name || undefined
			: undefined,
		secondary_unit_conversion: data.use_secondary_unit
			? data.secondary_unit_conversion
				? parseFloat(data.secondary_unit_conversion)
				: undefined
			: undefined,
	};
}
