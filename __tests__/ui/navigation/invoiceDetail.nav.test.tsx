import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import InvoiceDetailScreen from '@/app/(app)/invoices/[id]';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

const mockInvoice = {
	id: 'inv-123',
	invoice_number: 'INV-123',
	customer_name: 'Test Customer',
	grand_total: 1000,
	amount_paid: 0,
	payment_status: 'unpaid',
	line_items: [],
};

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'inv-123' });

	(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
		currentInvoice: mockInvoice,
		fetchInvoiceById: jest.fn().mockResolvedValue(mockInvoice),
		loading: false,
		error: null,
		clearCurrentInvoice: jest.fn(),
	});
});

describe('InvoiceDetail Navigation Wiring', () => {
	it('Press back -> router.back() called', async () => {
		const { getByLabelText } = renderWithTheme(<InvoiceDetailScreen />);
		// Assuming there's a back button with this label (standard in our AppHeader/Screen)
		await waitFor(() => expect(getByLabelText('Go back')).toBeTruthy());
		fireEvent.press(getByLabelText('Go back'));
		expect(mockBack).toHaveBeenCalled();
	});

	it('Press "Record Payment" -> Record Payment button is visible (Modal trigger)', async () => {
		const { getByLabelText } = renderWithTheme(<InvoiceDetailScreen />);
		await waitFor(() => expect(getByLabelText('record-payment-button')).toBeTruthy());
	});
});
