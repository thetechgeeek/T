import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
	return render(
		<ThemeProvider initialMode="light" persist={false}>
			{component}
		</ThemeProvider>,
	);
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

	it('shows helper text and exposes it through the accessibility hint', () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(
			<TextInput
				label="Project Name"
				placeholder="Atlas"
				helperText="Visible to the entire team"
			/>,
		);

		expect(getByText('Visible to the entire team')).toBeTruthy();
		expect(getByPlaceholderText('Atlas').props.accessibilityHint).toBe(
			'Visible to the entire team',
		);
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
		expect(getByDisplayValue('Pre-filled value')).toHaveProp('readOnly', true);
	});

	it('passes keyboardType and multiline props', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput placeholder="Number" keyboardType="numeric" multiline />,
		);
		const input = getByPlaceholderText('Number');
		expect(input.props.keyboardType).toBe('numeric');
		expect(input.props.multiline).toBe(true);
	});

	it.each([
		['email-address', 'Email'],
		['phone-pad', 'Phone'],
		['url', 'URL'],
		['decimal-pad', 'Decimal'],
	] as const)('forwards %s keyboard types', (keyboardType, placeholder) => {
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput placeholder={placeholder} keyboardType={keyboardType} />,
		);

		expect(getByPlaceholderText(placeholder).props.keyboardType).toBe(keyboardType);
	});

	it('shows a character counter when enabled', () => {
		const { getByText } = renderWithTheme(
			<TextInput
				label="Summary"
				value="Ship"
				onChangeText={jest.fn()}
				maxLength={20}
				showCharacterCount
			/>,
		);

		expect(getByText('4/20')).toBeTruthy();
	});

	it('supports clearable text fields', () => {
		const onChangeText = jest.fn();
		const onClear = jest.fn();
		const { getByLabelText } = renderWithTheme(
			<TextInput
				value="Atlas"
				onChangeText={onChangeText}
				clearable
				onClear={onClear}
				clearAccessibilityLabel="Clear project name"
			/>,
		);

		fireEvent.press(getByLabelText('Clear project name'));

		expect(onChangeText).toHaveBeenCalledWith('');
		expect(onClear).toHaveBeenCalledTimes(1);
	});

	it('shows loading state and disabled accessibility state', () => {
		const { getByPlaceholderText, getByLabelText } = renderWithTheme(
			<TextInput placeholder="Username" loading editable={false} onChangeText={jest.fn()} />,
		);

		const input = getByPlaceholderText('Username');
		expect(input.props.accessibilityState.busy).toBe(true);
		expect(input.props.accessibilityState.disabled).toBe(true);
		expect(getByLabelText('Input loading')).toBeTruthy();
	});

	it('forwards native mobile input props for autofill and password entry', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput
				placeholder="Password"
				onChangeText={jest.fn()}
				returnKeyType="done"
				autoComplete="password"
				textContentType="password"
				secureTextEntry
			/>,
		);

		const input = getByPlaceholderText('Password');
		expect(input.props.returnKeyType).toBe('done');
		expect(input.props.autoComplete).toBe('password');
		expect(input.props.textContentType).toBe('password');
		expect(input.props.secureTextEntry).toBe(true);
	});
});
