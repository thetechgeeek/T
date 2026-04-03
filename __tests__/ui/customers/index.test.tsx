import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CustomersScreen from '@/app/(app)/customers/index';
import { useCustomerStore } from '@/src/stores/customerStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

// Mock store
jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

const mockCustomers = [
	{ id: 'c-1', name: 'John Doe', phone: '1234567890', city: 'Morbi', type: 'retail' },
];

describe('CustomersScreen', () => {
	const mockFetchCustomers = jest.fn();
	const mockSetFilters = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchCustomers.mockResolvedValue(undefined);
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			customers: mockCustomers,
			loading: false,
			fetchCustomers: mockFetchCustomers,
			setFilters: mockSetFilters,
			filters: {},
		});
	});

	it('renders customers correctly', async () => {
		const { getByText } = renderWithTheme(<CustomersScreen />);

		await waitFor(() => {
			expect(getByText('John Doe')).toBeTruthy();
			expect(getByText('1234567890')).toBeTruthy();
		});

		expect(mockFetchCustomers).toHaveBeenCalled();
	});

	it('shows an alert when fetching customers fails', async () => {
		const errorMessage = 'Database error';
		mockFetchCustomers.mockRejectedValue(new Error(errorMessage));

		renderWithTheme(<CustomersScreen />);

		await waitFor(() => {
			expect(mockFetchCustomers).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});

	// ─── Navigation ───────────────────────────────────────────────────────────

	it('pressing "Add Customer" empty-state action navigates to /customers/add', async () => {
		// Render with no customers to show empty state
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			customers: [],
			loading: false,
			fetchCustomers: mockFetchCustomers,
			setFilters: mockSetFilters,
			filters: {},
		});
		const { getByText } = renderWithTheme(<CustomersScreen />);
		await waitFor(() => expect(getByText('Add Customer')).toBeTruthy());
		fireEvent.press(getByText('Add Customer'));
		expect(mockPush).toHaveBeenCalledWith('/customers/add');
	});

	it('pressing a customer row navigates to /customers/:id', async () => {
		const { getByText } = renderWithTheme(<CustomersScreen />);
		await waitFor(() => expect(getByText('John Doe')).toBeTruthy());
		fireEvent.press(getByText('John Doe'));
		expect(mockPush).toHaveBeenCalledWith('/customers/c-1');
	});

	// ─── Phase 3: Loading & Empty UI States ──────────────────────────────────

	it('shows empty state when customers=[] and loading=false', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			customers: [],
			loading: false,
			fetchCustomers: mockFetchCustomers,
			setFilters: mockSetFilters,
			filters: {},
		});

		const { getByText } = renderWithTheme(<CustomersScreen />);
		await waitFor(() => expect(getByText('No customers found')).toBeTruthy());
	});

	it('does NOT show empty state while loading=true', () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			customers: [],
			loading: true,
			fetchCustomers: mockFetchCustomers,
			setFilters: mockSetFilters,
			filters: {},
		});

		const { queryByText } = renderWithTheme(<CustomersScreen />);
		expect(queryByText('No customers found')).toBeNull();
	});
});
