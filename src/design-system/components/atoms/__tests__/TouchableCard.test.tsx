import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { TouchableCard } from '../TouchableCard';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import type { RuntimeQualitySignals } from '@/src/design-system/runtimeSignals';

const renderWithTheme = (
	component: React.ReactElement,
	runtimeOverrides?: Partial<RuntimeQualitySignals>,
) =>
	render(
		<ThemeProvider persist={false} runtimeOverrides={runtimeOverrides}>
			{component}
		</ThemeProvider>,
	);

describe('TouchableCard', () => {
	it('renders children', () => {
		const { getByText } = renderWithTheme(
			<TouchableCard testID="card" onPress={jest.fn()}>
				<Text>Hello</Text>
			</TouchableCard>,
		);
		expect(getByText('Hello')).toBeTruthy();
	});

	it('calls onPress when pressed', () => {
		const onPress = jest.fn();
		const { getByTestId } = renderWithTheme(
			<TouchableCard testID="card" onPress={onPress}>
				<Text>Content</Text>
			</TouchableCard>,
		);
		fireEvent.press(getByTestId('card'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('does not call onPress when disabled', () => {
		const onPress = jest.fn();
		const { getByTestId } = renderWithTheme(
			<TouchableCard testID="card" onPress={onPress} disabled>
				<Text>Content</Text>
			</TouchableCard>,
		);
		fireEvent.press(getByTestId('card'));
		expect(onPress).not.toHaveBeenCalled();
	});

	it('has accessibilityRole button', () => {
		const { getByTestId } = renderWithTheme(
			<TouchableCard testID="card" onPress={jest.fn()}>
				<Text>Content</Text>
			</TouchableCard>,
		);
		expect(getByTestId('card')).toHaveProp('accessibilityRole', 'button');
	});

	it('sets disabled accessibilityState when disabled', () => {
		const { getByTestId } = renderWithTheme(
			<TouchableCard testID="card" onPress={jest.fn()} disabled>
				<Text>Content</Text>
			</TouchableCard>,
		);
		expect(getByTestId('card')).toHaveProp('accessibilityState', { disabled: true });
	});

	it('skips motion feedback when reduced motion is enabled', () => {
		const springSpy = jest.spyOn(Reanimated, 'withSpring');
		const { getByTestId } = renderWithTheme(
			<TouchableCard testID="card" onPress={jest.fn()}>
				<Text>Content</Text>
			</TouchableCard>,
			{ reduceMotionEnabled: true },
		);

		fireEvent(getByTestId('card'), 'pressIn');
		fireEvent(getByTestId('card'), 'pressOut');

		expect(springSpy).not.toHaveBeenCalled();
	});
});
