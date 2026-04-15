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
import { DEFAULT_RUNTIME_QUALITY_SIGNALS } from '@/src/design-system/runtimeSignals';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from './ThemedText';
import { MS_SYNC_POLL, SYNC_BADGE_MAX, SIZE_BADGE_OFFSET, Z_INDEX } from '@/theme/uiMetrics';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';

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
	const { c, runtime } = useThemeTokens();
	const reduceMotionEnabled =
		runtime?.reduceMotionEnabled ?? DEFAULT_RUNTIME_QUALITY_SIGNALS.reduceMotionEnabled;

	const rotation = useSharedValue(0);

	useEffect(() => {
		if (status === 'syncing' && !reduceMotionEnabled) {
			rotation.value = withRepeat(
				withTiming(360, { duration: MS_SYNC_POLL, easing: Easing.linear }),
				-1,
				false,
			);
		} else {
			cancelAnimation(rotation);
			rotation.value = 0;
		}
	}, [reduceMotionEnabled, rotation, status]);

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
					<ThemedText variant="captionSmall" weight="bold" style={{ color: c.onPrimary }}>
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
		width: SPACING_PX.xl,
		height: SPACING_PX.xl,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badge: {
		position: 'absolute',
		minWidth: SPACING_PX.lg,
		height: SPACING_PX.lg,
		borderRadius: BORDER_RADIUS_PX.full,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: SPACING_PX.xxs,
		zIndex: Z_INDEX.base,
	},
});
