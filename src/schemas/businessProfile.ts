import { z } from 'zod';
import { MAX_LONG_TEXT_CHARS } from '@easydesign/design-system/foundation';

type SchemaTranslator = (key: string) => string;

const DEFAULT_MESSAGES: Record<string, string> = {
	'validation.businessProfile.businessNameRequired': 'Business name is required',
	'validation.businessProfile.invalidGstin': 'Invalid GSTIN format',
	'validation.businessProfile.addressRequired': 'Address is required for GST compliance',
	'validation.businessProfile.cityRequired': 'City is required for GST compliance',
	'validation.businessProfile.stateRequired': 'State is required for GST compliance',
	'validation.businessProfile.invalidPincode': 'Pincode must be 6 digits',
	'validation.businessProfile.invalidPhone': 'Enter a valid 10-digit Indian mobile number',
	'validation.businessProfile.invalidAlternatePhone': 'Enter a valid 10-digit mobile number',
	'validation.businessProfile.invalidEmail': 'Invalid email address',
	'validation.businessProfile.invalidWebsite': 'Invalid website URL',
	'validation.businessProfile.invalidUpi': 'Invalid UPI ID format',
	'validation.businessProfile.invalidIfsc': 'Invalid IFSC format',
	'validation.businessProfile.invoicePrefixRequired': 'Invoice prefix is required',
	'validation.businessProfile.invoicePrefixMax': 'Invoice prefix must be 5 characters or fewer',
};

const defaultT: SchemaTranslator = (key) => DEFAULT_MESSAGES[key] ?? key;

export function getBusinessProfileSchema(t: SchemaTranslator = defaultT) {
	return z.object({
		business_name: z.string().min(1, t('validation.businessProfile.businessNameRequired')),
		gstin: z
			.string()
			.regex(
				/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/,
				t('validation.businessProfile.invalidGstin'),
			)
			.optional()
			.or(z.literal('')),
		address: z.string().min(1, t('validation.businessProfile.addressRequired')),
		city: z.string().min(1, t('validation.businessProfile.cityRequired')),
		state: z.string().min(1, t('validation.businessProfile.stateRequired')),
		state_code: z.string().optional(),
		pincode: z
			.string()
			.regex(/^\d{6}$/, t('validation.businessProfile.invalidPincode'))
			.optional(),
		phone: z
			.string()
			.regex(/^[6-9]\d{9}$/, t('validation.businessProfile.invalidPhone'))
			.optional()
			.or(z.literal('')),
		email: z
			.string()
			.email(t('validation.businessProfile.invalidEmail'))
			.optional()
			.or(z.literal('')),
		website: z
			.string()
			.url(t('validation.businessProfile.invalidWebsite'))
			.optional()
			.or(z.literal('')),
		alternate_phone: z
			.string()
			.regex(/^[6-9]\d{9}$/, t('validation.businessProfile.invalidAlternatePhone'))
			.optional()
			.or(z.literal('')),
		business_description: z.string().max(200).optional().or(z.literal('')),
		logo_url: z.string().optional(),
		signature_url: z.string().optional(),
		upi_id: z
			.string()
			.regex(/^[\w.-]+@[\w.-]+$/, t('validation.businessProfile.invalidUpi'))
			.optional()
			.or(z.literal('')),
		bank_details: z
			.object({
				bank_name: z.string().optional(),
				account_number: z.string().optional(),
				ifsc_code: z
					.string()
					.regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, t('validation.businessProfile.invalidIfsc'))
					.optional()
					.or(z.literal('')),
				holder_name: z.string().optional(),
				branch_name: z.string().optional(),
			})
			.optional(),
		invoice_prefix: z
			.string()
			.min(1, t('validation.businessProfile.invoicePrefixRequired'))
			.max(5, t('validation.businessProfile.invoicePrefixMax')),
		terms_and_conditions: z.string().max(MAX_LONG_TEXT_CHARS).optional(),
	});
}

export const BusinessProfileSchema = getBusinessProfileSchema();

export type BusinessProfileFormInput = z.infer<typeof BusinessProfileSchema>;
