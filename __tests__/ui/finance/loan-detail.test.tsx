import React from 'react';
import LoanDetailScreen from '@/app/(app)/finance/loans/[id]';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { renderWithTheme } from '../../utils/renderWithTheme';

describe('LoanDetailScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'loan-1' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
	});

	it('renders the loan summary and amortisation section', () => {
		const { getByText } = renderWithTheme(<LoanDetailScreen />);

		expect(getByText('State Bank of India')).toBeTruthy();
		expect(getByText('Repayment Progress')).toBeTruthy();
		expect(getByText('Amortisation Schedule')).toBeTruthy();
	});
});
