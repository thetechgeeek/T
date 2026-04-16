import React from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface TouchableCardProps extends Omit<PressableProps, 'style'> {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

/**
 * P0.4 — TouchableCard
 * Tappable card with Reanimated scale 0.97 + opacity 0.85 press animation.
 * Used for all tappable cards in the app.
 */
export function TouchableCard({
	children,
	style,
	disabled,
	onPress,
	onPressIn,
	onPressOut,
	testID,
	...props
}: TouchableCardProps) {
	const { theme } = useTheme();
	const reduceMotionEnabled = useReducedMotion();
	const cardMotion = theme.animation.profiles.cardPress;

	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
		if (disabled) return;
		onPress?.(e);
	};

	const handlePressIn = (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
		if (disabled) return;
		if (!reduceMotionEnabled) {
			// eslint-disable-next-line react-hooks/immutability
			scale.value = withSpring(cardMotion.scalePressed, cardMotion.spring);
			// eslint-disable-next-line react-hooks/immutability
			opacity.value = withSpring(cardMotion.opacityPressed, cardMotion.spring);
		}
		onPressIn?.(e);
	};

	const handlePressOut = (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
		if (disabled) return;
		if (!reduceMotionEnabled) {
			// eslint-disable-next-line react-hooks/immutability
			scale.value = withSpring(1, cardMotion.spring);
			// eslint-disable-next-line react-hooks/immutability
			opacity.value = withSpring(1, cardMotion.spring);
		} else {
			scale.value = 1;
			opacity.value = 1;
		}
		onPressOut?.(e);
	};

	return (
		<Animated.View style={animStyle}>
			<Pressable
				{...props}
				testID={testID}
				disabled={disabled}
				onPress={handlePress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				accessibilityRole="button"
				accessibilityState={{ disabled: !!disabled }}
				style={[
					{
						backgroundColor: theme.colors.card,
						borderRadius: theme.borderRadius.md,
					},
					style,
				]}
			>
				{children}
			</Pressable>
		</Animated.View>
	);
}
