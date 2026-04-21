import React, { useCallback, useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Slot, useRouter, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import '../src/i18n'; // Initialize i18n
import { useAuthStore } from '@/src/stores/authStore';
import { useLocale } from '@/src/hooks/useLocale';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { useSyncStore } from '@/src/stores/syncStore';
import { createInventoryShellEnvironment } from '@/src/inventory-app/shell/createInventoryShellEnvironment';
import { ShellAuthGate, ShellRootProviders } from '@easydesign/ui-shell';

function AppShell() {
	const router = useRouter();
	const segments = useSegments();
	const { width } = useWindowDimensions();
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
	const {
		notifications,
		unreadCount,
		notificationsLoading,
		fetchUnread,
		markAsRead,
		markAllAsRead,
	} = useNotificationStore(
		useShallow((state) => ({
			notifications: state.notifications,
			unreadCount: state.unreadCount,
			notificationsLoading: state.loading,
			fetchUnread: state.fetchUnread,
			markAsRead: state.markAsRead,
			markAllAsRead: state.markAllAsRead,
		})),
	);
	const { isAuthenticated, loading, initialize } = useAuthStore(
		useShallow((state) => ({
			isAuthenticated: state.isAuthenticated,
			loading: state.loading,
			initialize: state.initialize,
		})),
	);

	useEffect(() => {
		void fetchUnread();
	}, [fetchUnread]);

	const environment = useMemo(
		() =>
			createInventoryShellEnvironment({
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
				notifications: {
					items: notifications,
					unreadCount,
					loading: notificationsLoading,
					refresh: fetchUnread,
					markAsRead,
					markAllAsRead,
				},
				width,
				pushRoute: (href) => {
					router.push(href as Href);
				},
				replaceRoute: (href) => {
					router.replace(href as Href);
				},
				onValidateSession: initialize,
			}),
		[
			fetchUnread,
			initialize,
			isConnected,
			isSyncing,
			lastSyncedAt,
			markAllAsRead,
			markAsRead,
			notifications,
			notificationsLoading,
			pendingCount,
			router,
			t,
			unreadCount,
			width,
		],
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
