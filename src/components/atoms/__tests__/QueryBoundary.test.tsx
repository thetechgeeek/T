import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { QueryBoundary } from '../QueryBoundary';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('QueryBoundary', () => {
	it('renders children when not loading, no error, not empty', () => {
		const { getByText } = wrap(
			<QueryBoundary loading={false} error={null}>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Content')).toBeTruthy();
	});

	it('renders loading indicator when loading with no children', () => {
		const { queryByText, UNSAFE_getByType } = wrap(
			<QueryBoundary loading={true} error={null}>
				{null}
			</QueryBoundary>,
		);
		// ActivityIndicator should be present
		const { ActivityIndicator } = require('react-native');
		expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
		expect(queryByText('Content')).toBeNull();
	});

	it('renders error message when error is set', () => {
		const { getByText } = wrap(
			<QueryBoundary loading={false} error={new Error('Fetch failed')}>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Fetch failed')).toBeTruthy();
	});

	it('renders string error directly', () => {
		const { getByText } = wrap(
			<QueryBoundary loading={false} error="Something went wrong">
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Something went wrong')).toBeTruthy();
	});

	it('renders retry button when onRetry is provided and error exists', () => {
		const onRetry = jest.fn();
		const { getByText } = wrap(
			<QueryBoundary loading={false} error="Error" onRetry={onRetry}>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Retry')).toBeTruthy();
	});

	it('renders empty state when empty=true', () => {
		const { getByText } = wrap(
			<QueryBoundary loading={false} error={null} empty>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('No results found')).toBeTruthy();
	});

	it('renders custom empty state when provided', () => {
		const { getByText } = wrap(
			<QueryBoundary
				loading={false}
				error={null}
				empty
				emptyState={<Text>No items here</Text>}
			>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('No items here')).toBeTruthy();
	});
});
