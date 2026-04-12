import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { WifiOff, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { SPRING_PRESS, TIMING_NORMAL } from '@/src/theme/animations';

export function OfflineBanner() {
	const { isConnected } = useNetworkStatus();
	const { theme } = useTheme();
	const router = useRouter();

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

	const handlePress = () => {
		// P22.1 — Tap banner opens sync log
		router.push('/settings/sync-log' as Href);
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
					No internet connection
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
		paddingVertical: 10,
		paddingHorizontal: 16,
		gap: 6,
	},
});
