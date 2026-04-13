import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '../atoms/ThemedText';
import { SyncIndicator, type SyncStatus } from '../atoms/SyncIndicator';
import { layout } from '@/src/theme/layout';
import { useSyncStore } from '@/src/stores/syncStore';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useLocale } from '@/src/hooks/useLocale';
import { MS_HEADER_SYNC_REFRESH } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const MINS_PER_HOUR = 60;

export interface ScreenHeaderProps {
	title: string | React.ReactNode;
	onBack?: () => void;
	rightElement?: React.ReactNode;
	style?: ViewStyle;
	showBackButton?: boolean;
	showSyncStatus?: boolean;
}

/**
 * A standardized header for all screens in the app.
 * P22.1 — Enhanced with sync status indicators.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	title,
	onBack,
	rightElement,
	style,
	showBackButton = true,
	showSyncStatus = true,
}) => {
	const { c, s } = useThemeTokens();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isConnected } = useNetworkStatus();
	const { lastSyncedAt, isSyncing, pendingCount } = useSyncStore();
	const { t } = useLocale();

	const [lastSyncedText, setLastSyncedText] = useState('');

	useEffect(() => {
		if (!showSyncStatus) return;

		const updateRelativeTime = () => {
			if (!lastSyncedAt) {
				setLastSyncedText('');
				return;
			}
			const diff = Date.now() - new Date(lastSyncedAt).getTime();
			const mins = Math.floor(diff / MS_HEADER_SYNC_REFRESH);

			if (mins < 1) {
				setLastSyncedText(t('common.syncedJustNow') || 'Just now');
			} else if (mins < MINS_PER_HOUR) {
				setLastSyncedText(`${mins} ${t('common.minsAgo') || 'mins ago'}`);
			} else {
				setLastSyncedText(t('common.syncedLongAgo') || 'Synced a while ago');
			}
		};

		updateRelativeTime();
		const timer = setInterval(updateRelativeTime, MS_HEADER_SYNC_REFRESH);
		return () => clearInterval(timer);
	}, [lastSyncedAt, showSyncStatus, t]);

	const handleBack = onBack || (() => router.back());

	// Determine sync status for indicator
	const syncStatus: SyncStatus = isSyncing ? 'syncing' : isConnected ? 'synced' : 'offline';

	return (
		<View
			style={[
				styles.header,
				layout.rowBetween,
				{
					borderBottomColor: c.border,
					borderBottomWidth: 1,
					paddingHorizontal: s.lg,
					paddingBottom: s.md,
					paddingTop: Math.max(insets.top, s.sm),
				},
				style,
			]}
		>
			<View style={[layout.row, { flex: 1 }]}>
				{showBackButton && (
					<TouchableOpacity
						onPress={handleBack}
						style={styles.back}
						accessibilityRole="button"
						accessibilityLabel="Go back"
					>
						<ArrowLeft size={22} color={c.primary} strokeWidth={2} />
					</TouchableOpacity>
				)}
				<View style={{ marginLeft: showBackButton ? s.md : 0, flex: 1 }}>
					<ThemedText variant="h2" numberOfLines={1}>
						{title}
					</ThemedText>
					{showSyncStatus && lastSyncedText ? (
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ marginTop: -s.xxs }}
						>
							{lastSyncedText}
						</ThemedText>
					) : null}
				</View>
			</View>

			<View style={layout.row}>
				{showSyncStatus && (
					<View style={{ marginRight: rightElement ? s.md : 0 }}>
						<SyncIndicator status={syncStatus} pendingCount={pendingCount} />
					</View>
				)}
				{rightElement && <View style={{ marginLeft: s.md }}>{rightElement}</View>}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		alignItems: 'center',
	},
	back: {
		padding: SPACING_PX.md,
		marginLeft: -SPACING_PX.md,
	},
});
