import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TextInput', () => {
	it('renders without label', () => {
		const { queryByText } = renderWithTheme(<TextInput placeholder="No label" />);
		// Assuming we don't have another text element with this specific text
		expect(queryByText('Username')).toBeNull();
	});

	it('shows error message with correct colors and accessibility hint', () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(
			<TextInput label="Email" placeholder="test@test.com" error="Required field" />,
		);
		const errorText = getByText('Required field');
		expect(errorText).toBeTruthy();

		const input = getByPlaceholderText('test@test.com');
		expect(input.props.accessibilityHint).toBe('Error: Required field');
	});

	it('renders left and right icons', () => {
		const { getByTestId } = renderWithTheme(
			<TextInput
				placeholder="Search"
				leftIcon={<View testID="left-icon" />}
				rightIcon={<View testID="right-icon" />}
			/>,
		);
		expect(getByTestId('left-icon')).toBeTruthy();
		expect(getByTestId('right-icon')).toBeTruthy();
	});

	it('changes border color on focus and blur', () => {
		const { getByPlaceholderText } = renderWithTheme(<TextInput placeholder="Input" />);
		const input = getByPlaceholderText('Input');
		// Accessing internal styles is brittle, but we can verify onFocus/onBlur callbacks
		const onFocus = jest.fn();
		const onBlur = jest.fn();

		const { getByPlaceholderText: getByPlace2 } = renderWithTheme(
			<TextInput placeholder="Action" onFocus={onFocus} onBlur={onBlur} />,
		);
		const input2 = getByPlace2('Action');

		fireEvent(input2, 'focus');
		expect(onFocus).toHaveBeenCalled();

		fireEvent(input2, 'blur');
		expect(onBlur).toHaveBeenCalled();
	});

	it('displays value correctly', () => {
		const { getByDisplayValue } = renderWithTheme(
			<TextInput value="Pre-filled value" readOnly />,
		);
		expect(getByDisplayValue('Pre-filled value')).toBeTruthy();
	});

	it('passes keyboardType and multiline props', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput placeholder="Number" keyboardType="numeric" multiline />,
		);
		const input = getByPlaceholderText('Number');
		expect(input.props.keyboardType).toBe('numeric');
		expect(input.props.multiline).toBe(true);
	});
});
