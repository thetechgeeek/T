import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { PaginatedList } from '../PaginatedList';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('PaginatedList', () => {
	const items = [
		{ id: '1', name: 'Item 1' },
		{ id: '2', name: 'Item 2' },
	];

	it('renders items via renderItem', () => {
		const { getByText } = renderWithTheme(
			<PaginatedList
				data={items}
				renderItem={({ item }) => <Text>{(item as { name: string }).name}</Text>}
				keyExtractor={(item) => (item as { id: string }).id}
				isLoading={false}
				hasError={false}
			/>,
		);
		expect(getByText('Item 1')).toBeTruthy();
		expect(getByText('Item 2')).toBeTruthy();
	});

	it('renders skeleton rows when loading and no data', () => {
		const { getAllByTestId } = renderWithTheme(
			<PaginatedList
				data={[]}
				renderItem={() => <Text>x</Text>}
				keyExtractor={(item) => String(item)}
				isLoading
				hasError={false}
			/>,
		);
		expect(getAllByTestId('skeleton-row', { hidden: true }).length).toBeGreaterThanOrEqual(1);
	});

	it('renders empty state when no data and not loading', () => {
		const { getByTestId } = renderWithTheme(
			<PaginatedList
				data={[]}
				renderItem={() => <Text>x</Text>}
				keyExtractor={(item) => String(item)}
				isLoading={false}
				hasError={false}
				emptyTitle="No items found"
			/>,
		);
		expect(getByTestId('empty-state')).toBeTruthy();
	});

	it('renders error state with retry button when hasError', () => {
		const onRetry = jest.fn();
		const { getByTestId } = renderWithTheme(
			<PaginatedList
				data={[]}
				renderItem={() => <Text>x</Text>}
				keyExtractor={(item) => String(item)}
				isLoading={false}
				hasError
				onRetry={onRetry}
			/>,
		);
		const retryBtn = getByTestId('error-retry-btn');
		fireEvent.press(retryBtn);
		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it('renders header component', () => {
		const { getByText } = renderWithTheme(
			<PaginatedList
				data={items}
				renderItem={({ item }) => <Text>{(item as { name: string }).name}</Text>}
				keyExtractor={(item) => (item as { id: string }).id}
				isLoading={false}
				hasError={false}
				ListHeaderComponent={<Text>Header</Text>}
			/>,
		);
		expect(getByText('Header')).toBeTruthy();
	});

	it('supports infinite loading and pull-to-refresh callbacks', () => {
		const onLoadMore = jest.fn();
		const onRefresh = jest.fn();
		const { getByTestId } = renderWithTheme(
			<PaginatedList
				data={items}
				renderItem={({ item }) => <Text>{(item as { name: string }).name}</Text>}
				keyExtractor={(item) => (item as { id: string }).id}
				isLoading={false}
				hasError={false}
				onLoadMore={onLoadMore}
				onRefresh={onRefresh}
				isRefreshing
			/>,
		);
		fireEvent.press(getByTestId('flatlist-end-trigger'));
		expect(onLoadMore).toHaveBeenCalledTimes(1);
	});
});
