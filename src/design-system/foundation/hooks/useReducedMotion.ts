import { useTheme } from '@/src/design-system/foundation/theme/ThemeProvider';

/**
 * Small convenience hook so components can opt out of motion without re-reading
 * the full runtime quality object each time.
 */
export function useReducedMotion() {
	const { runtime } = useTheme();
	return runtime.reduceMotionEnabled;
}
