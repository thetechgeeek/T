import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { Button } from '../Button';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { buildTheme } from '@/src/theme/colors';
import type { RuntimeQualitySignals } from '@/src/design-system/runtimeSignals';

const lightTheme = buildTheme(false);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const renderWithTheme = (
	component: React.ReactElement,
	runtimeOverrides?: Partial<RuntimeQualitySignals>,
) => {
	return render(
		<ThemeProvider initialMode="light" persist={false} runtimeOverrides={runtimeOverrides}>
			{component}
		</ThemeProvider>,
	);
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

	it('renders with right icon', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<Button title="Next" rightIcon={<View testID="next-icon" />} />,
		);
		expect(getByTestId('next-icon')).toBeTruthy();
		expect(getByText('Next')).toBeTruthy();
	});

	it('applies the supported primary, secondary, ghost, and danger variants', () => {
		const { getByLabelText } = renderWithTheme(
			<>
				<Button title="Primary" />
				<Button title="Secondary" variant="secondary" />
				<Button title="Ghost" variant="ghost" />
				<Button title="Danger" variant="danger" />
				<Button title="Inverse" variant="inverse" />
			</>,
		);

		expect(flattenStyle(getByLabelText('Primary').props.style)).toEqual(
			expect.objectContaining({ backgroundColor: lightTheme.colors.primary }),
		);
		expect(flattenStyle(getByLabelText('Secondary').props.style)).toEqual(
			expect.objectContaining({ backgroundColor: lightTheme.colors.surfaceVariant }),
		);
		expect(flattenStyle(getByLabelText('Ghost').props.style)).toEqual(
			expect.objectContaining({ backgroundColor: 'transparent' }),
		);
		expect(flattenStyle(getByLabelText('Danger').props.style)).toEqual(
			expect.objectContaining({ backgroundColor: lightTheme.colors.error }),
		);
		expect(flattenStyle(getByLabelText('Inverse').props.style)).toEqual(
			expect.objectContaining({ backgroundColor: lightTheme.visual.surfaces.inverse }),
		);
	});

	it('renders with different sizes without crash', () => {
		const { getByText: getSm } = renderWithTheme(<Button title="Small" size="sm" />);
		const { getByText: getLg } = renderWithTheme(<Button title="Large" size="lg" />);
		expect(getSm('Small')).toBeTruthy();
		expect(getLg('Large')).toBeTruthy();
	});

	it('keeps button heights at or above the mobile touch-target baseline', () => {
		const { getByLabelText } = renderWithTheme(
			<>
				<Button title="Small action" size="sm" />
				<Button title="Default action" size="md" />
				<Button title="Large action" size="lg" />
			</>,
		);

		const smallStyle = flattenStyle(getByLabelText('Small action').props.style) as {
			height: number;
		};
		const mediumStyle = flattenStyle(getByLabelText('Default action').props.style) as {
			height: number;
		};
		const largeStyle = flattenStyle(getByLabelText('Large action').props.style) as {
			height: number;
		};

		expect(smallStyle.height).toBeGreaterThanOrEqual(44);
		expect(mediumStyle.height).toBeGreaterThanOrEqual(48);
		expect(largeStyle.height).toBeGreaterThanOrEqual(56);
	});

	it('shows a loading spinner, marks the button busy, and blocks presses while loading', () => {
		const onPress = jest.fn();
		const { getByLabelText, getByTestId, queryByText } = renderWithTheme(
			<Button title="Saving" loading onPress={onPress} />,
		);

		expect(getByTestId('loading-indicator')).toBeTruthy();
		expect(queryByText('Saving')).toBeNull();
		expect(getByLabelText('Saving')).toHaveProp('accessibilityState', {
			disabled: true,
			busy: true,
		});

		fireEvent.press(getByLabelText('Saving'));
		expect(onPress).not.toHaveBeenCalled();
	});

	it('skips press animations when reduced motion is enabled', () => {
		const springSpy = jest.spyOn(Reanimated, 'withSpring');
		const { getByLabelText } = renderWithTheme(<Button title="Accessible Tap" />, {
			reduceMotionEnabled: true,
		});

		fireEvent(getByLabelText('Accessible Tap'), 'pressIn');
		fireEvent(getByLabelText('Accessible Tap'), 'pressOut');

		expect(springSpy).not.toHaveBeenCalled();
	});
});
