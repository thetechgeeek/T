import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { ActivityFeed, type ActivityFeedItem } from '../ActivityFeed';

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const baseItems: ActivityFeedItem[] = [
	{
		id: 'activity-1',
		title: 'Invoice approved',
		description: 'Priya approved INV-104',
		timeLabel: '09:15',
		dateLabel: 'Today',
		statusLabel: 'Approved',
	},
	{
		id: 'activity-2',
		title: 'Reminder scheduled',
		description: 'Collections reminder queued',
		timeLabel: '18:20',
		dateLabel: 'Yesterday',
	},
];

describe('ActivityFeed', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders date separators and load-more affordances', () => {
		const onLoadMore = jest.fn();
		const { getByText } = renderWithTheme(
			<ActivityFeed
				items={baseItems}
				onLoadMore={onLoadMore}
				loadMoreLabel="Load older activity"
			/>,
		);

		expect(getByText('Today')).toBeTruthy();
		expect(getByText('Yesterday')).toBeTruthy();

		fireEvent.press(getByText('Load older activity'));

		expect(onLoadMore).toHaveBeenCalledTimes(1);
	});

	it('injects pending items explicitly instead of silently prepending them', () => {
		const pendingItem: ActivityFeedItem = {
			id: 'activity-3',
			title: 'Payment synced',
			description: 'UPI receipt imported',
			timeLabel: '10:42',
			dateLabel: 'Today',
			statusLabel: 'New',
		};
		const onItemsChange = jest.fn();
		const { getByTestId, getByText } = renderWithTheme(
			<ActivityFeed
				defaultItems={baseItems}
				pendingItems={[pendingItem]}
				onItemsChange={onItemsChange}
				newItemsLabel="Show new updates"
			/>,
		);

		fireEvent.press(getByTestId('activity-feed-inject'));

		expect(onItemsChange).toHaveBeenCalledWith([pendingItem, ...baseItems]);
		expect(getByText('Payment synced')).toBeTruthy();
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'1 new activity items added',
		);
	});

	it('supports compact and relaxed feed density via shared card spacing', () => {
		const { getByTestId: getCompactByTestId } = renderWithTheme(
			<ActivityFeed items={baseItems} density="compact" testID="compact-feed" />,
		);
		const { getByTestId: getRelaxedByTestId } = renderWithTheme(
			<ActivityFeed items={baseItems} density="relaxed" testID="relaxed-feed" />,
		);

		const compactStyle = flattenStyle(
			getCompactByTestId('compact-feed-item-activity-1').props.style,
		) as {
			padding: number;
		};
		const relaxedStyle = flattenStyle(
			getRelaxedByTestId('relaxed-feed-item-activity-1').props.style,
		) as {
			padding: number;
		};

		expect(relaxedStyle.padding).toBeGreaterThan(compactStyle.padding);
	});
});
