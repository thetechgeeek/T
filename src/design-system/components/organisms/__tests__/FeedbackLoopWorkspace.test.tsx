import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { FeedbackLoopWorkspace } from '../FeedbackLoopWorkspace';

describe('FeedbackLoopWorkspace', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		act(() => {
			jest.runOnlyPendingTimers();
		});
		jest.useRealTimers();
	});

	it('handles optimistic rollback and background job completion', () => {
		const { getByText } = renderWithTheme(<FeedbackLoopWorkspace />);

		fireEvent.press(getByText('Apply optimistic edit'));
		expect(getByText('Approval gate: Approved locally')).toBeTruthy();

		fireEvent.press(getByText('Rollback'));
		expect(getByText('Approval gate: Waiting')).toBeTruthy();

		fireEvent.press(getByText('Start job'));
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		expect(getByText('JOB-24018 • completed')).toBeTruthy();
	});

	it('contains section failures inside the local boundary', () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const { getByText } = renderWithTheme(<FeedbackLoopWorkspace />);

		fireEvent.press(getByText('Trigger section failure'));

		expect(getByText('Section boundary recovered')).toBeTruthy();

		errorSpy.mockRestore();
	});
});
