/**
 * Integration tests for the 3-step invoice create wizard.
 *
 * @requires @testing-library/react-native
 *
 * @todo Uncomment when @testing-library/react-native is installed.
 */

// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
// import InvoiceCreateScreen from '@/src/features/invoice-create/InvoiceCreateScreen';

describe.skip('InvoiceCreateFlow — integration (requires RNTL)', () => {
	it('starts on CustomerStep (step 1)', () => {
		// const { getByText } = render(<InvoiceCreateScreen />);
		// expect(getByText('Customer')).toBeTruthy(); // step label
		expect(true).toBe(true);
	});

	it('cannot advance without customer name', () => {
		// const { getByText, queryByText } = render(<InvoiceCreateScreen />);
		// fireEvent.press(getByText('Next'));
		// expect(queryByText('Items')).toBeNull(); // still on step 1
		expect(true).toBe(true);
	});

	it('advances to LineItemsStep when name is filled', async () => {
		// const { getByPlaceholderText, getByText } = render(<InvoiceCreateScreen />);
		// fireEvent.changeText(getByPlaceholderText('Name'), 'Rahul Kumar');
		// fireEvent.press(getByText('Next'));
		// await waitFor(() => expect(getByText('Add Item')).toBeTruthy());
		expect(true).toBe(true);
	});

	it('advances to PaymentStep when line items are added', async () => {
		// ... (requires mocking inventory search)
		expect(true).toBe(true);
	});

	it('disables submit while submitting is true', async () => {
		// const { getByText } = render(<InvoiceCreateScreen />);
		// ... advance to step 3 ...
		// expect(getByText('Creating Invoice…')).toBeTruthy();
		expect(true).toBe(true);
	});
});
