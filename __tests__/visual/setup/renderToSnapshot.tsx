import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Appearance } from 'react-native';

// Initial setup for jest-image-snapshot if used in an environment that supports it
// In standard Jest/RNTL, this will mostly be used for structural snapshots
// unless a bridge to a real renderer is provided.
try {
	const { toMatchImageSnapshot } = require('jest-image-snapshot');
	expect.extend({ toMatchImageSnapshot });
} catch (e) {
	// jest-image-snapshot might not be configured for all environments
}

interface RenderOptions {
	isDark?: boolean;
	insets?: { top: number; bottom: number; left: number; right: number };
}

/**
 * Renders a component wrapped in all necessary providers for visual testing.
 */
export function renderToSnapshot(
	component: React.ReactElement,
	{ isDark = false, insets = { top: 0, bottom: 0, left: 0, right: 0 } }: RenderOptions = {},
) {
	// Force Appearance to match the desired theme for the ThemeProvider
	jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(isDark ? 'dark' : 'light');

	return render(
		<SafeAreaProvider
			initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets }}
		>
			<ThemeProvider>{component}</ThemeProvider>
		</SafeAreaProvider>,
	);
}

export const renderLight = (component: React.ReactElement) =>
	renderToSnapshot(component, { isDark: false });
export const renderDark = (component: React.ReactElement) =>
	renderToSnapshot(component, { isDark: true });
