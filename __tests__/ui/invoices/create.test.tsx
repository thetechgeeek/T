import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateInvoiceScreen from '@/app/(app)/invoices/create';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

// Mock stores and router
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() })),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((cb) => cb()),
}));

const mockInventoryItems = [
	{ id: 'item-1', design_name: 'Marble gold', box_count: 50, selling_price: 1000 },
];

describe('CreateInvoiceScreen', () => {
	const mockReplace = jest.fn();
	const mockCreateInvoice = jest.fn();
	const mockFetchItems = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

		// Mock Inventory Store
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			items: mockInventoryItems,
			fetchItems: mockFetchItems,
			setFilters: jest.fn(),
		});
		jest.mocked(useInventoryStore).getState = jest.fn().mockReturnValue({
			fetchItems: mockFetchItems,
		});

		// Mock Invoice Store
		jest.mocked(useInvoiceStore).getState = jest.fn().mockReturnValue({
			createInvoice: mockCreateInvoice,
		});
		mockCreateInvoice.mockResolvedValue({ id: 'new-inv-123' });
	});

	it('completes the full invoice creation flow', async () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(<CreateInvoiceScreen />);

		// Step 1: Customer Details
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.changeText(getByPlaceholderText('10-digit mobile number'), '9876543210');

		fireEvent.press(getByText('Next'));

		// Step 2: Line Items
		await waitFor(() => expect(getByText('Items')).toBeTruthy());

		fireEvent.press(getByText('+ Add Item'));

		// Search and select item
		fireEvent.changeText(getByPlaceholderText(/search/i), 'Marble');
		fireEvent.press(getByText('Marble gold'));

		// Modal Interaction
		fireEvent.changeText(getByPlaceholderText('Enter quantity'), '10');
		fireEvent.changeText(getByPlaceholderText('Enter discount amount'), '100');

		fireEvent.press(getByText('Confirm'));

		// Check if item added back in Step 2 list
		expect(getByText('Marble gold')).toBeTruthy();
		expect(getByText('10 units @ ₹1000')).toBeTruthy();

		fireEvent.press(getByText('Next'));

		// Step 3: Review & Payment
		await waitFor(() => expect(getByText('Review')).toBeTruthy());

		expect(getByText('Customer: Test Customer')).toBeTruthy();
		// Grand Total: (10 * 1000) - 100 = 9900. Plus 18% GST (1782) = 11682
		expect(getByText('₹11682')).toBeTruthy();

		fireEvent.changeText(getByPlaceholderText('Enter amount paid'), '11682');

		fireEvent.press(getByText('Generate Invoice'));

		await waitFor(() => {
			expect(mockCreateInvoice).toHaveBeenCalledWith(
				expect.objectContaining({
					customer_name: 'Test Customer',
					line_items: expect.arrayContaining([
						expect.objectContaining({
							item_id: 'item-1',
							quantity: 10,
							discount: 100,
						}),
					]),
					amount_paid: 11682,
					payment_status: 'paid',
				}),
			);
		});
		await waitFor(() => {
			expect(mockReplace).toHaveBeenCalledWith('/(app)/invoices/new-inv-123');
		});
	});

	it('Step 1 with empty customer name does NOT advance to Step 2', async () => {
		const { getByText, queryByText, getByPlaceholderText } = renderWithTheme(
			<CreateInvoiceScreen />,
		);

		// Do NOT fill customer name
		fireEvent.press(getByText('Next'));

		// Should still be on Step 1 — next step content not visible
		expect(queryByText('+ Add Item')).toBeNull();
		// Step 1 title or field still visible
		expect(getByPlaceholderText('e.g. Rahul Sharma')).toBeTruthy();
	});

	it('Step 2 with no line items does NOT advance to Step 3', async () => {
		const { getByText, queryByText, getByPlaceholderText } = renderWithTheme(
			<CreateInvoiceScreen />,
		);

		// Fill valid customer data on Step 1
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.press(getByText('Next'));

		await waitFor(() => expect(getByText('Items')).toBeTruthy());

		// Press Next without adding any line items
		fireEvent.press(getByText('Next'));

		// Should still be on Step 2 — Step 3 title not visible
		expect(queryByText('Grand Total')).toBeNull();
		expect(getByText('+ Add Item')).toBeTruthy();
	});

	it('payment_status is unpaid when amount_paid is 0', async () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(<CreateInvoiceScreen />);

		// Step 1
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.press(getByText('Next'));

		// Step 2
		await waitFor(() => expect(getByText('Items')).toBeTruthy());
		fireEvent.press(getByText('+ Add Item'));
		fireEvent.changeText(getByPlaceholderText(/search/i), 'Marble');
		fireEvent.press(getByText('Marble gold'));
		fireEvent.changeText(getByPlaceholderText('Enter quantity'), '5');
		fireEvent.press(getByText('Confirm'));
		fireEvent.press(getByText('Next'));

		// Step 3
		await waitFor(() => expect(getByText('Review')).toBeTruthy());

		// Leave amount_paid at 0 (default)
		fireEvent.press(getByText('Generate Invoice'));

		await waitFor(() => {
			expect(mockCreateInvoice).toHaveBeenCalledWith(
				expect.objectContaining({ payment_status: 'unpaid', amount_paid: 0 }),
			);
		});
	});

	it('shows an alert and prevents adding item if quantity exceeds stock', async () => {
		const { getByText, getByPlaceholderText, queryByText } = renderWithTheme(
			<CreateInvoiceScreen />,
		);

		// Go to Step 2
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.press(getByText('Next'));
		await waitFor(() => expect(getByText('Items')).toBeTruthy());

		fireEvent.press(getByText('+ Add Item'));
		fireEvent.press(getByText('Marble gold'));

		// Enter quantity > stock (mock stock is 50)
		fireEvent.changeText(getByPlaceholderText('Enter quantity'), '60');
		fireEvent.press(getByText('Confirm'));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				'Insufficient Stock',
				expect.stringContaining('50 boxes'),
				expect.any(Array),
			);
		});

		// Verify item was NOT added to the list
		expect(queryByText('60 units @ ₹1000')).toBeNull();
	});

	it('shows an alert when invoice creation fails', async () => {
		const errorMessage = 'Schema error';
		mockCreateInvoice.mockRejectedValue(new Error(errorMessage));

		const { getByText, getByPlaceholderText } = renderWithTheme(<CreateInvoiceScreen />);

		// Step 1
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Test Customer');
		fireEvent.press(getByText('Next'));

		// Step 2
		await waitFor(() => expect(getByText('Items')).toBeTruthy());
		fireEvent.press(getByText('+ Add Item'));
		fireEvent.press(getByText('Marble gold'));
		fireEvent.press(getByText('Confirm'));
		fireEvent.press(getByText('Next'));

		// Step 3
		await waitFor(() => expect(getByText('Review')).toBeTruthy());
		fireEvent.press(getByText('Generate Invoice'));

		await waitFor(() => {
			expect(mockCreateInvoice).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error Creating Invoice',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});
});
