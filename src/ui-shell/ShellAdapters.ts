export type ShellAccessState = 'allowed' | 'denied' | 'masked' | 'limited' | 'loading';

export interface ShellPermissionResolution {
	state: ShellAccessState;
	title?: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
}

export interface ShellPermissionAdapter {
	resolve: (capability: string) => ShellPermissionResolution;
	requestAccess?: (capability: string) => void;
}

export interface ShellFeatureFlagAdapter {
	isResolving?: boolean;
	isEnabled: (flag: string) => boolean;
}

export interface ShellTenantContext {
	id: string | null;
	name: string;
	accentLabel?: string;
	canSwitch?: boolean;
}

export interface ShellTenantAdapter {
	current: ShellTenantContext;
	switchTenant?: () => void;
}

export type ShellNotificationSeverity = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface ShellNotificationItem {
	id: string;
	title: string;
	description?: string;
	category: string;
	read?: boolean;
	severity?: ShellNotificationSeverity;
}

export interface ShellNotificationAdapter {
	items: ShellNotificationItem[];
	unreadCount: number;
	loading?: boolean;
	openInbox?: () => void;
	openPreferences?: () => void;
	markAsRead?: (id: string) => Promise<void> | void;
	markAllAsRead?: () => Promise<void> | void;
	refresh?: () => Promise<void> | void;
}

export type ShellDeepLinkStatus = 'handled' | 'invalid' | 'unauthorized';

export interface ShellDeepLinkResolution {
	status: ShellDeepLinkStatus;
	href?: string;
	reason?: string;
}

export interface ShellDeepLinkAdapter {
	resolve: (url: string) => ShellDeepLinkResolution;
	openExternal?: (url: string) => void;
}

export interface ShellAnalyticsAdapter {
	track: (eventName: string, meta?: Record<string, unknown>) => void;
}

export interface ShellPersistenceAdapter {
	flushPending?: () => Promise<void> | void;
	restoreLastRoute?: () => Promise<string | null> | string | null;
}

export interface ShellAssetAdapter {
	ready: boolean;
	requiredAssets: string[];
}

export type ShellWidthClass = 'compact' | 'medium' | 'expanded';
export type ShellLayoutVariant = 'single-pane' | 'split-pane';

export interface ShellAdaptiveRuntimeAdapter {
	widthClass: ShellWidthClass;
	layoutVariant: ShellLayoutVariant;
	isTablet: boolean;
}

export interface ShellSessionAdapter {
	isLocked: boolean;
	canUseBiometrics: boolean;
	reauthenticate?: () => Promise<void> | void;
	recoverSession?: () => Promise<void> | void;
	validateOnResume?: () => Promise<void> | void;
	lock?: () => Promise<void> | void;
	unlock?: () => Promise<void> | void;
}
