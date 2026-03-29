import { dashboardService } from './dashboardService';
import { financeRepository } from '../repositories/financeRepository';

jest.mock('../repositories/financeRepository', () => ({
	financeRepository: {
		fetchDashboardStats: jest.fn(),
	},
}));

describe('dashboardService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('fetchDashboardStats', () => {
		it('delegates to financeRepository.fetchDashboardStats', async () => {
			const mockStats = {
				today_sales: 5000,
				outstanding_credit: 12000,
				low_stock_count: 3,
				monthly_revenue: 80000,
			};
			(financeRepository.fetchDashboardStats as jest.Mock).mockResolvedValue(mockStats);

			const result = await dashboardService.fetchDashboardStats();

			expect(financeRepository.fetchDashboardStats).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockStats);
		});

		it('propagates errors from the repository', async () => {
			(financeRepository.fetchDashboardStats as jest.Mock).mockRejectedValue(
				new Error('RPC failed'),
			);

			await expect(dashboardService.fetchDashboardStats()).rejects.toThrow('RPC failed');
		});
	});
});
