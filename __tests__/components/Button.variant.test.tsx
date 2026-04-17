import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { View, Text } from 'react-native';

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Button Component Variants', () => {
	describe('Visual Variants', () => {
		it('renders primary variant (default)', () => {
			const { getByText } = renderWithTheme(<Button title="Primary" />);
			expect(getByText('Primary')).toBeTruthy();
		});

		it('renders secondary variant', () => {
			const { getByText } = renderWithTheme(<Button title="Secondary" variant="secondary" />);
			expect(getByText('Secondary')).toBeTruthy();
		});

		it('renders outline variant', () => {
			const { getByText } = renderWithTheme(<Button title="Outline" variant="outline" />);
			expect(getByText('Outline')).toBeTruthy();
		});

		it('renders ghost variant', () => {
			const { getByText } = renderWithTheme(<Button title="Ghost" variant="ghost" />);
			expect(getByText('Ghost')).toBeTruthy();
		});

		it('renders danger variant', () => {
			const { getByText } = renderWithTheme(<Button title="Danger" variant="danger" />);
			expect(getByText('Danger')).toBeTruthy();
		});
	});

	describe('Sizes', () => {
		it('renders small size', () => {
			const { getByText } = renderWithTheme(<Button title="Small" size="sm" />);
			expect(getByText('Small')).toBeTruthy();
		});

		it('renders medium size (default)', () => {
			const { getByText } = renderWithTheme(<Button title="Medium" size="md" />);
			expect(getByText('Medium')).toBeTruthy();
		});

		it('renders large size', () => {
			const { getByText } = renderWithTheme(<Button title="Large" size="lg" />);
			expect(getByText('Large')).toBeTruthy();
		});
	});

	describe('Interactive States', () => {
		it('calls onPress when clicked', () => {
			const onPress = jest.fn();
			const { getByText } = renderWithTheme(<Button title="Click Me" onPress={onPress} />);
			fireEvent.press(getByText('Click Me'));
			expect(onPress).toHaveBeenCalledTimes(1);
		});

		it('does NOT call onPress when disabled', () => {
			const onPress = jest.fn();
			const { getByText } = renderWithTheme(
				<Button title="Disabled" onPress={onPress} disabled />,
			);
			fireEvent.press(getByText('Disabled'));
			expect(onPress).not.toHaveBeenCalled();
		});

		it('shows loading indicator and disables interaction when loading=true', () => {
			const onPress = jest.fn();
			const { getByTestId, queryByText } = renderWithTheme(
				<Button title="Loading" onPress={onPress} loading />,
			);
			expect(getByTestId('loading-indicator')).toBeTruthy();
			expect(queryByText('Loading')).toBeNull(); // Text is hidden during loading

			// Interaction should be disabled
			fireEvent.press(getByTestId('loading-indicator'));
			expect(onPress).not.toHaveBeenCalled();
		});
	});

	describe('Icons', () => {
		it('renders with left icon', () => {
			const LeftIcon = <View testID="left-icon" />;
			const { getByTestId, getByText } = renderWithTheme(
				<Button title="With Icon" leftIcon={LeftIcon} />,
			);
			expect(getByTestId('left-icon')).toBeTruthy();
			expect(getByText('With Icon')).toBeTruthy();
		});

		it('renders with right icon', () => {
			const RightIcon = <View testID="right-icon" />;
			const { getByTestId, getByText } = renderWithTheme(
				<Button title="With Icon" rightIcon={RightIcon} />,
			);
			expect(getByTestId('right-icon')).toBeTruthy();
			expect(getByText('With Icon')).toBeTruthy();
		});
	});
});
