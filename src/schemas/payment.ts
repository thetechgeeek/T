import { z } from 'zod';

type SchemaTranslator = (key: string) => string;

const DEFAULT_MESSAGES: Record<string, string> = {
	'validation.payment.amountPositive': 'Amount must be positive',
	'validation.payment.invalidDate': 'Date must be in YYYY-MM-DD format',
	'validation.payment.linkedBoth': 'Payment cannot be linked to both a customer and a supplier',
	'validation.payment.linkedRequired':
		'Payment must be linked to either a customer or a supplier',
};

const defaultT: SchemaTranslator = (key) => DEFAULT_MESSAGES[key] ?? key;

export function getPaymentSchema(t: SchemaTranslator = defaultT) {
	return z
		.object({
			amount: z.number().positive(t('validation.payment.amountPositive')),
			payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'credit', 'cheque']),
			direction: z.enum(['received', 'made']),
			payment_date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/, t('validation.payment.invalidDate')),
			customer_id: z.string().uuid().optional(),
			supplier_id: z.string().uuid().optional(),
			invoice_id: z.string().uuid().optional(),
			purchase_id: z.string().uuid().optional(),
			notes: z.string().max(500).optional(),
		})
		.refine((data) => !(data.customer_id && data.supplier_id), {
			message: t('validation.payment.linkedBoth'),
			path: ['supplier_id'],
		})
		.refine((data) => data.customer_id || data.supplier_id, {
			message: t('validation.payment.linkedRequired'),
			path: ['customer_id'],
		});
}

export const PaymentSchema = getPaymentSchema();

export type PaymentFormInput = z.infer<typeof PaymentSchema>;
