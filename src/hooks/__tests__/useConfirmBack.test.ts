import { renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useConfirmBack } from '../useConfirmBack';

/**
 * useConfirmBack uses navigation.addListener('beforeRemove', ...) from expo-router's useNavigation.
 * When isDirty=true, it intercepts back navigation and shows an Alert.
 */

const mockDispatch = jest.fn();
const mockAddListener = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('expo-router', () => ({
	useNavigation: jest.fn(() => ({
		addListener: mockAddListener,
		dispatch: mockDispatch,
	})),
	useRouter: () => ({
		replace: jest.fn(),
		push: jest.fn(),
		back: jest.fn(),
	}),
}));

describe('useConfirmBack', () => {
	let alertSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
		// addListener returns an unsubscribe function
		mockAddListener.mockReturnValue(mockUnsubscribe);
	});

	afterEach(() => {
		alertSpy.mockRestore();
	});

	it('clean form (isDirty=false) — does NOT add a beforeRemove listener', () => {
		renderHook(() => useConfirmBack(false));
		expect(mockAddListener).not.toHaveBeenCalled();
	});

	it('dirty form (isDirty=true) — registers a beforeRemove listener', () => {
		renderHook(() => useConfirmBack(true));
		expect(mockAddListener).toHaveBeenCalledWith('beforeRemove', expect.any(Function));
	});

	it('dirty form — pressing back shows Alert and does NOT dispatch immediately', () => {
		renderHook(() => useConfirmBack(true));

		// Simulate beforeRemove event
		const handler = mockAddListener.mock.calls[0][1];
		const mockEvent = {
			preventDefault: jest.fn(),
			data: { action: { type: 'GO_BACK' } },
		};
		handler(mockEvent);

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(alertSpy).toHaveBeenCalled();
		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it('confirming Alert triggers navigation.dispatch', () => {
		renderHook(() => useConfirmBack(true));

		const handler = mockAddListener.mock.calls[0][1];
		const mockAction = { type: 'GO_BACK' };
		handler({ preventDefault: jest.fn(), data: { action: mockAction } });

		// Find the "Discard" button onPress in Alert.alert call
		const buttons = alertSpy.mock.calls[0][2] as { style?: string; onPress?: () => void }[];
		const discardButton = buttons.find((b) => b.style === 'destructive');
		expect(discardButton).toBeDefined();
		discardButton?.onPress?.();

		expect(mockDispatch).toHaveBeenCalledWith(mockAction);
	});

	it('cancelling Alert does NOT trigger navigation.dispatch', () => {
		renderHook(() => useConfirmBack(true));

		const handler = mockAddListener.mock.calls[0][1];
		handler({ preventDefault: jest.fn(), data: { action: { type: 'GO_BACK' } } });

		// Find the "Stay" (cancel) button onPress
		const buttons = alertSpy.mock.calls[0][2] as { style?: string; onPress?: () => void }[];
		const cancelButton = buttons.find((b) => b.style === 'cancel');
		expect(cancelButton).toBeDefined();

		// Cancel buttons typically have no onPress or a no-op
		if (cancelButton?.onPress) {
			cancelButton.onPress();
		}

		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it('unsubscribes listener when isDirty becomes false', () => {
		const { rerender } = renderHook(
			({ isDirty }: { isDirty: boolean }) => useConfirmBack(isDirty),
			{ initialProps: { isDirty: true } },
		);

		expect(mockAddListener).toHaveBeenCalledTimes(1);

		// Changing isDirty to false should clean up the listener
		rerender({ isDirty: false });

		expect(mockUnsubscribe).toHaveBeenCalled();
	});
});
