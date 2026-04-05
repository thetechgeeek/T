import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { SPRING_PRESS, TIMING_NORMAL } from '@/src/theme/animations';

export function OfflineBanner() {
	const { isConnected } = useNetworkStatus();
	const { theme } = useTheme();

	const translateY = useSharedValue(-44);
	const opacity = useSharedValue(0);

	useEffect(() => {
		if (!isConnected) {
			translateY.value = -44;
			opacity.value = 0;
			translateY.value = withSpring(0, SPRING_PRESS);
			opacity.value = withTiming(1, TIMING_NORMAL);
		}
	}, [isConnected, opacity, translateY]);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	if (isConnected) return null;

	return (
		<Animated.View
			style={[
				styles.banner,
				{ backgroundColor: theme.colors.error, paddingTop: 0 },
				animStyle,
			]}
		>
			<WifiOff size={14} color={theme.colors.onError} strokeWidth={2} />
			<ThemedText variant="caption" weight="semibold" style={{ color: theme.colors.onError }}>
				No internet connection
			</ThemedText>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 6,
		paddingHorizontal: 16,
		gap: 6,
	},
});
