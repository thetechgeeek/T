import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../../../foundation/theme/ThemeProvider';
import { FormSection } from '../FormSection';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('FormSection', () => {
	it('renders header title and children', () => {
		const { getByText, getByTestId } = renderWithTheme(
			<FormSection title="Details" testID="details-section">
				<View />
			</FormSection>,
		);
		expect(getByText('Details')).toBeTruthy();
		expect(getByTestId('details-section')).toHaveProp('accessibilityLabel', 'Details');
	});

	it('allows a more specific accessibility label for grouped fields', () => {
		const { getByTestId } = renderWithTheme(
			<FormSection
				title="Details"
				accessibilityLabel="Supplier details fields"
				testID="supplier-section"
			>
				<View />
			</FormSection>,
		);

		expect(getByTestId('supplier-section')).toHaveProp(
			'accessibilityLabel',
			'Supplier details fields',
		);
	});
});
