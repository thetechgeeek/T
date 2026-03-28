import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import '../src/i18n'; // Initialize i18n
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useAuthStore } from '@/src/stores/authStore';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ErrorBoundary } from '@/src/components/atoms/ErrorBoundary';
import { OfflineBanner } from '@/src/components/atoms/OfflineBanner';

function AuthGate({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, loading, initialize } = useAuthStore(
		useShallow((s) => ({
			isAuthenticated: s.isAuthenticated,
			loading: s.loading,
			initialize: s.initialize,
		})),
	);
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		initialize();
	}, [initialize]);

	useEffect(() => {
		if (loading) return;
		const inAuthGroup = segments[0] === '(auth)';
		if (!isAuthenticated && !inAuthGroup) {
			router.replace('/(auth)/login');
		} else if (isAuthenticated && inAuthGroup) {
			router.replace('/(app)/(tabs)');
		}
	}, [isAuthenticated, loading, segments, router]);

	return <>{children}</>;
}

function AppShell() {
	const { theme } = useThemeTokens();

	return (
		<GestureHandlerRootView style={styles.root}>
			<SafeAreaProvider>
				<StatusBar style={theme.isDark ? 'light' : 'dark'} />
				<OfflineBanner />
				<AuthGate>
					<Slot />
				</AuthGate>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

export default function RootLayout() {
	return (
		<ErrorBoundary>
			<ThemeProvider>
				<KeyboardProvider>
					<AppShell />
				</KeyboardProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
});
