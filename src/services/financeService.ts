import { supabase } from '../config/supabase';
import type { UUID } from '../types/common';
import type {
	Expense,
	Payment,
	Purchase,
	PurchaseLineItem,
	ProfitLossReport as ProfitLossSummary,
} from '../types/finance';

import { AppError, toAppError } from '../errors/AppError';

type PurchaseWithSupplier = Purchase & { suppliers: { name: string } | null };

export type PurchaseDetail = Purchase & {
	suppliers?: { name: string; phone?: string } | null;
	purchase_line_items?: PurchaseLineItem[];
};

export type PurchasePayment = Payment & {
	customer?: { name: string };
	supplier?: { name: string };
};

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
		if (error) throw toAppError(error);
		return { data: data as Expense[], count: count || 0 };
	},

	async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
		const { data, error } = await supabase.from('expenses').insert(expense).select().single();
		if (error) throw toAppError(error);
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
		if (error) throw toAppError(error);

		return (data as PurchaseWithSupplier[]).map((p) => ({
			...p,
			supplier_name: p.suppliers?.name,
		})) as Purchase[];
	},

	async createPurchase(
		purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'supplier_name'>,
	) {
		const { data, error } = await supabase.from('purchases').insert(purchase).select().single();
		if (error) throw toAppError(error);
		return data as Purchase;
	},

	async fetchPurchaseDetail(id: UUID): Promise<PurchaseDetail> {
		const { data, error } = await supabase
			.from('purchases')
			.select('*, suppliers(name, phone), purchase_line_items(*)')
			.eq('id', id)
			.single();

		if (error) throw toAppError(error);
		return data as PurchaseDetail;
	},

	async fetchPurchasePayments(purchaseId: UUID): Promise<PurchasePayment[]> {
		const { data, error } = await supabase
			.from('payments')
			.select('*')
			.eq('purchase_id', purchaseId)
			.order('payment_date', { ascending: false });

		if (error) throw toAppError(error);
		return (data ?? []) as PurchasePayment[];
	},

	async fetchPurchaseDetailScreenData(id: UUID): Promise<{
		purchase: PurchaseDetail;
		payments: PurchasePayment[];
	}> {
		const [purchase, payments] = await Promise.all([
			this.fetchPurchaseDetail(id),
			this.fetchPurchasePayments(id),
		]);

		return { purchase, payments };
	},

	async deletePurchase(id: UUID): Promise<void> {
		const { error } = await supabase.from('purchases').delete().eq('id', id);
		if (error) throw toAppError(error);
	},

	async getProfitLoss(startDate: string, endDate: string): Promise<ProfitLossSummary> {
		if (startDate > endDate) {
			throw new AppError(
				'Start date cannot be after end date',
				'VALIDATION_ERROR',
				'Invalid date range',
			);
		}

		const { data, error } = await supabase
			.rpc('get_profit_loss_v1', {
				p_start: startDate,
				p_end: endDate,
			})
			.single();

		if (error) throw toAppError(error);
		return (
			(data as ProfitLossSummary) || {
				total_revenue: 0,
				total_expenses: 0,
				net_profit: 0,
			}
		);
	},
};
