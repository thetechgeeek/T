import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import ScanTab from '@/app/(app)/(tabs)/scan';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';
import { inventoryService } from '@/src/services/inventoryService';
import { useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';

jest.mock('expo-camera', () => ({
	CameraView: 'CameraView',
	useCameraPermissions: jest.fn(),
}));

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItems: jest.fn(),
	},
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string, opts?: Record<string, unknown>) => {
			const map: Record<string, string> = {
				'common.errorTitle': 'Error',
				'common.ok': 'OK',
				'common.unexpectedError': 'Unexpected error',
				'common.cancel': 'Cancel',
				'scanner.grantPermission': 'Grant Permission',
				'scanner.manualEntry': 'Manual Entry',
				'scanner.manualEntryPlaceholder': 'Enter item or design #',
				'scanner.searchHint': 'Type an item name or design number to search',
				'scanner.itemNotFound': 'Not Found',
				'scanner.noMatchFound': 'No item found matching "{{query}}".',
				'inventory.add': 'Add Item',
			};
			let val = map[key] ?? key.split('.').pop() ?? key;
			if (opts) {
				val = val.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) =>
					k in opts ? String(opts[k]) : `{{${k}}}`,
				);
			}
			return val;
		},
	}),
}));

const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
});

// Permission hook is already imported at top level

describe('ScanTab — permission states', () => {
	it('renders nothing while permission is loading (null)', () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([null, jest.fn()]);
		const { toJSON } = renderWithTheme(<ScanTab />);
		expect(toJSON()).not.toBeNull();
	});

	it('renders Grant Permission button when permission denied', () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([{ granted: false }, jest.fn()]);
		const { getByText } = renderWithTheme(<ScanTab />);
		expect(getByText('Grant Permission')).toBeTruthy();
	});

	it('calls requestPermission on Grant Permission press', () => {
		const mockRequest = jest.fn();
		(useCameraPermissions as jest.Mock).mockReturnValue([{ granted: false }, mockRequest]);
		const { getByText } = renderWithTheme(<ScanTab />);
		fireEvent.press(getByText('Grant Permission'));
		expect(mockRequest).toHaveBeenCalled();
	});

	it('renders Manual Entry when camera permission granted', () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
		const { getByText } = renderWithTheme(<ScanTab />);
		expect(getByText('Manual Entry')).toBeTruthy();
	});
});

describe('ScanTab — manual search', () => {
	beforeEach(() => {
		(useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
	});

	it('navigates to inventory item when single result found', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({
			data: [{ id: 'inv-1', design_name: 'Elite', base_item_number: 'E001' }],
		});

		const { getByPlaceholderText, getByText } = renderWithTheme(<ScanTab />);
		fireEvent.changeText(getByPlaceholderText('Enter item or design #'), 'Elite');
		fireEvent.press(getByText(''));

		await waitFor(() => {
			expect(inventoryService.fetchItems).toHaveBeenCalledWith({ search: 'Elite' });
		});
	});

	it('does not search when input is empty', async () => {
		const { getByText } = renderWithTheme(<ScanTab />);
		fireEvent.press(getByText(''));

		await waitFor(() => {
			expect(inventoryService.fetchItems).not.toHaveBeenCalled();
		});
	});

	it('shows Not Found alert when no items returned', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: [] });

		const { getByPlaceholderText, getByText } = renderWithTheme(<ScanTab />);
		fireEvent.changeText(getByPlaceholderText('Enter item or design #'), 'Nonexistent');
		fireEvent.press(getByText(''));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				'Not Found',
				expect.stringContaining('Nonexistent'),
				expect.any(Array),
			);
		});
	});
});
