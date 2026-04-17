import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Card } from '@/src/design-system/components/atoms/Card';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { InvoiceStatusBadge } from '@/app/components/molecules/InvoiceStatusBadge';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import type { Invoice } from '@/src/types/invoice';

/** Number of days in a quarter (365/4 rounded down) */
const QUARTER_DAYS = 89;

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

	if (filter === 'today') {
		return { from: today, to: today };
	}
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
		from.setDate(now.getDate() - QUARTER_DAYS);
		return { from: toISO(from), to: today };
	}
	return { from: today, to: today };
}

export default function SaleReportScreen() {
	const { theme, c, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const { invoices, loading, fetchInvoices } = useInvoiceStore(
		useShallow((state) => ({
			invoices: state.invoices,
			loading: state.loading,
			fetchInvoices: state.fetchInvoices,
		})),
	);

	const [activeFilter, setActiveFilter] = useState<DateFilter>('month');
	const [customFrom, setCustomFrom] = useState(todayISO());
	const [customTo, setCustomTo] = useState(todayISO());

	useEffect(() => {
		fetchInvoices(1);
	}, [fetchInvoices]);

	const { from, to } = useMemo(() => {
		if (activeFilter === 'custom') {
			return { from: customFrom, to: customTo };
		}
		return getDateRange(activeFilter);
	}, [activeFilter, customFrom, customTo]);

	const filteredInvoices = useMemo(() => {
		return invoices.filter((inv) => {
			const d = inv.invoice_date;
			return d >= from && d <= to;
		});
	}, [invoices, from, to]);

	const totalInvoices = filteredInvoices.length;
	const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
	const amountCollected = filteredInvoices.reduce((sum, inv) => sum + inv.amount_paid, 0);
	const outstanding = filteredInvoices.reduce(
		(sum, inv) => sum + (inv.grand_total - inv.amount_paid),
		0,
	);

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const renderItem = ({ item }: { item: Invoice }) => (
		<View
			style={[
				styles.tableRow,
				{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
			]}
		>
			<View style={{ flex: 1 }}>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{formatDate(item.invoice_date)}
				</ThemedText>
				<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.sm }}>
					{item.invoice_number}
				</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{item.customer_name}
				</ThemedText>
			</View>
			<View style={{ alignItems: 'flex-end', gap: SPACING_PX.xs }}>
				<ThemedText weight="bold">{formatCurrency(item.grand_total)}</ThemedText>
				<InvoiceStatusBadge status={item.payment_status} size="sm" />
			</View>
		</View>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Sale Report" showBackButton />

			{/* Date filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.filterRow}
			>
				{DATE_FILTERS.map((df) => (
					<Pressable
						key={df.value}
						onPress={() => setActiveFilter(df.value)}
						style={chipStyle(activeFilter === df.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: activeFilter === df.value }}
					>
						<ThemedText
							variant="caption"
							color={activeFilter === df.value ? c.onPrimary : c.primary}
							style={{ fontWeight: activeFilter === df.value ? '600' : '400' }}
						>
							{df.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			{/* Custom date pickers */}
			{activeFilter === 'custom' ? (
				<View style={styles.customDates}>
					<View style={{ flex: 1 }}>
						<DatePickerField label="From" value={customFrom} onChange={setCustomFrom} />
					</View>
					<View style={{ flex: 1 }}>
						<DatePickerField label="To" value={customTo} onChange={setCustomTo} />
					</View>
				</View>
			) : null}

			<FlatList
				data={loading ? [] : filteredInvoices}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<>
						{/* Summary cards 2-column grid */}
						<View style={styles.summaryGrid}>
							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Total Invoices
								</ThemedText>
								<ThemedText variant="h2">{String(totalInvoices)}</ThemedText>
							</Card>
							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Total Amount
								</ThemedText>
								<ThemedText variant="h2">{formatCurrency(totalAmount)}</ThemedText>
							</Card>
							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Collected
								</ThemedText>
								<ThemedText variant="h2" color={c.success}>
									{formatCurrency(amountCollected)}
								</ThemedText>
							</Card>
							<Card style={styles.summaryCard} padding="md">
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Outstanding
								</ThemedText>
								<ThemedText variant="h2" color={c.error}>
									{formatCurrency(outstanding)}
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
								Invoice
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Amount / Status
							</ThemedText>
						</View>

						{/* Loading skeleton */}
						{loading ? (
							<View style={{ gap: SPACING_PX.md, marginTop: SPACING_PX.sm }}>
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
								No invoices for this period
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
	customDates: {
		flexDirection: 'row',
		gap: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
		paddingBottom: SPACING_PX.sm,
	},
	listContent: {
		padding: SPACING_PX.lg,
		paddingBottom: SPACING_PX['2xl'],
	},
	summaryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.md,
		marginBottom: SPACING_PX.lg,
	},
	summaryCard: {
		flex: 1,
		minWidth: '45%',
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.sm,
		marginBottom: SPACING_PX.xs,
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.md,
		alignItems: 'center',
	},
	emptyState: {
		paddingVertical: SPACING_PX['2xl'],
	},
});
