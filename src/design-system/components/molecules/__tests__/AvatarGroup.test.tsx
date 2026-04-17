import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { AvatarGroup } from '../AvatarGroup';

const items = [
	{ id: 'a1', name: 'Asha Patel' },
	{ id: 'a2', name: 'Sam Rivera' },
	{ id: 'a3', name: 'Dana Moss' },
	{ id: 'a4', name: 'Luis Chen' },
];

describe('AvatarGroup', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('shows +N overflow and expands hidden members on tap', () => {
		const onExpandedChange = jest.fn();
		const { getByLabelText, getByTestId, queryByLabelText } = renderWithTheme(
			<AvatarGroup items={items} maxVisible={2} onExpandedChange={onExpandedChange} />,
		);

		expect(getByLabelText('4 avatars in group')).toBeTruthy();
		expect(getByTestId('avatar-group-overflow')).toBeTruthy();
		expect(queryByLabelText('Dana Moss avatar')).toBeNull();

		fireEvent.press(getByTestId('avatar-group-overflow'));

		expect(onExpandedChange).toHaveBeenCalledWith(true);
		expect(getByLabelText('Dana Moss avatar')).toBeTruthy();
		expect(getByTestId('avatar-group-collapse')).toBeTruthy();
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'2 more avatars expanded',
		);
	});

	it('supports collapsing the expanded stack', () => {
		const onExpandedChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<AvatarGroup
				items={items}
				maxVisible={2}
				expanded
				onExpandedChange={onExpandedChange}
			/>,
		);

		fireEvent.press(getByTestId('avatar-group-collapse'));

		expect(onExpandedChange).toHaveBeenCalledWith(false);
	});
});
