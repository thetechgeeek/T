import { Features } from '@/src/config/featureFlags';
import type { Notification } from '@/src/types/notification';
import type { ShellEnvironment, ShellPermissionResolution } from '@easydesign/ui-shell';

export interface InventoryShellNotificationState {
	items: Notification[];
	unreadCount: number;
	loading: boolean;
	markAsRead?: (id: string) => Promise<void> | void;
	markAllAsRead?: () => Promise<void> | void;
	refresh?: () => Promise<void> | void;
}

export interface CreateInventoryShellEnvironmentInput {
	translate: (key: string, fallback?: string) => string;
	isConnected: boolean;
	syncStatus: ShellEnvironment['syncStatus'];
	notifications: InventoryShellNotificationState;
	width: number;
	pushRoute: (href: string) => void;
	replaceRoute: (href: string) => void;
	tenantName?: string;
	assetsReady?: boolean;
	permissionOverrides?: Record<string, ShellPermissionResolution>;
	featureFlags?: Partial<typeof Features>;
	onTrack?: (eventName: string, meta?: Record<string, unknown>) => void;
	onValidateSession?: () => Promise<void> | void;
}

const SPLIT_PANE_MIN_WIDTH = 960;
const MEDIUM_WIDTH_MIN = 768;

const DEFAULT_PERMISSION_RESOLUTIONS: Record<string, ShellPermissionResolution> = {
	'shell.notifications': Features.NOTIFICATIONS
		? { state: 'allowed' }
		: {
				state: 'denied',
				title: 'Notifications unavailable',
				description: 'This build has disabled notification delivery and inbox access.',
			},
	'inventory.multiWarehouse': Features.MULTI_WAREHOUSE
		? { state: 'allowed' }
		: {
				state: 'limited',
				title: 'Single-warehouse mode',
				description: 'This workspace is running without multi-warehouse controls.',
				actionLabel: 'Open item settings',
			},
	'inventory.aiOrderParsing': Features.AI_ORDER_PARSING
		? { state: 'allowed' }
		: {
				state: 'limited',
				title: 'AI order parsing disabled',
				description: 'The app can still import orders manually without AI parsing enabled.',
			},
	'settings.users': {
		state: 'denied',
		title: 'Admin access required',
		description: 'User management is reserved for admin workspaces in the inventory app.',
	},
};

function toCategoryLabel(type: string) {
	return type
		.split('_')
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ');
}

function normalizeFeatureFlags(featureFlags?: Partial<typeof Features>) {
	return {
		...Features,
		...featureFlags,
	};
}

function normalizeFlagName(flag: string) {
	return flag.replace(/[\s-]/g, '_').toUpperCase();
}

function resolveAdaptiveRuntime(width: number) {
	if (width >= SPLIT_PANE_MIN_WIDTH) {
		return {
			widthClass: 'expanded' as const,
			layoutVariant: 'split-pane' as const,
			isTablet: true,
		};
	}

	if (width >= MEDIUM_WIDTH_MIN) {
		return {
			widthClass: 'medium' as const,
			layoutVariant: 'single-pane' as const,
			isTablet: true,
		};
	}

	return {
		widthClass: 'compact' as const,
		layoutVariant: 'single-pane' as const,
		isTablet: false,
	};
}

export function createInventoryShellEnvironment({
	translate,
	isConnected,
	syncStatus,
	notifications,
	width,
	pushRoute,
	replaceRoute,
	tenantName = 'EasyStock',
	assetsReady = true,
	permissionOverrides,
	featureFlags,
	onTrack,
	onValidateSession,
}: CreateInventoryShellEnvironmentInput): ShellEnvironment {
	const resolvedFeatureFlags = normalizeFeatureFlags(featureFlags);
	const resolvedPermissions = {
		...DEFAULT_PERMISSION_RESOLUTIONS,
		...permissionOverrides,
	};

	return {
		translate,
		isConnected,
		syncStatus,
		openSyncLog: () => pushRoute('/settings/sync-log'),
		permissions: {
			resolve: (capability) => resolvedPermissions[capability] ?? { state: 'allowed' },
			requestAccess: (capability) => {
				if (capability === 'shell.notifications') {
					pushRoute('/settings/reminders');
					return;
				}

				pushRoute('/settings/security');
			},
		},
		featureFlags: {
			isResolving: false,
			isEnabled: (flag) => {
				const normalizedFlag = normalizeFlagName(flag) as keyof typeof Features;
				return Boolean(resolvedFeatureFlags[normalizedFlag]);
			},
		},
		tenant: {
			current: {
				id: 'inventory-app',
				name: tenantName,
				accentLabel: 'Inventory',
				canSwitch: false,
			},
		},
		notifications: {
			items: notifications.items.map((item) => ({
				id: item.id,
				title: item.title,
				description: item.body,
				category: toCategoryLabel(item.type),
				read: item.read,
				severity:
					item.type === 'low_stock'
						? 'warning'
						: item.type === 'payment_received'
							? 'success'
							: 'info',
			})),
			unreadCount: notifications.unreadCount,
			loading: notifications.loading,
			openInbox: () => pushRoute('/settings/reminders'),
			openPreferences: () => pushRoute('/settings/reminders'),
			markAsRead: notifications.markAsRead,
			markAllAsRead: notifications.markAllAsRead,
			refresh: notifications.refresh,
		},
		deepLinks: {
			resolve: (url) => {
				if (url === '/settings/users') {
					const resolution = resolvedPermissions['settings.users'];
					if (resolution && resolution.state !== 'allowed') {
						return {
							status: 'unauthorized' as const,
							reason: resolution.description,
						};
					}
				}

				if (
					url.startsWith('/design-system') ||
					url.startsWith('/settings') ||
					url.startsWith('/inventory') ||
					url.startsWith('/customers') ||
					url.startsWith('/finance') ||
					url.startsWith('/reports') ||
					url.startsWith('/orders') ||
					url.startsWith('/suppliers') ||
					url.startsWith('/transactions') ||
					url.startsWith('/utilities') ||
					url.startsWith('/(app)') ||
					url.startsWith('/(auth)')
				) {
					return {
						status: 'handled' as const,
						href: url,
					};
				}

				return {
					status: 'invalid' as const,
					reason: 'The inventory app shell does not recognize that route.',
				};
			},
			openExternal: (url) => {
				pushRoute(url);
			},
		},
		analytics: {
			track: (eventName, meta) => {
				onTrack?.(eventName, meta);
			},
		},
		persistence: {
			restoreLastRoute: () => '/(app)/(tabs)',
		},
		assets: {
			ready: assetsReady,
			requiredAssets: ['lucide-react-native', 'expo-router'],
		},
		adaptiveRuntime: resolveAdaptiveRuntime(width),
		session: {
			isLocked: false,
			canUseBiometrics: true,
			reauthenticate: () => replaceRoute('/(auth)/login'),
			recoverSession: () => replaceRoute('/(auth)/login'),
			validateOnResume: onValidateSession,
		},
	};
}
