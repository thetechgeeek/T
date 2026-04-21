import React from 'react';
import { DesignLibraryScreen, ThemeProvider, useTheme } from '@easydesign/design-system';

export default function DesignSystemRoute() {
	const { mode } = useTheme();

	return (
		<ThemeProvider initialMode={mode} initialPresetId="prism" persist={false}>
			<DesignLibraryScreen />
		</ThemeProvider>
	);
}
