/**
 * Integration tests for the Invoices tab screen.
 *
 * @requires @testing-library/react-native
 * Run: npx expo install @testing-library/react-native
 *
 * @todo Uncomment when @testing-library/react-native is installed.
 */

// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
// import InvoicesScreen from '@/app/(app)/(tabs)/invoices';
// import { useInvoiceStore } from '@/src/stores/invoiceStore';
// import { mockInvoice } from '../fixtures/invoice';

describe.skip('InvoicesScreen — integration (requires RNTL)', () => {
	// beforeEach(() => {
	// 	const store = useInvoiceStore.getState();
	// 	store.invoices = [mockInvoice({ invoice_number: 'TM-001', total_amount: 5000 })];
	// 	store.loading = false;
	// });

	it('renders invoice list', async () => {
		// const { getByText } = render(<InvoicesScreen />);
		// await waitFor(() => expect(getByText('TM-001')).toBeTruthy());
		expect(true).toBe(true); // stub passes
	});

	it('shows loading state during fetch', async () => {
		// const store = useInvoiceStore.getState();
		// store.loading = true;
		// store.invoices = [];
		// const { getByTestId } = render(<InvoicesScreen />);
		// expect(getByTestId('loading-indicator')).toBeTruthy();
		expect(true).toBe(true);
	});

	it('shows empty state when no invoices', async () => {
		// const store = useInvoiceStore.getState();
		// store.invoices = [];
		// store.loading = false;
		// const { getByText } = render(<InvoicesScreen />);
		// await waitFor(() => expect(getByText('No invoices yet')).toBeTruthy());
		expect(true).toBe(true);
	});

	it('navigates to invoice detail on press', async () => {
		// const push = jest.fn();
		// jest.mock('expo-router', () => ({ useRouter: () => ({ push }) }));
		// const { getByText } = render(<InvoicesScreen />);
		// fireEvent.press(getByText('TM-001'));
		// expect(push).toHaveBeenCalledWith(expect.stringContaining('/invoices/'));
		expect(true).toBe(true);
	});
});
