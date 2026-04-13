const STATUS_DOT_SIZE = 7;
const STATUS_DOT_INLINE_SIZE = 8;
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { Button } from '@/src/components/atoms/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { FileText, Plus, Search, X } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { InvoiceStatusBadge } from '@/src/components/molecules/InvoiceStatusBadge';
import type { InvoiceStatus } from '@/src/components/molecules/InvoiceStatusBadge';
import { InvoiceListSkeleton } from '@/src/components/molecules/skeletons/InvoiceListSkeleton';
import type { Invoice, PaymentStatus } from '@/src/types/invoice';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

// ─── types ───────────────────────────────────────────────────────────────────

type DateChip = 'all' | 'today' | 'week' | 'month' | 'fy';
type StatusChip = 'ALL' | PaymentStatus | 'overdue';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDateRange(chip: DateChip): { from?: string; to?: string } {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

	if (chip === 'today') {
		const s = fmt(now);
		return { from: s, to: s };
	}
	if (chip === 'week') {
		const start = new Date(now);
		start.setDate(now.getDate() - now.getDay());
		return { from: fmt(start), to: fmt(now) };
	}
	if (chip === 'month') {
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		return { from: fmt(start), to: fmt(now) };
	}
	if (chip === 'fy') {
		// Indian financial year: April 1 – March 31
		const fyStart =
			now.getMonth() >= 3
				? new Date(now.getFullYear(), 3, 1)
				: new Date(now.getFullYear() - 1, 3, 1);
		return { from: fmt(fyStart), to: fmt(now) };
	}
	return {};
}

const DATE_CHIP_LABELS: Record<DateChip, string> = {
	all: 'All Time',
	today: 'Today',
	week: 'This Week',
	month: 'This Month',
	fy: 'This FY',
};

const STATUS_CHIPS: StatusChip[] = ['ALL', 'paid', 'partial', 'unpaid'];

// ─── component ───────────────────────────────────────────────────────────────

