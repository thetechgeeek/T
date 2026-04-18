import React from 'react';
import {
	View,
	StyleSheet,
	type AccessibilityRole,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface CardSectionProps {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
}

export type CardDensity = 'compact' | 'default' | 'relaxed';

export interface CardProps {
	children?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	media?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	variant?: 'elevated' | 'outlined' | 'flat';
	orientation?: 'vertical' | 'horizontal';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	density?: CardDensity;
	featured?: boolean;
	accessible?: boolean;
	accessibilityLabel?: string;
	accessibilityRole?: AccessibilityRole;
	testID?: string;
}

export const Card: React.FC<CardProps> = ({
	children,
	header,
	footer,
	media,
	style,
	variant = 'elevated',
	orientation = 'vertical',
	padding = 'md',
	density = 'default',
	featured = false,
	accessible,
	accessibilityLabel,
	accessibilityRole,
	testID,
}) => {
	const { theme } = useTheme();
	const cardTokens = theme.components.card;
	const resolvedPadding =
		padding === 'none'
			? 'none'
			: density === 'compact'
				? 'sm'
				: density === 'relaxed'
					? 'lg'
					: padding;
	const sectionGap =
		density === 'compact'
			? theme.spacing.xs
			: density === 'relaxed'
				? theme.spacing.md
				: theme.spacing.sm;
	const mediaGap =
		density === 'compact'
			? theme.spacing.sm
			: density === 'relaxed'
				? theme.spacing.lg
				: theme.spacing.md;
	const horizontalGap =
		density === 'compact'
			? theme.spacing.sm
			: density === 'relaxed'
				? theme.spacing.lg
				: theme.spacing.md;

	const cardStyles = [
		styles.base,
		{
			backgroundColor: featured ? theme.visual.hero.promo.surface : theme.colors.card,
			borderRadius: cardTokens.radius,
			borderWidth: featured ? theme.borderWidth.sm : 0,
			borderColor: featured ? theme.visual.hero.promo.accent : 'transparent',
		},
		variant === 'elevated' && theme.elevation.raised,
		variant === 'outlined' && {
			borderWidth: theme.borderWidth.sm,
			borderColor: theme.colors.border,
		},
		variant === 'flat' && { backgroundColor: theme.colors.surfaceVariant },
		resolvedPadding === 'sm' && { padding: cardTokens.padding.sm },
		resolvedPadding === 'md' && { padding: cardTokens.padding.md },
		resolvedPadding === 'lg' && { padding: cardTokens.padding.lg },
		orientation === 'horizontal' && styles.horizontal,
		orientation === 'horizontal' && {
			gap: horizontalGap,
		},
		style,
	];

	return (
		<View
			testID={testID}
			style={cardStyles as StyleProp<ViewStyle>}
			accessible={accessible}
			accessibilityLabel={accessibilityLabel}
			accessibilityRole={accessibilityRole}
		>
			{media ? (
				<View
					style={[
						orientation === 'horizontal' ? styles.horizontalMedia : styles.media,
						orientation === 'vertical'
							? {
									marginBottom: mediaGap,
								}
							: null,
					]}
				>
					{media}
				</View>
			) : null}
			<View style={[styles.content, { gap: sectionGap }]}>
				{header ? <View style={styles.section}>{header}</View> : null}
				{children ? <View style={styles.section}>{children}</View> : null}
				{footer ? <View style={styles.section}>{footer}</View> : null}
			</View>
		</View>
	);
};

export function CardHeader({ children, style }: CardSectionProps) {
	const { theme } = useTheme();

	return (
		<View style={style}>
			{typeof children === 'string' ? (
				<ThemedText variant="bodyStrong" style={{ color: theme.colors.onSurface }}>
					{children}
				</ThemedText>
			) : (
				children
			)}
		</View>
	);
}

export function CardBody({ children, style }: CardSectionProps) {
	return <View style={style}>{children}</View>;
}

export function CardFooter({ children, style }: CardSectionProps) {
	return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
	base: {},
	horizontal: {
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	horizontalMedia: {
		width: 128,
		justifyContent: 'center',
	},
	media: {
		marginBottom: SPACING_PX.md,
	},
	content: {
		flex: 1,
	},
	section: {},
});
