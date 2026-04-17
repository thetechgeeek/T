import React, { forwardRef, useState } from 'react';
import { Pressable, View, StyleSheet, ViewStyle, type StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { ThemedText } from '../atoms/ThemedText';

interface ListItemProps {
	title: string;
	subtitle?: string;
	leftIcon?: React.ReactNode;
	rightElement?: React.ReactNode;
	onPress?: () => void;
	density?: 'compact' | 'default' | 'relaxed';
	style?: StyleProp<ViewStyle>;
	showChevron?: boolean;
	testID?: string;
	/** Stable English identifier. Defaults to combining title + subtitle. */
	accessibilityLabel?: string;
	accessibilityHint?: string;
}

export const ListItem = forwardRef<React.ElementRef<typeof Pressable>, ListItemProps>(
	(
		{
			title,
			subtitle,
			leftIcon,
			rightElement,
			onPress,
			density = 'default',
			style,
			showChevron = true,
			testID,
			accessibilityLabel,
			accessibilityHint,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const reduceMotionEnabled = useReducedMotion();
		const listItemMotion = theme.animation.profiles.listItemPress;
		const [isFocused, setIsFocused] = useState(false);

		const scale = useSharedValue(1);
		const animStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}));
		const rowPaddingVertical =
			density === 'compact'
				? theme.spacing.sm
				: density === 'relaxed'
					? theme.spacing.lg
					: theme.spacing.md;
		const rowPaddingHorizontal = density === 'compact' ? theme.spacing.md : theme.spacing.lg;

		const composedLabel = accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ');

		return (
			<Animated.View style={[animStyle, style]}>
				<Pressable
					ref={ref}
					testID={testID}
					onPress={onPress}
					focusable={Boolean(onPress)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
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
						{
							borderBottomWidth: 1,
							borderBottomColor: theme.colors.separator,
							paddingVertical: rowPaddingVertical,
							paddingHorizontal: rowPaddingHorizontal,
						},
						pressed &&
							!reduceMotionEnabled && {
								backgroundColor: theme.colors.surfaceVariant,
							},
						isFocused && onPress
							? buildFocusRingStyle({
									color: theme.colors.primary,
									radius: theme.borderRadius.md,
								})
							: null,
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
							<LucideIconGlyph
								icon={ChevronRight}
								size={20}
								color={theme.colors.onSurfaceVariant}
								style={styles.chevron}
							/>
						)}
					</View>
				</Pressable>
			</Animated.View>
		);
	},
);

ListItem.displayName = 'ListItem';

const styles = StyleSheet.create({
	container: {},
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
