import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

/**
 * Returns a shared value that oscillates 0 → 1 → 0 in a loop.
 * All skeleton screens call this once and pass the value down to ShimmerOverlay.
 * Fully wired in Phase 8 — exported here for API stability.
 */
export function useSkeletonShimmer() {
	const { theme } = useTheme();
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withRepeat(
			withTiming(1, {
				duration: theme.animation.durationSlow * 2,
				easing: Easing.inOut(Easing.ease),
			}),
			-1, // infinite
			true, // reverse
		);
		return () => {
			progress.value = 0;
		};
	}, [progress, theme.animation.durationSlow]);

	return progress;
}
