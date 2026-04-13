import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { Download, ArrowUpDown } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { REPORT_NUM_COLUMN_MIN_WIDTH_PX } from '@/constants/reportLayout';
import { MOCK_ITEM_PROFIT_ROWS, type ItemProfitRow } from '@/src/mocks/reports/itemProfit';

// TODO: Replace with real data from Supabase (sales + purchase cost joined on item_id)
type Period = 'month' | 'quarter' | 'year' | 'fy';
type SortKey = 'profit' | 'revenue' | 'qty';

const PERIOD_CHIPS: { label: string; value: Period }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'Quarter', value: 'quarter' },
	{ label: 'Year', value: 'year' },
	{ label: 'FY', value: 'fy' },
];

const SORT_CHIPS: { label: string; value: SortKey }[] = [
	{ label: 'Profit', value: 'profit' },
	{ label: 'Revenue', value: 'revenue' },
	{ label: 'Qty', value: 'qty' },
];

export default function ItemProfitScreen() {
	const { c, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [period, setPeriod] = useState<Period>('month');
	const [sortKey, setSortKey] = useState<SortKey>('profit');

	const sortedItems = useMemo<ItemProfitRow[]>(() => {
		// TODO: filter MOCK_ITEM_PROFIT_ROWS by period when real date-range data is available
		return [...MOCK_ITEM_PROFIT_ROWS].sort(
			(a, b) =>
				b[sortKey === 'qty' ? 'qtySold' : sortKey] -
				a[sortKey === 'qty' ? 'qtySold' : sortKey],
		);
	}, [sortKey]);

	const totals = useMemo(() => {
		const revenue = sortedItems.reduce((sum, i) => sum + i.revenue, 0);
		const cost = sortedItems.reduce((sum, i) => sum + i.cost, 0);
		const profit = sortedItems.reduce((sum, i) => sum + i.profit, 0);
		const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
		return { revenue, cost, profit, margin };
	}, [sortedItems]);

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const renderItem = ({ item }: { item: ItemProfitRow }) => (
		<View
			style={[
				styles.row,
				{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
			]}
		>
			<View style={{ flex: 1, gap: 2 }}>
				<ThemedText
					weight="bold"
					numberOfLines={1}
					style={{ fontSize: theme.typography.sizes.sm }}
				>
					{item.name}
				</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{item.category} · {item.qtySold} boxes
				</ThemedText>
			</View>
			<View style={{ alignItems: 'flex-end', gap: 2 }}>
				<ThemedText variant="caption" style={styles.numCol}>
					{formatCurrency(item.revenue)}
				</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.numCol}>
					Cost {formatCurrency(item.cost)}
				</ThemedText>
				<ThemedText
					variant="caption"
					weight="bold"
					color={item.profit >= 0 ? c.success : c.error}
					style={styles.numCol}
				>
					{formatCurrency(item.profit)} ({item.margin}%)
				</ThemedText>
			</View>
		</View>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader
				title="Item-wise P&L"
				showBackButton
				rightElement={
					<Pressable
						onPress={() => Alert.alert('Export', 'Export feature coming soon.')}
						style={styles.exportBtn}
						accessibilityRole="button"
						accessibilityLabel="Export item profit report"
					>
						<Download size={20} color={c.primary} strokeWidth={2} />
					</Pressable>
				}
			/>

			{/* Period filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.filterRow}
			>
				{PERIOD_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setPeriod(chip.value)}
						style={chipStyle(period === chip.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: period === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={period === chip.value ? c.onPrimary : c.primary}
							style={{ fontWeight: period === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			{/* Sort chips */}
			<View style={[styles.filterRow, { paddingTop: 0, alignItems: 'center' }]}>
				<ArrowUpDown size={14} color={c.onSurfaceVariant} strokeWidth={2} />
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginRight: 4 }}>
					Sort:
				</ThemedText>
				{SORT_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setSortKey(chip.value)}
						style={[
							styles.chip,
							{
								backgroundColor:
									sortKey === chip.value ? (c.secondary ?? c.primary) : c.surface,
								borderColor: c.secondary ?? c.primary,
								borderRadius: r.full,
							},
						]}
						accessibilityRole="button"
						accessibilityState={{ selected: sortKey === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={
								sortKey === chip.value ? c.onPrimary : (c.secondary ?? c.primary)
							}
							style={{ fontWeight: sortKey === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</View>

			<FlatList
				data={sortedItems}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<>
						{/* Summary card */}
						<Card padding="md" style={{ marginBottom: 16 }}>
							<View style={styles.summaryGrid}>
								<View style={styles.summaryCell}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Revenue
									</ThemedText>
									<ThemedText variant="h3" weight="bold">
										{formatCurrency(totals.revenue)}
									</ThemedText>
								</View>
								<View style={styles.summaryCell}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Cost
									</ThemedText>
									<ThemedText variant="h3" weight="bold">
										{formatCurrency(totals.cost)}
									</ThemedText>
								</View>
								<View style={styles.summaryCell}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Gross Profit
									</ThemedText>
									<ThemedText variant="h3" weight="bold" color={c.success}>
										{formatCurrency(totals.profit)}
									</ThemedText>
								</View>
								<View style={styles.summaryCell}>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Margin
									</ThemedText>
									<ThemedText variant="h3" weight="bold" color={c.success}>
										{totals.margin}%
									</ThemedText>
								</View>
							</View>
						</Card>

						{/* Table column headers */}
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
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.numCol}
							>
								Revenue / Profit
							</ThemedText>
						</View>
					</>
				}
				renderItem={renderItem}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
							No items found
						</ThemedText>
					</View>
				}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 8,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	exportBtn: {
		padding: 6,
	},
	listContent: {
		padding: 16,
		paddingBottom: 32,
	},
	summaryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	summaryCell: {
		width: '45%',
		gap: 2,
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: 8,
		marginBottom: 4,
	},
	row: {
		flexDirection: 'row',
		paddingVertical: 12,
		alignItems: 'flex-start',
	},
	numCol: {
		textAlign: 'right',
		minWidth: REPORT_NUM_COLUMN_MIN_WIDTH_PX,
	},
	emptyState: {
		paddingVertical: 32,
	},
});
