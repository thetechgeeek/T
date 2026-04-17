import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Card } from '@/src/components/atoms/Card';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	isAccessibilityAction,
	mapAccessibilityActionNames,
} from '@/src/utils/accessibility';
import { animateNextLayout } from '@/src/utils/animateNextLayout';

export interface CollapsibleSectionProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	expanded?: boolean;
	defaultExpanded?: boolean;
	onExpandedChange?: (expanded: boolean, meta?: { source: 'toggle' }) => void;
	collapsedLabel?: string;
	expandedLabel?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	contentTestID?: string;
}

export const CollapsibleSection = forwardRef<
	React.ElementRef<typeof Pressable>,
	CollapsibleSectionProps
>(
	(
		{
			title,
			subtitle,
			children,
			expanded,
			defaultExpanded = false,
			onExpandedChange,
			collapsedLabel = 'Show details',
			expandedLabel = 'Hide details',
			style,
			testID,
			contentTestID,
		},
		ref,
	) => {
		const { c, s } = useThemeTokens();
		const reduceMotionEnabled = useReducedMotion();
		const [isFocused, setIsFocused] = useState(false);
		const [isExpanded, setIsExpanded] = useControllableState({
			value: expanded,
			defaultValue: defaultExpanded,
			onChange: (nextExpanded) => onExpandedChange?.(nextExpanded, { source: 'toggle' }),
		});

		const toggle = () => {
			animateNextLayout({ disabled: reduceMotionEnabled });
			setIsExpanded(
				(current) => {
					const nextExpanded = !current;
					void announceForScreenReader(nextExpanded ? expandedLabel : collapsedLabel);
					return nextExpanded;
				},
				{ source: 'toggle' },
			);
		};

		return (
			<Card
				variant="outlined"
				padding="none"
				style={[styles.card, { borderColor: c.border }, style]}
			>
				<Pressable
					ref={ref}
					testID={testID}
					onPress={toggle}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					accessibilityRole="button"
					accessibilityLabel={title}
					accessibilityHint={isExpanded ? expandedLabel : collapsedLabel}
					accessibilityState={{ expanded: isExpanded }}
					accessibilityActions={mapAccessibilityActionNames([
						{ name: 'expand', label: 'Expand section' },
						{ name: 'collapse', label: 'Collapse section' },
					])}
					onAccessibilityAction={(event) => {
						if (isAccessibilityAction(event, 'expand') && !isExpanded) {
							toggle();
							return;
						}
						if (isAccessibilityAction(event, 'collapse') && isExpanded) {
							toggle();
						}
					}}
					style={[
						styles.header,
						{ paddingHorizontal: s.lg, paddingVertical: s.md },
						isFocused
							? buildFocusRingStyle({
									color: c.primary,
									radius: s.md,
								})
							: null,
					]}
				>
					<View style={styles.headerContent}>
						<ThemedText
							variant="label"
							weight="semibold"
							style={{ color: c.onSurface }}
						>
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
							{isExpanded ? expandedLabel : collapsedLabel}
						</ThemedText>
						<ChevronDown
							size={18}
							color={c.onSurfaceVariant}
							style={{
								transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
							}}
							importantForAccessibility="no"
						/>
					</View>
				</Pressable>

				{isExpanded ? (
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
	},
);

CollapsibleSection.displayName = 'CollapsibleSection';

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
