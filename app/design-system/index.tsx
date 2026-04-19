import React from 'react';
import DesignLibraryScreen from '@/src/design-system/DesignLibraryScreen';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';

export default function DesignSystemRoute() {
	const { mode } = useTheme();

	return (
		<ThemeProvider initialMode={mode} initialPresetId="prism" persist={false}>
			<DesignLibraryScreen />
		</ThemeProvider>
	);
}
