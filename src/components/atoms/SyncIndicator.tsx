import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

export interface SyncIndicatorProps {
	status: SyncStatus;
	pendingCount?: number;
}

/**
 * P0.8 — SyncIndicator
 * Shows sync status in ScreenHeader:
 * - synced: green cloud-check
 * - syncing: spinning cloud (Activity Indicator)
 * - offline: grey cloud-off
 * Shows pending count badge when > 0.
 */
export function SyncIndicator({ status, pendingCount = 0 }: SyncIndicatorProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	const iconChar = status === 'synced' ? '✓' : status === 'syncing' ? '↻' : '✕';
	const iconColor =
		status === 'synced' ? c.success : status === 'syncing' ? c.primary : c.placeholder;

	return (
		<View style={styles.container}>
			<View
				testID={`sync-indicator-${status}`}
				style={[
					styles.icon,
					{
						backgroundColor: status === 'offline' ? c.surfaceVariant : 'transparent',
					},
				]}
				accessibilityLabel={`Sync status: ${status}`}
			>
				<Text style={{ color: iconColor, fontSize: 14, fontWeight: '700' }}>
					{iconChar}
				</Text>
			</View>
			{pendingCount > 0 ? (
				<View style={[styles.badge, { backgroundColor: c.primary }]}>
					<Text style={{ color: c.onPrimary, fontSize: 10, fontWeight: '700' }}>
						{pendingCount}
					</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		width: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
	},
	badge: {
		minWidth: 16,
		height: 16,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 2,
		paddingHorizontal: 3,
	},
});
