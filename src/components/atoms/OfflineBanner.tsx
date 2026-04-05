import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';

export function OfflineBanner() {
	const { isConnected } = useNetworkStatus();
	const { theme } = useTheme();

	if (isConnected) return null;

	return (
		<View style={[styles.banner, { backgroundColor: theme.colors.error, paddingTop: 0 }]}>
			<WifiOff size={14} color={theme.colors.onError} strokeWidth={2} />
			<ThemedText variant="caption" weight="semibold" style={{ color: theme.colors.onError }}>
				No internet connection
			</ThemedText>
		</View>
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
