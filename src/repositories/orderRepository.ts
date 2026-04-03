import { supabase } from '../config/supabase';
import { toAppError } from '../errors';
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
		if (error) throw toAppError(error);
		return (data ?? []) as unknown as Order[];
	},
};
