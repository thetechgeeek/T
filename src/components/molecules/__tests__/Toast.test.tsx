import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Toast } from '../Toast';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

jest.useFakeTimers();

afterEach(() => {
	jest.clearAllTimers();
});

const renderWithTheme = (component: React.ReactElement) =>
	render(
		<ThemeProvider initialMode="light" persist={false}>
			{component}
		</ThemeProvider>,
	);

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

	it('renders warning variant', () => {
		const { getByTestId } = renderWithTheme(
			<Toast
				testID="toast"
				visible
				message="Check your changes"
				variant="warning"
				onDismiss={jest.fn()}
			/>,
		);
		expect(getByTestId('toast')).toBeTruthy();
	});

	it('supports a custom auto-dismiss duration', () => {
		const onDismiss = jest.fn();
		renderWithTheme(
			<Toast
				visible
				message="Saved"
				variant="success"
				duration={1200}
				onDismiss={onDismiss}
			/>,
		);

		act(() => {
			jest.advanceTimersByTime(1199);
		});
		expect(onDismiss).not.toHaveBeenCalled();

		act(() => {
			jest.advanceTimersByTime(1);
		});
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it('does not auto-dismiss error toasts unless a duration is provided', () => {
		const onDismiss = jest.fn();
		renderWithTheme(<Toast visible message="Failed" variant="error" onDismiss={onDismiss} />);

		act(() => {
			jest.advanceTimersByTime(10000);
		});

		expect(onDismiss).not.toHaveBeenCalled();
	});
});
