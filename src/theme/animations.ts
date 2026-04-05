import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Shared animation presets for consistent motion across the app.
 * Use these with Reanimated's withSpring / withTiming.
 */

export const SPRING_PRESS: WithSpringConfig = {
	damping: 15,
	stiffness: 180,
	mass: 1,
};

export const SPRING_BOUNCE: WithSpringConfig = {
	damping: 10,
	stiffness: 200,
	mass: 0.8,
};

export const TIMING_FAST: WithTimingConfig = {
	duration: 150,
};

export const TIMING_NORMAL: WithTimingConfig = {
	duration: 250,
};

export const TIMING_SLOW: WithTimingConfig = {
	duration: 400,
};

/** Scale values for press animations */
export const PRESS_SCALE = {
	pressed: 0.97,
	released: 1,
} as const;
