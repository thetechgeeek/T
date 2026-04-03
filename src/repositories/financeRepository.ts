import { supabase } from '../config/supabase';
import { toAppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Expense, Purchase, ProfitLossReport, DashboardStats } from '../types/finance';

const expenseBase = createRepository<Expense>('expenses');
const purchaseBase = createRepository<Purchase>('purchases');

export const financeRepository = {
	expenses: expenseBase,
	purchases: purchaseBase,

	async fetchProfitLoss(startDate: string, endDate: string): Promise<ProfitLossReport> {
		const { data, error } = await supabase
			.rpc('get_profit_loss_v1', { p_start: startDate, p_end: endDate })
			.single();
		if (error) throw toAppError(error);
		return data as ProfitLossReport;
	},

	async fetchDashboardStats(): Promise<DashboardStats> {
		const { data, error } = await supabase.rpc('get_dashboard_stats_v1').single();
		if (error) throw toAppError(error);
		return data as DashboardStats;
	},
};
