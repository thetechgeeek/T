import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, TextInput } from 'react-native';
import { OPACITY_TINT_LIGHT, OPACITY_TOAST } from '@/theme/uiMetrics';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import {
	TrendingUp,
	ShoppingCart,
	ArrowDownCircle,
	ArrowUpCircle,
	Receipt,
	Search,
} from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const ICON_CIRCLE_SIZE = SPACING_PX['2xl'] + SPACING_PX.xs + SPACING_PX.xxs;
const ICON_CIRCLE_RADIUS = ICON_CIRCLE_SIZE / 2;

type TxType = 'all' | 'sale' | 'purchase' | 'payment_in' | 'payment_out' | 'expense';
type DateRange = 'today' | 'week' | 'month' | 'fy';

const TX_CHIPS: { label: string; value: TxType }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Sale', value: 'sale' },
	{ label: 'Purchase', value: 'purchase' },
	{ label: 'Payment In', value: 'payment_in' },
	{ label: 'Payment Out', value: 'payment_out' },
	{ label: 'Expense', value: 'expense' },
];

const DATE_CHIPS: { label: string; value: DateRange }[] = [
	{ label: 'Today', value: 'today' },
	{ label: 'Week', value: 'week' },
	{ label: 'Month', value: 'month' },
	{ label: 'FY', value: 'fy' },
];

function toISO(d: Date) {
	return d.toISOString().slice(0, 10);
}

function getRange(range: DateRange): { from: string; to: string } {
	const now = new Date();
	const today = toISO(now);
	if (range === 'today') return { from: today, to: today };
	if (range === 'week') {
		const from = new Date(now);
		from.setDate(now.getDate() - 6);
		return { from: toISO(from), to: today };
	}
	if (range === 'month') {
		const from = new Date(now.getFullYear(), now.getMonth(), 1);
		return { from: toISO(from), to: today };
	}
	// FY: April 1 of current FY
	const month = now.getMonth() + 1;
	const fyYear = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;
	return { from: `${fyYear}-04-01`, to: today };
}

interface TxRow {
	id: string;
	type: TxType;
	ref: string;
	party: string;
	date: string;
	amount: number;
	isInflow: boolean;
	route?: string;
}

