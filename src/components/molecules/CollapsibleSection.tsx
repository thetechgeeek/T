import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Card } from '@/src/components/atoms/Card';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { animateNextLayout } from '@/src/utils/animateNextLayout';

export interface CollapsibleSectionProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	defaultExpanded?: boolean;
	collapsedLabel?: string;
	expandedLabel?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	contentTestID?: string;
}

export function CollapsibleSection({
	title,
	subtitle,
	children,
	defaultExpanded = false,
	collapsedLabel = 'Show details',
	expandedLabel = 'Hide details',
	style,
	testID,
	contentTestID,
}: CollapsibleSectionProps) {
	const { c, s } = useThemeTokens();
	const reduceMotionEnabled = useReducedMotion();
	const [expanded, setExpanded] = useState(defaultExpanded);

	const toggle = () => {
		animateNextLayout({ disabled: reduceMotionEnabled });
		setExpanded((current) => !current);
	};

	return (
		<Card
			variant="outlined"
			padding="none"
			style={[styles.card, { borderColor: c.border }, style]}
		>
			<Pressable
				testID={testID}
				onPress={toggle}
				accessibilityRole="button"
				accessibilityLabel={title}
				accessibilityHint={expanded ? expandedLabel : collapsedLabel}
				accessibilityState={{ expanded }}
				style={[styles.header, { paddingHorizontal: s.lg, paddingVertical: s.md }]}
			>
				<View style={styles.headerContent}>
					<ThemedText variant="label" weight="semibold" style={{ color: c.onSurface }}>
						{title}
					</ThemedText>
					{!!subtitle && (
						<ThemedText
							variant="metadata"
							style={{ color: c.onSurfaceVariant, marginTop: s.xxs }}
						>
							{subtitle}
						</ThemedText>
					)}
				</View>
				<View style={[styles.toggleMeta, { marginStart: s.md, gap: s.xs }]}>
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						{expanded ? expandedLabel : collapsedLabel}
					</ThemedText>
					<ChevronDown
						size={18}
						color={c.onSurfaceVariant}
						style={{
							transform: [{ rotate: expanded ? '180deg' : '0deg' }],
						}}
						importantForAccessibility="no"
					/>
				</View>
			</Pressable>

			{expanded ? (
				<View
					testID={contentTestID}
					style={[
						styles.content,
						{
							borderTopColor: c.separator,
							paddingHorizontal: s.lg,
							paddingTop: s.sm,
							paddingBottom: s.lg,
						},
					]}
				>
					{children}
				</View>
			) : null}
		</Card>
	);
}

const styles = StyleSheet.create({
	card: {
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerContent: {
		flex: 1,
	},
	toggleMeta: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	content: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
});
