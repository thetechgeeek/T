import { z } from 'zod';

export const InvoiceLineItemSchema = z.object({
	item_id: z.string().uuid().optional(),
	design_name: z.string().min(1, 'Design name is required'),
	quantity: z.number().positive('Quantity must be a positive number'),
	rate_per_unit: z.number().positive('Rate must be positive'),
	discount: z.number().min(0).default(0),
	gst_rate: z.number().refine((r) => [0, 5, 12, 18, 28].includes(r), 'Invalid GST rate'),
	hsn_code: z.string().optional(),
});

export const InvoiceInputSchema = z.object({
	idempotency_key: z.string().uuid().optional(),
	invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
	customer_name: z.string().min(1, 'Customer name is required'),
	customer_gstin: z
		.string()
		.regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/, 'Invalid GSTIN format')
		.optional()
		.or(z.literal('')),
	customer_phone: z
		.string()
		.min(10, 'Phone number must be at least 10 digits')
		.regex(/^\d+$/, 'Phone number must contain only digits'),
	customer_address: z.string().optional(),
	is_inter_state: z.boolean(),
	place_of_supply: z.string().optional(),
	line_items: z.array(InvoiceLineItemSchema).min(1, 'At least one line item required'),
	payment_status: z.enum(['paid', 'partial', 'unpaid']),
	payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'credit', 'cheque']).optional(),
	amount_paid: z.number().min(0).default(0),
	notes: z.string().max(1000).optional(),
	terms: z.string().max(2000).optional(),
});

export type InvoiceLineItemInput = z.infer<typeof InvoiceLineItemSchema>;
export type InvoiceFormInput = z.infer<typeof InvoiceInputSchema>;
