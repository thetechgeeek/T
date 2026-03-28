import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TextInput', () => {
	it('renders label and placeholder', () => {
		const { getByText, getByPlaceholderText } = renderWithTheme(
			<TextInput label="Username" placeholder="Enter username" />,
		);
		expect(getByText('Username')).toBeTruthy();
		expect(getByPlaceholderText('Enter username')).toBeTruthy();
	});

	it('calls onChangeText when text changes', () => {
		const onChangeTextMock = jest.fn();
		const { getByPlaceholderText } = renderWithTheme(
			<TextInput placeholder="Search" onChangeText={onChangeTextMock} />,
		);
		fireEvent.changeText(getByPlaceholderText('Search'), 'hello');
		expect(onChangeTextMock).toHaveBeenCalledWith('hello');
	});

	it('shows error message', () => {
		const { getByText } = renderWithTheme(
			<TextInput label="Email" error="Invalid email address" />,
		);
		expect(getByText('Invalid email address')).toBeTruthy();
	});
});
