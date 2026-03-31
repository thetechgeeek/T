import { renderHook } from '@testing-library/react-native';
import { useRefreshOnFocus } from '../useRefreshOnFocus';

/**
 * useRefreshOnFocus calls `onRefresh` every time the screen comes into focus
 * via expo-router's useFocusEffect.
 *
 * The global jest.setup.ts mock for expo-router does NOT include useFocusEffect,
 * so we provide a local override that captures the registered callback for
 * controlled focus simulation.
 */

let capturedFocusCallback: (() => void) | null = null;

jest.mock('expo-router', () => ({
	useFocusEffect: jest.fn((cb: () => void) => {
		// Store callback for manual simulation
		capturedFocusCallback = cb;
	}),
	useRouter: () => ({
		replace: jest.fn(),
		push: jest.fn(),
		back: jest.fn(),
	}),
}));

describe('useRefreshOnFocus', () => {
	beforeEach(() => {
		capturedFocusCallback = null;
	});

	it('does NOT call refetch on initial render', () => {
		const refetch = jest.fn();
		renderHook(() => useRefreshOnFocus(refetch));
		// useFocusEffect registers the callback but does not fire it
		expect(refetch).not.toHaveBeenCalled();
	});

	it('calls refetch when the screen comes into focus', () => {
		const refetch = jest.fn();
		renderHook(() => useRefreshOnFocus(refetch));

		expect(capturedFocusCallback).not.toBeNull();
		capturedFocusCallback!();

		expect(refetch).toHaveBeenCalledTimes(1);
	});

	it('does NOT call refetch again without another focus event', () => {
		const refetch = jest.fn();
		renderHook(() => useRefreshOnFocus(refetch));

		// Simulate one focus
		capturedFocusCallback!();
		expect(refetch).toHaveBeenCalledTimes(1);

		// No further call without another focus event
		expect(refetch).toHaveBeenCalledTimes(1);
	});
});
