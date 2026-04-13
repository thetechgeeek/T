import { supabase } from '../config/supabase';
import { toAppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Customer } from '../types/customer';
import { DB_SEARCH_LIMIT } from '@/theme/uiMetrics';

const base = createRepository<Customer>('customers');

export const customerRepository = {
	...base,

	/** Search on both name AND phone (fixes §customerService.ts:19) */
	async search(term: string): Promise<Customer[]> {
		const escaped = term.replace(/[%_\\]/g, (c) => `\\${c}`);
		const { data, error } = await supabase
			.from('customers')
			.select('*')
			.or(`name.ilike.%${escaped}%,phone.ilike.%${escaped}%`)
			.order('name', { ascending: true })
			.limit(DB_SEARCH_LIMIT);
		if (error) throw toAppError(error);
		return (data ?? []) as Customer[];
	},
};
