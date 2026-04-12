import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import CustomersScreen from '@/app/(app)/customers/index';
import { useCustomerStore } from '@/src/stores/customerStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });

	(useCustomerStore as unknown as jest.Mock).mockReturnValue({
		customers: [],
		loading: false,
		fetchCustomers: jest.fn().mockResolvedValue(undefined),
		setFilters: jest.fn(),
		filters: {},
	});
});

describe('CustomerList Navigation Wiring', () => {
	it('Press add button -> router.push("/(app)/customers/add" as any) called', async () => {
		const { getByLabelText } = renderWithTheme(<CustomersScreen />);
		// FAB might be labelled add-customer-button
		await waitFor(() => expect(getByLabelText('add-customer-button')).toBeTruthy());
		fireEvent.press(getByLabelText('add-customer-button'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/customers/add');
	});

	it('Press customer row -> router.push("/(app)/customers/${id}" as any) called', async () => {
		const mockCustomer = {
			id: 'c-123',
			name: 'John Doe',
			phone: '123',
			type: 'wholesale' as const,
		};
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			customers: [mockCustomer],
			loading: false,
			fetchCustomers: jest.fn().mockResolvedValue(undefined),
			setFilters: jest.fn(),
			filters: {},
		});

		const { getByText } = renderWithTheme(<CustomersScreen />);
		await waitFor(() => expect(getByText('John Doe')).toBeTruthy());
		fireEvent.press(getByText('John Doe'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/customers/c-123');
	});
});
