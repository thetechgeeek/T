import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { OPACITY_TINT_STRONG, OPACITY_SKELETON_BASE } from '@/theme/uiMetrics';

const DISABLED_NAV_OPACITY = OPACITY_TINT_STRONG;
const SUMMARY_CARD_BORDER_WIDTH = 1.5;
import { useShallow } from 'zustand/react/shallow';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Card } from '@/src/design-system/components/atoms/Card';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { SIZE_CHIP_HEIGHT } from '@/theme/uiMetrics';

type PeriodMode = 'monthly' | 'quarterly' | 'fy';
const PROFIT_LOSS_SCROLL_BOTTOM_PADDING = 40;
const NET_PROFIT_VALUE_SIZE = 32;

const PERIOD_TABS: { label: string; value: PeriodMode }[] = [
	{ label: 'Monthly', value: 'monthly' },
	{ label: 'Quarterly', value: 'quarterly' },
	{ label: 'Full FY', value: 'fy' },
];

function toISO(d: Date) {
	return d.toISOString().slice(0, 10);
}

function fyStartYear(): number {
	const now = new Date();
	const m = now.getMonth() + 1;
	return m >= 4 ? now.getFullYear() : now.getFullYear() - 1;
}

function getPeriodRange(
	mode: PeriodMode,
	monthOffset: number,
): { label: string; from: string; to: string } {
	const now = new Date();
	const fyStart = fyStartYear();

	if (mode === 'fy') {
		return {
			label: `FY ${fyStart}–${(fyStart + 1).toString().slice(2)}`,
			from: `${fyStart}-04-01`,
			to: `${fyStart + 1}-03-31`,
		};
	}

	if (mode === 'quarterly') {
		// Quarter index 0–3 within FY (Apr=Q1, Jul=Q2, Oct=Q3, Jan=Q4)
		const qIdx = ((monthOffset % 4) + 4) % 4;
		const startMonth = [4, 7, 10, 1][qIdx];
		const qYear = startMonth === 1 ? fyStart + 1 : fyStart;
		const fromDate = new Date(qYear, startMonth - 1, 1);
		const toDate = new Date(qYear, startMonth + 2, 0); // last day of 3rd month
		const quarterNames = ['Q1 (Apr–Jun)', 'Q2 (Jul–Sep)', 'Q3 (Oct–Dec)', 'Q4 (Jan–Mar)'];
		return {
			label: `${quarterNames[qIdx]} FY${fyStart}`,
			from: toISO(fromDate),
			to: toISO(toDate),
		};
	}

	// Monthly
	const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
	const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
	return {
		label: base.toLocaleString('default', { month: 'long', year: 'numeric' }),
		from: toISO(base),
		to: toISO(lastDay),
	};
}

interface ExpenseCategory {
	category: string;
	total: number;
}

function SectionRow({
	label,
	value,
	accent,
	bold,
	indent,
	c,
	formatCurrency,
}: {
	label: string;
	value: number;
	accent?: string;
	bold?: boolean;
	indent?: boolean;
	c: ThemeColors;
	formatCurrency: (v: number) => string;
}) {
	return (
		<View style={[styles.sectionRow, indent && { paddingLeft: SPACING_PX.md }]}>
			<ThemedText
				color={accent ?? c.onSurface}
				weight={bold ? 'bold' : 'regular'}
				style={{ flex: 1 }}
			>
				{label}
			</ThemedText>
			<ThemedText color={accent ?? c.onSurface} weight={bold ? 'bold' : 'regular'}>
				{formatCurrency(value)}
			</ThemedText>
		</View>
	);
}

