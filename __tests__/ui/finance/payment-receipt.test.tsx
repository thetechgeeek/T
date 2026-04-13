import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentReceiptScreen from '@/app/(app)/finance/payments/[id]/receipt';
import { paymentService } from '@/src/services/paymentService';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		fetchPayments: jest.fn(),
	},
}));

describe('PaymentReceiptScreen', () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'pay-1' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: mockBack });
		(paymentService.fetchPayments as jest.Mock).mockResolvedValue([
			{
				id: 'pay-1',
				payment_date: '2026-04-10',
				amount: 1250,
				payment_mode: 'upi',
				direction: 'received',
				customer: { name: 'Ravi Traders' },
				notes: 'TXN-01',
			},
		]);
	});

	it('renders receipt details and action buttons', async () => {
		const { getByText, getByLabelText } = renderWithTheme(<PaymentReceiptScreen />);

		await waitFor(() => {
			expect(getByText('PAYMENT RECEIPT')).toBeTruthy();
			expect(getByText('Ravi Traders')).toBeTruthy();
			expect(getByLabelText('Share on WhatsApp')).toBeTruthy();
		});
	});

	it('returns to the previous screen when done is pressed', async () => {
		const { getByLabelText } = renderWithTheme(<PaymentReceiptScreen />);

		await waitFor(() => {
			expect(getByLabelText('done')).toBeTruthy();
		});

		fireEvent.press(getByLabelText('done'));

		expect(mockBack).toHaveBeenCalled();
	});
});
