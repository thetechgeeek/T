import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';
import { ANIMATION_MS, SPRING_PHYSICS } from './layoutMetrics';

/**
 * Shared animation presets for consistent motion across the app.
 * Use these with Reanimated's withSpring / withTiming.
 */

const PRESS_SCALE_PRESSED = 0.97;
const PRESS_SCALE_RELEASED = 1;
const LIST_ITEM_PRESS_SCALE = 0.985;
const CARD_PRESS_OPACITY = 0.85;
const CURVE_ZERO = 0;
const CURVE_ONE = 1;
const CURVE_MATERIAL_EASE_IN = 0.4;
const CURVE_MATERIAL_EASE_OUT = 0.2;

export const SPRING_PRESS: WithSpringConfig = {
	damping: SPRING_PHYSICS.press.damping,
	stiffness: SPRING_PHYSICS.press.stiffness,
	mass: SPRING_PHYSICS.press.mass,
};

export const SPRING_BOUNCE: WithSpringConfig = {
	damping: SPRING_PHYSICS.bounce.damping,
	stiffness: SPRING_PHYSICS.bounce.stiffness,
	mass: SPRING_PHYSICS.bounce.mass,
};

export const TIMING_FAST: WithTimingConfig = {
	duration: ANIMATION_MS.fast,
};

export const TIMING_NORMAL: WithTimingConfig = {
	duration: ANIMATION_MS.normal,
};

export const TIMING_SLOW: WithTimingConfig = {
	duration: ANIMATION_MS.slow,
};

export const EASING_CURVES = {
	easeIn: [CURVE_MATERIAL_EASE_IN, CURVE_ZERO, CURVE_ONE, CURVE_ONE],
	easeOut: [CURVE_ZERO, CURVE_ZERO, CURVE_MATERIAL_EASE_OUT, CURVE_ONE],
	easeInOut: [CURVE_MATERIAL_EASE_IN, CURVE_ZERO, CURVE_MATERIAL_EASE_OUT, CURVE_ONE],
	linear: [CURVE_ZERO, CURVE_ZERO, CURVE_ONE, CURVE_ONE],
} as const;

export type EasingCurveName = keyof typeof EASING_CURVES;

export const MOTION_PROFILES = {
	buttonPress: {
		scalePressed: PRESS_SCALE_PRESSED,
		spring: SPRING_PRESS,
	},
	cardPress: {
		scalePressed: PRESS_SCALE_PRESSED,
		opacityPressed: CARD_PRESS_OPACITY,
		spring: SPRING_PRESS,
	},
	listItemPress: {
		scalePressed: LIST_ITEM_PRESS_SCALE,
		spring: SPRING_PRESS,
	},
	bannerEnter: {
		duration: ANIMATION_MS.fast,
		easing: 'easeOut' as const,
		spring: SPRING_PRESS,
	},
	shimmerLoop: {
		duration: ANIMATION_MS.slow * 2,
		easing: 'easeInOut' as const,
		reverse: true,
	},
} as const;

export function getEasingFunction(name: EasingCurveName): NonNullable<WithTimingConfig['easing']> {
	const curve = EASING_CURVES[name] ?? EASING_CURVES.linear;
	return Easing.bezier(curve[0], curve[1], curve[2], curve[3]);
}

export function createTimingConfig(
	duration: number,
	easingName: EasingCurveName = 'easeOut',
): WithTimingConfig {
	return {
		duration,
		easing: getEasingFunction(easingName),
	};
}

/** Scale values for press animations */
export const PRESS_SCALE = {
	pressed: PRESS_SCALE_PRESSED,
	released: PRESS_SCALE_RELEASED,
} as const;

const PRESS_OPACITY_PRESSED_VALUE = CARD_PRESS_OPACITY;
const PRESS_OPACITY_RELEASED_VALUE = 1;

/** Opacity values for press animations (use alongside PRESS_SCALE) */
export const PRESS_OPACITY = {
	pressed: PRESS_OPACITY_PRESSED_VALUE,
	released: PRESS_OPACITY_RELEASED_VALUE,
} as const;
