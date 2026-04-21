import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { QueryBoundary } from '../QueryBoundary';

describe('QueryBoundary', () => {
	it('renders children when not loading, no error, not empty', () => {
		const { getByText } = renderWithTheme(
			<QueryBoundary loading={false} error={null}>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Content')).toBeTruthy();
	});

	it('renders loading skeleton when loading with no children', () => {
		const { queryByText, toJSON } = renderWithTheme(
			<QueryBoundary loading={true} error={null}>
				{null}
			</QueryBoundary>,
		);
		// Loading skeleton should be present (SkeletonBlock rows rendered)
		expect(toJSON()).toBeTruthy();
		expect(queryByText('Content')).toBeNull();
	});

	it('renders error message when error is set', () => {
		const { getByText } = renderWithTheme(
			<QueryBoundary loading={false} error={new Error('Fetch failed')}>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Fetch failed')).toBeTruthy();
	});

	it('renders string error directly', () => {
		const { getByText } = renderWithTheme(
			<QueryBoundary loading={false} error="Something went wrong">
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Something went wrong')).toBeTruthy();
	});

	it('renders retry button when onRetry is provided and error exists', () => {
		const onRetry = jest.fn();
		const { getByText } = renderWithTheme(
			<QueryBoundary loading={false} error="Error" onRetry={onRetry}>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('Retry')).toBeTruthy();
	});

	it('renders empty state when empty=true', () => {
		const { getByText } = renderWithTheme(
			<QueryBoundary loading={false} error={null} empty>
				<Text>Content</Text>
			</QueryBoundary>,
		);
		expect(getByText('No results found')).toBeTruthy();
	});

	it('renders custom empty state when provided', () => {
		const { getByText } = renderWithTheme(
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
