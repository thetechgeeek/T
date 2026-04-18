import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { SearchFilterWorkspace } from '../SearchFilterWorkspace';

describe('SearchFilterWorkspace', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		act(() => {
			jest.runOnlyPendingTimers();
		});
		jest.useRealTimers();
	});

	it('supports suggestions, recent searches, and the mobile filter sheet', () => {
		const { getByPlaceholderText, getByText } = renderWithTheme(<SearchFilterWorkspace />);

		fireEvent.changeText(
			getByPlaceholderText('Search customers, projects, or approval packs'),
			'northwind',
		);
		act(() => {
			jest.runOnlyPendingTimers();
		});

		expect(getByText('northwind supplier onboarding')).toBeTruthy();
		expect(getByText('priority renewal')).toBeTruthy();

		fireEvent.press(getByText('Open mobile filters'));

		expect(getByText('Mobile filters')).toBeTruthy();
		expect(getByText('Active filters')).toBeTruthy();
		expect(getByText('Ops queue')).toBeTruthy();
	});
});
