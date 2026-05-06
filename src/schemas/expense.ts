import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../constants/paymentModes';

const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map((c) => c.value) as [string, ...string[]];

type SchemaTranslator = (key: string) => string;

const DEFAULT_MESSAGES: Record<string, string> = {
	'validation.expense.amountPositive': 'Amount must be positive',
	'validation.expense.invalidCategory': 'Invalid expense category',
	'validation.expense.invalidDate': 'Date must be in YYYY-MM-DD format',
};

const defaultT: SchemaTranslator = (key) => DEFAULT_MESSAGES[key] ?? key;

export function getExpenseSchema(t: SchemaTranslator = defaultT) {
	return z.object({
		amount: z.number().positive(t('validation.expense.amountPositive')),
		category: z.enum(EXPENSE_CATEGORY_VALUES, {
			message: t('validation.expense.invalidCategory'),
		}),
		expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('validation.expense.invalidDate')),
		description: z.string().optional(),
		notes: z.string().max(500).optional(),
		receipt_image_url: z.string().url().optional().or(z.literal('')),
	});
}

export const ExpenseSchema = getExpenseSchema();

export type ExpenseFormInput = z.infer<typeof ExpenseSchema>;
