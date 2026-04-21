import React, { createContext, useContext, useMemo } from 'react';
import type {
	ShellAdaptiveRuntimeAdapter,
	ShellAnalyticsAdapter,
	ShellAssetAdapter,
	ShellDeepLinkAdapter,
	ShellFeatureFlagAdapter,
	ShellNotificationAdapter,
	ShellPermissionAdapter,
	ShellPermissionResolution,
	ShellPersistenceAdapter,
	ShellSessionAdapter,
	ShellTenantAdapter,
	ShellTenantContext,
} from './ShellAdapters';

export interface ShellSyncStatus {
	lastSyncedAt: string | null;
	isSyncing: boolean;
	pendingCount: number;
}

export interface ShellEnvironment {
	translate: (key: string, fallback?: string) => string;
	isConnected: boolean;
	syncStatus: ShellSyncStatus;
	openSyncLog: () => void;
	permissions: ShellPermissionAdapter;
	featureFlags: ShellFeatureFlagAdapter;
	tenant: ShellTenantAdapter;
	notifications: ShellNotificationAdapter;
	deepLinks: ShellDeepLinkAdapter;
	analytics: ShellAnalyticsAdapter;
	persistence: ShellPersistenceAdapter;
	assets: ShellAssetAdapter;
	adaptiveRuntime: ShellAdaptiveRuntimeAdapter;
	session: ShellSessionAdapter;
}

export interface ShellEnvironmentInput {
	translate?: ShellEnvironment['translate'];
	isConnected?: boolean;
	syncStatus?: Partial<ShellSyncStatus>;
	openSyncLog?: ShellEnvironment['openSyncLog'];
	permissions?: Partial<ShellPermissionAdapter>;
	featureFlags?: Partial<ShellFeatureFlagAdapter>;
	tenant?: Partial<ShellTenantAdapter> & {
		current?: Partial<ShellTenantContext>;
	};
	notifications?: Partial<ShellNotificationAdapter>;
	deepLinks?: Partial<ShellDeepLinkAdapter>;
	analytics?: Partial<ShellAnalyticsAdapter>;
	persistence?: Partial<ShellPersistenceAdapter>;
	assets?: Partial<ShellAssetAdapter>;
	adaptiveRuntime?: Partial<ShellAdaptiveRuntimeAdapter>;
	session?: Partial<ShellSessionAdapter>;
}

const DEFAULT_SYNC_STATUS: ShellSyncStatus = {
	lastSyncedAt: null,
	isSyncing: false,
	pendingCount: 0,
};

const DEFAULT_PERMISSION_RESOLUTION: ShellPermissionResolution = {
	state: 'allowed',
};

const DEFAULT_TENANT_CONTEXT: ShellTenantContext = {
	id: null,
	name: 'Workspace',
	accentLabel: 'Default',
	canSwitch: false,
};

export const DEFAULT_SHELL_ENVIRONMENT: ShellEnvironment = {
	translate: (key, fallback) => fallback ?? key,
	isConnected: true,
	syncStatus: DEFAULT_SYNC_STATUS,
	openSyncLog: () => {},
	permissions: {
		resolve: () => DEFAULT_PERMISSION_RESOLUTION,
	},
	featureFlags: {
		isEnabled: () => true,
	},
	tenant: {
		current: DEFAULT_TENANT_CONTEXT,
	},
	notifications: {
		items: [],
		unreadCount: 0,
		loading: false,
	},
	deepLinks: {
		resolve: () => ({ status: 'invalid', reason: 'No deep-link adapter configured.' }),
		openExternal: () => {},
	},
	analytics: {
		track: () => {},
	},
	persistence: {},
	assets: {
		ready: true,
		requiredAssets: [],
	},
	adaptiveRuntime: {
		widthClass: 'compact',
		layoutVariant: 'single-pane',
		isTablet: false,
	},
	session: {
		isLocked: false,
		canUseBiometrics: false,
	},
};

export function createShellEnvironment(overrides: ShellEnvironmentInput = {}): ShellEnvironment {
	return {
		translate: overrides.translate ?? DEFAULT_SHELL_ENVIRONMENT.translate,
		isConnected: overrides.isConnected ?? DEFAULT_SHELL_ENVIRONMENT.isConnected,
		syncStatus: {
			...DEFAULT_SHELL_ENVIRONMENT.syncStatus,
			...(overrides.syncStatus ?? {}),
		},
		openSyncLog: overrides.openSyncLog ?? DEFAULT_SHELL_ENVIRONMENT.openSyncLog,
		permissions: {
			...DEFAULT_SHELL_ENVIRONMENT.permissions,
			...(overrides.permissions ?? {}),
		},
		featureFlags: {
			...DEFAULT_SHELL_ENVIRONMENT.featureFlags,
			...(overrides.featureFlags ?? {}),
		},
		tenant: {
			...DEFAULT_SHELL_ENVIRONMENT.tenant,
			...(overrides.tenant ?? {}),
			current: {
				...DEFAULT_TENANT_CONTEXT,
				...(overrides.tenant?.current ?? {}),
			},
		},
		notifications: {
			...DEFAULT_SHELL_ENVIRONMENT.notifications,
			...(overrides.notifications ?? {}),
			items: overrides.notifications?.items ?? DEFAULT_SHELL_ENVIRONMENT.notifications.items,
			unreadCount:
				overrides.notifications?.unreadCount ??
				DEFAULT_SHELL_ENVIRONMENT.notifications.unreadCount,
		},
		deepLinks: {
			...DEFAULT_SHELL_ENVIRONMENT.deepLinks,
			...(overrides.deepLinks ?? {}),
		},
		analytics: {
			...DEFAULT_SHELL_ENVIRONMENT.analytics,
			...(overrides.analytics ?? {}),
		},
		persistence: {
			...DEFAULT_SHELL_ENVIRONMENT.persistence,
			...(overrides.persistence ?? {}),
		},
		assets: {
			...DEFAULT_SHELL_ENVIRONMENT.assets,
			...(overrides.assets ?? {}),
			requiredAssets:
				overrides.assets?.requiredAssets ?? DEFAULT_SHELL_ENVIRONMENT.assets.requiredAssets,
		},
		adaptiveRuntime: {
			...DEFAULT_SHELL_ENVIRONMENT.adaptiveRuntime,
			...(overrides.adaptiveRuntime ?? {}),
		},
		session: {
			...DEFAULT_SHELL_ENVIRONMENT.session,
			...(overrides.session ?? {}),
		},
	};
}

const ShellEnvironmentContext = createContext<ShellEnvironment>(DEFAULT_SHELL_ENVIRONMENT);

export function ShellEnvironmentProvider({
	children,
	value,
}: {
	children: React.ReactNode;
	value: ShellEnvironmentInput;
}) {
	const resolvedValue = useMemo(() => createShellEnvironment(value), [value]);

	return (
		<ShellEnvironmentContext.Provider value={resolvedValue}>
			{children}
		</ShellEnvironmentContext.Provider>
	);
}

export function useShellEnvironment() {
	return useContext(ShellEnvironmentContext);
}
