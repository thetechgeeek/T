import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { Badge } from '@/src/components/atoms/Badge';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { Purchase } from '@/src/types/finance';

type DateFilter = 'today' | 'week' | 'month' | 'quarter' | 'custom';

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
	{ label: 'Today', value: 'today' },
	{ label: 'This Week', value: 'week' },
	{ label: 'This Month', value: 'month' },
	{ label: 'This Quarter', value: 'quarter' },
	{ label: 'Custom', value: 'custom' },
];

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

function getDateRange(filter: DateFilter): { from: string; to: string } {
	const now = new Date();
	const toISO = (d: Date) => d.toISOString().slice(0, 10);
	const today = toISO(now);

	if (filter === 'today') return { from: today, to: today };
	if (filter === 'week') {
		const from = new Date(now);
		from.setDate(now.getDate() - 6);
		return { from: toISO(from), to: today };
	}
	if (filter === 'month') {
		const from = new Date(now.getFullYear(), now.getMonth(), 1);
		return { from: toISO(from), to: today };
	}
	if (filter === 'quarter') {
		const from = new Date(now);
		from.setDate(now.getDate() - 89);
		return { from: toISO(from), to: today };
	}
	return { from: today, to: today };
}

export default function PurchaseReportScreen() {
	const { c, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const { purchases, loading, fetchPurchases } = useFinanceStore(
		useShallow((state) => ({
			purchases: state.purchases,
			loading: state.loading,
			fetchPurchases: state.fetchPurchases,
		})),
	);

	const [activeFilter, setActiveFilter] = useState<DateFilter>('month');
	const [customFrom, setCustomFrom] = useState(todayISO());
	const [customTo, setCustomTo] = useState(todayISO());

	useEffect(() => {
		fetchPurchases();
	}, [fetchPurchases]);

	const { from, to } = useMemo(() => {
		if (activeFilter === 'custom') return { from: customFrom, to: customTo };
		return getDateRange(activeFilter);
	}, [activeFilter, customFrom, customTo]);

	const filtered = useMemo(
		() =>
			purchases.filter((p) => {
				const d = p.purchase_date.slice(0, 10);
				return d >= from && d <= to;
			}),
		[purchases, from, to],
	);

	const totals = useMemo(() => {
		const totalAmount = filtered.reduce((a, p) => a + p.grand_total, 0);
		const totalPaid = filtered.reduce((a, p) => a + p.amount_paid, 0);
		const outstanding = totalAmount - totalPaid;
		const totalGst = filtered.reduce((a, p) => a + (p.tax_total ?? 0), 0);
		return { totalAmount, totalPaid, outstanding, totalGst, count: filtered.length };
	}, [filtered]);

	const renderItem = ({ item: purchase }: { item: Purchase }) => {
		const outstanding = purchase.grand_total - purchase.amount_paid;
		return (
			<View
				style={[
					styles.tableRow,
					{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
				]}
			>
				<View style={{ flex: 1 }}>
					<ThemedText variant="bodyBold" numberOfLines={1}>
						{purchase.purchase_number ?? 'PUR-—'}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{purchase.supplier_name ?? 'Unknown Supplier'} ·{' '}
						{formatDate(purchase.purchase_date)}
					</ThemedText>
				</View>
				<View style={{ alignItems: 'flex-end' }}>
					<ThemedText variant="amount" color={c.error}>
						{formatCurrency(purchase.grand_total)}
					</ThemedText>
					<Badge
						label={
							purchase.payment_status.charAt(0).toUpperCase() +
							purchase.payment_status.slice(1)
						}
						variant={
							purchase.payment_status === 'paid'
								? 'paid'
								: purchase.payment_status === 'partial'
									? 'partial'
									: 'unpaid'
						}
					/>
					{outstanding > 0 && (
						<ThemedText variant="caption" color={c.error}>
							To Pay: {formatCurrency(outstanding)}
						</ThemedText>
					)}
				</View>
			</View>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Purchase Report" />

			<FlatList
				data={filtered}
				keyExtractor={(item: Purchase) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<>
						{/* Date filter chips */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.filterRow}
							contentContainerStyle={{ gap: 8 }}
						>
							{DATE_FILTERS.map((f) => (
								<Pressable
									key={f.value}
									onPress={() => setActiveFilter(f.value)}
									style={[
										styles.chip,
										{
											borderRadius: r.full,
											borderColor:
												activeFilter === f.value ? c.primary : c.border,
											backgroundColor:
												activeFilter === f.value ? c.primary : c.surface,
										},
									]}
									accessibilityRole="button"
									accessibilityLabel={`filter-${f.value}`}
									accessibilityState={{ selected: activeFilter === f.value }}
								>
									<ThemedText
										variant="caption"
										color={activeFilter === f.value ? c.onPrimary : c.onSurface}
									>
										{f.label}
									</ThemedText>
								</Pressable>
							))}
						</ScrollView>

						{/* Custom date pickers */}
						{activeFilter === 'custom' && (
							<View style={styles.customDates}>
								<View style={{ flex: 1 }}>
									<DatePickerField
										label="From"
										value={customFrom}
										onChange={setCustomFrom}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<DatePickerField
										label="To"
										value={customTo}
										onChange={setCustomTo}
									/>
								</View>
							</View>
						)}

						{/* Summary cards */}
						<View style={styles.summaryGrid}>
							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Total Purchases
								</ThemedText>
								<ThemedText variant="amount" color={c.error}>
									{formatCurrency(totals.totalAmount)}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{totals.count} bills
								</ThemedText>
							</Card>

							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Paid
								</ThemedText>
								<ThemedText variant="amount" color={c.success}>
									{formatCurrency(totals.totalPaid)}
								</ThemedText>
							</Card>

							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									To Pay
								</ThemedText>
								<ThemedText variant="amount" color={c.error}>
									{formatCurrency(totals.outstanding)}
								</ThemedText>
							</Card>

							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Input GST (ITC)
								</ThemedText>
								<ThemedText variant="amount" color={c.info}>
									{formatCurrency(totals.totalGst)}
								</ThemedText>
							</Card>
						</View>

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
								Bill / Supplier
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Amount / Status
							</ThemedText>
						</View>

						{loading ? (
							<View style={{ gap: 12, marginTop: 8 }}>
								<SkeletonBlock height={56} borderRadius={8} />
								<SkeletonBlock height={56} borderRadius={8} />
								<SkeletonBlock height={56} borderRadius={8} />
							</View>
						) : null}
					</>
				}
				renderItem={renderItem}
				ListEmptyComponent={
					!loading ? (
						<View style={styles.emptyState}>
							<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
								No purchases for this period
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
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	customDates: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	listContent: {
		padding: 16,
		paddingBottom: 32,
	},
	summaryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
		marginBottom: 16,
	},
	summaryCard: {
		flex: 1,
		minWidth: '45%',
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: 8,
		marginBottom: 4,
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 12,
		alignItems: 'center',
	},
	emptyState: {
		paddingVertical: 32,
	},
});
