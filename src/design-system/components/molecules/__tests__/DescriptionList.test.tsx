import React from 'react';
import { AccessibilityInfo, Clipboard } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { DescriptionList } from '../DescriptionList';

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const items = [
	{
		id: 'account',
		label: 'Account number',
		value: 'INV-2048',
		copyable: true,
	},
	{
		id: 'iban',
		label: 'IBAN',
		value: 'DE12500105170648489890',
		sensitive: true,
		maskedValue: '••••••••••••9890',
	},
];

describe('DescriptionList', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('supports horizontal and vertical layout variants', () => {
		const { rerender, toJSON } = renderWithTheme(
			<DescriptionList items={items} layout="horizontal" />,
		);

		const horizontalRowStyle = flattenStyle(
			(Array.isArray(toJSON()) ? toJSON()[0] : toJSON())?.children?.[0]?.props?.style,
		) as {
			flexDirection: string;
		};
		expect(horizontalRowStyle.flexDirection).toBe('row');

		rerender(<DescriptionList items={items} layout="vertical" />);

		const verticalRowStyle = flattenStyle(
			(Array.isArray(toJSON()) ? toJSON()[0] : toJSON())?.children?.[0]?.props?.style,
		) as {
			flexDirection: string;
		};
		expect(verticalRowStyle.flexDirection).toBe('column');
	});

	it('copies values to the clipboard', () => {
		const { getByTestId } = renderWithTheme(<DescriptionList items={items} />);

		fireEvent.press(getByTestId('account-copy'));

		expect(Clipboard.setString).toHaveBeenCalledWith('INV-2048');
	});

	it('masks and reveals sensitive values intentionally', () => {
		const { getByTestId, getByText, queryByText } = renderWithTheme(
			<DescriptionList items={items} />,
		);

		expect(getByText('••••••••••••9890')).toBeTruthy();
		expect(queryByText('DE12500105170648489890')).toBeNull();

		fireEvent.press(getByTestId('iban-reveal'));

		expect(getByText('DE12500105170648489890')).toBeTruthy();
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('IBAN revealed');
	});
});
