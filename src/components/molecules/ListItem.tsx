import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle, type StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { ThemedText } from '../atoms/ThemedText';

interface ListItemProps {
	title: string;
	subtitle?: string;
	leftIcon?: React.ReactNode;
	rightElement?: React.ReactNode;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	showChevron?: boolean;
	testID?: string;
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
	testID,
	accessibilityLabel,
	accessibilityHint,
}) => {
	const { theme } = useTheme();
	const reduceMotionEnabled = useReducedMotion();
	const listItemMotion = theme.animation.profiles.listItemPress;

	const scale = useSharedValue(1);
	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const composedLabel = accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ');

	return (
		<Animated.View style={[animStyle, style]}>
			<Pressable
				testID={testID}
				onPress={onPress}
				onPressIn={() => {
					if (onPress && !reduceMotionEnabled) {
						// eslint-disable-next-line react-hooks/immutability
						scale.value = withSpring(
							listItemMotion.scalePressed,
							listItemMotion.spring,
						);
					}
				}}
				onPressOut={() => {
					if (onPress) {
						if (!reduceMotionEnabled) {
							// eslint-disable-next-line react-hooks/immutability
							scale.value = withSpring(1, listItemMotion.spring);
						} else {
							scale.value = 1;
						}
					}
				}}
				accessibilityRole={onPress ? 'button' : 'none'}
				accessibilityLabel={composedLabel}
				accessibilityHint={
					accessibilityHint ?? (onPress ? 'Double tap to open' : undefined)
				}
				style={({ pressed }) => [
					styles.container,
					{ borderBottomWidth: 1, borderBottomColor: theme.colors.separator },
					pressed &&
						!reduceMotionEnabled && {
							backgroundColor: theme.colors.surfaceVariant,
						},
				]}
			>
				<View style={styles.content}>
					{leftIcon && (
						<View style={styles.leftIcon} importantForAccessibility="no">
							{leftIcon}
						</View>
					)}
					<View style={styles.textContainer}>
						<ThemedText
							allowFontScaling
							weight="bold"
							style={[
								styles.title,
								{
									color: theme.colors.onSurface,
									fontSize: theme.typography.sizes.md,
								},
							]}
						>
							{title}
						</ThemedText>
						{!!subtitle && (
							<ThemedText
								allowFontScaling
								variant="caption"
								style={[
									styles.subtitle,
									{
										color: theme.colors.onSurfaceVariant,
										fontSize: theme.typography.sizes.sm,
									},
								]}
							>
								{subtitle}
							</ThemedText>
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
		marginEnd: SPACING_PX.lg,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		marginBottom: SPACING_PX.xxs,
	},
	subtitle: {},
	chevron: {
		marginStart: SPACING_PX.sm,
	},
});
