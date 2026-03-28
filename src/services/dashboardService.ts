import { financeRepository } from '../repositories/financeRepository';
import type { DashboardStats } from '../types/finance';

export const dashboardService = {
	async fetchDashboardStats(): Promise<DashboardStats> {
		return financeRepository.fetchDashboardStats();
	},
};
