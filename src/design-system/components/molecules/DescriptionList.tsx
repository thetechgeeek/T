import React, { forwardRef, useMemo, useState } from 'react';
import {
	Clipboard,
	Pressable,
	StyleSheet,
	View,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { Copy, Eye, EyeOff } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export type DescriptionListLayout = 'vertical' | 'horizontal';
export type DescriptionListDensity = 'compact' | 'default';

export interface DescriptionListItem {
	id: string;
	label: string;
	value: string;
	copyable?: boolean;
	sensitive?: boolean;
	maskedValue?: string;
}

export interface DescriptionListProps {
	items: DescriptionListItem[];
	layout?: DescriptionListLayout;
	density?: DescriptionListDensity;
	copyLabel?: string;
	revealLabel?: string;
	hideLabel?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const DEFAULT_COPY_LABEL = 'Copy value';
const DEFAULT_REVEAL_LABEL = 'Reveal value';
const DEFAULT_HIDE_LABEL = 'Hide value';
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- horizontal layouts reserve a smaller flex share for labels so values can breathe.
const HORIZONTAL_LABEL_FLEX = 0.8;

export const DescriptionList = forwardRef<React.ElementRef<typeof View>, DescriptionListProps>(
	(
		{
			items,
			layout = 'vertical',
			density = 'default',
			copyLabel = DEFAULT_COPY_LABEL,
			revealLabel = DEFAULT_REVEAL_LABEL,
			hideLabel = DEFAULT_HIDE_LABEL,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const [revealedIds, setRevealedIds] = useState<string[]>([]);
		const [focusedAction, setFocusedAction] = useState<string | null>(null);
		const rowGap = density === 'compact' ? theme.spacing.sm : theme.spacing.md;

		const revealedSet = useMemo(() => new Set(revealedIds), [revealedIds]);

		const toggleReveal = (item: DescriptionListItem) => {
			const isRevealed = revealedSet.has(item.id);
			setRevealedIds((current) =>
				isRevealed ? current.filter((id) => id !== item.id) : [...current, item.id],
			);
			void triggerDesignSystemHaptic('selection');
			void announceForScreenReader(
				isRevealed ? `${item.label} hidden` : `${item.label} revealed`,
			);
		};

		const copyValue = async (item: DescriptionListItem) => {
			Clipboard.setString(item.value);
			void triggerDesignSystemHaptic('selection');
			await announceForScreenReader(`${item.label} copied`);
		};

		return (
			<View ref={ref} testID={testID} style={[{ gap: rowGap }, style]}>
				{items.map((item) => {
					const isSensitive = item.sensitive ?? false;
					const isRevealed = revealedSet.has(item.id);
					const displayValue =
						isSensitive && !isRevealed ? (item.maskedValue ?? '••••••') : item.value;

					return (
						<View
							key={item.id}
							style={[
								styles.row,
								{
									flexDirection: layout === 'horizontal' ? 'row' : 'column',
									alignItems: layout === 'horizontal' ? 'center' : 'stretch',
									gap: theme.spacing.sm,
									paddingBottom: rowGap,
									borderBottomWidth: theme.borderWidth.sm,
									borderBottomColor: theme.colors.separator,
								},
							]}
						>
							<View
								style={{
									flex:
										layout === 'horizontal' ? HORIZONTAL_LABEL_FLEX : undefined,
								}}
							>
								<ThemedText
									variant="label"
									style={{ color: theme.colors.onSurfaceVariant }}
								>
									{item.label}
								</ThemedText>
							</View>
							<View style={[styles.valueGroup, { flex: 1 }]}>
								<ThemedText
									variant="body"
									style={{ color: theme.colors.onSurface }}
								>
									{displayValue}
								</ThemedText>
								<View style={styles.actions}>
									{item.copyable ? (
										<Pressable
											testID={`${item.id}-copy`}
											onPress={() => void copyValue(item)}
											onFocus={() => setFocusedAction(`${item.id}-copy`)}
											onBlur={() => setFocusedAction(null)}
											accessibilityRole="button"
											accessibilityLabel={`${copyLabel}: ${item.label}`}
											style={[
												styles.iconAction,
												{
													borderColor: theme.colors.border,
													backgroundColor: theme.colors.surfaceVariant,
												},
												focusedAction === `${item.id}-copy`
													? buildFocusRingStyle({
															color: theme.colors.primary,
															radius: theme.borderRadius.sm,
														})
													: null,
											]}
										>
											<LucideIconGlyph
												icon={Copy}
												size={16}
												color={theme.colors.onSurfaceVariant}
											/>
										</Pressable>
									) : null}
									{isSensitive ? (
										<Pressable
											testID={`${item.id}-reveal`}
											onPress={() => toggleReveal(item)}
											onFocus={() => setFocusedAction(`${item.id}-reveal`)}
											onBlur={() => setFocusedAction(null)}
											accessibilityRole="button"
											accessibilityLabel={`${
												isRevealed ? hideLabel : revealLabel
											}: ${item.label}`}
											style={[
												styles.iconAction,
												{
													borderColor: theme.colors.border,
													backgroundColor: theme.colors.surfaceVariant,
												},
												focusedAction === `${item.id}-reveal`
													? buildFocusRingStyle({
															color: theme.colors.primary,
															radius: theme.borderRadius.sm,
														})
													: null,
											]}
										>
											<LucideIconGlyph
												icon={isRevealed ? EyeOff : Eye}
												size={16}
												color={theme.colors.onSurfaceVariant}
											/>
										</Pressable>
									) : null}
								</View>
							</View>
						</View>
					);
				})}
			</View>
		);
	},
);

DescriptionList.displayName = 'DescriptionList';

const styles = StyleSheet.create({
	row: {},
	valueGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: SPACING_PX.sm,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.sm,
	},
	iconAction: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
});
