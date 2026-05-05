import { z } from 'zod';
import { MAX_LONG_TEXT_CHARS } from '@easydesign/design-system/foundation';
import { CASH_WALK_IN_CUSTOMER_NAME } from '@/src/constants/invoiceCustomer';

type SchemaTranslator = (key: string) => string;

const DEFAULT_MESSAGES: Record<string, string> = {
	'validation.invoice.designNameRequired': 'Design name is required',
	'validation.invoice.quantityPositive': 'Quantity must be a positive number',
	'validation.invoice.ratePositive': 'Rate must be positive',
	'validation.invoice.invalidGstRate': 'Invalid GST rate',
	'validation.invoice.invalidDate': 'Date must be in YYYY-MM-DD format',
	'validation.invoice.customerNameRequired': 'Customer name is required',
	'validation.invoice.invalidGstin': 'Invalid GSTIN format',
	'validation.invoice.lineItemsRequired': 'At least one line item required',
	'validation.invoice.phoneDigits': 'Phone number must contain only digits',
	'validation.invoice.phoneMin': 'Phone number must be at least 10 digits',
};

const defaultT: SchemaTranslator = (key) => DEFAULT_MESSAGES[key] ?? key;

export function getInvoiceLineItemSchema(t: SchemaTranslator = defaultT) {
	return z.object({
		item_id: z.string().uuid().optional(),
		design_name: z.string().min(1, t('validation.invoice.designNameRequired')),
		description: z.string().optional(),
		quantity: z.number().positive(t('validation.invoice.quantityPositive')),
		rate_per_unit: z.number().positive(t('validation.invoice.ratePositive')),
		discount: z.number().min(0).default(0),
		gst_rate: z
			.number()
			.refine((r) => [0, 5, 12, 18, 28].includes(r), t('validation.invoice.invalidGstRate')),
		hsn_code: z.string().optional(),
		tile_image_url: z.string().optional(),
	});
}

export function getInvoiceSchema(t: SchemaTranslator = defaultT) {
	const lineItemSchema = getInvoiceLineItemSchema(t);

	return z
		.object({
			invoice_number: z.string().optional(),
			idempotency_key: z.string().uuid().optional(),
			invoice_date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/, t('validation.invoice.invalidDate')),
			customer_id: z.string().uuid().optional(),
			customer_name: z.string().min(1, t('validation.invoice.customerNameRequired')),
			customer_gstin: z
				.string()
				.regex(
					/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/,
					t('validation.invoice.invalidGstin'),
				)
				.optional()
				.or(z.literal('')),
			customer_phone: z.string(),
			customer_address: z.string().optional(),
			is_inter_state: z.boolean(),
			place_of_supply: z.string().optional(),
			reverse_charge: z.boolean().optional(),
			line_items: z.array(lineItemSchema).min(1, t('validation.invoice.lineItemsRequired')),
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
					message: t('validation.invoice.phoneDigits'),
					path: ['customer_phone'],
				});
				return;
			}
			if (p.length < 10) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('validation.invoice.phoneMin'),
					path: ['customer_phone'],
				});
			}
		});
}

export const InvoiceLineItemSchema = getInvoiceLineItemSchema();
export const InvoiceInputSchema = getInvoiceSchema();

/** Matches `InvoiceInputSchema` phone rules for non–walk-in customers. */
export function isInvoiceCustomerPhoneValid(phone: string | undefined | null): boolean {
	if (phone == null || phone === '') return false;
	return /^\d+$/.test(phone) && phone.length >= 10;
}

export type InvoiceLineItemInput = z.infer<typeof InvoiceLineItemSchema>;
export type InvoiceFormInput = z.infer<typeof InvoiceInputSchema>;
