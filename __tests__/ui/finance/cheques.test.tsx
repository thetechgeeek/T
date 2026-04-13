import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import ChequesScreen from '@/app/(app)/finance/cheques';
import { renderWithTheme } from '../../utils/renderWithTheme';

describe('ChequesScreen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-04-09T00:00:00.000Z'));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('shows due-soon received cheques by default', () => {
		const { getByText } = renderWithTheme(<ChequesScreen />);

		expect(getByText(/2 cheques due to deposit within 3 days/i)).toBeTruthy();
		expect(getByText('Rajesh Kumar')).toBeTruthy();
		expect(getByText('Sharma Tiles')).toBeTruthy();
	});

	it('switches to issued cheques tab', () => {
		const { getByText, queryByText } = renderWithTheme(<ChequesScreen />);

		fireEvent.press(getByText('Issued'));

		expect(getByText('Kajaria Ceramics')).toBeTruthy();
		expect(queryByText(/due to deposit within 3 days/i)).toBeNull();
	});
});
