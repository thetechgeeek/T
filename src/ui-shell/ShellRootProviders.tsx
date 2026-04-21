import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ThemeProvider, useTheme } from '@/src/design-system/foundation';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';
import { OfflineBanner } from './components/atoms/OfflineBanner';
import { ShellEnvironmentProvider, type ShellEnvironment } from './ShellEnvironment';

type ThemeProviderProps = React.ComponentProps<typeof ThemeProvider>;

interface ShellViewportProps {
	children: React.ReactNode;
	hideOfflineBanner: boolean;
}

function ShellViewport({ children, hideOfflineBanner }: ShellViewportProps) {
	const { isDark } = useTheme();

	return (
		<GestureHandlerRootView style={styles.root}>
			<SafeAreaProvider>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				{hideOfflineBanner ? null : <OfflineBanner />}
				{children}
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

export interface ShellRootProvidersProps {
	children: React.ReactNode;
	environment: ShellEnvironment;
	errorFallback?: React.ReactNode;
	hideOfflineBanner?: boolean;
	themeProviderProps?: Partial<ThemeProviderProps>;
}

export function ShellRootProviders({
	children,
	environment,
	errorFallback,
	hideOfflineBanner = false,
	themeProviderProps,
}: ShellRootProvidersProps) {
	return (
		<ThemeProvider {...themeProviderProps}>
			<ShellEnvironmentProvider value={environment}>
				<ErrorBoundary fallback={errorFallback}>
					<KeyboardProvider>
						<ShellViewport hideOfflineBanner={hideOfflineBanner}>
							{children}
						</ShellViewport>
					</KeyboardProvider>
				</ErrorBoundary>
			</ShellEnvironmentProvider>
		</ThemeProvider>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
});
