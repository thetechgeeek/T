import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useTheme } from '@/src/theme/ThemeProvider';
import { createTimingConfig } from '@/src/theme/animations';

/**
 * Returns a shared value that oscillates 0 → 1 → 0 in a loop.
 * All skeleton screens call this once and pass the value down to ShimmerOverlay.
 * Fully wired in Phase 8 — exported here for API stability.
 */
export function useSkeletonShimmer() {
	const { theme } = useTheme();
	const reduceMotionEnabled = useReducedMotion();
	const progress = useSharedValue(0);
	const shimmerMotion = theme.animation.profiles.shimmerLoop;

	useEffect(() => {
		if (reduceMotionEnabled) {
			progress.value = 0;
			return;
		}

		progress.value = withRepeat(
			withTiming(1, createTimingConfig(shimmerMotion.duration, shimmerMotion.easing)),
			-1, // infinite
			shimmerMotion.reverse,
		);
		return () => {
			progress.value = 0;
		};
	}, [
		progress,
		reduceMotionEnabled,
		shimmerMotion.duration,
		shimmerMotion.easing,
		shimmerMotion.reverse,
	]);

	return progress;
}
