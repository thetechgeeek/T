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
		const existing = await this.fetch();
		const doc = existing ? { ...data, id: (existing as any).id } : data;
		const { error } = await supabase.from('business_profile').upsert(doc);
		if (error) throw new Error(error.message);
	},

	async fetch() {
		const { data, error } = await supabase
			.from('business_profile')
			.select('*')
			.limit(1)
			.maybeSingle();
		if (error && error.code !== 'PGRST116') throw new Error(error.message);
		return data;
	},
};
