import type { UUID } from './common';

export interface BusinessProfile {
	id: UUID;
	business_name: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	state_code?: string;
	phone?: string;
	email?: string;
	website?: string;
	alternate_phone?: string;
	business_description?: string;
	logo_url?: string;
	signature_url?: string;
	upi_id?: string;
	bank_details?: {
		bank_name?: string;
		account_number?: string;
		ifsc_code?: string;
		holder_name?: string;
		branch_name?: string;
	};
	invoice_prefix: string;
	invoice_sequence: number;
	last_invoice_fy?: string;
	financial_year_start?: string;
	terms_and_conditions?: string;
	created_at: string;
	updated_at: string;
}
