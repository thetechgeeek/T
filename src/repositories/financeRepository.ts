import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Expense, Purchase, ProfitLossReport, DashboardStats } from '../types/finance';

const expenseBase = createRepository<Expense>('expenses');
const purchaseBase = createRepository<Purchase>('purchases');

export const financeRepository = {
	expenses: expenseBase,
	purchases: purchaseBase,

	async fetchProfitLoss(startDate: string, endDate: string): Promise<ProfitLossReport> {
		const { data, error } = await supabase
			.rpc('get_profit_loss', { p_start: startDate, p_end: endDate })
			.single();
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'RPC_ERROR',
				'Failed to fetch profit/loss report',
				error,
			);
		}
		return data as ProfitLossReport;
	},

	async fetchDashboardStats(): Promise<DashboardStats> {
		const { data, error } = await supabase.rpc('get_dashboard_stats').single();
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'RPC_ERROR',
				'Failed to fetch dashboard stats',
				error,
			);
		}
		return data as DashboardStats;
	},
};
