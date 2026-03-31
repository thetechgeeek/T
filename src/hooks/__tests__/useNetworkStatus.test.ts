import { renderHook, act } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useNetworkStatus } from '../useNetworkStatus';

/**
 * useNetworkStatus polls a URL via fetch and listens to AppState changes.
 * Tests mock global fetch to control reachability checks.
 */

const mockAddEventListener = jest.fn();
const mockRemove = jest.fn();

describe('useNetworkStatus', () => {
	let originalFetch: typeof global.fetch;

	beforeEach(() => {
		jest.useFakeTimers();
		originalFetch = global.fetch;
		// Default: connected (fetch resolves with status 204)
		global.fetch = jest.fn().mockResolvedValue({ status: 204, ok: true });
		(AppState.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });
		mockRemove.mockClear();
	});

	afterEach(() => {
		global.fetch = originalFetch;
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	it('initial state is true (optimistic) before first reachability check completes', () => {
		const { result } = renderHook(() => useNetworkStatus());
		// Initial state is true before the async check completes
		expect(result.current.isConnected).toBe(true);
	});

	it('isConnected becomes true after successful reachability check', async () => {
		global.fetch = jest.fn().mockResolvedValue({ status: 204, ok: true });

		const { result } = renderHook(() => useNetworkStatus());

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.isConnected).toBe(true);
	});

	it('isConnected becomes false when fetch fails (no network)', async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

		const { result } = renderHook(() => useNetworkStatus());

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.isConnected).toBe(false);
	});

	it('reconnection: isConnected returns to true after re-check succeeds', async () => {
		// First call: fail
		global.fetch = jest
			.fn()
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce({ status: 204, ok: true });

		const { result } = renderHook(() => useNetworkStatus());

		// First check: offline
		await act(async () => {
			await Promise.resolve();
		});
		expect(result.current.isConnected).toBe(false);

		// Trigger AppState 'active' event to re-check
		const appStateHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
		await act(async () => {
			appStateHandler('active' as AppStateStatus);
			await Promise.resolve();
		});

		expect(result.current.isConnected).toBe(true);
	});

	it('cleans up interval and AppState listener on unmount', () => {
		const removeSpy = jest.fn();
		(AppState.addEventListener as jest.Mock).mockReturnValue({ remove: removeSpy });

		const { unmount } = renderHook(() => useNetworkStatus());

		unmount();

		expect(removeSpy).toHaveBeenCalled();
	});
});
