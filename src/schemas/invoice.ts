import { z } from 'zod';
import { MAX_LONG_TEXT_CHARS } from '@/theme/uiMetrics';
import { CASH_WALK_IN_CUSTOMER_NAME } from '@/src/constants/invoiceCustomer';

export const InvoiceLineItemSchema = z.object({
	item_id: z.string().uuid().optional(),
	design_name: z.string().min(1, 'Design name is required'),
	quantity: z.number().positive('Quantity must be a positive number'),
	rate_per_unit: z.number().positive('Rate must be positive'),
	discount: z.number().min(0).default(0),
	gst_rate: z.number().refine((r) => [0, 5, 12, 18, 28].includes(r), 'Invalid GST rate'),
	hsn_code: z.string().optional(),
});

export const InvoiceInputSchema = z
	.object({
		idempotency_key: z.string().uuid().optional(),
		invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
		customer_name: z.string().min(1, 'Customer name is required'),
		customer_gstin: z
			.string()
			.regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/, 'Invalid GSTIN format')
			.optional()
			.or(z.literal('')),
		customer_phone: z.string(),
		customer_address: z.string().optional(),
		is_inter_state: z.boolean(),
		place_of_supply: z.string().optional(),
		line_items: z.array(InvoiceLineItemSchema).min(1, 'At least one line item required'),
		payment_status: z.enum(['paid', 'partial', 'unpaid']),
		payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'credit', 'cheque']).optional(),
		amount_paid: z.number().min(0).default(0),
		notes: z
			.string()
			.max(MAX_LONG_TEXT_CHARS / 2)
			.optional(),
		terms: z.string().max(MAX_LONG_TEXT_CHARS).optional(),
	})
	.superRefine((data, ctx) => {
		const walkIn = data.customer_name === CASH_WALK_IN_CUSTOMER_NAME;
		const p = data.customer_phone;
		if (walkIn && p === '') return;
		if (!/^\d+$/.test(p)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Phone number must contain only digits',
				path: ['customer_phone'],
			});
			return;
		}
		if (p.length < 10) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Phone number must be at least 10 digits',
				path: ['customer_phone'],
			});
		}
	});

/** Matches `InvoiceInputSchema` phone rules for non–walk-in customers. */
export function isInvoiceCustomerPhoneValid(phone: string | undefined | null): boolean {
	if (phone == null || phone === '') return false;
	return /^\d+$/.test(phone) && phone.length >= 10;
}

export type InvoiceLineItemInput = z.infer<typeof InvoiceLineItemSchema>;
export type InvoiceFormInput = z.infer<typeof InvoiceInputSchema>;
