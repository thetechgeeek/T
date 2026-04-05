import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import CustomerDetailScreen from '@/app/(app)/customers/[id]';
import { useCustomerStore } from '@/src/stores/customerStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

const mockCustomer = {
	id: 'c-123',
	name: 'John Doe',
	current_balance: 1000,
	type: 'wholesale' as const,
};

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'c-123' });

	(useCustomerStore as unknown as jest.Mock).mockReturnValue({
		selectedCustomer: mockCustomer,
		ledger: [],
		summary: { outstanding_balance: 1000, total_invoiced: 1000, total_paid: 0 },
		loading: false,
		fetchCustomerDetail: jest.fn().mockResolvedValue(mockCustomer),
	});
});

describe('CustomerDetail Navigation Wiring', () => {
	it('Press back -> router.back() called', async () => {
		const { getByLabelText } = renderWithTheme(<CustomerDetailScreen />);
		// Assuming there's a back button with this label (standard in our AppHeader/Screen)
		await waitFor(() => expect(getByLabelText('Go back')).toBeTruthy());
		fireEvent.press(getByLabelText('Go back'));
		expect(mockBack).toHaveBeenCalled();
	});

	it('Press "New Invoice" -> navigates to /(app)/invoices/create?customer_id=c-123', async () => {
		const { getByText } = renderWithTheme(<CustomerDetailScreen />);
		await waitFor(() => expect(getByText('New Invoice')).toBeTruthy());
		fireEvent.press(getByText('New Invoice'));
		// Passes customerId as search param in object format
		expect(mockPush).toHaveBeenCalledWith({
			pathname: expect.stringContaining('/invoices/create'),
			params: { customerId: 'c-123' },
		});
	});

	it('Press "Record Payment" -> button exists (Modal trigger)', async () => {
		const { getByText } = renderWithTheme(<CustomerDetailScreen />);
		await waitFor(() => expect(getByText('Record Payment')).toBeTruthy());
	});
});
