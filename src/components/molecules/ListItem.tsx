import React from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPRING_PRESS, PRESS_SCALE } from '@/src/theme/animations';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

interface ListItemProps {
	title: string;
	subtitle?: string;
	leftIcon?: React.ReactNode;
	rightElement?: React.ReactNode;
	onPress?: () => void;
	style?: ViewStyle;
	showChevron?: boolean;
	/** Stable English identifier. Defaults to combining title + subtitle. */
	accessibilityLabel?: string;
	accessibilityHint?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
	title,
	subtitle,
	leftIcon,
	rightElement,
	onPress,
	style,
	showChevron = true,
	accessibilityLabel,
	accessibilityHint,
}) => {
	const { theme } = useTheme();

	const scale = useSharedValue(1);
	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const composedLabel = accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ');

	return (
		<Animated.View style={[animStyle, style]}>
			<Pressable
				onPress={onPress}
				onPressIn={() => {
					// eslint-disable-next-line react-hooks/immutability
					if (onPress) scale.value = withSpring(PRESS_SCALE.pressed, SPRING_PRESS);
				}}
				onPressOut={() => {
					// eslint-disable-next-line react-hooks/immutability
					if (onPress) scale.value = withSpring(PRESS_SCALE.released, SPRING_PRESS);
				}}
				accessibilityRole={onPress ? 'button' : 'none'}
				accessibilityLabel={composedLabel}
				accessibilityHint={
					accessibilityHint ?? (onPress ? 'Double tap to open' : undefined)
				}
				style={({ pressed }) => [
					styles.container,
					{ borderBottomWidth: 1, borderBottomColor: theme.colors.separator },
					pressed && { backgroundColor: theme.colors.surfaceVariant },
				]}
			>
				<View style={styles.content}>
					{leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
					<View style={styles.textContainer}>
						<Text
							style={[
								styles.title,
								{
									color: theme.colors.onSurface,
									fontSize: theme.typography.sizes.md,
									fontFamily: theme.typography.fontFamilyBold,
								},
							]}
						>
							{title}
						</Text>
						{!!subtitle && (
							<Text
								style={[
									styles.subtitle,
									{
										color: theme.colors.onSurfaceVariant,
										fontSize: theme.typography.sizes.sm,
										fontFamily: theme.typography.fontFamily,
									},
								]}
							>
								{subtitle}
							</Text>
						)}
					</View>
					{rightElement}
					{onPress && showChevron && (
						<ChevronRight
							size={20}
							color={theme.colors.onSurfaceVariant}
							style={styles.chevron}
							importantForAccessibility="no"
						/>
					)}
				</View>
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	leftIcon: {
		marginRight: SPACING_PX.lg,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		marginBottom: SPACING_PX.xxs,
	},
	subtitle: {},
	chevron: {
		marginLeft: SPACING_PX.sm,
	},
});
