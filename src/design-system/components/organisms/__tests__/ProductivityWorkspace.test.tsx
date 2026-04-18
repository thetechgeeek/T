import React from 'react';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { ProductivityWorkspace } from '../ProductivityWorkspace';

describe('ProductivityWorkspace', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		act(() => {
			jest.runOnlyPendingTimers();
		});
		jest.useRealTimers();
	});

	it('copies values, opens sharing, exports files, and runs the import flow', async () => {
		const { getByTestId, getByText } = renderWithTheme(<ProductivityWorkspace />);

		fireEvent.press(getByText('Copy ID'));
		await waitFor(() => expect(Clipboard.setStringAsync).toHaveBeenCalledWith('INV-482'));

		fireEvent.press(getByText('Share link'));
		await waitFor(() =>
			expect(Share.share).toHaveBeenCalledWith({
				message: 'https://timemaster.app/design-system/patterns/import-export',
				url: 'https://timemaster.app/design-system/patterns/import-export',
			}),
		);

		fireEvent(getByTestId('productivity-workspace-shortcut-input'), 'keyPress', {
			nativeEvent: { key: '?' },
		});
		expect(
			getByText('Captured shortcut help request for the settings/help surface.'),
		).toBeTruthy();

		fireEvent.press(getByText('Export CSV'));
		await waitFor(() => expect(FileSystem.writeAsStringAsync).toHaveBeenCalled());
		await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());

		fireEvent.press(getByText('Confirm import'));
		act(() => {
			jest.advanceTimersByTime(600);
		});

		expect(getByText('Import confirmed with validation notes attached')).toBeTruthy();
	});
});
