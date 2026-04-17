import React from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { SortableList } from '../SortableList';

const items = [
	{ id: 'first', label: 'First item' },
	{ id: 'second', label: 'Second item' },
	{ id: 'third', label: 'Third item' },
];

function getRowActionTarget(instances: ReturnType<typeof renderWithTheme>['UNSAFE_getAllByType']) {
	return instances('View' as any).find(
		(node) => typeof node.props.onAccessibilityAction === 'function',
	);
}

function getPanGesture(instance: {
	props: { gesture: { handlers?: { begin?: () => void; finalize?: (event?: any) => void } } };
}) {
	return instance.props.gesture;
}

describe('SortableList', () => {
	it('renders a calm empty state when there is nothing to sort', () => {
		const { getByText } = renderWithTheme(
			<SortableList defaultItems={[]} renderItem={() => <Text>Unused</Text>} />,
		);

		expect(getByText('No items to sort')).toBeTruthy();
	});

	it('reorders items with explicit move controls and accessibility actions', () => {
		const onItemsChange = jest.fn();
		const { getAllByLabelText, UNSAFE_getAllByType } = renderWithTheme(
			<SortableList
				items={items}
				onItemsChange={onItemsChange}
				renderItem={(item) => (
					<View>
						<Text>{item.label}</Text>
					</View>
				)}
			/>,
		);

		fireEvent.press(getAllByLabelText('Move down')[0]!);
		expect(onItemsChange).toHaveBeenCalledWith([items[1]!, items[0]!, items[2]!]);

		const accessibilityTarget = getRowActionTarget(UNSAFE_getAllByType);
		fireEvent(accessibilityTarget!, 'accessibilityAction', {
			nativeEvent: { actionName: 'increment' },
		});
		expect(onItemsChange).toHaveBeenCalledWith([items[1]!, items[0]!, items[2]!]);
	});

	it('supports gesture-based drag reorder through the shared pan contract', () => {
		const onItemsChange = jest.fn();
		const { UNSAFE_getAllByType } = renderWithTheme(
			<SortableList
				items={items}
				onItemsChange={onItemsChange}
				itemHeight={76}
				renderItem={(item) => <Text>{item.label}</Text>}
			/>,
		);

		const firstGesture = getPanGesture(UNSAFE_getAllByType('GestureDetector' as any)[0]!);
		act(() => {
			firstGesture.handlers?.begin?.();
			firstGesture.handlers?.finalize?.({ translationY: 90 });
		});

		expect(onItemsChange).toHaveBeenCalledWith([items[1]!, items[0]!, items[2]!]);
	});
});
