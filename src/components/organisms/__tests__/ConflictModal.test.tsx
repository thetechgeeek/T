import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { ConflictModal } from '../ConflictModal';

const baseProps = {
	visible: true,
	onKeepMine: jest.fn(),
	onUseServer: jest.fn(),
	onCancel: jest.fn(),
	fields: [
		{ label: 'Phone', localValue: '9876543210', serverValue: '9999999999' },
		{ label: 'Address', localValue: 'Local Road', serverValue: 'Server Street' },
	],
};

describe('ConflictModal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders the conflict details when visible', () => {
		const { getByText } = renderWithTheme(<ConflictModal {...baseProps} />);

		expect(getByText('Data Conflict Detected')).toBeTruthy();
		expect(getByText('Phone')).toBeTruthy();
		expect(getByText('9876543210')).toBeTruthy();
		expect(getByText('9999999999')).toBeTruthy();
	});

	it('fires the action callbacks', () => {
		const { getByText } = renderWithTheme(<ConflictModal {...baseProps} />);

		fireEvent.press(getByText('Keep My Version'));
		fireEvent.press(getByText('Use Server Version'));
		fireEvent.press(getByText('Cancel'));

		expect(baseProps.onKeepMine).toHaveBeenCalledTimes(1);
		expect(baseProps.onUseServer).toHaveBeenCalledTimes(1);
		expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
	});
});
