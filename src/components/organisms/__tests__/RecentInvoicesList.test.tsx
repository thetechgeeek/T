import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { RecentInvoicesList, type Invoice } from '../RecentInvoicesList';

// RecentInvoicesList uses useLocale for currency formatting and t() for translations
jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key.split('.').pop() ?? key,
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
		currentLanguage: 'en',
	}),
}));

const makeInvoice = (overrides?: Partial<Invoice>): Invoice => ({
	id: 'inv-uuid-001',
	customer_name: 'Test Customer',
	invoice_number: 'TM/2025-26/0001',
	invoice_date: '2026-01-15',
	grand_total: 5000,
	payment_status: 'unpaid',
	...overrides,
});

describe('RecentInvoicesList', () => {
	it('renders invoice number, customer name, and formatted amount', () => {
		const { getByText } = renderWithTheme(<RecentInvoicesList invoices={[makeInvoice()]} />);
		expect(getByText('Test Customer')).toBeTruthy();
		expect(getByText(/TM\/2025-26\/0001/)).toBeTruthy();
		expect(getByText(/₹5000/)).toBeTruthy();
	});

	it('calls router.push with invoice id when row is pressed', () => {
		const router = useRouter();
		const pushMock = router.push as jest.Mock;
		pushMock.mockClear();

		const invoice = makeInvoice({ id: 'inv-uuid-001' });
		const { getByText } = renderWithTheme(<RecentInvoicesList invoices={[invoice]} />);

		fireEvent.press(getByText('Test Customer'));

		expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('inv-uuid-001'));
	});

	it('renders empty state when invoices array is empty', () => {
		const { queryByText } = renderWithTheme(<RecentInvoicesList invoices={[]} />);
		// Empty state shows i18n translations for noInvoices / createFirst
		// Both render without crash
		expect(queryByText('Test Customer')).toBeNull();
	});

	it('payment_status="paid" row renders "Paid" badge text', () => {
		const { getByText } = renderWithTheme(
			<RecentInvoicesList invoices={[makeInvoice({ payment_status: 'paid' })]} />,
		);
		expect(getByText('Paid')).toBeTruthy();
	});

	it('payment_status="unpaid" row renders "Unpaid" badge text', () => {
		const { getByText } = renderWithTheme(
			<RecentInvoicesList invoices={[makeInvoice({ payment_status: 'unpaid' })]} />,
		);
		expect(getByText('Unpaid')).toBeTruthy();
	});

	it('payment_status="partial" row renders "Partial" badge text', () => {
		const { getByText } = renderWithTheme(
			<RecentInvoicesList invoices={[makeInvoice({ payment_status: 'partial' })]} />,
		);
		expect(getByText('Partial')).toBeTruthy();
	});
});
