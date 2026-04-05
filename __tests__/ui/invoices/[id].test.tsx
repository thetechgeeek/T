import React from 'react';
import { waitFor } from '@testing-library/react-native';
import InvoiceDetailScreen from '@/app/(app)/invoices/[id]';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useLocalSearchParams } from 'expo-router';

// Mock store and router
jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
	useLocalSearchParams: jest.fn(() => ({ id: 'inv-123' })),
	useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((cb) => cb()),
}));

const mockInvoice = {
	id: 'inv-123',
	invoice_number: 'TM/2026-27/0001',
	invoice_date: '2026-03-22',
	customer_name: 'Test Customer',
	subtotal: 9900,
	cgst_total: 891,
	sgst_total: 891,
	grand_total: 11682,
	amount_paid: 11682,
	payment_status: 'paid',
	payment_mode: 'upi',
	line_items: [
		{
			id: 'li-1',
			design_name: 'Marble gold',
			quantity: 10,
			rate_per_unit: 1000,
			line_total: 11682,
		},
	],
};

const mockFetchInvoiceById = jest.fn();
const mockClearCurrentInvoice = jest.fn();

describe('InvoiceDetailScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'inv-123' });
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			currentInvoice: mockInvoice,
			fetchInvoiceById: mockFetchInvoiceById,
			loading: false,
			error: null,
			clearCurrentInvoice: mockClearCurrentInvoice,
		});
	});

	it('renders invoice details correctly', async () => {
		const { getByText, getAllByText } = renderWithTheme(<InvoiceDetailScreen />);

		await waitFor(() => {
			expect(getByText('TM/2026-27/0001')).toBeTruthy();
			expect(getByText('Test Customer')).toBeTruthy();
			expect(getByText('Amount Paid')).toBeTruthy();
			expect(getAllByText('₹11682').length).toBeGreaterThan(0);
		});
	});
});
