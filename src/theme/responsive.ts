export type ResponsiveBreakpoint = 'phone' | 'tablet' | 'wide';
export type ResponsiveDeviceType = 'phone' | 'tablet';
export type ResponsiveOrientation = 'portrait' | 'landscape';

export interface ResponsiveMetrics {
	width: number;
	height: number;
	shortestSide: number;
	orientation: ResponsiveOrientation;
	breakpoint: ResponsiveBreakpoint;
	deviceType: ResponsiveDeviceType;
	isPhone: boolean;
	isTablet: boolean;
	isPortrait: boolean;
	isLandscape: boolean;
	supportsSplitPane: boolean;
	columns: number;
	layoutScale: number;
	spacingScale: number;
	typographyScale: number;
}

const PHONE_BREAKPOINT_MAX_WIDTH = 767;
const TABLET_BREAKPOINT_MAX_WIDTH = 1279;
const TABLET_MIN_WIDTH = 768;
const TABLET_MIN_SHORTEST_SIDE = 600;
const COMPACT_PHONE_MAX_WIDTH = 359;
const ROOMY_PHONE_MIN_WIDTH = 430;
const TABLET_WIDE_MIN_WIDTH = 1100;
const TABLET_SPACING_SCALE = 1.08;
const TABLET_WIDE_SPACING_SCALE = 1.12;
const COMPACT_PHONE_SPACING_SCALE = 0.92;
const MID_PHONE_SPACING_SCALE = 0.96;
const TABLET_TYPOGRAPHY_SCALE = 1.04;
const TABLET_WIDE_TYPOGRAPHY_SCALE = 1.08;
const COMPACT_PHONE_TYPOGRAPHY_SCALE = 0.95;
const TABLET_LAYOUT_SCALE = 1.08;
const TABLET_WIDE_LAYOUT_SCALE = 1.12;
const COMPACT_PHONE_LAYOUT_SCALE = 0.94;
const MIN_LAYOUT_SCALE = 0.9;
const MAX_LAYOUT_SCALE = 1.16;
const MIN_SPACING_SCALE = 0.9;
const MAX_SPACING_SCALE = 1.14;
const MIN_TYPOGRAPHY_SCALE = 0.94;
const MAX_TYPOGRAPHY_SCALE = 1.1;

function clampScale(value: number, minimum: number, maximum: number) {
	return Math.min(maximum, Math.max(minimum, value));
}

export function resolveResponsiveMetrics(width: number, height: number): ResponsiveMetrics {
	const shortestSide = Math.min(width, height);
	const orientation: ResponsiveOrientation = width >= height ? 'landscape' : 'portrait';
	const isTablet = width >= TABLET_MIN_WIDTH || shortestSide >= TABLET_MIN_SHORTEST_SIDE;
	const breakpoint: ResponsiveBreakpoint =
		width > TABLET_BREAKPOINT_MAX_WIDTH ? 'wide' : isTablet ? 'tablet' : 'phone';
	const deviceType: ResponsiveDeviceType = isTablet ? 'tablet' : 'phone';
	const isPhone = !isTablet;
	const columns = breakpoint === 'wide' ? 3 : isTablet ? 2 : 1;
	const supportsSplitPane = isTablet;

	const spacingScale = isTablet
		? width >= TABLET_WIDE_MIN_WIDTH
			? TABLET_WIDE_SPACING_SCALE
			: TABLET_SPACING_SCALE
		: width <= COMPACT_PHONE_MAX_WIDTH
			? COMPACT_PHONE_SPACING_SCALE
			: width >= ROOMY_PHONE_MIN_WIDTH
				? 1
				: MID_PHONE_SPACING_SCALE;
	const typographyScale = isTablet
		? width >= TABLET_WIDE_MIN_WIDTH
			? TABLET_WIDE_TYPOGRAPHY_SCALE
			: TABLET_TYPOGRAPHY_SCALE
		: width <= COMPACT_PHONE_MAX_WIDTH
			? COMPACT_PHONE_TYPOGRAPHY_SCALE
			: 1;
	const layoutScale = isTablet
		? width >= TABLET_WIDE_MIN_WIDTH
			? TABLET_WIDE_LAYOUT_SCALE
			: TABLET_LAYOUT_SCALE
		: width <= COMPACT_PHONE_MAX_WIDTH
			? COMPACT_PHONE_LAYOUT_SCALE
			: 1;

	return {
		width,
		height,
		shortestSide,
		orientation,
		breakpoint,
		deviceType,
		isPhone,
		isTablet,
		isPortrait: orientation === 'portrait',
		isLandscape: orientation === 'landscape',
		supportsSplitPane,
		columns,
		layoutScale: clampScale(layoutScale, MIN_LAYOUT_SCALE, MAX_LAYOUT_SCALE),
		spacingScale: clampScale(spacingScale, MIN_SPACING_SCALE, MAX_SPACING_SCALE),
		typographyScale: clampScale(typographyScale, MIN_TYPOGRAPHY_SCALE, MAX_TYPOGRAPHY_SCALE),
	};
}

export function scaleResponsiveValue(value: number, scale: number, minimum = 0) {
	return Math.max(minimum, Math.round(value * scale));
}

export function isPhoneBreakpoint(width: number) {
	return width <= PHONE_BREAKPOINT_MAX_WIDTH;
}
