import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BottomSheetPicker } from '../BottomSheetPicker';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

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
});
