import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderWithTheme } from '../../utils/renderWithTheme';
import SetupScreen from '@/app/(auth)/setup';

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: () => ({ replace: mockReplace, back: mockBack }),
	useLocalSearchParams: () => ({}),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockUpsert = jest.fn();

jest.mock('@/src/services/businessProfileService', () => ({
	businessProfileService: {
		upsert: jest.fn().mockImplementation(() => mockUpsert()),
		get: jest.fn().mockResolvedValue(null),
	},
}));

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(() => ({
		user: { phone: '+919876543210' },
		loading: false,
	})),
}));

describe('SetupScreen — 4-step wizard', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUpsert.mockResolvedValue({});
	});

	it('renders Step 1 initially with progress indicator', () => {
		const { getByTestId, getByText } = renderWithTheme(<SetupScreen />);
		expect(getByTestId('step-indicator')).toBeTruthy();
		expect(getByText(/1.*4|चरण 1/)).toBeTruthy();
		expect(getByTestId('business-name-input')).toBeTruthy();
		expect(getByTestId('owner-name-input')).toBeTruthy();
	});

	it('Next button is disabled on Step 1 when required fields empty', () => {
		const { getByTestId } = renderWithTheme(<SetupScreen />);
		expect(getByTestId('next-button')).toHaveProp('accessibilityState', { disabled: true });
	});

	it('Next button enabled on Step 1 when required fields filled', () => {
		const { getByTestId } = renderWithTheme(<SetupScreen />);
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		expect(getByTestId('next-button')).toHaveProp('accessibilityState', { disabled: false });
	});

	it('advances to Step 2 after filling Step 1 and pressing Next', async () => {
		const { getByTestId, getByText } = renderWithTheme(<SetupScreen />);
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		expect(getByText(/2.*4|चरण 2/)).toBeTruthy();
		expect(getByTestId('business-type-grid')).toBeTruthy();
	});

	it('advances to Step 3 from Step 2', async () => {
		const { getByTestId, getByText } = renderWithTheme(<SetupScreen />);
		// Step 1
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 2 — can be skipped
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		expect(getByText(/3.*4|चरण 3/)).toBeTruthy();
		expect(getByTestId('gst-toggle-yes')).toBeTruthy();
		expect(getByTestId('gst-toggle-no')).toBeTruthy();
	});

	it('advances to Step 4 from Step 3', async () => {
		const { getByTestId, getByText } = renderWithTheme(<SetupScreen />);
		// Step 1
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 2
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 3
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		expect(getByText(/4.*4|चरण 4/)).toBeTruthy();
		expect(getByTestId('invoice-prefix-input')).toBeTruthy();
		expect(getByTestId('finish-button')).toBeTruthy();
	});

	it('Back button goes to previous step', async () => {
		const { getByTestId, getByText } = renderWithTheme(<SetupScreen />);
		// Step 1 → 2
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		expect(getByText(/2.*4|चरण 2/)).toBeTruthy();
		// Back to 1
		await act(async () => {
			fireEvent.press(getByTestId('back-button'));
		});
		expect(getByText(/1.*4|चरण 1/)).toBeTruthy();
	});

	it('calls businessProfileService.upsert and navigates home on Finish', async () => {
		const { getByTestId } = renderWithTheme(<SetupScreen />);
		// Step 1
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 2
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 3
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 4 — Finish
		await act(async () => {
			fireEvent.press(getByTestId('finish-button'));
		});
		await waitFor(() => {
			expect(mockUpsert).toHaveBeenCalled();
			expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)');
		});
	});

	it('shows GST input when YES selected on Step 3', async () => {
		const { getByTestId } = renderWithTheme(<SetupScreen />);
		// Step 1 → Step 2 → Step 3
		fireEvent.changeText(getByTestId('business-name-input'), 'Sharma Tiles');
		fireEvent.changeText(getByTestId('owner-name-input'), 'Ramesh Sharma');
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		await act(async () => {
			fireEvent.press(getByTestId('next-button'));
		});
		// Step 3: tap YES
		fireEvent.press(getByTestId('gst-toggle-yes'));
		expect(getByTestId('gstin-input')).toBeTruthy();
	});
});
