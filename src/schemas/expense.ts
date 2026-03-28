import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../constants/paymentModes';

const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map((c) => c.value) as [string, ...string[]];

export const ExpenseSchema = z.object({
	amount: z.number().positive('Amount must be positive'),
	category: z.enum(EXPENSE_CATEGORY_VALUES, { message: 'Invalid expense category' }),
	expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
	description: z.string().optional(),
	notes: z.string().max(500).optional(),
	receipt_image_url: z.string().url().optional().or(z.literal('')),
});

export type ExpenseFormInput = z.infer<typeof ExpenseSchema>;
