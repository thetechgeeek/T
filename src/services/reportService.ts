import { financeRepository } from '../repositories/financeRepository';
import { customerRepository } from '../repositories/customerRepository';
import type { ProfitLossReport, DashboardStats } from '../types/finance';
import type { AgingBucket } from '../types/customer';

export const reportService = {
	getDashboardStats(): Promise<DashboardStats> {
		return financeRepository.fetchDashboardStats();
	},

	getProfitLoss(start: string, end: string): Promise<ProfitLossReport> {
		return financeRepository.fetchProfitLoss(start, end);
	},

	async getAgingReport(customerId?: string): Promise<AgingBucket[]> {
		return customerRepository.rpc<AgingBucket[]>('get_aging_report_v1', {
			p_customer_id: customerId ?? null,
		});
	},
};