export default function ProfitLossScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [mode, setMode] = useState<PeriodMode>('monthly');
	const [offset, setOffset] = useState(0);

	const { expenses, purchases, initialize } = useFinanceStore(
		useShallow((state) => ({
			expenses: state.expenses,
			purchases: state.purchases,
			initialize: state.initialize,
		})),
	);

	const { invoices, fetchInvoices } = useInvoiceStore(
		useShallow((state) => ({
			invoices: state.invoices,
			fetchInvoices: state.fetchInvoices,
		})),
	);

	useEffect(() => {
		initialize();
		fetchInvoices(1);
	}, [initialize, fetchInvoices]);

	const { label, from, to } = useMemo(() => getPeriodRange(mode, offset), [mode, offset]);

	// Revenue
	const saleRevenue = useMemo(
		() =>
			invoices
				.filter((inv) => inv.invoice_date >= from && inv.invoice_date <= to)
				.reduce((sum, inv) => sum + inv.grand_total, 0),
		[invoices, from, to],
	);

	// TODO: wire Other Income from a dedicated income store when available
	const otherIncome = 0;
	const grossRevenue = saleRevenue + otherIncome;

	// COGS
	// TODO: opening/closing stock from inventoryStore when stockValuation is implemented
	const openingStock = 0;
	const closingStock = 0;
	const purchasesTotal = useMemo(
		() =>
			purchases
				.filter((p) => p.purchase_date >= from && p.purchase_date <= to)
				.reduce((sum, p) => sum + p.grand_total, 0),
		[purchases, from, to],
	);
	const cogs = openingStock + purchasesTotal - closingStock;
	const grossProfit = grossRevenue - cogs;

	// Expenses by category
	const expenseCategories = useMemo<ExpenseCategory[]>(() => {
		const map: Record<string, number> = {};
		expenses
			.filter((e) => e.expense_date >= from && e.expense_date <= to)
			.forEach((e) => {
				map[e.category] = (map[e.category] ?? 0) + e.amount;
			});
		return Object.entries(map)
			.map(([category, total]) => ({ category, total }))
			.sort((a, b) => b.total - a.total);
	}, [expenses, from, to]);

	const totalExpenses = expenseCategories.reduce((s, e) => s + e.total, 0);
	const netProfit = grossProfit - totalExpenses;
	const isProfit = netProfit >= 0;

	const tabStyle = (active: boolean) => [
		styles.tab,
		{
			backgroundColor: active ? c.primary : 'transparent',
			borderRadius: r.sm,
		},
	];

	const canGoBack = mode !== 'fy';
	const canGoForward = mode !== 'fy' && offset < 0;

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title="Profit & Loss" showBackButton />}
			contentContainerStyle={{
				padding: s.md,
				paddingBottom: PROFIT_LOSS_SCROLL_BOTTOM_PADDING,
				gap: SPACING_PX.md,
			}}
		>
			{/* Period mode tabs */}
			<View
				style={[
					styles.tabBar,
					{ backgroundColor: c.surface, borderRadius: r.md, marginHorizontal: s.md },
				]}
			>
				{PERIOD_TABS.map((tab) => (
					<Pressable
						key={tab.value}
						onPress={() => {
							setMode(tab.value);
							setOffset(0);
						}}
						style={tabStyle(mode === tab.value)}
						accessibilityRole="tab"
						accessibilityState={{ selected: mode === tab.value }}
					>
						<ThemedText
							variant="caption"
							weight={mode === tab.value ? 'bold' : 'regular'}
							color={mode === tab.value ? c.onPrimary : c.onSurfaceVariant}
						>
							{tab.label}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Period navigation */}
			<View style={[styles.periodNav, { paddingHorizontal: s.md, marginTop: s.sm }]}>
				<Pressable
					onPress={() => canGoBack && setOffset((o) => o - 1)}
					disabled={!canGoBack}
					style={[styles.navBtn, { opacity: canGoBack ? 1 : DISABLED_NAV_OPACITY }]}
					accessibilityLabel="Previous period"
				>
					<ChevronLeft size={20} color={c.onSurface} strokeWidth={2} />
				</Pressable>
				<ThemedText weight="bold" style={{ flex: 1, textAlign: 'center' }}>
					{label}
				</ThemedText>
				<Pressable
					onPress={() => canGoForward && setOffset((o) => o + 1)}
					disabled={!canGoForward}
					style={[styles.navBtn, { opacity: canGoForward ? 1 : DISABLED_NAV_OPACITY }]}
					accessibilityLabel="Next period"
				>
					<ChevronRight size={20} color={c.onSurface} strokeWidth={2} />
				</Pressable>
			</View>

			{/* Revenue Section */}
			<Card padding="md">
				<ThemedText variant="caption" weight="bold" style={{ marginBottom: s.sm }}>
					Revenue
				</ThemedText>
				<SectionRow
					label="Sale Revenue"
					value={saleRevenue}
					indent
					c={c}
					formatCurrency={formatCurrency}
				/>
				<SectionRow
					label="Other Income"
					value={otherIncome}
					indent
					c={c}
					formatCurrency={formatCurrency}
				/>
				<View style={[styles.divider, { backgroundColor: c.border }]} />
				<SectionRow
					label="Gross Revenue"
					value={grossRevenue}
					bold
					c={c}
					formatCurrency={formatCurrency}
				/>
			</Card>

			{/* COGS Section */}
			<Card padding="md">
				<ThemedText variant="caption" weight="bold" style={{ marginBottom: s.sm }}>
					Cost of Goods Sold
				</ThemedText>
				<SectionRow
					label="Opening Stock"
					value={openingStock}
					indent
					c={c}
					formatCurrency={formatCurrency}
				/>
				<SectionRow
					label="+ Purchases"
					value={purchasesTotal}
					indent
					c={c}
					formatCurrency={formatCurrency}
				/>
				<SectionRow
					label="– Closing Stock"
					value={closingStock}
					indent
					c={c}
					formatCurrency={formatCurrency}
				/>
				<View style={[styles.divider, { backgroundColor: c.border }]} />
				<SectionRow label="COGS" value={cogs} bold c={c} formatCurrency={formatCurrency} />
				<View style={[styles.divider, { backgroundColor: c.border }]} />
				<SectionRow
					label="Gross Profit"
					value={grossProfit}
					bold
					accent={grossProfit >= 0 ? c.success : c.error}
					c={c}
					formatCurrency={formatCurrency}
				/>
			</Card>

			{/* Expenses Section */}
			<Card padding="md">
				<ThemedText variant="caption" weight="bold" style={{ marginBottom: s.sm }}>
					Expenses
				</ThemedText>
				{expenseCategories.length === 0 ? (
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						No expenses in this period
					</ThemedText>
				) : (
					expenseCategories.map((cat) => (
						<SectionRow
							key={cat.category}
							label={cat.category}
							value={cat.total}
							indent
							c={c}
							formatCurrency={formatCurrency}
						/>
					))
				)}
				<View style={[styles.divider, { backgroundColor: c.border }]} />
				<SectionRow
					label="Total Expenses"
					value={totalExpenses}
					bold
					c={c}
					formatCurrency={formatCurrency}
				/>
			</Card>

			{/* Net Profit / Loss */}
			<Card
				padding="lg"
				style={{
					borderRadius: r.md,
					backgroundColor: withOpacity(
						isProfit ? c.success : c.error,
						OPACITY_SKELETON_BASE,
					),
					borderWidth: SUMMARY_CARD_BORDER_WIDTH,
					borderColor: isProfit ? c.success : c.error,
				}}
			>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ textAlign: 'center', marginBottom: s.xs }}
				>
					Net {isProfit ? 'Profit' : 'Loss'}
				</ThemedText>
				<ThemedText
					weight="bold"
					color={isProfit ? c.success : c.error}
					style={{ fontSize: NET_PROFIT_VALUE_SIZE, textAlign: 'center' }}
				>
					{isProfit ? '' : '– '}
					{formatCurrency(Math.abs(netProfit))}
				</ThemedText>
			</Card>
		</Screen>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: 'row',
		padding: SPACING_PX.xs,
		marginTop: SPACING_PX.sm,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: SPACING_PX.sm,
	},
	periodNav: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	navBtn: {
		width: SIZE_CHIP_HEIGHT,
		height: SIZE_CHIP_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sectionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: SPACING_PX.xs,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		marginVertical: SPACING_PX.xs,
	},
});
