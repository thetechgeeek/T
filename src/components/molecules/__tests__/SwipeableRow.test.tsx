import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeableRow } from '../SwipeableRow';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('SwipeableRow', () => {
	it('renders children', () => {
		const { getByText } = renderWithTheme(
			<SwipeableRow onDelete={jest.fn()}>
				<Text>Row content</Text>
			</SwipeableRow>,
		);
		expect(getByText('Row content')).toBeTruthy();
	});

	it('calls onDelete when delete action triggered', () => {
		const onDelete = jest.fn();
		const { getByTestId } = renderWithTheme(
			<SwipeableRow onDelete={onDelete}>
				<Text>Item</Text>
			</SwipeableRow>,
		);
		fireEvent.press(getByTestId('swipeable-delete-btn'));
		expect(onDelete).toHaveBeenCalledTimes(1);
	});

	it('calls onEdit when edit action triggered', () => {
		const onEdit = jest.fn();
		const { getByTestId } = renderWithTheme(
			<SwipeableRow onDelete={jest.fn()} onEdit={onEdit}>
				<Text>Item</Text>
			</SwipeableRow>,
		);
		fireEvent.press(getByTestId('swipeable-edit-btn'));
		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it('does not render edit button when onEdit not provided', () => {
		const { queryByTestId } = renderWithTheme(
			<SwipeableRow onDelete={jest.fn()}>
				<Text>Item</Text>
			</SwipeableRow>,
		);
		expect(queryByTestId('swipeable-edit-btn')).toBeNull();
	});

	it('calls onShare when share action triggered', () => {
		const onShare = jest.fn();
		const { getByTestId } = renderWithTheme(
			<SwipeableRow onDelete={jest.fn()} onShare={onShare}>
				<Text>Item</Text>
			</SwipeableRow>,
		);
		fireEvent.press(getByTestId('swipeable-share-btn'));
		expect(onShare).toHaveBeenCalledTimes(1);
	});
});