export default function InvoicesListScreen() {
	const router = useRouter();
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency, formatDate } = useLocale();

	const { invoices, loading, fetchInvoices } = useInvoiceStore(
		useShallow((st) => ({
			invoices: st.invoices,
			loading: st.loading,
			fetchInvoices: st.fetchInvoices,
		})),
	);

	const [refreshing, setRefreshing] = useState(false);
	const [search, setSearch] = useState('');
	const [dateChip, setDateChip] = useState<DateChip>('all');
	const [statusChip, setStatusChip] = useState<StatusChip>('ALL');

	useEffect(() => {
		fetchInvoices().catch(() => {
			Alert.alert(t('common.errorTitle'), t('invoice.loadError'), [{ text: t('common.ok') }]);
		});
	}, [fetchInvoices, t]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchInvoices(1);
		} finally {
			setRefreshing(false);
		}
	}, [fetchInvoices]);

	// ── client-side filter (search + date + status) ──
	const filtered = useMemo<Invoice[]>(() => {
		const { from, to } = getDateRange(dateChip);
		const q = search.trim().toLowerCase();

		return invoices.filter((inv) => {
			// Search
			if (q) {
				const match =
					inv.invoice_number.toLowerCase().includes(q) ||
					inv.customer_name.toLowerCase().includes(q);
				if (!match) return false;
			}
			// Date range
			if (from && inv.invoice_date < from) return false;
			if (to && inv.invoice_date > to) return false;
			// Status
			if (statusChip !== 'ALL' && statusChip !== 'overdue') {
				if (inv.payment_status !== statusChip) return false;
			}
			if (statusChip === 'overdue') {
				const dueDateStr = inv.due_date;
				const isOverdue =
					inv.payment_status === 'unpaid' &&
					!!dueDateStr &&
					new Date(dueDateStr) < new Date();
				if (!isOverdue) return false;
			}
			return true;
		});
	}, [invoices, search, dateChip, statusChip]);

	// ── summary card stats (filtered by this month always, independent of chips) ──
	const monthlySummary = useMemo(() => {
		const now = new Date();
		const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
		const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			.toISOString()
			.slice(0, 10);
		const thisMonth = invoices.filter(
			(inv) => inv.invoice_date >= monthStart && inv.invoice_date <= monthEnd,
		);
		const billed = thisMonth.reduce((s, i) => s + i.grand_total, 0);
		const collected = thisMonth.reduce((s, i) => s + i.amount_paid, 0);
		const pending = billed - collected;
		return { billed, collected, pending };
	}, [invoices]);

	return (
		<AtomicScreen safeAreaEdges={['top']}>
			{/* ── Top Header ── */}
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<ThemedText variant="h1" accessibilityLabel="invoices-screen-title">
					{t('invoice.title')}
				</ThemedText>
				<Button
					title={t('invoice.newInvoice')}
					accessibilityLabel="new-invoice-button"
					leftIcon={<Plus color={c.onPrimary} size={20} />}
					onPress={() => router.push('/(app)/invoices/create')}
				/>
			</View>

			{/* ── Monthly Summary Card ── */}
			{invoices.length > 0 && (
				<View
					style={[
						styles.summaryCard,
						{
							backgroundColor: c.card,
							marginHorizontal: s.md,
							marginTop: s.md,
							borderRadius: r.md,
							...theme.shadows.sm,
						},
					]}
				>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginBottom: s.xs }}
					>
						This Month
					</ThemedText>
					<View style={styles.summaryRow}>
						<View style={styles.summaryCol}>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Billed
							</ThemedText>
							<ThemedText variant="bodyBold" color={c.onSurface}>
								{formatCurrency(monthlySummary.billed)}
							</ThemedText>
						</View>
						<View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
						<View style={styles.summaryCol}>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Collected
							</ThemedText>
							<ThemedText variant="bodyBold" color={c.success}>
								{formatCurrency(monthlySummary.collected)}
							</ThemedText>
						</View>
						<View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
						<View style={styles.summaryCol}>
							<ThemedText variant="captionBold" color={c.onSurfaceVariant}>
								Pending
							</ThemedText>
							<ThemedText
								variant="bodyBold"
								color={monthlySummary.pending > 0 ? c.error : c.onSurface}
							>
								{formatCurrency(monthlySummary.pending)}
							</ThemedText>
						</View>
					</View>
				</View>
			)}

			{/* ── Search Bar ── */}
			<View
				style={[
					styles.searchBar,
					{
						backgroundColor: c.surfaceVariant,
						borderRadius: r.md,
						marginHorizontal: s.md,
						marginTop: s.md,
					},
				]}
			>
				<Search size={16} color={c.placeholder} style={{ marginRight: SPACING_PX.xs }} />
				<TextInput
					style={[styles.searchInput, { color: c.onSurface }]}
					placeholder="Search invoice no. or customer..."
					placeholderTextColor={c.placeholder}
					value={search}
					onChangeText={setSearch}
					returnKeyType="search"
					clearButtonMode="never"
					accessibilityLabel="invoice-search-input"
				/>
				{search.length > 0 && (
					<TouchableOpacity
						onPress={() => setSearch('')}
						accessibilityLabel="clear-search"
					>
						<X size={16} color={c.placeholder} />
					</TouchableOpacity>
				)}
			</View>

			{/* ── Date Filter Chips ── */}
			<FlatList
				horizontal
				data={Object.keys(DATE_CHIP_LABELS) as DateChip[]}
				keyExtractor={(k) => k}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: s.md, paddingTop: s.sm, gap: s.xs }}
				renderItem={({ item: chip }) => (
					<TouchableOpacity
						style={[
							styles.chip,
							{
								backgroundColor: dateChip === chip ? c.primary : c.surfaceVariant,
								borderRadius: r.full,
								paddingHorizontal: s.md,
								paddingVertical: s.xs,
							},
						]}
						onPress={() => setDateChip(chip)}
						accessibilityRole="button"
						accessibilityLabel={`date-filter-${chip}`}
					>
						<ThemedText
							variant="captionBold"
							color={dateChip === chip ? c.onPrimary : c.onSurfaceVariant}
						>
							{DATE_CHIP_LABELS[chip]}
						</ThemedText>
					</TouchableOpacity>
				)}
			/>

			{/* ── Status Filter Chips ── */}
			<FlatList
				horizontal
				data={STATUS_CHIPS}
				keyExtractor={(k) => k}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: s.md,
					paddingTop: s.xs,
					paddingBottom: s.sm,
					gap: s.xs,
				}}
				renderItem={({ item: chip }) => {
					const isActive = statusChip === chip;
					const dotColor =
						chip === 'paid'
							? c.success
							: chip === 'partial'
								? c.warning
								: chip === 'unpaid'
									? c.error
									: 'transparent';
					return (
						<TouchableOpacity
							style={[
								styles.chip,
								{
									backgroundColor: isActive ? c.primary : c.surfaceVariant,
									borderRadius: r.full,
									paddingHorizontal: s.md,
									paddingVertical: s.xs,
									flexDirection: 'row',
									alignItems: 'center',
									gap: s.xs,
								},
							]}
							onPress={() => setStatusChip(chip)}
							accessibilityRole="button"
							accessibilityLabel={`status-filter-${chip}`}
						>
							{chip !== 'ALL' && (
								<View
									style={[
										styles.statusDot,
										{ backgroundColor: isActive ? c.onPrimary : dotColor },
									]}
								/>
							)}
							<ThemedText
								variant="captionBold"
								color={isActive ? c.onPrimary : c.onSurfaceVariant}
							>
								{chip === 'ALL'
									? 'All'
									: chip.charAt(0).toUpperCase() + chip.slice(1)}
							</ThemedText>
						</TouchableOpacity>
					);
				}}
			/>

			{/* ── Invoice List ── */}
			{loading && invoices.length === 0 ? <InvoiceListSkeleton /> : null}
			<FlatList
				data={loading && invoices.length === 0 ? [] : filtered}
				keyExtractor={(item) => item.id}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				initialNumToRender={10}
				windowSize={5}
				maxToRenderPerBatch={10}
				contentContainerStyle={{ padding: s.md, flexGrow: 1 }}
				ListEmptyComponent={() => (
					<View style={{ alignItems: 'center', marginTop: s['2xl'] }}>
						<FileText color={c.placeholder} size={64} />
						<ThemedText color={c.onSurfaceVariant} style={{ marginTop: s.md }}>
							{search || statusChip !== 'ALL' || dateChip !== 'all'
								? t('common.noResults')
								: t('invoice.noInvoices')}
						</ThemedText>
						{!search && statusChip === 'ALL' && dateChip === 'all' && (
							<Button
								title={t('invoice.createFirst')}
								variant="outline"
								style={{ marginTop: s.lg }}
								onPress={() => router.push('/(app)/invoices/create')}
							/>
						)}
					</View>
				)}
				renderItem={({ item }) => {
					const dueDateStr = item.due_date;
					const isOverdue =
						item.payment_status === 'unpaid' &&
						!!dueDateStr &&
						new Date(dueDateStr) < new Date();
					const dotColor = isOverdue
						? c.overdue
						: item.payment_status === 'paid'
							? c.success
							: item.payment_status === 'partial'
								? c.warning
								: c.error;
					return (
						<TouchableOpacity
							style={[
								styles.invoiceCard,
								{
									backgroundColor: theme.colors.card,
									...theme.shadows.sm,
								},
							]}
							accessibilityRole="button"
							accessibilityLabel={`invoice-${item.invoice_number}`}
							accessibilityHint={`${t('invoice.' + item.payment_status)}, ${formatCurrency(item.grand_total)}. ${t('invoice.tapToOpen')}`}
							onPress={() => router.push(`/(app)/invoices/${item.id}`)}
						>
							<View style={styles.cardHeader}>
								<View
									style={[styles.statusDotInline, { backgroundColor: dotColor }]}
								/>
								<ThemedText weight="bold" variant="body" style={{ flex: 1 }}>
									{item.invoice_number}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{formatDate(item.invoice_date)}
								</ThemedText>
							</View>
							<ThemedText color={c.onSurfaceVariant} style={{ marginBottom: s.sm }}>
								{item.customer_name}
							</ThemedText>
							<View style={styles.cardFooter}>
								<InvoiceStatusBadge
									status={item.payment_status as InvoiceStatus}
									size="sm"
								/>
								<ThemedText variant="h3" color={c.primary}>
									{formatCurrency(item.grand_total)}
								</ThemedText>
							</View>
						</TouchableOpacity>
					);
				}}
			/>
		</AtomicScreen>
	);
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	header: {
		padding: SPACING_PX.lg,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
	},
	summaryCard: {
		padding: SPACING_PX.md,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	summaryCol: {
		flex: 1,
		alignItems: 'center',
		gap: SPACING_PX.xxs,
	},
	summaryDivider: {
		width: StyleSheet.hairlineWidth,
		height: SPACING_PX['2xl'],
		marginHorizontal: SPACING_PX.xs,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: FONT_SIZE.caption,
		paddingVertical: 0,
	},
	chip: {
		// dynamic styles applied inline
	},
	statusDot: {
		width: STATUS_DOT_SIZE,
		height: STATUS_DOT_SIZE,
		borderRadius: STATUS_DOT_SIZE / 2,
	},
	invoiceCard: {
		padding: SPACING_PX.lg,
		borderRadius: BORDER_RADIUS_PX.lg,
		marginBottom: SPACING_PX.md,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: SPACING_PX.xs,
		gap: SPACING_PX.xs,
	},
	statusDotInline: {
		width: STATUS_DOT_INLINE_SIZE,
		height: STATUS_DOT_INLINE_SIZE,
		borderRadius: BORDER_RADIUS_PX.sm,
	},
	cardFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: SPACING_PX.sm,
	},
});
