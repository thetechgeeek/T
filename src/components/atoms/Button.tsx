import React from 'react';
import {
	Pressable,
	Text,
	StyleSheet,
	ActivityIndicator,
	type PressableProps,
	type ViewStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPRING_PRESS, PRESS_SCALE } from '@/src/theme/animations';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
	title?: string;
	/** Stable English identifier used by screen readers and Maestro. Overrides the default title-derived label. */
	accessibilityLabel?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	style?: ViewStyle;
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
	onPressIn,
	onPressOut,
	...props
}: ButtonProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;

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
				// 44pt minimum touch target (Apple HIG / Material)
				return { height: 44, px: 16, fontSize: theme.typography.sizes.sm };
			case 'lg':
				return { height: 56, px: 32, fontSize: theme.typography.sizes.lg };
			case 'md':
			default:
				return { height: 48, px: 24, fontSize: theme.typography.sizes.md };
		}
	};

	const v = getVariantStyles();
	const s = getSizeStyles();

	const isOutline = variant === 'outline';
	const isDisabled = disabled || loading;

	return (
		<Animated.View style={[animStyle, style]}>
			<Pressable
				disabled={isDisabled}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel ?? title}
				accessibilityState={{ disabled: isDisabled, busy: loading }}
				accessibilityHint={loading ? 'Loading, please wait' : undefined}
				onPressIn={(e) => {
					scale.value = withSpring(PRESS_SCALE.pressed, SPRING_PRESS);
					onPressIn?.(e);
				}}
				onPressOut={(e) => {
					scale.value = withSpring(PRESS_SCALE.released, SPRING_PRESS);
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
						borderWidth: isOutline ? 1 : 0,
						borderRadius: r.md,
						height: s.height,
						paddingHorizontal: s.px,
					},
				]}
				{...props}
			>
				{loading ? (
					<ActivityIndicator
						testID="loading-indicator"
						color={isOutline || variant === 'ghost' ? c.primary : v.text}
					/>
				) : (
					<>
						{leftIcon}
						<Text
							style={[
								styles.label,
								{
									color: isDisabled ? c.placeholder : v.text,
									fontSize: s.fontSize,
									fontWeight: theme.typography.weights.semibold,
									marginLeft: leftIcon ? 8 : 0,
									marginRight: rightIcon ? 8 : 0,
								},
							]}
						>
							{title}
						</Text>
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
