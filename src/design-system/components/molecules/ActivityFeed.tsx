import React, { forwardRef, useMemo, useState } from 'react';
import {
	Pressable,
	SectionList,
	StyleSheet,
	View,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { ArrowDownToLine, BellPlus, Clock3 } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card, type CardDensity } from '@/src/design-system/components/atoms/Card';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { announceForScreenReader } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface ActivityFeedItem {
	id: string;
	title: string;
	description?: string;
	timeLabel: string;
	dateLabel: string;
	statusLabel?: string;
}

export interface ActivityFeedProps {
	items?: ActivityFeedItem[];
	defaultItems?: ActivityFeedItem[];
	pendingItems?: ActivityFeedItem[];
	onItemsChange?: (items: ActivityFeedItem[]) => void;
	onLoadMore?: () => void;
	loadMoreLabel?: string;
	newItemsLabel?: string;
	density?: CardDensity;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const DEFAULT_LOAD_MORE_LABEL = 'Load more activity';
const DEFAULT_NEW_ITEMS_LABEL = 'Show new updates';

export const ActivityFeed = forwardRef<React.ElementRef<typeof View>, ActivityFeedProps>(
	(
		{
			items,
			defaultItems = [],
			pendingItems = [],
			onItemsChange,
			onLoadMore,
			loadMoreLabel = DEFAULT_LOAD_MORE_LABEL,
			newItemsLabel = DEFAULT_NEW_ITEMS_LABEL,
			density = 'default',
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const [uncontrolledItems, setUncontrolledItems] = useState(defaultItems);
		const resolvedItems = items ?? uncontrolledItems;
		const stackGap =
			density === 'compact'
				? theme.spacing.sm
				: density === 'relaxed'
					? theme.spacing.lg
					: theme.spacing.md;
		const sectionPaddingHorizontal =
			density === 'compact' ? theme.spacing.xs : theme.spacing.sm;
		const sectionPaddingVertical = density === 'compact' ? theme.spacing.xxs : theme.spacing.xs;
		const rowSpacing =
			density === 'compact'
				? theme.spacing.xs
				: density === 'relaxed'
					? theme.spacing.sm
					: theme.spacing.xs;
		const pendingPadding =
			density === 'compact'
				? theme.spacing.xs
				: density === 'relaxed'
					? theme.spacing.md
					: theme.spacing.sm;

		const sections = useMemo(() => {
			const grouped = new Map<string, ActivityFeedItem[]>();
			for (const item of resolvedItems) {
				grouped.set(item.dateLabel, [...(grouped.get(item.dateLabel) ?? []), item]);
			}

			return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
		}, [resolvedItems]);

		const setItems = (nextItems: ActivityFeedItem[]) => {
			if (items === undefined) {
				setUncontrolledItems(nextItems);
			}
			onItemsChange?.(nextItems);
		};

		const injectPendingItems = () => {
			if (pendingItems.length === 0) {
				return;
			}

			setItems([...pendingItems, ...resolvedItems]);
			void triggerDesignSystemHaptic('selection');
			void announceForScreenReader(`${pendingItems.length} new activity items added`);
		};

		return (
			<View ref={ref} testID={testID} style={[{ gap: stackGap }, style]}>
				{pendingItems.length > 0 ? (
					<Pressable
						testID="activity-feed-inject"
						onPress={injectPendingItems}
						accessibilityRole="button"
						accessibilityLabel={`${newItemsLabel}: ${pendingItems.length}`}
						style={[
							styles.pendingButton,
							{
								backgroundColor: theme.colors.infoLight,
								borderRadius: theme.borderRadius.md,
								padding: pendingPadding,
							},
						]}
					>
						<LucideIconGlyph icon={BellPlus} size={16} color={theme.colors.info} />
						<ThemedText
							variant="captionBold"
							style={{ color: theme.colors.info, flex: 1 }}
						>
							{`${newItemsLabel} (${pendingItems.length})`}
						</ThemedText>
					</Pressable>
				) : null}

				<SectionList
					sections={sections}
					testID="activity-feed-list"
					keyExtractor={(item) => item.id}
					onEndReached={onLoadMore}
					onEndReachedThreshold={0.4}
					renderSectionHeader={({ section }) => (
						<View
							style={[
								styles.sectionHeader,
								{
									backgroundColor: theme.colors.surfaceVariant,
									borderRadius: theme.borderRadius.full,
									paddingHorizontal: sectionPaddingHorizontal,
									paddingVertical: sectionPaddingVertical,
								},
							]}
						>
							<ThemedText
								variant="captionBold"
								style={{ color: theme.colors.onSurfaceVariant }}
							>
								{section.title}
							</ThemedText>
						</View>
					)}
					renderItem={({ item, index }) => (
						<View style={{ marginTop: index === 0 ? stackGap : rowSpacing }}>
							<Card
								variant="outlined"
								density={density}
								testID={testID ? `${testID}-item-${item.id}` : undefined}
							>
								<View style={styles.rowHeader}>
									<View style={{ flex: 1, gap: theme.spacing.xxs }}>
										<ThemedText
											variant="bodyStrong"
											style={{ color: theme.colors.onSurface }}
										>
											{item.title}
										</ThemedText>
										{item.description ? (
											<ThemedText
												variant="caption"
												style={{ color: theme.colors.onSurfaceVariant }}
											>
												{item.description}
											</ThemedText>
										) : null}
									</View>
									{item.statusLabel ? (
										<Badge label={item.statusLabel} size="sm" />
									) : null}
								</View>
								<View style={styles.metaRow}>
									<LucideIconGlyph
										icon={Clock3}
										size={14}
										color={theme.colors.onSurfaceVariant}
									/>
									<ThemedText
										variant="caption"
										style={{ color: theme.colors.onSurfaceVariant }}
									>
										{item.timeLabel}
									</ThemedText>
								</View>
							</Card>
						</View>
					)}
					ListFooterComponent={
						onLoadMore ? (
							<Button
								title={loadMoreLabel}
								variant="ghost"
								size={density === 'compact' ? 'sm' : 'md'}
								leftIcon={
									<LucideIconGlyph
										icon={ArrowDownToLine}
										size={16}
										color={theme.colors.primary}
									/>
								}
								onPress={onLoadMore}
							/>
						) : null
					}
				/>
			</View>
		);
	},
);

ActivityFeed.displayName = 'ActivityFeed';

const styles = StyleSheet.create({
	pendingButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.sm,
	},
	sectionHeader: {
		alignSelf: 'flex-start',
	},
	rowHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: SPACING_PX.sm,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.xs,
		marginTop: SPACING_PX.sm,
	},
});
