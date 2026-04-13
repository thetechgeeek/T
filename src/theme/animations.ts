import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Shared animation presets for consistent motion across the app.
 * Use these with Reanimated's withSpring / withTiming.
 */

const SPRING_PRESS_DAMPING = 15;
const SPRING_PRESS_STIFFNESS = 180;
const SPRING_PRESS_MASS = 1;

const SPRING_BOUNCE_DAMPING = 10;
const SPRING_BOUNCE_STIFFNESS = 200;
const SPRING_BOUNCE_MASS = 0.8;

const TIMING_FAST_MS = 150;
const TIMING_NORMAL_MS = 250;
const TIMING_SLOW_MS = 400;

const PRESS_SCALE_PRESSED = 0.97;
const PRESS_SCALE_RELEASED = 1;

export const SPRING_PRESS: WithSpringConfig = {
	damping: SPRING_PRESS_DAMPING,
	stiffness: SPRING_PRESS_STIFFNESS,
	mass: SPRING_PRESS_MASS,
};

export const SPRING_BOUNCE: WithSpringConfig = {
	damping: SPRING_BOUNCE_DAMPING,
	stiffness: SPRING_BOUNCE_STIFFNESS,
	mass: SPRING_BOUNCE_MASS,
};

export const TIMING_FAST: WithTimingConfig = {
	duration: TIMING_FAST_MS,
};

export const TIMING_NORMAL: WithTimingConfig = {
	duration: TIMING_NORMAL_MS,
};

export const TIMING_SLOW: WithTimingConfig = {
	duration: TIMING_SLOW_MS,
};

/** Scale values for press animations */
export const PRESS_SCALE = {
	pressed: PRESS_SCALE_PRESSED,
	released: PRESS_SCALE_RELEASED,
} as const;

const PRESS_OPACITY_PRESSED_VALUE = 0.85;
const PRESS_OPACITY_RELEASED_VALUE = 1;

/** Opacity values for press animations (use alongside PRESS_SCALE) */
export const PRESS_OPACITY = {
	pressed: PRESS_OPACITY_PRESSED_VALUE,
	released: PRESS_OPACITY_RELEASED_VALUE,
} as const;
