import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentDetailScreen from '@/app/(app)/finance/payments/[id]';
import { paymentService } from '@/src/services/paymentService';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		fetchPayments: jest.fn(),
	},
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

describe('PaymentDetailScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'pay-1' });
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
		(paymentService.fetchPayments as jest.Mock).mockResolvedValue([
			{
				id: 'pay-1',
				payment_date: '2026-04-10',
				amount: 1250,
				payment_mode: 'cash',
				direction: 'made',
				supplier: { name: 'Apex Supplies' },
				notes: 'ADV-001',
			},
		]);
	});

	it('renders advance payment details', async () => {
		const { getByText } = renderWithTheme(<PaymentDetailScreen />);

		await waitFor(() => {
			expect(getByText('Payment Made')).toBeTruthy();
			expect(getByText('Apex Supplies')).toBeTruthy();
			expect(getByText('ADVANCE')).toBeTruthy();
		});
	});

	it('navigates to the receipt screen', async () => {
		const { getByLabelText } = renderWithTheme(<PaymentDetailScreen />);

		await waitFor(() => {
			expect(getByLabelText('view-receipt')).toBeTruthy();
		});

		fireEvent.press(getByLabelText('view-receipt'));

		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/payments/pay-1/receipt');
	});
});
