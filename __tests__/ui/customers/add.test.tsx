import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddCustomerScreen from '@/app/(app)/customers/add';
import { useCustomerStore } from '@/src/stores/customerStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock the customer store
jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

describe('AddCustomerScreen', () => {
	const mockCreateCustomer = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			createCustomer: mockCreateCustomer,
			loading: false,
		});
	});

	it('renders correctly', () => {
		const { getByPlaceholderText, getByText } = renderWithTheme(<AddCustomerScreen />);

		expect(getByPlaceholderText('e.g. Rahul Sharma')).toBeTruthy();
		expect(getByText('Basic Info')).toBeTruthy();
		expect(getByText('Credit & Balance')).toBeTruthy();
		expect(getByText('Save Customer')).toBeTruthy();
	});

	it('shows an alert when customer creation fails', async () => {
		const errorMessage = "Could not find the table 'public.customers' in the schema cache";
		mockCreateCustomer.mockRejectedValue(new Error(errorMessage));

		const { getByPlaceholderText, getByText } = renderWithTheme(<AddCustomerScreen />);

		// Fill in required fields
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.changeText(getByPlaceholderText('10-digit mobile number'), '9876543210');

		// Submit form
		fireEvent.press(getByText('Save Customer'));

		await waitFor(() => {
			expect(mockCreateCustomer).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error Saving Customer',
				errorMessage,
				expect.any(Array),
			);
		});
	});

	it('successfully creates a customer and navigates back', async () => {
		mockCreateCustomer.mockResolvedValue({ id: '123', name: 'Test Customer' });

		const { getByPlaceholderText, getByText } = renderWithTheme(<AddCustomerScreen />);

		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.changeText(getByPlaceholderText('10-digit mobile number'), '9876543210');
		fireEvent.press(getByText('Save Customer'));

		await waitFor(() => {
			expect(mockCreateCustomer).toHaveBeenCalled();
			expect(Alert.alert).not.toHaveBeenCalled();
		});
	});
});
