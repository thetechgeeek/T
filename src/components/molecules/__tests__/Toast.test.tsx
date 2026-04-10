import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Toast } from '../Toast';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

jest.useFakeTimers();

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('Toast', () => {
	it('renders message when visible', () => {
		const { getByText } = renderWithTheme(
			<Toast visible message="Item saved" variant="success" onDismiss={jest.fn()} />,
		);
		expect(getByText('Item saved')).toBeTruthy();
	});

	it('does not render when not visible', () => {
		const { queryByText } = renderWithTheme(
			<Toast visible={false} message="Hidden" variant="success" onDismiss={jest.fn()} />,
		);
		expect(queryByText('Hidden')).toBeNull();
	});

	it('calls onDismiss after 3 seconds', () => {
		const onDismiss = jest.fn();
		renderWithTheme(
			<Toast visible message="Auto dismiss" variant="info" onDismiss={onDismiss} />,
		);
		act(() => {
			jest.advanceTimersByTime(3000);
		});
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it('does not call onDismiss before 3 seconds', () => {
		const onDismiss = jest.fn();
		renderWithTheme(<Toast visible message="Not yet" variant="info" onDismiss={onDismiss} />);
		act(() => {
			jest.advanceTimersByTime(2999);
		});
		expect(onDismiss).not.toHaveBeenCalled();
	});

	it('renders success variant', () => {
		const { getByTestId } = renderWithTheme(
			<Toast testID="toast" visible message="Done" variant="success" onDismiss={jest.fn()} />,
		);
		expect(getByTestId('toast')).toBeTruthy();
	});

	it('renders error variant', () => {
		const { getByTestId } = renderWithTheme(
			<Toast testID="toast" visible message="Failed" variant="error" onDismiss={jest.fn()} />,
		);
		expect(getByTestId('toast')).toBeTruthy();
	});
});
