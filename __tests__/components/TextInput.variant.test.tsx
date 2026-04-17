import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { View, Text } from 'react-native';

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('TextInput Component Variants', () => {
	it('renders with label and placeholder', () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(
			<TextInput label="Email" placeholder="Enter email" />,
		);
		expect(getByText('Email')).toBeTruthy();
		expect(getByPlaceholderText('Enter email')).toBeTruthy();
	});

	it('shows error message when error prop is provided', () => {
		const { getByText } = renderWithTheme(<TextInput label="Email" error="Invalid email" />);
		expect(getByText('Invalid email')).toBeTruthy();
	});

	it('shows helper text when provided', () => {
		const { getByText } = renderWithTheme(
			<TextInput label="Password" helperText="Minimal 8 characters" />,
		);
		expect(getByText('Minimal 8 characters')).toBeTruthy();
	});

	it('renders left and right icons', () => {
		const LeftIcon = <View testID="left-icon" />;
		const RightIcon = <View testID="right-icon" />;
		const { getByTestId } = renderWithTheme(
			<TextInput leftIcon={LeftIcon} rightIcon={RightIcon} />,
		);
		expect(getByTestId('left-icon')).toBeTruthy();
		expect(getByTestId('right-icon')).toBeTruthy();
	});

	it('handles focus and blur states', () => {
		const onFocus = jest.fn();
		const onBlur = jest.fn();
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput placeholder="Focus test" onFocus={onFocus} onBlur={onBlur} />,
		);
		const input = getByPlaceholderText('Focus test');

		fireEvent(input, 'focus');
		expect(onFocus).toHaveBeenCalled();

		fireEvent(input, 'blur');
		expect(onBlur).toHaveBeenCalled();
	});

	it('updates text correctly', () => {
		const onChangeText = jest.fn();
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput placeholder="Type here" onChangeText={onChangeText} />,
		);
		const input = getByPlaceholderText('Type here');

		fireEvent.changeText(input, 'Hello');
		expect(onChangeText).toHaveBeenCalledWith('Hello');
	});
});
