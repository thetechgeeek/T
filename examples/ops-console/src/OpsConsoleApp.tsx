import React from 'react';
import { View } from 'react-native';
import { Card, CardBody, CardHeader, ThemedText } from '@easydesign/design-system';
import type { ShellEnvironment } from '@easydesign/ui-shell';
import {
	ShellAuthGate,
	ShellDeepLinkGuard,
	ShellFeatureFlagBoundary,
	ShellLayoutScaffold,
	ShellNotificationBadge,
	ShellNotificationHost,
	ShellPermissionBoundary,
	ShellRootProviders,
	ShellTenantSwitcher,
} from '@easydesign/ui-shell';

const environment: ShellEnvironment = {
	translate: (key, fallback) => fallback ?? key,
	isConnected: true,
	syncStatus: {
		lastSyncedAt: '2026-04-21T10:00:00.000Z',
		isSyncing: false,
		pendingCount: 2,
	},
	openSyncLog: () => {},
	permissions: {
		resolve: (capability) => {
			if (capability === 'ops.billing') {
				return {
					state: 'denied',
					title: 'Ops billing is restricted',
					description:
						'Only finance operators can access billing controls in this console.',
				};
			}

			return { state: 'allowed' };
		},
	},
	featureFlags: {
		isEnabled: (flag) => flag !== 'OPS_EXPORTS',
	},
	tenant: {
		current: {
			id: 'ops-console',
			name: 'Operations Console',
			accentLabel: 'Ops',
			canSwitch: true,
		},
		switchTenant: () => {},
	},
	notifications: {
		items: [
			{
				id: 'ops-1',
				title: 'Queue drift detected',
				description: 'One background sync worker is lagging by 4 minutes.',
				category: 'Operations',
				read: false,
				severity: 'warning',
			},
			{
				id: 'ops-2',
				title: 'Webhook delivery recovered',
				description: 'The downstream delivery worker is healthy again.',
				category: 'Reliability',
				read: true,
				severity: 'success',
			},
		],
		unreadCount: 1,
		loading: false,
		openInbox: () => {},
		openPreferences: () => {},
	},
	deepLinks: {
		resolve: (url) => {
			if (url === '/settings/users') {
				return {
					status: 'unauthorized',
					reason: 'The ops console cannot open inventory user settings.',
				};
			}

			if (url === '/ops/health') {
				return {
					status: 'handled',
					href: url,
				};
			}

			return {
				status: 'invalid',
				reason: 'This example app only handles /ops/health links.',
			};
		},
	},
	analytics: {
		track: () => {},
	},
	persistence: {
		restoreLastRoute: () => '/ops/health',
	},
	assets: {
		ready: true,
		requiredAssets: ['lucide-react-native'],
	},
	adaptiveRuntime: {
		widthClass: 'expanded',
		layoutVariant: 'split-pane',
		isTablet: true,
	},
	session: {
		isLocked: false,
		canUseBiometrics: false,
	},
};

function OpsConsoleContent() {
	return (
		<ShellLayoutScaffold
			title="Ops Console"
			rightHeaderElement={<ShellNotificationBadge showZero />}
			aside={<ShellTenantSwitcher />}
			showBackButton={false}
		>
			<View style={{ gap: 16 }}>
				<ShellPermissionBoundary capability="ops.audit-log">
					<Card variant="outlined" padding="lg">
						<CardHeader>
							<ThemedText variant="sectionTitle">Audit log access</ThemedText>
						</CardHeader>
						<CardBody>
							<ThemedText variant="body" color="muted">
								This consumer can read audit logs through the shared shell.
							</ThemedText>
						</CardBody>
					</Card>
				</ShellPermissionBoundary>

				<ShellPermissionBoundary capability="ops.billing" />

				<ShellFeatureFlagBoundary
					flag="OPS_EXPORTS"
					fallback={
						<Card variant="outlined" padding="lg">
							<CardHeader>
								<ThemedText variant="sectionTitle">Exports are disabled</ThemedText>
							</CardHeader>
							<CardBody>
								<ThemedText variant="body" color="muted">
									The second consumer is intentionally proving a disabled feature
									flag path.
								</ThemedText>
							</CardBody>
						</Card>
					}
				>
					<Card variant="outlined" padding="lg">
						<CardHeader>
							<ThemedText variant="sectionTitle">Exports enabled</ThemedText>
						</CardHeader>
					</Card>
				</ShellFeatureFlagBoundary>

				<ShellDeepLinkGuard url="/settings/users">
					<Card variant="outlined" padding="lg">
						<CardHeader>
							<ThemedText variant="sectionTitle">Deep link accepted</ThemedText>
						</CardHeader>
					</Card>
				</ShellDeepLinkGuard>

				<ShellNotificationHost />
			</View>
		</ShellLayoutScaffold>
	);
}

export function OpsConsoleApp() {
	return (
		<ShellRootProviders environment={environment} hideOfflineBanner>
			<ShellAuthGate
				loading={false}
				isAuthenticated
				inAuthArea={false}
				onAuthRequired={() => {}}
				onAuthenticated={() => {}}
			>
				<OpsConsoleContent />
			</ShellAuthGate>
		</ShellRootProviders>
	);
}

export default OpsConsoleApp;
