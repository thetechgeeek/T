import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ListItem } from '../ListItem';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ListItem', () => {
	it('renders title text', () => {
		const { getByText } = renderWithTheme(<ListItem title="Invoice #001" />);
		expect(getByText('Invoice #001')).toBeTruthy();
	});

	it('renders subtitle when provided', () => {
		const { getByText } = renderWithTheme(
			<ListItem title="Rahul Tiles" subtitle="Last purchase: ₹5000" />,
		);
		expect(getByText('Last purchase: ₹5000')).toBeTruthy();
	});

	it('does not render subtitle when not provided', () => {
		const { queryByText } = renderWithTheme(<ListItem title="Title Only" />);
		// No subtitle text should appear
		expect(queryByText(/Last purchase/)).toBeNull();
	});

	it('renders left icon when provided', () => {
		const { getByTestId } = renderWithTheme(
			<ListItem title="With Icon" leftIcon={<Text testID="left-icon">Icon</Text>} />,
		);
		expect(getByTestId('left-icon')).toBeTruthy();
	});

	it('renders right element when provided', () => {
		const { getByTestId } = renderWithTheme(
			<ListItem title="With Right" rightElement={<Text testID="right-elem">₹1000</Text>} />,
		);
		expect(getByTestId('right-elem')).toBeTruthy();
	});

	it('calls onPress callback when pressed', () => {
		const onPress = jest.fn();
		const { getByText } = renderWithTheme(
			<ListItem title="Pressable Item" onPress={onPress} />,
		);
		fireEvent.press(getByText('Pressable Item'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('does not crash when no onPress provided', () => {
		expect(() => renderWithTheme(<ListItem title="No Press" />)).not.toThrow();
	});

	it('shows chevron icon when onPress is provided and showChevron=true (default)', () => {
		const { toJSON } = renderWithTheme(<ListItem title="Chevron" onPress={jest.fn()} />);
		// Lucide ChevronRight mock renders as Icon with name="ChevronRight"
		const json = JSON.stringify(toJSON());
		expect(json).toContain('ChevronRight');
	});

	it('does not show chevron when showChevron=false', () => {
		const { toJSON } = renderWithTheme(
			<ListItem title="No Chevron" onPress={jest.fn()} showChevron={false} />,
		);
		const json = JSON.stringify(toJSON());
		expect(json).not.toContain('ChevronRight');
	});

	it('does not show chevron when onPress is not provided', () => {
		const { toJSON } = renderWithTheme(<ListItem title="Static Item" />);
		const json = JSON.stringify(toJSON());
		expect(json).not.toContain('ChevronRight');
	});

	it('has correct accessibilityRole=button on the container', () => {
		const { toJSON } = renderWithTheme(<ListItem title="Accessible" onPress={jest.fn()} />);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('"button"');
	});

	it('has accessibilityLabel matching the title', () => {
		const { getByLabelText } = renderWithTheme(
			<ListItem title="My Label" onPress={jest.fn()} />,
		);
		expect(getByLabelText('My Label')).toBeTruthy();
	});
});
