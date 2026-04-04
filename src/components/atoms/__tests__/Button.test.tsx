import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button', () => {
	it('renders correctly with title', () => {
		const { getByText } = renderWithTheme(<Button title="Click Me" />);
		expect(getByText('Click Me')).toBeTruthy();
	});

	it('calls onPress when clicked', () => {
		const onPressMock = jest.fn();
		const { getByText } = renderWithTheme(<Button title="Tap" onPress={onPressMock} />);
		fireEvent.press(getByText('Tap'));
		expect(onPressMock).toHaveBeenCalled();
	});

	it('does NOT call onPress when disabled', () => {
		const onPressMock = jest.fn();
		const { getByText } = renderWithTheme(
			<Button title="Disabled" disabled onPress={onPressMock} />,
		);
		fireEvent.press(getByText('Disabled'));
		expect(onPressMock).not.toHaveBeenCalled();
	});

	it('renders with left icon', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<Button title="Edit" leftIcon={<View testID="edit-icon" />} />,
		);
		expect(getByTestId('edit-icon')).toBeTruthy();
		expect(getByText('Edit')).toBeTruthy();
	});

	it('renders with different sizes without crash', () => {
		const { getByText: getSm } = renderWithTheme(<Button title="Small" size="sm" />);
		const { getByText: getLg } = renderWithTheme(<Button title="Large" size="lg" />);
		expect(getSm('Small')).toBeTruthy();
		expect(getLg('Large')).toBeTruthy();
	});
});
