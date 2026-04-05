import React from 'react';
import {
	TouchableOpacity,
	Text,
	View,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface ChipProps {
	label: string;
	selected?: boolean;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	size?: 'sm' | 'md';
	leftIcon?: React.ReactNode;
	/** Stable English identifier for screen readers and Maestro. Defaults to label. */
	accessibilityLabel?: string;
	/** Test ID for unit tests. */
	testID?: string;
}

export function Chip({
	label,
	selected = false,
	onPress,
	style,
	size = 'md',
	leftIcon,
	accessibilityLabel,
	testID,
}: ChipProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;

	const bgColor = selected ? c.primary : c.surfaceVariant;
	const textColor = selected ? c.onPrimary : c.onSurfaceVariant;
	const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

	const isSm = size === 'sm';

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			testID={testID}
			hitSlop={hitSlop}
			accessibilityRole="togglebutton"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ selected }}
			accessibilityHint={selected ? 'Double tap to deselect' : 'Double tap to select'}
			style={[
				styles.chip,
				{
					backgroundColor: bgColor,
					borderRadius: r.full,
					paddingHorizontal: isSm ? 10 : 16,
					paddingVertical: isSm ? 4 : 8,
					gap: leftIcon ? 4 : 0,
				},
				style,
			]}
		>
			{leftIcon && <View importantForAccessibility="no">{leftIcon}</View>}
			<Text
				style={[
					{
						color: textColor,
						fontSize: isSm ? theme.typography.sizes.xs : theme.typography.sizes.sm,
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
