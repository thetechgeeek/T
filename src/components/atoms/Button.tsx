import React from 'react';
import {
	Pressable,
	StyleSheet,
	ActivityIndicator,
	type PressableProps,
	type StyleProp,
	type ViewStyle,
	type GestureResponderEvent,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { DEFAULT_RUNTIME_QUALITY_SIGNALS } from '@/src/design-system/runtimeSignals';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
	title?: string;
	/** Stable English identifier used by screen readers and Maestro. Overrides the default title-derived label. */
	accessibilityLabel?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
}

export function Button({
	title,
	accessibilityLabel,
	variant = 'primary',
	size = 'md',
	loading = false,
	leftIcon,
	rightIcon,
	style,
	disabled,
	onPress,
	onPressIn,
	onPressOut,
	...props
}: ButtonProps) {
	const { theme, runtime } = useTheme();
	const reduceMotionEnabled =
		runtime?.reduceMotionEnabled ?? DEFAULT_RUNTIME_QUALITY_SIGNALS.reduceMotionEnabled;
	const c = theme.colors;
	const buttonTokens = theme.components.button;
	const buttonMotion = theme.animation.profiles.buttonPress;

	const scale = useSharedValue(1);
	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const getVariantStyles = () => {
		switch (variant) {
			case 'secondary':
				return { bg: c.surfaceVariant, text: c.onSurfaceVariant, border: 'transparent' };
			case 'outline':
				return { bg: 'transparent', text: c.primary, border: c.primary };
			case 'ghost':
				return { bg: 'transparent', text: c.primary, border: 'transparent' };
			case 'danger':
				return { bg: c.error, text: c.onError, border: 'transparent' };
			case 'primary':
			default:
				return { bg: c.primary, text: c.onPrimary, border: 'transparent' };
		}
	};

	const getSizeStyles = () => {
		switch (size) {
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

	const isOutline = variant === 'outline';
	const isDisabled = disabled || loading;

	const handlePress = (e: GestureResponderEvent) => {
		if (isDisabled) return;
		onPress?.(e);
	};

	return (
		<Animated.View style={[animStyle, style]}>
			<Pressable
				{...props}
				disabled={isDisabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel ?? title}
				accessibilityState={{ disabled: isDisabled, busy: loading }}
				accessibilityHint={loading ? 'Loading, please wait' : undefined}
				onPressIn={(e: GestureResponderEvent) => {
					if (isDisabled) return;
					if (!reduceMotionEnabled) {
						// eslint-disable-next-line react-hooks/immutability
						scale.value = withSpring(buttonMotion.scalePressed, buttonMotion.spring);
					}
					onPressIn?.(e);
				}}
				onPressOut={(e: GestureResponderEvent) => {
					if (isDisabled) return;
					if (!reduceMotionEnabled) {
						// eslint-disable-next-line react-hooks/immutability
						scale.value = withSpring(1, buttonMotion.spring);
					} else {
						// eslint-disable-next-line react-hooks/immutability
						scale.value = 1;
					}
					onPressOut?.(e);
				}}
				style={[
					styles.button,
					{
						backgroundColor:
							isDisabled && !isOutline && variant !== 'ghost'
								? c.surfaceVariant
								: v.bg,
						borderColor: isDisabled && isOutline ? c.border : v.border,
						borderWidth: isOutline ? buttonTokens.outlineWidth : 0,
						borderRadius: buttonTokens.radius,
						height: s.height,
						paddingHorizontal: s.px,
					},
				]}
				onPress={handlePress}
			>
				{loading ? (
					<ActivityIndicator
						testID="loading-indicator"
						color={isOutline || variant === 'ghost' ? c.primary : v.text}
					/>
				) : (
					<>
						{leftIcon}
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
						{rightIcon}
					</>
				)}
			</Pressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {},
});
