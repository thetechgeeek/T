import { reportService } from './reportService';
import { financeRepository } from '../repositories/financeRepository';
import { customerRepository } from '../repositories/customerRepository';

jest.mock('../repositories/financeRepository', () => ({
	financeRepository: {
		fetchDashboardStats: jest.fn(),
		fetchProfitLoss: jest.fn(),
	},
}));

jest.mock('../repositories/customerRepository', () => ({
	customerRepository: {
		rpc: jest.fn(),
	},
}));

describe('reportService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getDashboardStats', () => {
		it('delegates to financeRepository.fetchDashboardStats', async () => {
			const mockStats = {
				today_sales: 1000,
				outstanding_credit: 5000,
				low_stock_count: 2,
				monthly_revenue: 50000,
			};
			(financeRepository.fetchDashboardStats as jest.Mock).mockResolvedValue(mockStats);

			const result = await reportService.getDashboardStats();

			expect(financeRepository.fetchDashboardStats).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockStats);
		});
	});

	describe('getProfitLoss', () => {
		it('delegates to financeRepository.fetchProfitLoss with correct dates', async () => {
			const mockReport = { total_revenue: 100000, net_profit: 20000, total_expenses: 80000 };
			(financeRepository.fetchProfitLoss as jest.Mock).mockResolvedValue(mockReport);

			const result = await reportService.getProfitLoss('2026-01-01', '2026-03-31');

			expect(financeRepository.fetchProfitLoss).toHaveBeenCalledWith(
				'2026-01-01',
				'2026-03-31',
			);
			expect(result).toEqual(mockReport);
		});
	});

	describe('getAgingReport', () => {
		it('calls customerRepository.rpc with get_aging_report_v1 and null customerId when omitted', async () => {
			const mockBuckets = [{ label: '0-30', amount: 5000 }];
			(customerRepository.rpc as jest.Mock).mockResolvedValue(mockBuckets);

			const result = await reportService.getAgingReport();

			expect(customerRepository.rpc).toHaveBeenCalledWith('get_aging_report_v1', {
				p_customer_id: null,
			});
			expect(result).toEqual(mockBuckets);
		});

		it('passes customerId when provided', async () => {
			const customerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
			(customerRepository.rpc as jest.Mock).mockResolvedValue([]);

			await reportService.getAgingReport(customerId);

			expect(customerRepository.rpc).toHaveBeenCalledWith('get_aging_report_v1', {
				p_customer_id: customerId,
			});
		});
	});
});
