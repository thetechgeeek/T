import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';

type ModeType = 'customers' | 'suppliers';
type DateRange = 'month' | 'quarter' | 'fy';

const MODE_TABS: { label: string; value: ModeType }[] = [
	{ label: 'Customers', value: 'customers' },
	{ label: 'Suppliers', value: 'suppliers' },
];

const DATE_RANGES: { label: string; value: DateRange }[] = [
	{ label: 'This Month', value: 'month' },
	{ label: 'This Quarter', value: 'quarter' },
	{ label: 'Full FY', value: 'fy' },
];

// Deterministic "random" number seeded by string hash so values don't
// flicker on re-render.
function seededRandom(seed: string): number {
	let h = 0;
	for (let i = 0; i < seed.length; i++) {
		h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
	}
	return Math.abs(h % 90001) + 10000; // 10_000 – 100_000
}

interface PartyRow {
	id: string;
	name: string;
	sale: number;
	cogs: number;
	profit: number;
	profitPct: number;
}

export default function PartyProfitScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [mode, setMode] = useState<ModeType>('customers');
	const [dateRange, setDateRange] = useState<DateRange>('month');

	const { customers, fetchCustomers } = useCustomerStore(
		useShallow((state) => ({
			customers: state.customers,
			fetchCustomers: state.fetchCustomers,
		})),
	);

	useEffect(() => {
		fetchCustomers(true);
	}, [fetchCustomers]);

	const rows = useMemo<PartyRow[]>(() => {
		if (mode === 'suppliers') return [];
		return customers.map((cust) => {
			const sale = seededRandom(cust.id + dateRange);
			const cogs = Math.round(sale * 0.6);
			const profit = sale - cogs;
			const profitPct = Math.round((profit / sale) * 100);
			return {
				id: cust.id,
				name: cust.name,
				sale,
				cogs,
				profit,
				profitPct,
			};
		});
	}, [customers, mode, dateRange]);

	const totals = useMemo(
		() =>
			rows.reduce(
				(acc, r) => ({
					sale: acc.sale + r.sale,
					cogs: acc.cogs + r.cogs,
					profit: acc.profit + r.profit,
				}),
				{ sale: 0, cogs: 0, profit: 0 },
			),
		[rows],
	);

	const avgMargin =
		rows.length > 0
			? Math.round(rows.reduce((sum, r) => sum + r.profitPct, 0) / rows.length)
			: 0;

	const topCustomer =
		rows.length > 0
			? rows.reduce((best, r) => (r.profit > best.profit ? r : best), rows[0])
			: null;

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const renderHeader = () => (
		<View
			style={[
				styles.tableHeader,
				{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
			]}
		>
			<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ flex: 2 }}>
				Customer
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.numCol}>
				Sale
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.numCol}>
				COGS
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.numCol}>
				Profit
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.pctCol}>
				%
			</ThemedText>
		</View>
	);

	const renderItem = ({ item }: { item: PartyRow }) => {
		const isNegative = item.profitPct < 0;
		return (
			<View
				style={[
					styles.tableRow,
					{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						backgroundColor: isNegative ? withOpacity(c.error, 0.06) : 'transparent',
					},
				]}
			>
				<ThemedText weight="bold" style={{ flex: 2 }} numberOfLines={1}>
					{item.name}
				</ThemedText>
				<ThemedText variant="caption" style={styles.numCol}>
					{formatCurrency(item.sale)}
				</ThemedText>
				<ThemedText variant="caption" style={styles.numCol}>
					{formatCurrency(item.cogs)}
				</ThemedText>
				<ThemedText
					variant="caption"
					color={isNegative ? c.error : c.success}
					style={styles.numCol}
				>
					{formatCurrency(item.profit)}
				</ThemedText>
				<ThemedText
					variant="caption"
					color={isNegative ? c.error : c.success}
					style={styles.pctCol}
				>
					{item.profitPct}%
				</ThemedText>
			</View>
		);
	};

	const renderTotalRow = () => (
		<View
			style={[
				styles.tableRow,
				{
					backgroundColor: withOpacity(c.primary, 0.06),
					borderTopColor: c.border,
					borderTopWidth: 1,
				},
			]}
		>
			<ThemedText weight="bold" style={{ flex: 2 }}>
				Total
			</ThemedText>
			<ThemedText weight="bold" style={styles.numCol}>
				{formatCurrency(totals.sale)}
			</ThemedText>
			<ThemedText weight="bold" style={styles.numCol}>
				{formatCurrency(totals.cogs)}
			</ThemedText>
			<ThemedText weight="bold" color={c.success} style={styles.numCol}>
				{formatCurrency(totals.profit)}
			</ThemedText>
			<ThemedText weight="bold" color={c.success} style={styles.pctCol}>
				{totals.sale > 0 ? Math.round((totals.profit / totals.sale) * 100) : 0}%
			</ThemedText>
		</View>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Party-wise P&L" showBackButton />

			{/* Mode toggle */}
			<View
				style={[
					styles.modeToggle,
					{
						backgroundColor: c.surface,
						borderRadius: r.md,
						marginHorizontal: s.md,
						marginTop: 8,
					},
				]}
			>
				{MODE_TABS.map((tab) => (
					<Pressable
						key={tab.value}
						onPress={() => setMode(tab.value)}
						style={[
							styles.modeTab,
							{
								backgroundColor: mode === tab.value ? c.primary : 'transparent',
								borderRadius: r.sm,
							},
						]}
						accessibilityRole="tab"
						accessibilityState={{ selected: mode === tab.value }}
					>
						<ThemedText
							weight={mode === tab.value ? 'bold' : 'regular'}
							color={mode === tab.value ? c.onPrimary : c.onSurfaceVariant}
						>
							{tab.label}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Date range chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.filterRow}
			>
				{DATE_RANGES.map((dr) => (
					<Pressable
						key={dr.value}
						onPress={() => setDateRange(dr.value)}
						style={chipStyle(dateRange === dr.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: dateRange === dr.value }}
					>
						<ThemedText
							variant="caption"
							color={dateRange === dr.value ? c.onPrimary : c.primary}
							style={{ fontWeight: dateRange === dr.value ? '600' : '400' }}
						>
							{dr.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			{mode === 'suppliers' ? (
				<View style={styles.emptyState}>
					<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
						Supplier P&L coming soon
					</ThemedText>
				</View>
			) : (
				<FlatList
					data={rows}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					ListHeaderComponent={
						<>
							<Card padding="none" style={{ overflow: 'hidden' }}>
								{renderHeader()}
							</Card>
						</>
					}
					renderItem={renderItem}
					ListFooterComponent={rows.length > 0 ? renderTotalRow : null}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
								No customers found
							</ThemedText>
						</View>
					}
					ItemSeparatorComponent={() => null}
				/>
			)}

			{/* Summary bar */}
			{topCustomer && mode === 'customers' && (
				<Card
					padding="sm"
					style={{
						marginHorizontal: s.md,
						marginBottom: s.md,
						flexDirection: 'row',
						justifyContent: 'space-between',
					}}
				>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Top: {topCustomer.name}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Avg margin: {avgMargin}%
					</ThemedText>
				</Card>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	modeToggle: {
		flexDirection: 'row',
		padding: 3,
	},
	modeTab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 9,
	},
	filterRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 8,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: 'transparent',
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 12,
		alignItems: 'center',
	},
	numCol: {
		width: 64,
		textAlign: 'right',
	},
	pctCol: {
		width: 36,
		textAlign: 'right',
	},
	emptyState: {
		flex: 1,
		paddingVertical: 40,
	},
});
