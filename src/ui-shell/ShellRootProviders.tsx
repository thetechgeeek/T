import React, { useEffect } from 'react';
import { AppState, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@easydesign/design-system/foundation';
import { ShellAssetGate } from './ShellAssetGate';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';
import { OfflineBanner } from './components/atoms/OfflineBanner';
import {
	ShellEnvironmentProvider,
	type ShellEnvironmentInput,
	useShellEnvironment,
} from './ShellEnvironment';
import { ShellOverlayProvider } from './ShellOverlay';

type ThemeProviderProps = React.ComponentProps<typeof ThemeProvider>;

interface ShellViewportProps {
	children: React.ReactNode;
	hideOfflineBanner: boolean;
}

function ShellSessionLifecycleBridge() {
	const { session } = useShellEnvironment();

	useEffect(() => {
		if (!session.validateOnResume) {
			return;
		}

		const subscription = AppState.addEventListener('change', (nextState) => {
			if (nextState === 'active') {
				void session.validateOnResume?.();
			}
		});

		return () => {
			subscription.remove();
		};
	}, [session]);

	return null;
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
	environment?: ShellEnvironmentInput;
	errorFallback?: React.ReactNode;
	assetFallback?: React.ReactNode;
	hideOfflineBanner?: boolean;
	themeProviderProps?: Partial<ThemeProviderProps>;
}

export function ShellRootProviders({
	children,
	environment = {},
	errorFallback,
	assetFallback,
	hideOfflineBanner = false,
	themeProviderProps,
}: ShellRootProvidersProps) {
	return (
		<ThemeProvider {...themeProviderProps}>
			<ShellEnvironmentProvider value={environment}>
				<ErrorBoundary fallback={errorFallback}>
					<ShellSessionLifecycleBridge />
					<ShellAssetGate fallback={assetFallback}>
						<ShellOverlayProvider>
							<ShellViewport hideOfflineBanner={hideOfflineBanner}>
								{children}
							</ShellViewport>
						</ShellOverlayProvider>
					</ShellAssetGate>
				</ErrorBoundary>
			</ShellEnvironmentProvider>
		</ThemeProvider>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
});
