import React from 'react';
import ChequesScreen from '@/app/(app)/finance/cheques';
import { renderWithTheme } from '../../utils/renderWithTheme';

describe('ChequesScreen', () => {
	it('renders the unavailable finance workflow surface', () => {
		const { getByTestId, getAllByText, getByText } = renderWithTheme(<ChequesScreen />);

		expect(getByTestId('unavailable-product-surface')).toBeTruthy();
		expect(getAllByText('Cheques').length).toBeGreaterThan(0);
		expect(
			getByText(
				'This finance workflow is disabled until it is connected to live banking, ledger, and audit data.',
			),
		).toBeTruthy();
	});
});
