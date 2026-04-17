import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { VirtualizedList } from '../VirtualizedList';

const flatItems = [
	{ id: 'row-1', label: 'First row' },
	{ id: 'row-2', label: 'Second row' },
];

describe('VirtualizedList', () => {
	it('renders loading skeletons before data arrives', () => {
		const { getAllByTestId } = renderWithTheme(
			<VirtualizedList
				data={[]}
				isLoading
				keyExtractor={(item) => String(item)}
				renderItem={() => null}
			/>,
		);

		expect(
			getAllByTestId('virtualized-list-skeleton', { includeHiddenElements: true }),
		).toHaveLength(3);
	});

	it('renders a FlashList-backed flat list with selection, virtualization tuning, load more, and refresh', () => {
		const onSelectedKeysChange = jest.fn();
		const onLoadMore = jest.fn();
		const onRefresh = jest.fn();
		const { getByTestId, getByText } = renderWithTheme(
			<VirtualizedList
				data={flatItems}
				testID="virtualized-flat"
				keyExtractor={(item) => item.id}
				itemHeight={64}
				onSelectedKeysChange={onSelectedKeysChange}
				onLoadMore={onLoadMore}
				onRefresh={onRefresh}
				renderItem={({ item, toggleSelected }) => (
					<Pressable onPress={toggleSelected}>
						<Text>{item.label}</Text>
					</Pressable>
				)}
			/>,
		);

		fireEvent.press(getByText('First row'));
		expect(onSelectedKeysChange).toHaveBeenCalledWith(['row-1']);

		const list = getByTestId('virtualized-flat');
		expect(list.props.removeClippedSubviews).toBe(true);
		expect(list.props.windowSize).toBe(5);
		expect(list.props.maxToRenderPerBatch).toBe(8);
		expect(list.props.initialNumToRender).toBe(8);
		expect(list.props.getItemLayout(null, 2)).toEqual({
			length: 64,
			offset: 128,
			index: 2,
		});

		fireEvent.press(getByTestId('virtualized-flat-end-trigger'));
		fireEvent.press(getByTestId('virtualized-flat-refresh-trigger'));

		expect(onLoadMore).toHaveBeenCalledTimes(1);
		expect(onRefresh).toHaveBeenCalledTimes(1);
	});

	it('renders empty and sectioned list variants', () => {
		const { getByTestId, getByText, rerender } = renderWithTheme(
			<VirtualizedList
				data={[]}
				keyExtractor={(item) => String(item)}
				renderItem={() => null}
				emptyTitle="No records"
				emptyDescription="Try a different filter."
			/>,
		);

		expect(getByText('No records')).toBeTruthy();

		rerender(
			<VirtualizedList
				sections={[
					{
						title: 'Today',
						data: flatItems,
					},
				]}
				testID="virtualized-section"
				keyExtractor={(item) => item.id}
				onLoadMore={jest.fn()}
				onRefresh={jest.fn()}
				renderSectionHeader={(section) => <Text>{section.title}</Text>}
				renderItem={({ item }) => <Text>{item.label}</Text>}
			/>,
		);

		const sectionList = getByTestId('virtualized-section');
		expect(sectionList.props.removeClippedSubviews).toBe(true);
		expect(sectionList.props.refreshControl).toBeTruthy();
		expect(getByText('Today')).toBeTruthy();
		expect(getByText('Second row')).toBeTruthy();
	});
});
