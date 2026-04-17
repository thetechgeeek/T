import React from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Popover } from '../Popover';

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('Popover', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('opens on press and renders interactive content', () => {
		const onApply = jest.fn();
		const { getByLabelText, getByText } = renderWithTheme(
			<Popover
				triggerLabel="Open popover"
				title="Quick edit"
				description="Adjust one field inline."
				trigger={<View />}
			>
				<Button title="Apply" onPress={onApply} />
			</Popover>,
		);

		fireEvent.press(getByLabelText('Open popover'));
		fireEvent.press(getByText('Apply'));

		expect(getByText('Quick edit')).toBeTruthy();
		expect(onApply).toHaveBeenCalledTimes(1);
	});

	it('anchors with a bounded width and dismisses on backdrop press', () => {
		const { getByLabelText, getByTestId, queryByText, UNSAFE_getAllByType } = renderWithTheme(
			<Popover
				triggerLabel="Open popover"
				title="Quick edit"
				maxWidth={280}
				testID="popover-surface"
				trigger={<View />}
			>
				<View />
			</Popover>,
		);

		fireEvent.press(getByLabelText('Open popover'));
		expect(flattenStyle(getByTestId('popover-surface').props.style)).toEqual(
			expect.objectContaining({ maxWidth: 280 }),
		);

		fireEvent.press(UNSAFE_getAllByType('Pressable' as any)[1]);
		expect(queryByText('Quick edit')).toBeNull();
	});

	it('supports long-press context-menu mode with haptic feedback', () => {
		const selectionAsync = jest.mocked(Haptics.selectionAsync);
		const { getByLabelText, getByText } = renderWithTheme(
			<Popover
				triggerLabel="Open context menu"
				title="Context menu"
				triggerMode="longPress"
				hapticFeedback="selection"
				trigger={<View />}
			>
				<View>
					<Button title="Archive" onPress={jest.fn()} />
				</View>
			</Popover>,
		);

		fireEvent(getByLabelText('Open context menu'), 'longPress');

		expect(selectionAsync).toHaveBeenCalledTimes(1);
		expect(getByText('Context menu')).toBeTruthy();
	});
});
