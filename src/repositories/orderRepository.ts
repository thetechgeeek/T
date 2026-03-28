import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Order } from '../types/order';

const base = createRepository<Order>('orders');

export const orderRepository = {
	...base,

	/** Case-insensitive duplicate detection (fixes §orderService.ts:91-94) */
	async findDuplicates(designName: string): Promise<Order[]> {
		const escaped = designName.replace(/[%_\\]/g, (c) => `\\${c}`);
		const { data, error } = await supabase
			.from('inventory_items')
			.select('id, design_name')
			.ilike('design_name', escaped)
			.limit(10);
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'DB_ERROR',
				'Failed to check duplicates',
				error,
			);
		}
		return (data ?? []) as unknown as Order[];
	},
};
