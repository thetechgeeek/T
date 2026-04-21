import React, { createContext, useContext } from 'react';

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
}

const DEFAULT_SYNC_STATUS: ShellSyncStatus = {
	lastSyncedAt: null,
	isSyncing: false,
	pendingCount: 0,
};

const DEFAULT_ENVIRONMENT: ShellEnvironment = {
	translate: (key, fallback) => fallback ?? key,
	isConnected: true,
	syncStatus: DEFAULT_SYNC_STATUS,
	openSyncLog: () => {},
};

const ShellEnvironmentContext = createContext<ShellEnvironment>(DEFAULT_ENVIRONMENT);

export function ShellEnvironmentProvider({
	children,
	value,
}: {
	children: React.ReactNode;
	value: ShellEnvironment;
}) {
	return (
		<ShellEnvironmentContext.Provider value={value}>
			{children}
		</ShellEnvironmentContext.Provider>
	);
}

export function useShellEnvironment() {
	return useContext(ShellEnvironmentContext);
}
