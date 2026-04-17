import React from 'react';
import { Keyboard } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { BottomSheetPicker } from '../BottomSheetPicker';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const OPTIONS = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' },
];

describe('BottomSheetPicker', () => {
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
		jest.spyOn(Keyboard, 'addListener').mockImplementation(((
			event: string,
			callback: () => void,
		) => {
			listeners[event] = callback as () => void;
			return { remove: jest.fn() } as any;
		}) as any);

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
		const { getByTestId, UNSAFE_getByType } = renderWithTheme(
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

		fireEvent(getByTestId('bottom-sheet'), 'layout', {
			nativeEvent: { layout: { height: 400, width: 320, x: 0, y: 0 } },
		});

		const gestureHost = UNSAFE_getByType('GestureDetector' as any);
		act(() => {
			gestureHost.props.gesture.handlers.change?.({ translationY: 180 });
			gestureHost.props.gesture.handlers.end?.({ translationY: 180, velocityY: 900 });
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
