import { supabase } from '@/src/config/supabase';
import { toAppError } from '@/src/errors/AppError';
import type { ItemCategory, ItemUnit } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';

export const itemCategoryService = {
	async fetchAll() {
		const { data, error } = await supabase
			.from('item_categories')
			.select('*')
			.order('sort_order', { ascending: true })
			.order('name_en', { ascending: true });

		if (error) throw toAppError(error);
		return data as ItemCategory[];
	},

	async create(category: Omit<ItemCategory, 'id' | 'created_at' | 'updated_at'>) {
		const { data, error } = await supabase
			.from('item_categories')
			.insert(category)
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as ItemCategory;
	},

	async update(id: UUID, updates: Partial<ItemCategory>) {
		const { data, error } = await supabase
			.from('item_categories')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as ItemCategory;
	},

	async delete(id: UUID) {
		const { error } = await supabase.from('item_categories').delete().eq('id', id);
		if (error) throw toAppError(error);
		return true;
	},
};

export const itemUnitService = {
	async fetchAll() {
		const { data, error } = await supabase
			.from('item_units')
			.select('*')
			.order('name', { ascending: true });

		if (error) throw toAppError(error);
		return data as ItemUnit[];
	},

	async create(unit: Omit<ItemUnit, 'id' | 'created_at' | 'updated_at'>) {
		const { data, error } = await supabase.from('item_units').insert(unit).select().single();

		if (error) throw toAppError(error);
		return data as ItemUnit;
	},

	async update(id: UUID, updates: Partial<ItemUnit>) {
		const { data, error } = await supabase
			.from('item_units')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as ItemUnit;
	},

	async delete(id: UUID) {
		const { error } = await supabase.from('item_units').delete().eq('id', id);
		if (error) throw toAppError(error);
		return true;
	},
};
