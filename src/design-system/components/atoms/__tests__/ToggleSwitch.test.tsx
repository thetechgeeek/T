import React from 'react';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { ToggleSwitch } from '../ToggleSwitch';

describe('ToggleSwitch', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders label and description', () => {
		const { getByText } = renderWithTheme(
			<ToggleSwitch
				label="Lock overdue invoices"
				description="Prevent edits after the due date passes."
			/>,
		);

		expect(getByText('Lock overdue invoices')).toBeTruthy();
		expect(getByText('Prevent edits after the due date passes.')).toBeTruthy();
	});

	it('supports controlled state', () => {
		const { getByTestId } = renderWithTheme(
			<ToggleSwitch label="Enabled" value={true} testID="toggle" />,
		);

		expect(getByTestId('toggle')).toHaveProp('accessibilityState', {
			checked: true,
			disabled: false,
		});
	});

	it('toggles and announces the state change', () => {
		const onValueChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<ToggleSwitch label="Auto reminders" onValueChange={onValueChange} testID="toggle" />,
		);

		fireEvent.press(getByTestId('toggle'));

		expect(getByTestId('toggle')).toHaveProp('accessibilityState', {
			checked: true,
			disabled: false,
		});
		expect(onValueChange).toHaveBeenCalledWith(true, { source: 'toggle' });
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'Auto reminders on',
		);
		expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
	});

	it('does not toggle when disabled', () => {
		const onValueChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<ToggleSwitch
				label="Auto reminders"
				disabled
				onValueChange={onValueChange}
				testID="toggle"
			/>,
		);

		fireEvent.press(getByTestId('toggle'));

		expect(onValueChange).not.toHaveBeenCalled();
		expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
	});

	it('adds hitSlop for the compact thumb control', () => {
		const { getByTestId } = renderWithTheme(
			<ToggleSwitch label="Auto reminders" testID="toggle" />,
		);

		expect(getByTestId('toggle').props.hitSlop).toBeGreaterThanOrEqual(4);
	});
});
