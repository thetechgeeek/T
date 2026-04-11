import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { SkeletonBlock } from '@/src/components/atoms/SkeletonBlock';
import { InvoiceStatusBadge } from '@/src/components/molecules/InvoiceStatusBadge';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { Invoice } from '@/src/types/invoice';

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
		from.setDate(now.getDate() - 89);
		return { from: toISO(from), to: today };
	}
	return { from: today, to: today };
}

export default function SaleReportScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency, formatDate } = useLocale();

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
			<View style={{ alignItems: 'flex-end', gap: 4 }}>
				<ThemedText weight="bold">{formatCurrency(item.grand_total)}</ThemedText>
				<InvoiceStatusBadge status={item.payment_status} size="sm" />
			</View>
		</View>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Sale Report" showBack />

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
