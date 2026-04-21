import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { WifiOff, ChevronRight } from 'lucide-react-native';
import { ThemedText } from '@/src/design-system';
import {
	createTimingConfig,
	SPACING_PX,
	SIZE_OFFLINE_BANNER_OFFSET,
	useReducedMotion,
	useTheme,
} from '@/src/design-system/foundation';
import { useShellEnvironment } from '../../ShellEnvironment';

export function OfflineBanner() {
	const { isConnected, openSyncLog, translate } = useShellEnvironment();
	const { theme } = useTheme();
	const reduceMotionEnabled = useReducedMotion();
	const bannerMotion = theme.animation.profiles.bannerEnter;

	const translateY = useSharedValue(SIZE_OFFLINE_BANNER_OFFSET);
	const opacity = useSharedValue(0);

	useEffect(() => {
		if (!isConnected) {
			translateY.value = SIZE_OFFLINE_BANNER_OFFSET;
			opacity.value = 0;
			if (reduceMotionEnabled) {
				translateY.value = 0;
				opacity.value = 1;
				return;
			}

			translateY.value = withSpring(0, bannerMotion.spring);
			opacity.value = withTiming(
				1,
				createTimingConfig(bannerMotion.duration, bannerMotion.easing),
			);
		}
	}, [
		bannerMotion.duration,
		bannerMotion.easing,
		bannerMotion.spring,
		isConnected,
		opacity,
		reduceMotionEnabled,
		translateY,
	]);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	const handlePress = () => {
		openSyncLog();
	};

	if (isConnected) return null;

	return (
		<Animated.View
			style={[
				styles.banner,
				{ backgroundColor: theme.colors.error, paddingTop: 0 },
				animStyle,
			]}
		>
			<Pressable onPress={handlePress} style={styles.pressable}>
				<WifiOff size={14} color={theme.colors.onError} strokeWidth={2} />
				<ThemedText
					variant="caption"
					weight="semibold"
					style={{ color: theme.colors.onError, flex: 1 }}
				>
					{translate('common.offlineBanner', 'No internet connection')}
				</ThemedText>
				<ChevronRight size={14} color={theme.colors.onError} />
			</Pressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	banner: {
		paddingVertical: 0,
	},
	pressable: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
		gap: SPACING_PX.xs,
	},
});
