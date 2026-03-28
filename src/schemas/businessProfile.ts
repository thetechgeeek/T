import { z } from 'zod';

export const BusinessProfileSchema = z.object({
	business_name: z.string().min(1, 'Business name is required'),
	gstin: z
		.string()
		.regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/, 'Invalid GSTIN format')
		.optional()
		.or(z.literal('')),
	address: z.string().min(1, 'Address is required for GST compliance'),
	city: z.string().min(1, 'City is required for GST compliance'),
	state: z.string().min(1, 'State is required for GST compliance'),
	state_code: z.string().optional(),
	pincode: z
		.string()
		.regex(/^\d{6}$/, 'Pincode must be 6 digits')
		.optional(),
	phone: z
		.string()
		.regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
		.optional()
		.or(z.literal('')),
	email: z.string().email('Invalid email address').optional().or(z.literal('')),
	invoice_prefix: z
		.string()
		.min(1, 'Invoice prefix is required')
		.max(5, 'Invoice prefix must be 5 characters or fewer'),
	terms_and_conditions: z.string().max(2000).optional(),
});

export type BusinessProfileFormInput = z.infer<typeof BusinessProfileSchema>;