export default function AllTransactionsScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const typeColors = theme.collections.allTransactionsTypeColors;
	const typeMeta: Record<TxType, { icon: React.ElementType; color: string; label: string }> = {
		all: { icon: Receipt, color: typeColors.all, label: 'All' },
		sale: { icon: TrendingUp, color: typeColors.sale, label: 'Sale' },
		purchase: { icon: ShoppingCart, color: typeColors.purchase, label: 'Purchase' },
		payment_in: { icon: ArrowDownCircle, color: typeColors.payment_in, label: 'Payment In' },
		payment_out: { icon: ArrowUpCircle, color: typeColors.payment_out, label: 'Payment Out' },
		expense: { icon: Receipt, color: typeColors.expense, label: 'Expense' },
	};

	const [txFilter, setTxFilter] = useState<TxType>('all');
	const [dateFilter, setDateFilter] = useState<DateRange>('month');
	const [search, setSearch] = useState('');

	const { expenses, purchases } = useFinanceStore(
		useShallow((state) => ({ expenses: state.expenses, purchases: state.purchases })),
	);

	const { invoices } = useInvoiceStore(useShallow((state) => ({ invoices: state.invoices })));

	const { from, to } = useMemo(() => getRange(dateFilter), [dateFilter]);

	const allRows = useMemo<TxRow[]>(() => {
		const rows: TxRow[] = [];

		// Sale invoices
		invoices
			.filter((inv) => inv.invoice_date >= from && inv.invoice_date <= to)
			.forEach((inv) => {
				rows.push({
					id: `sale-${inv.id}`,
					type: 'sale',
					ref: inv.invoice_number,
					party: inv.customer_name,
					date: inv.invoice_date,
					amount: inv.grand_total,
					isInflow: true,
					route: `/(app)/invoices/${inv.id}`,
				});
			});

		// Purchases
		purchases
			.filter((p) => p.purchase_date >= from && p.purchase_date <= to)
			.forEach((p) => {
				rows.push({
					id: `purchase-${p.id}`,
					type: 'purchase',
					ref: p.purchase_number ?? '—',
					party: p.supplier_name ?? 'Supplier',
					date: p.purchase_date,
					amount: p.grand_total,
					isInflow: false,
					route: `/(app)/finance/purchase/${p.id}`,
				});
			});

		// Expenses
		expenses
			.filter((e) => e.expense_date >= from && e.expense_date <= to)
			.forEach((e) => {
				rows.push({
					id: `expense-${e.id}`,
					type: 'expense',
					ref: e.id.slice(0, 8).toUpperCase(),
					party: e.category,
					date: e.expense_date,
					amount: e.amount,
					isInflow: false,
				});
			});

		// TODO: wire payment_in / payment_out from paymentStore when available

		// Sort descending by date
		rows.sort((a, b) => b.date.localeCompare(a.date));
		return rows;
	}, [invoices, purchases, expenses, from, to]);

	const filtered = useMemo(() => {
		let rows = allRows;
		if (txFilter !== 'all') rows = rows.filter((r) => r.type === txFilter);
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			rows = rows.filter(
				(r) => r.party.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q),
			);
		}
		return rows;
	}, [allRows, txFilter, search]);

	const totalIn = filtered.filter((r) => r.isInflow).reduce((s, r) => s + r.amount, 0);
	const totalOut = filtered.filter((r) => !r.isInflow).reduce((s, r) => s + r.amount, 0);
	const net = totalIn - totalOut;

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const dateChipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? withOpacity(c.info, OPACITY_TOAST) : c.surface,
			borderColor: active ? c.info : c.border,
			borderRadius: r.full,
		},
	];

	const renderItem = ({ item }: { item: TxRow }) => {
		const meta = typeMeta[item.type];
		const IconComp = meta.icon;
		return (
			<Pressable
				style={[
					styles.txRow,
					{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
				]}
				onPress={() => item.route && router.push(item.route as Href)}
				accessibilityRole="button"
			>
				<View
					style={[
						styles.iconCircle,
						{ backgroundColor: withOpacity(meta.color, OPACITY_TINT_LIGHT) },
					]}
				>
					<IconComp size={18} color={meta.color} strokeWidth={2} />
				</View>

				<View style={{ flex: 1 }}>
					<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.sm }}>
						{item.ref}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant} numberOfLines={1}>
						{item.party}
					</ThemedText>
					<ThemedText variant="caption" color={c.placeholder}>
						{formatDate(item.date)}
					</ThemedText>
				</View>

				<ThemedText
					weight="bold"
					color={item.isInflow ? c.success : c.error}
					style={{ fontSize: theme.typography.sizes.md }}
				>
					{item.isInflow ? '+' : '–'} {formatCurrency(item.amount)}
				</ThemedText>
			</Pressable>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="All Transactions" showBackButton />

			{/* Type filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.chipRow}
			>
				{TX_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setTxFilter(chip.value)}
						style={chipStyle(txFilter === chip.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: txFilter === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={txFilter === chip.value ? c.onPrimary : c.primary}
							style={{ fontWeight: txFilter === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			{/* Date range chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.chipRow}
			>
				{DATE_CHIPS.map((chip) => (
					<Pressable
						key={chip.value}
						onPress={() => setDateFilter(chip.value)}
						style={dateChipStyle(dateFilter === chip.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: dateFilter === chip.value }}
					>
						<ThemedText
							variant="caption"
							color={dateFilter === chip.value ? c.info : c.onSurfaceVariant}
							style={{ fontWeight: dateFilter === chip.value ? '600' : '400' }}
						>
							{chip.label}
						</ThemedText>
					</Pressable>
				))}
			</ScrollView>

			{/* Search bar */}
			<View
				style={[
					styles.searchBar,
					{
						backgroundColor: c.surface,
						borderColor: c.border,
						borderRadius: r.md,
						marginHorizontal: s.md,
						marginBottom: s.sm,
					},
				]}
			>
				<Search size={16} color={c.placeholder} strokeWidth={2} />
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Search party or reference…"
					placeholderTextColor={c.placeholder}
					style={[styles.searchInput, { color: c.onSurface }]}
					returnKeyType="search"
					clearButtonMode="while-editing"
				/>
			</View>

			{/* Summary bar */}
			<View
				style={[
					styles.summaryBar,
					{
						backgroundColor: c.surface,
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
					},
				]}
			>
				<ThemedText variant="caption" color={c.success} style={{ marginRight: s.md }}>
					In: {formatCurrency(totalIn)}
				</ThemedText>
				<ThemedText variant="caption" color={c.error} style={{ marginRight: s.md }}>
					Out: {formatCurrency(totalOut)}
				</ThemedText>
				<ThemedText variant="caption" weight="bold" color={net >= 0 ? c.success : c.error}>
					Net: {net >= 0 ? '+' : '–'} {formatCurrency(Math.abs(net))}
				</ThemedText>
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: s['2xl'] }}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
							No transactions found
						</ThemedText>
					</View>
				}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	chipRow: {
		flexDirection: 'row',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
		gap: SPACING_PX.sm,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
		borderWidth: 1,
		gap: SPACING_PX.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: FONT_SIZE.caption,
		padding: 0,
	},
	summaryBar: {
		flexDirection: 'row',
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
	},
	txRow: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: SPACING_PX['4xl'],
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
		gap: SPACING_PX.md,
	},
	iconCircle: {
		width: ICON_CIRCLE_SIZE,
		height: ICON_CIRCLE_SIZE,
		borderRadius: ICON_CIRCLE_RADIUS,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyState: {
		paddingVertical: SPACING_PX['2xl'] + SPACING_PX.sm,
	},
});
