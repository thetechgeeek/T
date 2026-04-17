import React, { forwardRef, useState } from 'react';
import {
	Pressable,
	StyleSheet,
	ActivityIndicator,
	Platform,
	type PressableProps,
	type StyleProp,
	type ViewStyle,
	type GestureResponderEvent,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { triggerDesignSystemHaptic, type DesignSystemHaptic } from '@/src/design-system/haptics';
import { buildFocusRingStyle } from '@/src/utils/accessibility';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
	title?: string;
	/** Stable English identifier used by screen readers and Maestro. Overrides the default title-derived label. */
	accessibilityLabel?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'inverse';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	tone?: 'brand' | 'neutral' | 'danger' | 'inverse';
	emphasis?: 'high' | 'medium' | 'low';
	density?: 'compact' | 'default' | 'relaxed';
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	iconOnly?: boolean;
	fullWidth?: boolean;
	hapticFeedback?: DesignSystemHaptic;
	style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
	(
		{
			title,
			accessibilityLabel,
			variant,
			size,
			tone = 'brand',
			emphasis = 'high',
			density = 'default',
			loading = false,
			leftIcon,
			rightIcon,
			iconOnly = false,
			fullWidth = false,
			hapticFeedback = 'selection',
			style,
			disabled,
			onPress,
			onPressIn,
			onPressOut,
			onFocus,
			onBlur,
			...props
		},
		ref,
	) => {
		const { theme } = useTheme();
		const reduceMotionEnabled = useReducedMotion();
		const c = theme.colors;
		const buttonTokens = theme.components.button;
		const buttonMotion = theme.animation.profiles.buttonPress;
		const inverseSurface = theme.visual.surfaces.inverse;
		const inverseText = theme.visual.surfaces.onInverse;
		const [isFocused, setIsFocused] = useState(false);

		const scale = useSharedValue(1);
		const animStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}));

		const resolvedVariant =
			variant ??
			(() => {
				if (tone === 'inverse') {
					return 'inverse';
				}
				if (tone === 'danger') {
					return 'danger';
				}
				if (tone === 'neutral') {
					return emphasis === 'high'
						? 'secondary'
						: emphasis === 'medium'
							? 'outline'
							: 'ghost';
				}
				return emphasis === 'high'
					? 'primary'
					: emphasis === 'medium'
						? 'outline'
						: 'ghost';
			})();

		const resolvedSize =
			size ?? (density === 'compact' ? 'sm' : density === 'relaxed' ? 'lg' : 'md');

		const getVariantStyles = () => {
			switch (resolvedVariant) {
				case 'secondary':
					return {
						bg: c.surfaceVariant,
						text: c.onSurfaceVariant,
						border: 'transparent',
					};
				case 'outline':
					return { bg: 'transparent', text: c.primary, border: c.primary };
				case 'ghost':
					return { bg: 'transparent', text: c.primary, border: 'transparent' };
				case 'danger':
					return { bg: c.error, text: c.onError, border: 'transparent' };
				case 'inverse':
					return { bg: inverseSurface, text: inverseText, border: 'transparent' };
				case 'primary':
				default:
					return { bg: c.primary, text: c.onPrimary, border: 'transparent' };
			}
		};

		const getSizeStyles = () => {
			switch (resolvedSize) {
				case 'xs':
					return {
						height: buttonTokens.heights.xs,
						px: buttonTokens.paddingX.xs,
						fontSize: theme.typography.sizes.xs,
					};
				case 'sm':
					return {
						height: buttonTokens.heights.sm,
						px: buttonTokens.paddingX.sm,
						fontSize: theme.typography.sizes.sm,
					};
				case 'lg':
					return {
						height: buttonTokens.heights.lg,
						px: buttonTokens.paddingX.lg,
						fontSize: theme.typography.sizes.lg,
					};
				case 'md':
				default:
					return {
						height: buttonTokens.heights.md,
						px: buttonTokens.paddingX.md,
						fontSize: theme.typography.sizes.md,
					};
			}
		};

		const v = getVariantStyles();
		const s = getSizeStyles();

		const isOutline = resolvedVariant === 'outline';
		const isGhost = resolvedVariant === 'ghost';
		const isDisabled = disabled || loading;

		const handlePress = (e: GestureResponderEvent) => {
			if (isDisabled) return;
			void triggerDesignSystemHaptic(hapticFeedback);
			onPress?.(e);
		};

		const hasTextLabel = Boolean(title) && !iconOnly;
		const widthStyle = iconOnly
			? { width: s.height, paddingHorizontal: 0 }
			: fullWidth
				? { width: '100%' as const }
				: null;

		return (
			<Animated.View style={[animStyle, style]}>
				<Pressable
					ref={ref}
					{...props}
					disabled={isDisabled}
					focusable={!isDisabled}
					accessibilityRole="button"
					accessibilityLabel={accessibilityLabel ?? title ?? 'Button'}
					accessibilityState={{ disabled: isDisabled, busy: loading }}
					accessibilityHint={loading ? 'Loading, please wait' : undefined}
					android_ripple={
						Platform.OS === 'android'
							? {
									color: c.surfaceVariant,
									borderless: false,
								}
							: undefined
					}
					onFocus={(e) => {
						setIsFocused(true);
						onFocus?.(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						onBlur?.(e);
					}}
					onPressIn={(e: GestureResponderEvent) => {
						if (isDisabled) return;
						if (!reduceMotionEnabled) {
							// eslint-disable-next-line react-hooks/immutability
							scale.value = withSpring(
								buttonMotion.scalePressed,
								buttonMotion.spring,
							);
						}
						onPressIn?.(e);
					}}
					onPressOut={(e: GestureResponderEvent) => {
						if (isDisabled) return;
						if (!reduceMotionEnabled) {
							// eslint-disable-next-line react-hooks/immutability
							scale.value = withSpring(1, buttonMotion.spring);
						} else {
							scale.value = 1;
						}
						onPressOut?.(e);
					}}
					style={[
						styles.button,
						{
							backgroundColor:
								isDisabled && !isOutline && !isGhost ? c.surfaceVariant : v.bg,
							borderColor: isFocused
								? c.primary
								: isDisabled && isOutline
									? c.border
									: v.border,
							borderWidth:
								isFocused && !isOutline
									? buildFocusRingStyle({
											color: c.primary,
											radius: buttonTokens.radius,
										}).borderWidth
									: isOutline
										? buttonTokens.outlineWidth
										: 0,
							borderRadius: buttonTokens.radius,
							height: s.height,
							paddingHorizontal: s.px,
						},
						widthStyle,
					]}
					onPress={handlePress}
				>
					{loading ? (
						<ActivityIndicator
							testID="loading-indicator"
							color={isOutline || isGhost ? c.primary : v.text}
						/>
					) : (
						<>
							{leftIcon}
							{hasTextLabel ? (
								<ThemedText
									allowFontScaling
									variant="label"
									weight="semibold"
									style={[
										styles.label,
										{
											color: isDisabled ? c.placeholder : v.text,
											fontSize: s.fontSize,
											marginStart: leftIcon ? buttonTokens.iconGap : 0,
											marginEnd: rightIcon ? buttonTokens.iconGap : 0,
										},
									]}
								>
									{title}
								</ThemedText>
							) : null}
							{rightIcon}
						</>
					)}
				</Pressable>
			</Animated.View>
		);
	},
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {},
});
