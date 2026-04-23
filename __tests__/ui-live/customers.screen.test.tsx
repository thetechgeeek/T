import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import CustomersScreen from '@/app/(app)/customers/index';
import CustomerDetailScreen from '@/app/(app)/customers/[id]';
import { customerService } from '@/src/services/customerService';
import { advanceDebounce, renderScreen } from '../utils/screenHarness';

jest.mock('@/src/services/customerService', () => ({
	customerService: {
		fetchCustomers: jest.fn(),
		fetchCustomerById: jest.fn(),
		fetchLedgerEntries: jest.fn(),
		getLedgerSummary: jest.fn(),
		createCustomer: jest.fn(),
		updateCustomer: jest.fn(),
	},
}));

const seededCustomer = {
	id: 'customer-1',
	name: 'Rajesh Tiles',
	phone: '9876543210',
	city: 'Morbi',
	state: 'Gujarat',
	type: 'dealer',
	current_balance: 12500,
};

describe('Customer screens live wiring', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({
			data: [seededCustomer],
			count: 1,
		});
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('loads the customer list via the real store and keeps search filtering wired to the service boundary', async () => {
		const screen = await renderScreen(<CustomersScreen />);

		await waitFor(() => {
			expect(customerService.fetchCustomers).toHaveBeenCalled();
		});

		expect(screen.getByText('Rajesh Tiles')).toBeTruthy();

		fireEvent.changeText(screen.getByLabelText('Search customers...'), 'Rajesh');
		await advanceDebounce(350);

		await waitFor(() => {
			expect(customerService.fetchCustomers).toHaveBeenLastCalledWith(
				expect.objectContaining({ search: 'Rajesh' }),
			);
		});

		fireEvent.press(screen.getByText('Rajesh Tiles'));
		expect(screen.router.push).toHaveBeenCalledWith('/(app)/customers/customer-1');
	});

	it('loads customer detail with the real store and route params', async () => {
		(customerService.fetchCustomerById as jest.Mock).mockResolvedValue(seededCustomer);
		(customerService.fetchLedgerEntries as jest.Mock).mockResolvedValue([
			{
				reference: 'INV-001',
				date: '2026-04-01',
				type: 'invoice',
				debit: 12500,
				credit: 0,
				balance: 12500,
			},
		]);
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue({
			outstanding_balance: 12500,
			total_invoiced: 12500,
			total_paid: 0,
		});

		const screen = await renderScreen(<CustomerDetailScreen />, {
			searchParams: { id: 'customer-1' },
		});

		await waitFor(() => {
			expect(customerService.fetchCustomerById).toHaveBeenCalledWith('customer-1');
		});

		expect(screen.getByText('Rajesh Tiles')).toBeTruthy();
		expect(screen.getByText('INV-001')).toBeTruthy();
		expect(screen.getAllByText('₹12500').length).toBeGreaterThan(0);
	});
});
