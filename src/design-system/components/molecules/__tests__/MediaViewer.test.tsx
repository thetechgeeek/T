import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { MediaViewer, type MediaViewerItem } from '../MediaViewer';

const items: MediaViewerItem[] = [
	{
		id: 'media-1',
		thumbnailUri: 'https://example.com/thumb-1.jpg',
		uri: 'https://example.com/full-1.jpg',
		alt: 'Invoice front',
		caption: 'Uploaded from phone camera',
	},
	{
		id: 'media-2',
		thumbnailUri: 'https://example.com/thumb-2.jpg',
		uri: 'https://example.com/full-2.jpg',
		alt: 'Invoice back',
		caption: 'Backside with signature',
	},
];

function getPanGesture(instance: { props: { gesture: unknown } }) {
	const gesture = instance.props.gesture as
		| {
				type?: string;
				gestures?: Array<{ handlers?: { finalize?: (event?: any) => void } }>;
				handlers?: { finalize?: (event?: any) => void };
		  }
		| { handlers?: { finalize?: (event?: any) => void } };

	return gesture && 'type' in gesture && gesture.type === 'simultaneous'
		? gesture.gestures?.[1]
		: gesture;
}

describe('MediaViewer', () => {
	it('supports progressive image loading and graceful text fallback', () => {
		const { UNSAFE_getAllByProps, UNSAFE_getAllByType, getAllByText, rerender } =
			renderWithTheme(<MediaViewer items={items} open defaultIndex={0} />);

		expect(
			UNSAFE_getAllByProps({ accessibilityViewIsModal: true })[0]?.props
				.importantForAccessibility,
		).toBe('yes');
		expect(UNSAFE_getAllByType('Image' as any)).toHaveLength(2);
		expect(UNSAFE_getAllByType('Image' as any)[0]?.props.cachePolicy).toBe('memory-disk');
		expect(UNSAFE_getAllByType('Image' as any)[0]?.props.priority).toBe('high');
		expect(UNSAFE_getAllByType('Image' as any)[1]?.props.cachePolicy).toBe('memory-disk');
		expect(UNSAFE_getAllByType('Image' as any)[1]?.props.priority).toBe('high');

		act(() => {
			fireEvent(UNSAFE_getAllByType('Image' as any)[1]!, 'load');
		});

		expect(UNSAFE_getAllByType('Image' as any)).toHaveLength(1);
		expect(UNSAFE_getAllByType('Image' as any)[0]?.props.recyclingKey).toBe('media-1');

		rerender(
			<MediaViewer
				items={[
					{
						id: 'fallback-media',
						alt: 'Attachment unavailable',
						caption: 'Text fallback keeps the review flow readable.',
					},
				]}
				open
			/>,
		);

		expect(getAllByText('Attachment unavailable').length).toBeGreaterThanOrEqual(1);
		expect(
			getAllByText('Text fallback keeps the review flow readable.').length,
		).toBeGreaterThanOrEqual(1);
	});

	it('supports explicit navigation, swipe navigation, and swipe-to-dismiss callbacks', () => {
		const onIndexChange = jest.fn();
		const onOpenChange = jest.fn();
		const { getByLabelText, UNSAFE_getByType } = renderWithTheme(
			<MediaViewer
				items={items}
				defaultIndex={0}
				open
				onIndexChange={onIndexChange}
				onOpenChange={onOpenChange}
			/>,
		);

		fireEvent.press(getByLabelText('Next media item'));
		expect(onIndexChange).toHaveBeenCalledWith(1);

		const panGesture = getPanGesture(UNSAFE_getByType('GestureDetector' as any));
		act(() => {
			panGesture?.handlers?.finalize?.({ translationX: 120, translationY: 0 });
		});
		expect(onIndexChange).toHaveBeenCalledWith(0);

		act(() => {
			panGesture?.handlers?.finalize?.({ translationX: 0, translationY: 140 });
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);

		fireEvent.press(getByLabelText('Close media viewer'));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
