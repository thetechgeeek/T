import { waitFor } from '@testing-library/react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { eventBus } from '@/src/events/appEvents';
import { customerService } from '@/src/services/customerService';

jest.mock('@/src/services/customerService');

/**
 * Phase 7: Cross-Screen State
 * Verifies that recording a payment refreshes the customer's detailed ledger/summary
 * if they are currently the active ("selected") customer in the store.
 */
describe('Cross-Screen Sync: Payment to Customer Detail', () => {
	const customerId = 'cust-123';

	beforeEach(() => {
		jest.clearAllMocks();
		useCustomerStore.getState().reset();

		// Set a "selected" customer to simulate being on the Customer Detail screen
		useCustomerStore.setState({
			selectedCustomer: { id: customerId, name: 'Test Customer' } as any,
		});
	});

	it('refreshes customer ledger and summary when a payment is recorded for that customer', async () => {
		// Mock the refresh responses
		(customerService.fetchCustomerById as jest.Mock).mockResolvedValue({
			id: customerId,
			name: 'Test Customer',
		});
		(customerService.fetchLedgerEntries as jest.Mock).mockResolvedValue([
			{ id: 'pay-1', type: 'payment', amount: 500 },
		]);
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue({
			outstanding_balance: 500,
		});

		// 1. Manually emit the payment event (simulating a successful payment recording from anywhere in the app)
		eventBus.emit({
			type: 'PAYMENT_RECORDED',
			paymentId: 'pay-1',
			customerId: customerId,
		});

		// 2. Verify that customer ledger refresh was triggered via EventBus
		await waitFor(() => {
			expect(customerService.fetchCustomerById).toHaveBeenCalledWith(customerId);
			expect(customerService.fetchLedgerEntries).toHaveBeenCalledWith(customerId);
			expect(customerService.getLedgerSummary).toHaveBeenCalledWith(customerId);
		});

		// 3. Verify store state update
		expect(useCustomerStore.getState().summary?.outstanding_balance).toBe(500);
		expect(useCustomerStore.getState().ledger).toHaveLength(1);
	});

	it('does NOT refresh ledger if payment is for a different customer', async () => {
		// 1. Emit event for a DIFFERENT customer
		eventBus.emit({
			type: 'PAYMENT_RECORDED',
			paymentId: 'pay-2',
			customerId: 'other-customer',
		});

		// 2. Should NOT have refreshed the active ledger for 'cust-123'
		expect(customerService.fetchCustomerById).not.toHaveBeenCalled();
	});
});
