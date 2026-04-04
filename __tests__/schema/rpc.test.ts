import { supabase } from '@/src/config/supabase';
import { customerService } from '@/src/services/customerService';
import { financeRepository } from '@/src/repositories/financeRepository';

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		rpc: jest.fn().mockReturnThis(),
		single: jest.fn().mockResolvedValue({ data: {}, error: null }),
		from: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
	},
}));

describe('Schema Integrity: SQL RPC Signature Verification', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('RPC: get_aging_report_v1 should use p_customer_id parameter', async () => {
		const customerId = '00000000-0000-0000-0000-000000000000';
		await customerService.getAgingReport(customerId);

		expect(supabase.rpc).toHaveBeenCalledWith('get_aging_report_v1', {
			p_customer_id: customerId,
		});
	});

	it('RPC: get_profit_loss_v1 should use p_start and p_end parameters', async () => {
		const start = '2024-01-01';
		const end = '2024-01-31';
		await financeRepository.fetchProfitLoss(start, end);

		expect(supabase.rpc).toHaveBeenCalledWith('get_profit_loss_v1', {
			p_start: start,
			p_end: end,
		});
	});

	it('RPC: get_dashboard_stats_v1 should be called without parameters', async () => {
		await financeRepository.fetchDashboardStats();

		expect(supabase.rpc).toHaveBeenCalledWith('get_dashboard_stats_v1');
	});
});
