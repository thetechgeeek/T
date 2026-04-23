import React from 'react';
import { waitFor } from '@testing-library/react-native';
import PaymentsScreen from '@/app/(app)/finance/payments';
import { paymentService } from '@/src/services/paymentService';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		fetchPayments: jest.fn(),
	},
}));

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
	(paymentService.fetchPayments as jest.Mock).mockResolvedValue([]);
});

describe('PaymentsScreen', () => {
	it('renders Payments heading', async () => {
		const { getByText } = renderWithTheme(<PaymentsScreen />);
		await waitFor(() => {
			expect(paymentService.fetchPayments).toHaveBeenCalledWith({});
		});
		expect(getByText('Payments')).toBeTruthy();
	});

	it('renders summary bar', async () => {
		const { getByText } = renderWithTheme(<PaymentsScreen />);
		await waitFor(() => {
			expect(paymentService.fetchPayments).toHaveBeenCalledWith({});
		});
		expect(getByText(/payments this month/i)).toBeTruthy();
	});

	it('renders FAB and screen without crash', async () => {
		const { toJSON } = renderWithTheme(<PaymentsScreen />);
		await waitFor(() => {
			expect(paymentService.fetchPayments).toHaveBeenCalledWith({});
		});
		const json = JSON.stringify(toJSON());
		expect(json).toContain('Payments');
		expect(json).toContain('Record payment');
	});
});
