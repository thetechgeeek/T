import React from 'react';
import PaymentsScreen from '@/app/(app)/finance/payments';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('PaymentsScreen', () => {
	it('renders Payments heading', () => {
		const { getByText } = renderWithTheme(<PaymentsScreen />);
		expect(getByText('Payments')).toBeTruthy();
	});

	it('renders summary bar', () => {
		const { getByText } = renderWithTheme(<PaymentsScreen />);
		expect(getByText(/payments this month/i)).toBeTruthy();
	});

	it('renders FAB and screen without crash', () => {
		const { toJSON } = renderWithTheme(<PaymentsScreen />);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('Payments');
		expect(json).toContain('Record payment');
	});
});
