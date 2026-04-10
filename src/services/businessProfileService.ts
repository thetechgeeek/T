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

export interface BusinessProfile extends BusinessProfileInput {
	id: string;
}

export const businessProfileService = {
	async upsert(data: BusinessProfileInput): Promise<void> {
		const existing = (await this.fetch()) as BusinessProfile | null;
		const doc = existing ? { ...data, id: existing.id } : data;
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

	/** Alias for fetch — used in auth flow to check if profile exists */
	async get() {
		return this.fetch();
	},
};
