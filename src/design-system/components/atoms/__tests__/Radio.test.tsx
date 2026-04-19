import React from 'react';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { Radio, RadioGroup } from '../Radio';

describe('Radio', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('supports default selected state', () => {
		const { getByTestId } = renderWithTheme(
			<Radio label="Weekly summary" defaultSelected testID="radio" />,
		);

		expect(getByTestId('radio')).toHaveProp('accessibilityState', {
			selected: true,
			disabled: false,
		});
	});

	it('selects a radio and announces the change', () => {
		const onSelectedChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<Radio label="Daily summary" onSelectedChange={onSelectedChange} testID="radio" />,
		);

		fireEvent.press(getByTestId('radio'));

		expect(getByTestId('radio')).toHaveProp('accessibilityState', {
			selected: true,
			disabled: false,
		});
		expect(onSelectedChange).toHaveBeenCalledWith(true, { source: 'selection' });
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'Daily summary selected',
		);
		expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
	});

	it('does not select when disabled', () => {
		const onSelectedChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<Radio
				label="Monthly summary"
				disabled
				onSelectedChange={onSelectedChange}
				testID="radio"
			/>,
		);

		fireEvent.press(getByTestId('radio'));

		expect(onSelectedChange).not.toHaveBeenCalled();
	});

	it('supports grouped radio selection', () => {
		const onValueChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<RadioGroup
				label="Digest cadence"
				defaultValue="weekly"
				onValueChange={onValueChange}
				options={[
					{ label: 'Daily', value: 'daily', testID: 'radio-daily' },
					{ label: 'Weekly', value: 'weekly', testID: 'radio-weekly' },
				]}
			/>,
		);

		fireEvent.press(getByTestId('radio-daily'));

		expect(onValueChange).toHaveBeenCalledWith('daily', { source: 'selection' });
	});

	it('adds hitSlop for compact radio controls', () => {
		const { getByTestId } = renderWithTheme(<Radio label="Daily summary" testID="radio" />);

		expect(getByTestId('radio').props.hitSlop).toBeGreaterThanOrEqual(4);
	});
});
