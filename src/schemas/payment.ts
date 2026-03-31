import { z } from 'zod';

export const PaymentSchema = z
	.object({
		amount: z.number().positive('Amount must be positive'),
		payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'credit', 'cheque']),
		direction: z.enum(['received', 'made']),
		payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
		customer_id: z.string().uuid().optional(),
		supplier_id: z.string().uuid().optional(),
		invoice_id: z.string().uuid().optional(),
		purchase_id: z.string().uuid().optional(),
		notes: z.string().max(500).optional(),
	})
	.refine((data) => !(data.customer_id && data.supplier_id), {
		message: 'Payment cannot be linked to both a customer and a supplier',
		path: ['supplier_id'],
	})
	.refine((data) => data.customer_id || data.supplier_id, {
		message: 'Payment must be linked to either a customer or a supplier',
		path: ['customer_id'],
	});

export type PaymentFormInput = z.infer<typeof PaymentSchema>;
