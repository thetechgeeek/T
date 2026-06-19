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

	it('renders the unavailable finance workflow surface', () => {
		const { getByTestId, getAllByText, getByText } = renderWithTheme(<LoanDetailScreen />);

		expect(getByTestId('unavailable-product-surface')).toBeTruthy();
		expect(getAllByText('Loan Detail').length).toBeGreaterThan(0);
		expect(
			getByText(
				'This finance workflow is disabled until it is connected to live banking, ledger, and audit data.',
			),
		).toBeTruthy();
	});
});
