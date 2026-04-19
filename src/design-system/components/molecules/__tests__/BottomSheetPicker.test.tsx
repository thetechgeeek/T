import React from 'react';
import { Keyboard, Modal, type EmitterSubscription } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { BottomSheetPicker } from '../BottomSheetPicker';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { setAccessibilityFocus } from '@/src/utils/accessibility';

jest.mock('@/src/utils/accessibility', () => {
	const actual = jest.requireActual('@/src/utils/accessibility');
	return {
		...actual,
		setAccessibilityFocus: jest.fn(),
	};
});

const mockSetAccessibilityFocus = jest.mocked(setAccessibilityFocus);

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

function createSubscription(): EmitterSubscription {
	return { remove: jest.fn() };
}

function getGestureHost(result: ReturnType<typeof renderWithTheme>) {
	return result.UNSAFE_getByType('GestureDetector' as never) as {
		props: {
			gesture: {
				handlers?: {
					change?: (event: { translationY: number }) => void;
					end?: (event: { translationY: number; velocityY: number }) => void;
				};
			};
		};
	};
}

const OPTIONS = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' },
];

describe('BottomSheetPicker', () => {
	beforeEach(() => {
		mockSetAccessibilityFocus.mockClear();
	});

	it('does not render options when closed', () => {
		const { queryByText } = renderWithTheme(
			<BottomSheetPicker
				visible={false}
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		expect(queryByText('Apple')).toBeNull();
	});

	it('renders all options when visible', () => {
		const { getByText } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		expect(getByText('Apple')).toBeTruthy();
		expect(getByText('Banana')).toBeTruthy();
		expect(getByText('Cherry')).toBeTruthy();
	});

	it('renders title in header', () => {
		const { getByText } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		expect(getByText('Select Fruit')).toBeTruthy();
	});

	it('supports compact and relaxed density spacing', () => {
		const { getByPlaceholderText, rerender } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				density="compact"
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);

		const compactStyle = flattenStyle(getByPlaceholderText('Search...').props.style) as {
			marginHorizontal: number;
			paddingHorizontal: number;
		};

		rerender(
			<ThemeProvider>
				<BottomSheetPicker
					visible
					title="Select Fruit"
					options={OPTIONS}
					density="relaxed"
					onSelect={jest.fn()}
					onClose={jest.fn()}
				/>
			</ThemeProvider>,
		);

		const relaxedStyle = flattenStyle(getByPlaceholderText('Search...').props.style) as {
			marginHorizontal: number;
			paddingHorizontal: number;
		};

		expect(compactStyle.marginHorizontal).toBeGreaterThan(0);
		expect(compactStyle.paddingHorizontal).toBeGreaterThan(0);
		expect(compactStyle.marginHorizontal).toBeLessThan(relaxedStyle.marginHorizontal);
		expect(compactStyle.paddingHorizontal).toBeLessThan(relaxedStyle.paddingHorizontal);
	});

	it('calls onSelect with correct value when option pressed', () => {
		const onSelect = jest.fn();
		const { getByText } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={onSelect}
				onClose={jest.fn()}
			/>,
		);
		fireEvent.press(getByText('Banana'));
		expect(onSelect).toHaveBeenCalledWith('banana');
	});

	it('calls onClose when close button pressed', () => {
		const onClose = jest.fn();
		const { getByTestId } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={onClose}
			/>,
		);
		fireEvent.press(getByTestId('bottom-sheet-close'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('dismisses through the native back or escape request-close path', () => {
		const onClose = jest.fn();
		const { UNSAFE_getByType } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={onClose}
			/>,
		);

		UNSAFE_getByType(Modal).props.onRequestClose();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('marks the sheet as modal, labels the search field, and restores focus after dismiss', async () => {
		const restoreFocusRef = { current: {} };
		function StatefulSheet() {
			const [open, setOpen] = React.useState(true);

			return (
				<BottomSheetPicker
					visible={open}
					title="Select Fruit"
					options={OPTIONS}
					restoreFocusRef={restoreFocusRef}
					onSelect={jest.fn()}
					onClose={() => setOpen(false)}
				/>
			);
		}

		const { getByLabelText, getByTestId, UNSAFE_getAllByProps } = renderWithTheme(
			<StatefulSheet />,
		);

		await act(async () => {
			await Promise.resolve();
		});

		expect(
			UNSAFE_getAllByProps({ accessibilityViewIsModal: true })[0]?.props
				.importantForAccessibility,
		).toBe('yes');
		expect(getByLabelText('Select Fruit search')).toBeTruthy();

		mockSetAccessibilityFocus.mockClear();
		fireEvent.press(getByTestId('bottom-sheet-close'));

		await act(async () => {
			await Promise.resolve();
		});

		expect(mockSetAccessibilityFocus).toHaveBeenCalledWith(restoreFocusRef);
	});

	it('filters options by search text', () => {
		const { getByPlaceholderText, getByText, queryByText } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		fireEvent.changeText(getByPlaceholderText('Search...'), 'ban');
		expect(getByText('Banana')).toBeTruthy();
		expect(queryByText('Apple')).toBeNull();
	});

	it('shows selected item with checkmark', () => {
		const { getByTestId } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				selectedValue="apple"
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		expect(getByTestId('check-apple')).toBeTruthy();
	});

	it('shows Add New button when allowAdd is true', () => {
		const { getByText } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				onSelect={jest.fn()}
				onClose={jest.fn()}
				allowAdd
				onAddNew={jest.fn()}
			/>,
		);
		expect(getByText(/नया जोड़ें|Add new/i)).toBeTruthy();
	});

	it('supports grouped options, multi-select, and explicit confirm', () => {
		const onValuesChange = jest.fn();
		const { getByText, getByTestId } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={[]}
				sections={[
					{ label: 'Citrus', options: [{ label: 'Orange', value: 'orange' }] },
					{ label: 'Berries', options: [{ label: 'Berry', value: 'berry' }] },
				]}
				multiple
				selectedValues={['orange']}
				onValuesChange={onValuesChange}
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		expect(getByText('Citrus')).toBeTruthy();
		fireEvent.press(getByText('Berry'));
		expect(onValuesChange).toHaveBeenCalledWith(['orange', 'berry']);
		fireEvent.press(getByTestId('bottom-sheet-confirm'));
	});

	it('shows loading and empty states', () => {
		const { getByText, rerender } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				loading
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);
		expect(getByText('Loading options…')).toBeTruthy();

		rerender(
			<ThemeProvider>
				<BottomSheetPicker
					visible
					title="Select Fruit"
					options={[]}
					emptyLabel="Nothing here"
					onSelect={jest.fn()}
					onClose={jest.fn()}
				/>
			</ThemeProvider>,
		);
		expect(getByText('Nothing here')).toBeTruthy();
	});

	it('supports snap-point sizing and closes from the backdrop', () => {
		const onClose = jest.fn();
		const { getByTestId } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				snapPoint="90%"
				testID="bottom-sheet"
				onSelect={jest.fn()}
				onClose={onClose}
			/>,
		);

		expect(flattenStyle(getByTestId('bottom-sheet').props.style)).toEqual(
			expect.objectContaining({ height: '90%' }),
		);

		fireEvent.press(getByTestId('bottom-sheet-backdrop'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('promotes the sheet to the tall snap point when the keyboard opens', () => {
		const listeners: Record<string, () => void> = {};
		const addListenerMock: typeof Keyboard.addListener = (
			event,
			callback,
		): EmitterSubscription => {
			listeners[event] = callback;
			return createSubscription();
		};
		jest.spyOn(Keyboard, 'addListener').mockImplementation(addListenerMock);

		const { getByTestId } = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				snapPoint="25%"
				snapPoints={['25%', '50%', '90%']}
				keyboardAware
				testID="bottom-sheet"
				onSelect={jest.fn()}
				onClose={jest.fn()}
			/>,
		);

		act(() => {
			listeners.keyboardDidShow?.();
		});

		expect(flattenStyle(getByTestId('bottom-sheet').props.style)).toEqual(
			expect.objectContaining({ height: '90%' }),
		);
	});

	it('dismisses when dragged with enough velocity', () => {
		const onClose = jest.fn();
		const result = renderWithTheme(
			<BottomSheetPicker
				visible
				title="Select Fruit"
				options={OPTIONS}
				dragToDismiss
				testID="bottom-sheet"
				onSelect={jest.fn()}
				onClose={onClose}
			/>,
		);

		fireEvent(result.getByTestId('bottom-sheet'), 'layout', {
			nativeEvent: { layout: { height: 400, width: 320, x: 0, y: 0 } },
		});

		const gestureHost = getGestureHost(result);
		act(() => {
			gestureHost.props.gesture.handlers.change?.({ translationY: 180 });
			gestureHost.props.gesture.handlers.end?.({ translationY: 180, velocityY: 900 });
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
