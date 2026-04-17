import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Download } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Card } from '@/src/design-system/components/atoms/Card';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_BADGE_BG } from '@/src/theme/uiMetrics';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import type { InventoryItem, TileCategory } from '@/src/types/inventory';

type CategoryFilter = 'ALL' | TileCategory;
type StockLevelFilter = 'all' | 'low' | 'out';

const CATEGORY_CHIPS: { label: string; value: CategoryFilter }[] = [
	{ label: 'All', value: 'ALL' },
	{ label: 'Glossy', value: 'GLOSSY' },
	{ label: 'Floor', value: 'FLOOR' },
	{ label: 'Matt', value: 'MATT' },
	{ label: 'Satin', value: 'SATIN' },
	{ label: 'Wooden', value: 'WOODEN' },
	{ label: 'Elevation', value: 'ELEVATION' },
	{ label: 'Other', value: 'OTHER' },
];

const STOCK_LEVEL_CHIPS: { label: string; value: StockLevelFilter }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Low Stock', value: 'low' },
	{ label: 'Out of Stock', value: 'out' },
];

export default function StockSummaryScreen() {
	const { theme, c, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const { items, loading, fetchItems } = useInventoryStore(
		useShallow((state) => ({
			items: state.items,
			loading: state.loading,
			fetchItems: state.fetchItems,
		})),
	);

	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
	const [stockLevelFilter, setStockLevelFilter] = useState<StockLevelFilter>('all');

	useEffect(() => {
		fetchItems(true);
	}, [fetchItems]);

	const filtered = useMemo(() => {
		return items.filter((item) => {
			const catMatch = categoryFilter === 'ALL' || item.category === categoryFilter;
			const isOut = item.box_count === 0;
			const isLow = !isOut && item.box_count <= item.low_stock_threshold;
			const levelMatch =
				stockLevelFilter === 'all' ||
				(stockLevelFilter === 'out' && isOut) ||
				(stockLevelFilter === 'low' && isLow);
			return catMatch && levelMatch;
		});
	}, [items, categoryFilter, stockLevelFilter]);

	const totalValue = useMemo(
		() => filtered.reduce((sum, i) => sum + i.box_count * i.cost_price, 0),
		[filtered],
	);
	const outOfStockCount = useMemo(
		() => filtered.filter((i) => i.box_count === 0).length,
		[filtered],
	);

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const renderItem = ({ item }: { item: InventoryItem }) => {
		const isOut = item.box_count === 0;
		const isLow = !isOut && item.box_count <= item.low_stock_threshold;
		const stockValue = item.box_count * item.cost_price;

		return (
			<View
				style={[
					styles.row,
					{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
				]}
			>
				<View style={{ flex: 1, gap: SPACING_PX.xs }}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: SPACING_PX.sm - SPACING_PX.xxs,
							flexWrap: 'wrap',
						}}
					>
						<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.sm }}>
							{item.design_name}
						</ThemedText>
						<View
							style={[
								styles.catChip,
								{
									backgroundColor: c.primaryLight ?? c.surface,
									borderRadius: r.sm,
								},
							]}
						>
							<ThemedText
								variant="caption"
								color={c.primary}
								style={{ fontSize: FONT_SIZE.captionSmall }}
							>
								{item.category}
							</ThemedText>
						</View>
					</View>
					{item.brand_name ? (
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{item.brand_name}
							{item.size_name ? ` · ${item.size_name}` : ''}
						</ThemedText>
					) : null}
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Value: {formatCurrency(stockValue)}
					</ThemedText>
				</View>

				<View style={{ alignItems: 'flex-end', gap: SPACING_PX.xs }}>
					{isOut ? (
						<View
							style={[
								styles.badge,
								{
									backgroundColor: c.surfaceVariant ?? c.surface,
									borderRadius: r.sm,
								},
							]}
						>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ fontSize: FONT_SIZE.captionSmall }}
							>
								Out of Stock
							</ThemedText>
						</View>
					) : (
						<ThemedText
							weight="bold"
							color={isLow ? c.error : c.onSurface}
							style={{ fontSize: theme.typography.sizes.md }}
						>
							{item.box_count} boxes
						</ThemedText>
					)}
					{isLow && !isOut ? (
						<ThemedText
							variant="caption"
							color={c.error}
							style={{ fontSize: FONT_SIZE.captionSmall }}
						>
							Low (threshold: {item.low_stock_threshold})
						</ThemedText>
					) : null}
				</View>
			</View>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader
				title="Stock Summary"
				showBackButton
				rightElement={
					<Pressable
						onPress={() => Alert.alert('Export', 'Export feature coming soon.')}
						style={styles.exportBtn}
						accessibilityRole="button"
						accessibilityLabel="Export stock summary"
					>
						<Download size={20} color={c.primary} strokeWidth={2} />
					</Pressable>
				}
			/>

			{/* Category filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.filterRow}
			>
				{CATEGORY_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setCategoryFilter(chip.value)}
						style={chipStyle(categoryFilter === chip.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: categoryFilter === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={categoryFilter === chip.value ? c.onPrimary : c.primary}
							style={{ fontWeight: categoryFilter === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			{/* Stock level filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[styles.filterRow, { paddingTop: 0 }]}
			>
				{STOCK_LEVEL_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setStockLevelFilter(chip.value)}
						style={[
							styles.chip,
							{
								backgroundColor:
									stockLevelFilter === chip.value ? c.warning : c.surface,
								borderColor: c.warning,
								borderRadius: r.full,
							},
						]}
						accessibilityRole="button"
						accessibilityState={{ selected: stockLevelFilter === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={stockLevelFilter === chip.value ? c.onPrimary : c.warning}
							style={{ fontWeight: stockLevelFilter === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			<FlatList
				data={loading ? [] : filtered}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<>
						{/* Summary card */}
						<Card padding="md" style={{ marginBottom: SPACING_PX.lg }}>
							<View style={styles.summaryRow}>
								<View style={{ flex: 1 }}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Total Stock Value
									</ThemedText>
									<ThemedText variant="h2">
										{formatCurrency(totalValue)}
									</ThemedText>
								</View>
								<View style={{ alignItems: 'center', flex: 1 }}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Total Items
									</ThemedText>
									<ThemedText variant="h2">{String(filtered.length)}</ThemedText>
								</View>
								<View style={{ alignItems: 'flex-end' }}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Out of Stock
									</ThemedText>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											gap: SPACING_PX.xs,
										}}
									>
										<ThemedText variant="h2" color={c.error}>
											{String(outOfStockCount)}
										</ThemedText>
										{outOfStockCount > 0 ? (
											<View
												style={[
													styles.badge,
													{
														backgroundColor:
															c.errorLight ??
															withOpacity(c.error, OPACITY_BADGE_BG),
														borderRadius: r.sm,
													},
												]}
											>
												<ThemedText
													variant="caption"
													color={c.error}
													style={{ fontSize: FONT_SIZE.captionSmall }}
												>
													ALERT
												</ThemedText>
											</View>
										) : null}
									</View>
								</View>
							</View>
						</Card>

						{/* Table header */}
						<View
							style={[
								styles.tableHeader,
								{
									borderBottomColor: c.border,
									borderBottomWidth: StyleSheet.hairlineWidth,
								},
							]}
						>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ flex: 1 }}
							>
								Item / Category
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Stock
							</ThemedText>
						</View>

						{loading ? (
							<View style={{ gap: SPACING_PX.md, marginTop: SPACING_PX.sm }}>
								<SkeletonBlock height={64} borderRadius={8} />
								<SkeletonBlock height={64} borderRadius={8} />
								<SkeletonBlock height={64} borderRadius={8} />
							</View>
						) : null}
					</>
				}
				renderItem={renderItem}
				ListEmptyComponent={
					!loading ? (
						<View style={styles.emptyState}>
							<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
								No items match the selected filters
							</ThemedText>
						</View>
					) : null
				}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterRow: {
		flexDirection: 'row',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		gap: SPACING_PX.sm,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	catChip: {
		paddingHorizontal: SPACING_PX.sm - SPACING_PX.xxs,
		paddingVertical: SPACING_PX.xxs,
	},
	badge: {
		paddingHorizontal: SPACING_PX.sm - SPACING_PX.xxs,
		paddingVertical: SPACING_PX.xxs,
	},
	exportBtn: {
		padding: SPACING_PX.sm - SPACING_PX.xxs,
	},
	listContent: {
		padding: SPACING_PX.lg,
		paddingBottom: SPACING_PX['2xl'],
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.sm,
		marginBottom: SPACING_PX.xs,
	},
	row: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.md,
		alignItems: 'center',
	},
	emptyState: {
		paddingVertical: SPACING_PX['2xl'],
	},
});
