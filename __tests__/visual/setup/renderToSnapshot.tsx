import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appearance } from 'react-native';
import { resolveResponsiveMetrics } from '@/src/theme/responsive';

// Initial setup for jest-image-snapshot if used in an environment that supports it
// In standard Jest/RNTL, this will mostly be used for structural snapshots
// unless a bridge to a real renderer is provided.
try {
	const { toMatchImageSnapshot } = require('jest-image-snapshot');
	expect.extend({ toMatchImageSnapshot });
} catch {
	// jest-image-snapshot might not be configured for all environments
}

interface RenderOptions {
	isDark?: boolean;
	insets?: { top: number; bottom: number; left: number; right: number };
	frame?: { x: number; y: number; width: number; height: number };
}

export const DEFAULT_SNAPSHOT_FRAME = { x: 0, y: 0, width: 390, height: 844 } as const;
export const IPHONE_SE_FRAME = { x: 0, y: 0, width: 375, height: 667 } as const;
export const IPHONE_15_PRO_MAX_FRAME = { x: 0, y: 0, width: 430, height: 932 } as const;

/**
 * Renders a component wrapped in all necessary providers for visual testing.
 */
export function renderToSnapshot(
	component: React.ReactElement,
	{
		isDark = false,
		insets = { top: 0, bottom: 0, left: 0, right: 0 },
		frame = DEFAULT_SNAPSHOT_FRAME,
	}: RenderOptions = {},
) {
	// Force Appearance to match the desired theme for the ThemeProvider
	jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(isDark ? 'dark' : 'light');
	const responsiveMetrics = resolveResponsiveMetrics(frame.width, frame.height);

	return render(
		<SafeAreaProvider initialMetrics={{ frame, insets }}>
			<ThemeProvider
				runtimeOverrides={{
					windowWidth: frame.width,
					windowHeight: frame.height,
					breakpoint: responsiveMetrics.breakpoint,
					deviceType: responsiveMetrics.deviceType,
					orientation: responsiveMetrics.orientation,
					columns: responsiveMetrics.columns,
					supportsSplitPane: responsiveMetrics.supportsSplitPane,
					layoutScale: responsiveMetrics.layoutScale,
					spacingScale: responsiveMetrics.spacingScale,
					typographyScale: responsiveMetrics.typographyScale,
				}}
			>
				{component}
			</ThemeProvider>
		</SafeAreaProvider>,
	);
}

export const renderLight = (component: React.ReactElement) =>
	renderToSnapshot(component, { isDark: false });
export const renderDark = (component: React.ReactElement) =>
	renderToSnapshot(component, { isDark: true });
