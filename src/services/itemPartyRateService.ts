import { supabase } from '@/src/config/supabase';
import { toAppError } from '@/src/errors/AppError';
import type { ItemPartyRate } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';

export const itemPartyRateService = {
	/**
	 * Fetch all custom rates for a specific item
	 */
	async fetchByItem(itemId: UUID) {
		const { data, error } = await supabase
			.from('item_party_rates')
			.select('*, customers(name), suppliers(name)')
			.eq('item_id', itemId);

		if (error) throw toAppError(error);
		return data;
	},

	/**
	 * Fetch a custom rate for a specific item and customer
	 */
	async fetchForCustomer(itemId: UUID, customerId: UUID) {
		const { data, error } = await supabase
			.from('item_party_rates')
			.select('*')
			.eq('item_id', itemId)
			.eq('customer_id', customerId)
			.maybeSingle();

		if (error) throw toAppError(error);
		return data as ItemPartyRate | null;
	},

	/**
	 * Create or update a party rate
	 */
	async upsertRate(rate: Omit<ItemPartyRate, 'id' | 'created_at' | 'updated_at'>) {
		const { data, error } = await supabase
			.from('item_party_rates')
			.upsert(rate)
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as ItemPartyRate;
	},

	/**
	 * Delete a party rate
	 */
	async deleteRate(id: UUID) {
		const { error } = await supabase.from('item_party_rates').delete().eq('id', id);

		if (error) throw toAppError(error);
		return true;
	},
};
