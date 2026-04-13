import { z } from 'zod';

export const CustomerSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
		gstin: z
			.string()
			.regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/, 'Invalid GSTIN format')
			.optional()
			.or(z.literal('')),
		email: z.string().email('Invalid email address').optional().or(z.literal('')),
		address: z.string().max(500).optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		type: z.enum(['retail', 'contractor', 'builder', 'dealer']),
		credit_limit: z.number().min(0).default(0),
		notes: z.string().optional(),
	})
	.passthrough();

export type CustomerFormInput = z.infer<typeof CustomerSchema>;
