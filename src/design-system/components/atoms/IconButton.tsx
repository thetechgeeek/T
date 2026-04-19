import React, { forwardRef, useState } from 'react';
import { Pressable, Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { triggerDesignSystemHaptic, type DesignSystemHaptic } from '@/src/design-system/haptics';
import { buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';

export interface IconButtonProps {
	icon: React.ReactNode;
	label?: string;
	onPress: () => void;
	disabled?: boolean;
	testID?: string;
	accessibilityLabel?: string;
	hapticFeedback?: DesignSystemHaptic;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.4 — IconButton
 * Icon + optional text label below. Minimum 48×48dp touch target.
 */
export const IconButton = forwardRef<React.ElementRef<typeof Pressable>, IconButtonProps>(
	(
		{
			icon,
			label,
			onPress,
			disabled,
			testID,
			accessibilityLabel,
			hapticFeedback = 'selection',
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const iconButtonTokens = theme.components.iconButton;
		const [isFocused, setIsFocused] = useState(false);
		const [isPressed, setIsPressed] = useState(false);

		const handlePress = () => {
			if (disabled) return;
			void triggerDesignSystemHaptic(hapticFeedback);
			onPress();
		};

		return (
			<Pressable
				ref={ref}
				testID={testID}
				onPress={handlePress}
				disabled={disabled}
				focusable={!disabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel ?? label}
				accessibilityState={{ disabled: !!disabled }}
				hitSlop={theme.spacing.xs}
				android_ripple={
					Platform.OS === 'android'
						? {
								color: theme.colors.surfaceVariant,
								borderless: true,
							}
						: undefined
				}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				onPressIn={() => setIsPressed(true)}
				onPressOut={() => setIsPressed(false)}
				style={[
					styles.container,
					{
						minWidth: iconButtonTokens.minSize,
						minHeight: iconButtonTokens.minSize,
						borderRadius: theme.borderRadius.full,
						opacity: isPressed && !disabled ? theme.opacity.pressed : 1,
					},
					isFocused
						? buildFocusRingStyle({
								color: theme.colors.primary,
								radius: theme.borderRadius.full,
							})
						: null,
					style,
				]}
			>
				{icon}
				{label ? (
					<ThemedText
						variant="caption"
						style={{
							color: disabled ? theme.colors.placeholder : theme.colors.onSurface,
							marginTop: iconButtonTokens.labelGap,
							textAlign: 'center',
						}}
					>
						{label}
					</ThemedText>
				) : null}
			</Pressable>
		);
	},
);

IconButton.displayName = 'IconButton';

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
	hapticFeedback?: DesignSystemHaptic;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.4 — FAB (Floating Action Button)
 * 56×56dp circle, terracotta background, shadow-lg, "+" icon.
 */
export const FAB = forwardRef<React.ElementRef<typeof Pressable>, FABProps>(
	({ onPress, testID, accessibilityLabel, hapticFeedback = 'selection', style }, ref) => {
		const { theme } = useTheme();
		const fabTokens = theme.components.fab;
		const [isFocused, setIsFocused] = useState(false);
		const [isPressed, setIsPressed] = useState(false);

		return (
			<Pressable
				ref={ref}
				testID={testID}
				onPress={() => {
					void triggerDesignSystemHaptic(hapticFeedback);
					onPress();
				}}
				focusable
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel ?? 'Add'}
				hitSlop={theme.spacing.xs}
				android_ripple={
					Platform.OS === 'android'
						? {
								color: theme.colors.surfaceVariant,
								borderless: true,
							}
						: undefined
				}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				onPressIn={() => setIsPressed(true)}
				onPressOut={() => setIsPressed(false)}
				style={[
					{
						width: fabTokens.size,
						height: fabTokens.size,
						borderRadius: fabTokens.radius,
						backgroundColor: theme.colors.primary,
						alignItems: 'center',
						justifyContent: 'center',
						position: 'absolute',
						bottom: theme.spacing.xl,
						alignSelf: 'flex-end',
						opacity: isPressed ? theme.opacity.pressed : 1,
					},
					theme.elevation.overlay,
					isFocused
						? buildFocusRingStyle({
								color: theme.colors.onPrimary,
								radius: fabTokens.radius,
							})
						: null,
					style,
				]}
			>
				<ThemedText
					variant="metric"
					style={{
						color: theme.colors.onPrimary,
						fontSize: fabTokens.iconSize,
						lineHeight: theme.spacing['2xl'],
					}}
				>
					+
				</ThemedText>
			</Pressable>
		);
	},
);

FAB.displayName = 'FAB';
