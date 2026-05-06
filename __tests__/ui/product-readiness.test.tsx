import React from 'react';
import { renderWithTheme } from '../utils/renderWithTheme';
import ReportsHubScreen from '@/app/(app)/reports';
import UtilitiesHubScreen from '@/app/(app)/utilities';
import { UnavailableProductSurface } from '@/src/features/productReadiness/UnavailableProductSurface';

describe('product readiness surfaces', () => {
	it('hides incomplete report surfaces from the reports hub', () => {
		const { getByText, queryByText } = renderWithTheme(<ReportsHubScreen />);

		expect(getByText('Stock Report')).toBeTruthy();
		expect(queryByText('Expense Report')).toBeNull();
	});

	it('hides incomplete utilities from primary utility navigation', () => {
		const { getByText, queryByText } = renderWithTheme(<UtilitiesHubScreen />);

		expect(getByText('Calculator')).toBeTruthy();
		expect(queryByText('Data Verification')).toBeNull();
		expect(queryByText('Close Financial Year')).toBeNull();
		expect(queryByText('Export to Tally')).toBeNull();
	});

	it('renders unavailable surfaces with translated disabled copy', () => {
		const { getAllByText, getByText, getByTestId } = renderWithTheme(
			<UnavailableProductSurface title="Bank Accounts" area="Finance" />,
		);

		expect(getByTestId('unavailable-product-surface')).toBeTruthy();
		expect(getAllByText('Bank Accounts').length).toBeGreaterThan(0);
		expect(
			getByText(
				'This finance workflow is disabled until it is connected to live banking, ledger, and audit data.',
			),
		).toBeTruthy();
	});
});
