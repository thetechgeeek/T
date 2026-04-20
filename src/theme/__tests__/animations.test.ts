import {
	createTimingConfig,
	EASING_CURVES,
	getEasingFunction,
	MOTION_PROFILES,
	PRESS_OPACITY,
	PRESS_SCALE,
	SPRING_BOUNCE,
	SPRING_PRESS,
	TIMING_FAST,
	TIMING_NORMAL,
	TIMING_SLOW,
} from '../animations';
import { ANIMATION_MS, SPRING_PHYSICS } from '../layoutMetrics';

describe('theme motion helpers', () => {
	it('exposes the shared duration scale and caps user-triggered motion at slow=500ms', () => {
		expect(ANIMATION_MS.instant).toBe(0);
		expect(ANIMATION_MS.micro).toBe(100);
		expect(ANIMATION_MS.fast).toBe(200);
		expect(ANIMATION_MS.normal).toBe(300);
		expect(ANIMATION_MS.slow).toBe(500);
		expect(TIMING_SLOW.duration).toBeLessThanOrEqual(500);
	});

	it('keeps easing curves and spring presets centralized', () => {
		expect(EASING_CURVES.easeOut).toEqual([0, 0, 0.2, 1]);
		expect(EASING_CURVES.easeIn).toEqual([0.4, 0, 1, 1]);
		expect(EASING_CURVES.easeInOut).toEqual([0.4, 0, 0.2, 1]);
		expect(SPRING_PRESS).toEqual({
			damping: SPRING_PHYSICS.press.damping,
			stiffness: SPRING_PHYSICS.press.stiffness,
			mass: SPRING_PHYSICS.press.mass,
		});
		expect(SPRING_BOUNCE).toEqual({
			damping: SPRING_PHYSICS.bounce.damping,
			stiffness: SPRING_PHYSICS.bounce.stiffness,
			mass: SPRING_PHYSICS.bounce.mass,
		});
	});

	it('builds timing configs from shared curves instead of ad hoc values', () => {
		const fastTiming = createTimingConfig(ANIMATION_MS.fast, 'easeOut');
		const normalTiming = createTimingConfig(ANIMATION_MS.normal, 'easeInOut');

		expect(fastTiming.duration).toBe(TIMING_FAST.duration);
		expect(normalTiming.duration).toBe(TIMING_NORMAL.duration);
		expect(typeof fastTiming.easing).toBe('function');
		expect(typeof normalTiming.easing).toBe('function');
		expect(getEasingFunction('easeOut')).toBeInstanceOf(Function);
	});

	it('keeps motion profiles tokenized for press, banner, and shimmer patterns', () => {
		expect(MOTION_PROFILES.buttonPress.scalePressed).toBe(PRESS_SCALE.pressed);
		expect(MOTION_PROFILES.cardPress.opacityPressed).toBe(PRESS_OPACITY.pressed);
		expect(MOTION_PROFILES.listItemPress.scalePressed).toBeLessThan(1);
		expect(MOTION_PROFILES.bannerEnter.duration).toBe(ANIMATION_MS.fast);
		expect(MOTION_PROFILES.shimmerLoop.duration).toBe(ANIMATION_MS.slow * 2);
	});
});
