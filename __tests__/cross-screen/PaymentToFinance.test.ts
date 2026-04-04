import { waitFor } from '@testing-library/react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { financeService } from '@/src/services/financeService';
import { eventBus } from '@/src/events/appEvents';

jest.mock('@/src/services/financeService');

describe('Cross-Screen Sync: Payment to Finance', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Initialize with default dateRange
		useFinanceStore.setState({ summary: null, loading: false });
	});

	it('refreshes profit/loss summary when a payment is recorded', async () => {
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue({
			total_income: 1000,
			total_expense: 200,
			net_profit: 800,
		});

		// 1. Simulate a payment being recorded (which emits the event)
		eventBus.emit({ type: 'PAYMENT_RECORDED', paymentId: 'p-1' });

		// 2. Verify that Finance Store automatically re-fetched summary
		await waitFor(() => {
			expect(financeService.getProfitLoss).toHaveBeenCalled();
		});

		expect(useFinanceStore.getState().summary?.net_profit).toBe(800);
	});
});
