import React, { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Slot, useRouter, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import '../src/i18n'; // Initialize i18n
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useSyncStore } from '@/src/stores/syncStore';
import { ShellAuthGate, ShellRootProviders } from '@/src/ui-shell';

function AppShell() {
	const router = useRouter();
	const segments = useSegments();
	const inAuthGroup = segments[0] === '(auth)';
	const inDesignSystem = segments[0] === 'design-system';
	const { t } = useLocale();
	const { isConnected } = useNetworkStatus();
	const { lastSyncedAt, isSyncing, pendingCount } = useSyncStore(
		useShallow((state) => ({
			lastSyncedAt: state.lastSyncedAt,
			isSyncing: state.isSyncing,
			pendingCount: state.pendingCount,
		})),
	);
	const { isAuthenticated, loading, initialize } = useAuthStore(
		useShallow((state) => ({
			isAuthenticated: state.isAuthenticated,
			loading: state.loading,
			initialize: state.initialize,
		})),
	);

	const environment = useMemo(
		() => ({
			translate: (key: string, fallback?: string) => {
				const translated = t(key);
				return translated === key && fallback ? fallback : translated;
			},
			isConnected,
			syncStatus: {
				lastSyncedAt,
				isSyncing,
				pendingCount,
			},
			openSyncLog: () => {
				router.push('/settings/sync-log' as Href);
			},
		}),
		[isConnected, isSyncing, lastSyncedAt, pendingCount, router, t],
	);

	const handleAuthRequired = useCallback(() => {
		router.replace('/(auth)/login');
	}, [router]);

	const handleAuthenticated = useCallback(() => {
		router.replace('/(app)/(tabs)' as Href);
	}, [router]);

	return (
		<ShellRootProviders environment={environment} hideOfflineBanner={inDesignSystem}>
			<ShellAuthGate
				loading={loading}
				isAuthenticated={isAuthenticated}
				inAuthArea={inAuthGroup}
				skip={inDesignSystem}
				initialize={initialize}
				onAuthRequired={handleAuthRequired}
				onAuthenticated={handleAuthenticated}
			>
				<Slot />
			</ShellAuthGate>
		</ShellRootProviders>
	);
}

export default function RootLayout() {
	return <AppShell />;
}
