import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { PaymentModal } from '../PaymentModal';

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		recordPayment: jest.fn().mockResolvedValue({ id: 'pay-001' }),
	},
}));

import { paymentService } from '@/src/services/paymentService';

const baseProps = {
	visible: true,
	onClose: jest.fn(),
	onSuccess: jest.fn(),
	customerId: 'cust-001',
	customerName: 'Test Customer',
	invoiceId: 'inv-001',
	invoiceNumber: 'TM/001',
	totalAmount: 5900,
};

describe('PaymentModal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('does NOT render content when visible=false', () => {
		const { queryByText } = renderWithTheme(
			<PaymentModal {...baseProps} visible={false} />,
		);
		// Modal mock returns null when visible=false
		expect(queryByText('Record Payment')).toBeNull();
	});

	it('DOES render content when visible=true', () => {
		const { getByText } = renderWithTheme(<PaymentModal {...baseProps} />);
		expect(getByText('Record Payment')).toBeTruthy();
	});

	it('renders the invoice number in the modal header area', () => {
		const { getByText } = renderWithTheme(<PaymentModal {...baseProps} />);
		expect(getByText(/TM\/001/)).toBeTruthy();
	});

	it('calls paymentService.recordPayment with amount and mode when submitted', async () => {
		const { getByPlaceholderText, getAllByRole } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);

		// Enter amount
		fireEvent.changeText(getByPlaceholderText('0.00'), '2000');

		// Press "Record Payment" submit button (last button by role)
		const buttons = getAllByRole('button');
		const submitButton = buttons.find(
			(b) => b.props.accessibilityLabel === 'Record Payment',
		);
		expect(submitButton).toBeDefined();
		fireEvent.press(submitButton!);

		// paymentService.recordPayment should be called
		await new Promise(process.nextTick);
		expect(paymentService.recordPayment).toHaveBeenCalledWith(
			expect.objectContaining({ amount: 2000 }),
		);
	});

	it('does NOT call paymentService.recordPayment when amount is empty on submit', () => {
		const { getAllByRole } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);

		// Do not fill the amount (leave empty)
		const buttons = getAllByRole('button');
		const submitButton = buttons.find(
			(b) => b.props.accessibilityLabel === 'Record Payment',
		);
		fireEvent.press(submitButton!);

		expect(paymentService.recordPayment).not.toHaveBeenCalled();
	});

	it('calls onClose when close (ghost) button is pressed', () => {
		const onClose = jest.fn();
		const { getAllByRole } = renderWithTheme(
			<PaymentModal {...baseProps} onClose={onClose} />,
		);

		// The ghost close button is the first button in the header (no title text)
		const buttons = getAllByRole('button');
		// Find the button without an accessibilityLabel (the ghost X button)
		const closeButton = buttons.find((b) => !b.props.accessibilityLabel);
		if (closeButton) {
			fireEvent.press(closeButton);
			expect(onClose).toHaveBeenCalled();
		} else {
			// Fallback: press first button (ghost button is first rendered)
			fireEvent.press(buttons[0]);
			expect(onClose).toHaveBeenCalled();
		}
	});
});
