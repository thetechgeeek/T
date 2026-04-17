import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { AlertBanner } from '../AlertBanner';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('AlertBanner', () => {
	it('renders the title and description', () => {
		const { getByText } = renderWithTheme(
			<AlertBanner title="Heads up" description="Review the imported data." />,
		);
		expect(getByText('Heads up')).toBeTruthy();
		expect(getByText('Review the imported data.')).toBeTruthy();
	});

	it('supports inline actions and dismiss', () => {
		const onAction = jest.fn();
		const onDismiss = jest.fn();
		const { getByText } = renderWithTheme(
			<AlertBanner
				title="Heads up"
				actionLabel="Review"
				onAction={onAction}
				dismissible
				onDismiss={onDismiss}
			/>,
		);
		fireEvent.press(getByText('Review'));
		fireEvent.press(getByText('Dismiss'));
		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});
});
