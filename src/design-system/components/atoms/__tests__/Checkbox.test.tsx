import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { Checkbox, CheckboxGroup } from '../Checkbox';

describe('Checkbox', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders label and description', () => {
		const { getByText } = renderWithTheme(
			<Checkbox
				label="Email alerts"
				description="Notify approvers when an invoice is blocked."
			/>,
		);

		expect(getByText('Email alerts')).toBeTruthy();
		expect(getByText('Notify approvers when an invoice is blocked.')).toBeTruthy();
	});

	it('supports default checked state', () => {
		const { getByTestId } = renderWithTheme(
			<Checkbox label="Email alerts" defaultChecked testID="checkbox" />,
		);

		expect(getByTestId('checkbox')).toHaveProp('accessibilityState', {
			checked: true,
			disabled: false,
		});
	});

	it('supports indeterminate state and resolves to checked on press', () => {
		const onCheckedChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<Checkbox
				label="Apply to current and future items"
				indeterminate
				onCheckedChange={onCheckedChange}
				testID="checkbox"
			/>,
		);

		expect(getByTestId('checkbox')).toHaveProp('accessibilityState', {
			checked: 'mixed',
			disabled: false,
		});

		fireEvent.press(getByTestId('checkbox'));

		expect(getByTestId('checkbox')).toHaveProp('accessibilityState', {
			checked: true,
			disabled: false,
		});
		expect(onCheckedChange).toHaveBeenCalledWith(true, { source: 'toggle' });
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'Apply to current and future items checked',
		);
	});

	it('does not toggle when disabled', () => {
		const onCheckedChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<Checkbox
				label="Disabled"
				disabled
				onCheckedChange={onCheckedChange}
				testID="checkbox"
			/>,
		);

		fireEvent.press(getByTestId('checkbox'));

		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
	});

	it('supports grouped checkbox values', () => {
		const onValuesChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<CheckboxGroup
				label="Delivery channels"
				defaultValues={['email']}
				onValuesChange={onValuesChange}
				options={[
					{ label: 'Email', value: 'email', testID: 'checkbox-email' },
					{ label: 'SMS', value: 'sms', testID: 'checkbox-sms' },
				]}
			/>,
		);

		fireEvent.press(getByTestId('checkbox-sms'));

		expect(onValuesChange).toHaveBeenCalledWith(['email', 'sms'], { source: 'toggle' });
	});
});
