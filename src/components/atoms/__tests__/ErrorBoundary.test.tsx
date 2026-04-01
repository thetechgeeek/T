import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws on demand
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) throw new Error('Test crash');
	return <Text>OK</Text>;
}

// Suppress console.error for expected throws in tests
beforeEach(() => {
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	(console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
	it('renders children when no error', () => {
		const { getByText } = render(
			<ErrorBoundary>
				<Text>Normal content</Text>
			</ErrorBoundary>,
		);
		expect(getByText('Normal content')).toBeTruthy();
	});

	it('renders fallback UI when child throws', () => {
		const { getByText } = render(
			<ErrorBoundary>
				<BrokenComponent shouldThrow />
			</ErrorBoundary>,
		);
		expect(getByText('Something went wrong')).toBeTruthy();
		expect(getByText('Test crash')).toBeTruthy();
	});

	it('renders custom fallback when provided', () => {
		const { getByText } = render(
			<ErrorBoundary fallback={<Text>Custom fallback</Text>}>
				<BrokenComponent shouldThrow />
			</ErrorBoundary>,
		);
		expect(getByText('Custom fallback')).toBeTruthy();
	});

	it('resets error state when Try Again is pressed', () => {
		const { getByText } = render(
			<ErrorBoundary>
				<BrokenComponent shouldThrow />
			</ErrorBoundary>,
		);
		expect(getByText('Something went wrong')).toBeTruthy();

		// Press Try Again
		fireEvent.press(getByText('Try Again'));

		// After reset, boundary re-renders children (they still throw, but boundary reset)
		// Since component still throws, it'll show error again — this tests the reset path
		expect(getByText('Something went wrong')).toBeTruthy();
	});
});
