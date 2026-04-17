import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Card } from '@/src/design-system/components/atoms/Card';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_ROW_HIGHLIGHT } from '@/src/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
const SEEDED_RAND_MODULUS = 90001;
const SEEDED_RAND_MIN = 10000;
const HASH_PRIME = 31;
const COGS_RATIO = 0.6;

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
		h = (Math.imul(HASH_PRIME, h) + seed.charCodeAt(i)) | 0;
	}
	return Math.abs(h % SEEDED_RAND_MODULUS) + SEEDED_RAND_MIN; // SEEDED_RAND_MIN – 100_000
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
	const { c, s, r } = useThemeTokens();
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
			const cogs = Math.round(sale * COGS_RATIO);
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
						backgroundColor: isNegative
							? withOpacity(c.error, OPACITY_ROW_HIGHLIGHT)
							: 'transparent',
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
					backgroundColor: withOpacity(c.primary, OPACITY_ROW_HIGHLIGHT),
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
						marginTop: s.sm,
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
		padding: SPACING_PX.xs,
	},
	modeTab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
	},
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
	listContent: {
		paddingHorizontal: SPACING_PX.lg,
		paddingBottom: SPACING_PX.sm,
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.md,
		backgroundColor: 'transparent',
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
		paddingHorizontal: SPACING_PX.md,
		alignItems: 'center',
	},
	numCol: {
		width: SPACING_PX['4xl'],
		textAlign: 'right',
	},
	pctCol: {
		width: SPACING_PX.xl + SPACING_PX.md,
		textAlign: 'right',
	},
	emptyState: {
		flex: 1,
		paddingVertical: SPACING_PX['2xl'] + SPACING_PX.sm,
	},
});
