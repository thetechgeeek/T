import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Re-runs `onRefresh` every time the screen comes into focus.
 * Useful for keeping screen data fresh after navigating back.
 */
export function useRefreshOnFocus(onRefresh: () => void | Promise<void>) {
	useFocusEffect(
		useCallback(() => {
			void onRefresh();
		}, [onRefresh]),
	);
}
