import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ProgressIndicator } from '../ProgressIndicator';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('ProgressIndicator', () => {
	it('renders determinate circular progress', () => {
		const { getByText } = renderWithTheme(
			<ProgressIndicator variant="circular" value={64} label="Uploading" />,
		);
		expect(getByText('64%')).toBeTruthy();
		expect(getByText('Uploading')).toBeTruthy();
	});

	it('renders indeterminate linear progress with the activity indicator fallback', () => {
		const { getByTestId } = renderWithTheme(
			<ProgressIndicator variant="linear" indeterminate testID="progress" />,
		);
		expect(getByTestId('ActivityIndicator')).toBeTruthy();
		expect(getByTestId('progress')).toBeTruthy();
	});
});
