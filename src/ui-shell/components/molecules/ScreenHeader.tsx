import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@easydesign/design-system';
import {
	layout,
	MS_HEADER_SYNC_REFRESH,
	SPACING_PX,
	useThemeTokens,
} from '@easydesign/design-system/foundation';
import { SyncIndicator, type SyncStatus } from '../atoms/SyncIndicator';
import { useShellEnvironment } from '../../ShellEnvironment';

const MINS_PER_HOUR = 60;
const SCREEN_HEADER_EYEBROW_LETTER_SPACING = 0.4;

export interface ScreenHeaderProps {
	title: string | React.ReactNode;
	eyebrow?: string;
	subtitle?: string;
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
	eyebrow,
	subtitle,
	onBack,
	rightElement,
	style,
	showBackButton = true,
	showSyncStatus = true,
}) => {
	const { c, s, r } = useThemeTokens();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isConnected, syncStatus, translate } = useShellEnvironment();
	const { isSyncing, lastSyncedAt, pendingCount } = syncStatus;

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
				setLastSyncedText(translate('common.syncedJustNow', 'Just now'));
			} else if (mins < MINS_PER_HOUR) {
				setLastSyncedText(`${mins} ${translate('common.minsAgo', 'mins ago')}`);
			} else {
				setLastSyncedText(translate('common.syncedLongAgo', 'Synced a while ago'));
			}
		};

		updateRelativeTime();
		const timer = setInterval(updateRelativeTime, MS_HEADER_SYNC_REFRESH);
		return () => clearInterval(timer);
	}, [lastSyncedAt, showSyncStatus, translate]);

	const handleBack = onBack || (() => router.back());

	// Determine sync status for indicator
	const indicatorStatus: SyncStatus = isSyncing ? 'syncing' : isConnected ? 'synced' : 'offline';
	const secondaryText = subtitle ?? (showSyncStatus ? lastSyncedText : '');

	return (
		<View
			style={[
				styles.header,
				layout.rowBetween,
				{
					backgroundColor: c.background,
					borderBottomColor: c.separator,
					borderBottomWidth: StyleSheet.hairlineWidth,
					paddingHorizontal: s.lg,
					paddingBottom: s.md,
					paddingTop: Math.max(insets.top + s.xs, s.md),
				},
				style,
			]}
		>
			<View style={[layout.row, { flex: 1, alignItems: 'center' }]}>
				{showBackButton && (
					<TouchableOpacity
						onPress={handleBack}
						style={[
							styles.back,
							{
								backgroundColor: c.surface,
								borderColor: c.border,
								borderRadius: r.md,
							},
						]}
						accessibilityRole="button"
						accessibilityLabel="Go back"
					>
						<ArrowLeft size={18} color={c.onSurface} strokeWidth={2.25} />
					</TouchableOpacity>
				)}
				<View style={{ marginLeft: showBackButton ? s.md : 0, flex: 1 }}>
					{eyebrow ? (
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{
								letterSpacing: SCREEN_HEADER_EYEBROW_LETTER_SPACING,
								textTransform: 'uppercase',
							}}
						>
							{eyebrow}
						</ThemedText>
					) : null}
					<ThemedText variant="screenTitle" numberOfLines={1}>
						{title}
					</ThemedText>
					{secondaryText ? (
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ marginTop: s.xxs }}
						>
							{secondaryText}
						</ThemedText>
					) : null}
				</View>
			</View>

			<View style={layout.row}>
				{showSyncStatus && (
					<View style={{ marginRight: rightElement ? s.md : 0 }}>
						<SyncIndicator status={indicatorStatus} pendingCount={pendingCount} />
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
		padding: SPACING_PX.sm,
		borderWidth: StyleSheet.hairlineWidth,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
