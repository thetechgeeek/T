import { supabase } from '../config/supabase';
import type { UUID } from '../types/common';
import type { Expense, Purchase, ProfitLossReport as ProfitLossSummary } from '../types/finance';

type PurchaseWithSupplier = Purchase & { suppliers: { name: string } | null };

export const financeService = {
	async fetchExpenses(filters: { search?: string; startDate?: string; endDate?: string }) {
		let query = supabase.from('expenses').select('*', { count: 'exact' });

		if (filters.search) {
			query = query.ilike('category', `%${filters.search}%`);
		}
		if (filters.startDate) {
			query = query.gte('expense_date', filters.startDate);
		}
		if (filters.endDate) {
			query = query.lte('expense_date', filters.endDate);
		}

		const { data, error, count } = await query.order('expense_date', { ascending: false });
		if (error) throw error;
		return { data: data as Expense[], count: count || 0 };
	},

	async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
		const { data, error } = await supabase.from('expenses').insert(expense).select().single();
		if (error) throw error;
		return data as Expense;
	},

	async fetchPurchases(filters: { supplierId?: UUID; startDate?: string; endDate?: string }) {
		let query = supabase.from('purchases').select('*, suppliers(name)');

		if (filters.supplierId) {
			query = query.eq('supplier_id', filters.supplierId);
		}
		if (filters.startDate) {
			query = query.gte('purchase_date', filters.startDate);
		}
		if (filters.endDate) {
			query = query.lte('purchase_date', filters.endDate);
		}

		const { data, error } = await query.order('purchase_date', { ascending: false });
		if (error) throw error;

		return (data as PurchaseWithSupplier[]).map((p) => ({
			...p,
			supplier_name: p.suppliers?.name,
		})) as Purchase[];
	},

	async createPurchase(
		purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'supplier_name'>,
	) {
		const { data, error } = await supabase.from('purchases').insert(purchase).select().single();
		if (error) throw error;
		return data as Purchase;
	},

	async getProfitLoss(startDate: string, endDate: string): Promise<ProfitLossSummary> {
		const { data, error } = await supabase
			.rpc('get_profit_loss', {
				p_start: startDate,
				p_end: endDate,
			})
			.single();

		if (error) throw error;
		return data as ProfitLossSummary;
	},
};
