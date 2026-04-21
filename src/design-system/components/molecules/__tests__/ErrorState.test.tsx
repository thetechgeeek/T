import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/design-system/foundation/theme/ThemeProvider';
import { ErrorState } from '../ErrorState';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('ErrorState', () => {
	it('renders the built-in offline variant copy', () => {
		const { getByText } = renderWithTheme(<ErrorState variant="offline" />);
		expect(getByText('You are offline')).toBeTruthy();
		expect(getByText('Reconnect and retry when you are ready.')).toBeTruthy();
	});

	it('supports a retry CTA', () => {
		const onAction = jest.fn();
		const { getByText } = renderWithTheme(
			<ErrorState variant="server" actionLabel="Retry now" onAction={onAction} />,
		);
		fireEvent.press(getByText('Retry now'));
		expect(onAction).toHaveBeenCalledTimes(1);
	});
});
