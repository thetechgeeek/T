import { supabase } from '../config/supabase';

export interface BusinessProfileInput {
	business_name: string;
	phone?: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	invoice_prefix?: string;
	invoice_sequence?: number;
}

export const businessProfileService = {
	async upsert(data: BusinessProfileInput): Promise<void> {
		const { error } = await supabase.from('business_profile').upsert(data);
		if (error) throw new Error(error.message);
	},

	async fetch() {
		const { data, error } = await supabase.from('business_profile').select('*').single();
		if (error && error.code !== 'PGRST116') throw new Error(error.message);
		return data;
	},
};
