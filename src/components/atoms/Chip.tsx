import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface ChipProps {
	label: string;
	selected?: boolean;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	/** Stable English identifier for screen readers and Maestro. Defaults to label. */
	accessibilityLabel?: string;
}

export function Chip({ label, selected = false, onPress, style, accessibilityLabel }: ChipProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;

	const bgColor = selected ? c.primary : c.surfaceVariant;
	const textColor = selected ? c.onPrimary : c.onSurfaceVariant;
	const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			hitSlop={hitSlop}
			accessibilityRole="togglebutton"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ selected }}
			accessibilityHint={selected ? 'Double tap to deselect' : 'Double tap to select'}
			style={[styles.chip, { backgroundColor: bgColor, borderRadius: r.full }, style]}
		>
			<Text
				style={[
					{
						color: textColor,
						fontSize: theme.typography.sizes.sm,
						fontWeight: theme.typography.weights.medium,
					},
				]}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	chip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
