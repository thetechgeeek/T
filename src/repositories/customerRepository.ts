import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Customer } from '../types/customer';

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
			.limit(50);
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'DB_ERROR',
				'Failed to search customers',
				error,
			);
		}
		return (data ?? []) as Customer[];
	},
};
