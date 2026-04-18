import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { CrudWorkspace } from '../CrudWorkspace';

describe('CrudWorkspace', () => {
	it('supports swipe archive and escalated delete confirmation flows', () => {
		const { getAllByTestId, getByText } = renderWithTheme(<CrudWorkspace />);

		fireEvent.press(getAllByTestId('swipeable-delete-btn')[0]);
		expect(getByText('Move to archive')).toBeTruthy();

		fireEvent.press(getAllByTestId('swipeable-archive-btn')[0]);

		expect(getByText('Archive / trash')).toBeTruthy();
		expect(getByText('Restore')).toBeTruthy();
		expect(getByText('Permanently delete')).toBeTruthy();
		expect(getByText('Version history / audit log')).toBeTruthy();
	});
});
