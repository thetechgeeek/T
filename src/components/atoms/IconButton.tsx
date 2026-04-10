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
			style={[styles.container, style]}
		>
			{icon}
			{label ? (
				<Text
					style={{
						fontSize: theme.typography.sizes.xs,
						color: disabled ? theme.colors.placeholder : theme.colors.onSurface,
						marginTop: 2,
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
		minWidth: 48,
		minHeight: 48,
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
					width: 56,
					height: 56,
					borderRadius: 28,
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
					fontSize: 28,
					lineHeight: 32,
					fontWeight: '400',
				}}
			>
				+
			</Text>
		</Pressable>
	);
}
