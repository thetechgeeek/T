import { supabase } from '../../config/supabase';
import { makeDashboardStats } from '../../../../__tests__/fixtures/financeFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

import { financeRepository } from '../financeRepository';

const mockRpc = supabase.rpc as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('financeRepository.fetchDashboardStats', () => {
	it('calls rpc(get_dashboard_stats_v1) and returns stats object', async () => {
		const stats = makeDashboardStats();
		// financeRepository.fetchDashboardStats calls supabase.rpc(...).single()
		mockRpc.mockReturnValue({
			single: jest.fn().mockResolvedValue({ data: stats, error: null }),
		});

		const result = await financeRepository.fetchDashboardStats();

		expect(mockRpc).toHaveBeenCalledWith('get_dashboard_stats_v1');
		expect(result).toEqual(stats);
	});

	it('throws AppError when RPC returns an error', async () => {
		mockRpc.mockReturnValue({
			single: jest.fn().mockResolvedValue({ data: null, error: { message: 'RPC error', code: 'P0001' } }),
		});

		await expect(financeRepository.fetchDashboardStats()).rejects.toMatchObject({
			message: 'RPC error',
		});
	});
});

describe('financeRepository.fetchProfitLoss', () => {
	it('calls rpc(get_profit_loss_v1, { p_start, p_end })', async () => {
		const mockReport = { total_revenue: 100000, net_profit: 20000, total_expenses: 5000 };
		mockRpc.mockReturnValue({
			single: jest.fn().mockResolvedValue({ data: mockReport, error: null }),
		});

		const result = await financeRepository.fetchProfitLoss('2026-01-01', '2026-03-31');

		expect(mockRpc).toHaveBeenCalledWith('get_profit_loss_v1', {
			p_start: '2026-01-01',
			p_end: '2026-03-31',
		});
		expect(result).toEqual(mockReport);
	});
});
