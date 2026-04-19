import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ProgressIndicator } from '../ProgressIndicator';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('ProgressIndicator', () => {
	it('renders determinate circular progress', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<ProgressIndicator variant="circular" value={64} label="Uploading" testID="progress" />,
		);
		expect(getByText('64%')).toBeTruthy();
		expect(getByText('Uploading')).toBeTruthy();
		expect(getByTestId('progress')).toHaveProp('accessibilityValue', {
			min: 0,
			max: 100,
			now: 64,
			text: '64%',
		});
	});

	it('renders indeterminate linear progress with the activity indicator fallback', () => {
		const { getByTestId } = renderWithTheme(
			<ProgressIndicator variant="linear" indeterminate testID="progress" />,
		);
		expect(getByTestId('ActivityIndicator')).toBeTruthy();
		expect(getByTestId('progress')).toBeTruthy();
		expect(getByTestId('progress')).toHaveProp('accessibilityState', { busy: true });
	});
});
