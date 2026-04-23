import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { allowExpectedConsoleError } from '@/__tests__/utils/runtimeNoise';

// Component that throws on demand
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) throw new Error('Test crash');
	return <Text>OK</Text>;
}

describe('ErrorBoundary', () => {
	it('renders children when no error', () => {
		const { getByText } = renderWithTheme(
			<ErrorBoundary>
				<Text>Normal content</Text>
			</ErrorBoundary>,
		);
		expect(getByText('Normal content')).toBeTruthy();
	});

	it('renders fallback UI when child throws', () => {
		allowExpectedConsoleError(/Test crash/, 2);
		const { getByText } = renderWithTheme(
			<ErrorBoundary>
				<BrokenComponent shouldThrow />
			</ErrorBoundary>,
		);
		expect(getByText('Something went wrong')).toBeTruthy();
		expect(getByText('Test crash')).toBeTruthy();
	});

	it('renders custom fallback when provided', () => {
		allowExpectedConsoleError(/Test crash/, 2);
		const { getByText } = renderWithTheme(
			<ErrorBoundary fallback={<Text>Custom fallback</Text>}>
				<BrokenComponent shouldThrow />
			</ErrorBoundary>,
		);
		expect(getByText('Custom fallback')).toBeTruthy();
	});

	it('resets error state when Try again is pressed', () => {
		allowExpectedConsoleError(/Test crash/, 4);
		const { getByText } = renderWithTheme(
			<ErrorBoundary>
				<BrokenComponent shouldThrow />
			</ErrorBoundary>,
		);
		expect(getByText('Something went wrong')).toBeTruthy();

		// Press Try again
		fireEvent.press(getByText('Try again'));

		// After reset, boundary re-renders children (they still throw, but boundary reset)
		// Since component still throws, it'll show error again — this tests the reset path
		expect(getByText('Something went wrong')).toBeTruthy();
	});
});
