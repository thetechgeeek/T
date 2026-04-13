import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { FormSection } from '../FormSection';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('FormSection', () => {
	it('renders header title and children', () => {
		const { getByText } = renderWithTheme(
			<FormSection title="Details">
				<View />
			</FormSection>,
		);
		expect(getByText('Details')).toBeTruthy();
	});
});
