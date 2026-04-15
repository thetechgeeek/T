import React from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface IconButtonProps {
	icon: React.ReactNode;
	label?: string;
	onPress: () => void;
	disabled?: boolean;
	testID?: string;
	accessibilityLabel?: string;
	style?: ViewStyle;
}

/**
 * P0.4 — IconButton
 * Icon + optional text label below. Minimum 48×48dp touch target.
 */
export function IconButton({
	icon,
	label,
	onPress,
	disabled,
	testID,
	accessibilityLabel,
	style,
}: IconButtonProps) {
	const { theme } = useTheme();
	const iconButtonTokens = theme.components.iconButton;

	const handlePress = () => {
		if (disabled) return;
		onPress();
	};

	return (
		<Pressable
			testID={testID}
			onPress={handlePress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ disabled: !!disabled }}
			style={[
				styles.container,
				{
					minWidth: iconButtonTokens.minSize,
					minHeight: iconButtonTokens.minSize,
				},
				style,
			]}
		>
			{icon}
			{label ? (
				<Text
					style={{
						fontSize: theme.typography.sizes.xs,
						color: disabled ? theme.colors.placeholder : theme.colors.onSurface,
						marginTop: iconButtonTokens.labelGap,
						textAlign: 'center',
					}}
				>
					{label}
				</Text>
			) : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export interface FABProps {
	onPress: () => void;
	testID?: string;
	accessibilityLabel?: string;
	style?: ViewStyle;
}

/**
 * P0.4 — FAB (Floating Action Button)
 * 56×56dp circle, terracotta background, shadow-lg, "+" icon.
 */
export function FAB({ onPress, testID, accessibilityLabel, style }: FABProps) {
	const { theme } = useTheme();
	const fabTokens = theme.components.fab;

	const handlePress = () => {
		onPress();
	};

	return (
		<Pressable
			testID={testID}
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? 'Add'}
			style={[
				{
					width: fabTokens.size,
					height: fabTokens.size,
					borderRadius: fabTokens.radius,
					backgroundColor: theme.colors.primary,
					alignItems: 'center',
					justifyContent: 'center',
				},
				style,
			]}
		>
			<Text
				style={{
					color: theme.colors.onPrimary,
					fontSize: fabTokens.iconSize,
					lineHeight: theme.spacing['2xl'],
					fontWeight: '400',
				}}
			>
				+
			</Text>
		</Pressable>
	);
}
