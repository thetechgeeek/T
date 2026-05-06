import { z } from 'zod';

type SchemaTranslator = (key: string) => string;

const DEFAULT_MESSAGES: Record<string, string> = {
	'validation.customer.nameRequired': 'Name is required',
	'validation.customer.invalidPhone': 'Enter a valid 10-digit Indian mobile number',
	'validation.customer.invalidGstin': 'Invalid GSTIN format',
	'validation.customer.invalidEmail': 'Invalid email address',
};

const defaultT: SchemaTranslator = (key) => DEFAULT_MESSAGES[key] ?? key;

export function getCustomerSchema(t: SchemaTranslator = defaultT) {
	return z
		.object({
			name: z.string().min(1, t('validation.customer.nameRequired')),
			phone: z.string().regex(/^[6-9]\d{9}$/, t('validation.customer.invalidPhone')),
			gstin: z
				.string()
				.regex(
					/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/,
					t('validation.customer.invalidGstin'),
				)
				.optional()
				.or(z.literal('')),
			email: z
				.string()
				.email(t('validation.customer.invalidEmail'))
				.optional()
				.or(z.literal('')),
			address: z.string().max(500).optional(),
			city: z.string().optional(),
			state: z.string().optional(),
			type: z.enum(['retail', 'contractor', 'builder', 'dealer']),
			credit_limit: z.number().min(0).default(0),
			notes: z.string().optional(),
		})
		.passthrough();
}

export const CustomerSchema = getCustomerSchema();

export type CustomerFormInput = z.infer<typeof CustomerSchema>;
