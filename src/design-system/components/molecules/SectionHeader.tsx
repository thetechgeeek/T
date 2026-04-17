import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { layout } from '@/src/theme/layout';
import { LETTER_SPACING_SECTION } from '@/theme/uiMetrics';

export type SectionHeaderVariant = 'default' | 'uppercase';

export interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	titleColor?: string;
	/**
	 * Pass a fully custom action node (Button/Pressable/etc).
	 * If omitted, you can use `actionLabel` + `onActionPress`.
	 */
	action?: React.ReactNode;
	actionLabel?: string;
	onActionPress?: () => void;
	variant?: SectionHeaderVariant;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

export function SectionHeader({
	title,
	subtitle,
	titleColor,
	action,
	actionLabel,
	onActionPress,
	variant = 'default',
	style,
	testID,
}: SectionHeaderProps) {
	const { c, s } = useThemeTokens();
	const isUppercase = variant === 'uppercase';

	return (
		<View
			testID={testID}
			style={[styles.container, { paddingHorizontal: s.lg, paddingVertical: s.md }, style]}
		>
			<View style={[layout.rowBetween, styles.topRow]}>
				<View style={styles.titleCol}>
					<ThemedText
						variant="label"
						weight="semibold"
						color={titleColor}
						style={
							isUppercase
								? {
										textTransform: 'uppercase',
										letterSpacing: LETTER_SPACING_SECTION,
									}
								: undefined
						}
					>
						{title}
					</ThemedText>
					{subtitle ? (
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{subtitle}
						</ThemedText>
					) : null}
				</View>

				{action ??
					(actionLabel && onActionPress ? (
						<Pressable
							onPress={onActionPress}
							accessibilityRole="button"
							accessibilityLabel={actionLabel}
						>
							<ThemedText variant="caption" weight="semibold" color={c.primary}>
								{actionLabel}
							</ThemedText>
						</Pressable>
					) : null)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {},
	topRow: { alignItems: 'center' },
	titleCol: { flex: 1 },
});
