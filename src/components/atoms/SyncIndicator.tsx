import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { CloudCheck, CloudOff, Cloud } from 'lucide-react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
	cancelAnimation,
} from 'react-native-reanimated';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from './ThemedText';
import { MS_SYNC_POLL, SYNC_BADGE_MAX, SIZE_BADGE_OFFSET } from '@/theme/uiMetrics';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

export interface SyncIndicatorProps {
	status: SyncStatus;
	pendingCount?: number;
}

/**
 * P22.1 — SyncIndicator
 * Shows sync status in ScreenHeader:
 * - synced: green cloud-check
 * - syncing: spinning cloud (animated)
 * - offline: grey cloud-off
 */
export function SyncIndicator({ status, pendingCount = 0 }: SyncIndicatorProps) {
	const { c } = useThemeTokens();

	const rotation = useSharedValue(0);

	useEffect(() => {
		if (status === 'syncing') {
			rotation.value = withRepeat(
				withTiming(360, { duration: MS_SYNC_POLL, easing: Easing.linear }),
				-1,
				false,
			);
		} else {
			cancelAnimation(rotation);
			rotation.value = 0;
		}
	}, [status, rotation]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	const renderIcon = () => {
		switch (status) {
			case 'synced':
				return (
					<CloudCheck
						testID="sync-indicator-synced"
						size={20}
						color={c.success}
						strokeWidth={2.5}
					/>
				);
			case 'offline':
				return (
					<CloudOff
						testID="sync-indicator-offline"
						size={20}
						color={c.onSurfaceVariant}
						strokeWidth={2}
					/>
				);
			case 'syncing':
				return (
					<Animated.View testID="sync-indicator-syncing" style={animatedStyle}>
						<Cloud size={20} color={c.primary} strokeWidth={2.5} />
					</Animated.View>
				);
			default:
				return null;
		}
	};

	return (
		<View style={styles.container} accessibilityLabel={`Sync status: ${status}`}>
			<View style={styles.iconContainer}>{renderIcon()}</View>
			{pendingCount > 0 && (
				<View
					style={[
						styles.badge,
						{
							backgroundColor: c.primary,
							right: SIZE_BADGE_OFFSET,
							top: SIZE_BADGE_OFFSET,
						},
					]}
				>
					<ThemedText
						variant="label"
						weight="bold"
						style={{ color: c.onPrimary, fontSize: 9 }}
					>
						{pendingCount > SYNC_BADGE_MAX ? `${SYNC_BADGE_MAX}+` : pendingCount}
					</ThemedText>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
	},
	iconContainer: {
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badge: {
		position: 'absolute',
		minWidth: 14,
		height: 14,
		borderRadius: 7,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 2,
		zIndex: 1,
	},
});
