import React, { forwardRef, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';

export interface ChipProps {
	label: string;
	selected?: boolean;
	defaultSelected?: boolean;
	onPress?: () => void;
	onSelectedChange?: (selected: boolean) => void;
	style?: StyleProp<ViewStyle>;
	size?: 'sm' | 'md';
	leftIcon?: React.ReactNode;
	/** Stable English identifier for screen readers and Maestro. Defaults to label. */
	accessibilityLabel?: string;
	/** Test ID for unit tests. */
	testID?: string;
}

export const Chip = forwardRef<React.ElementRef<typeof TouchableOpacity>, ChipProps>(
	(
		{
			label,
			selected,
			defaultSelected = false,
			onPress,
			onSelectedChange,
			style,
			size = 'md',
			leftIcon,
			accessibilityLabel,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const chipTokens = theme.components.chip;
		const hitSlop = 10;
		const isSm = size === 'sm';
		const [isFocused, setIsFocused] = useState(false);
		const [isSelected, setIsSelected] = useControllableState({
			value: selected,
			defaultValue: defaultSelected,
			onChange: (nextSelected) => onSelectedChange?.(nextSelected),
		});

		const bgColor = isSelected ? c.primary : c.surfaceVariant;
		const textColor = isSelected ? c.onPrimary : c.onSurfaceVariant;

		return (
			<TouchableOpacity
				ref={ref}
				activeOpacity={0.7}
				onPress={() => {
					setIsSelected((current) => !current, { source: 'toggle' });
					onPress?.();
				}}
				testID={testID}
				hitSlop={hitSlop}
				accessibilityRole="togglebutton"
				accessibilityLabel={accessibilityLabel ?? label}
				accessibilityState={{ selected: isSelected }}
				accessibilityHint={isSelected ? 'Double tap to deselect' : 'Double tap to select'}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={[
					styles.chip,
					{
						backgroundColor: bgColor,
						borderRadius: chipTokens.radius,
						height: isSm ? chipTokens.heights.sm : chipTokens.heights.md,
						paddingHorizontal: isSm ? chipTokens.paddingX.sm : chipTokens.paddingX.md,
						paddingVertical: isSm ? chipTokens.paddingY.sm : chipTokens.paddingY.md,
						gap: leftIcon ? chipTokens.gap : 0,
					},
					isFocused
						? buildFocusRingStyle({
								color: c.primary,
								radius: chipTokens.radius,
							})
						: null,
					style,
				]}
			>
				{leftIcon && <View importantForAccessibility="no">{leftIcon}</View>}
				<ThemedText
					variant="caption"
					weight="medium"
					style={[
						{
							color: textColor,
							fontSize: isSm ? theme.typography.sizes.xs : theme.typography.sizes.sm,
						},
					]}
				>
					{label}
				</ThemedText>
			</TouchableOpacity>
		);
	},
);

Chip.displayName = 'Chip';

const styles = StyleSheet.create({
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
