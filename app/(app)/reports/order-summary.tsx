import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { Download, CheckCircle2, Clock, XCircle, Package } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// TODO: Replace with real data — SELECT id, party_name, amount, status, date FROM sales_orders WHERE date BETWEEN ? AND ?
type Period = 'month' | 'quarter' | 'year' | 'fy';
type OrderStatus = 'fulfilled' | 'pending' | 'cancelled';

const PERIOD_CHIPS: { label: string; value: Period }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'Quarter', value: 'quarter' },
	{ label: 'Year', value: 'year' },
	{ label: 'FY', value: 'fy' },
];

interface OrderRow {
	id: string;
	orderNo: string;
	partyName: string;
	amount: number;
	items: number;
	date: string;
	status: OrderStatus;
}

// TODO: Replace with Supabase query filtered by period
const MOCK_ORDERS: OrderRow[] = [
	{
		id: '1',
		orderNo: 'ORD-2024-001',
		partyName: 'Ravi Construction Co.',
		amount: 87500,
		items: 3,
		date: '10 Apr 2026',
		status: 'fulfilled',
	},
	{
		id: '2',
		orderNo: 'ORD-2024-002',
		partyName: 'Metro Builders Pvt Ltd',
		amount: 142000,
		items: 5,
		date: '08 Apr 2026',
		status: 'pending',
	},
	{
		id: '3',
		orderNo: 'ORD-2024-003',
		partyName: 'Sharma Interiors',
		amount: 36800,
		items: 2,
		date: '05 Apr 2026',
		status: 'cancelled',
	},
	{
		id: '4',
		orderNo: 'ORD-2024-004',
		partyName: 'GreenField Developers',
		amount: 215000,
		items: 7,
		date: '02 Apr 2026',
		status: 'fulfilled',
	},
];

const STATUS_CONFIG: Record<
	OrderStatus,
	{
		label: string;
		bgKey: 'success' | 'warning' | 'error';
		fgKey: 'success' | 'warning' | 'error';
	}
> = {
	fulfilled: { label: 'Fulfilled', bgKey: 'success', fgKey: 'success' },
	pending: { label: 'Pending', bgKey: 'warning', fgKey: 'warning' },
	cancelled: { label: 'Cancelled', bgKey: 'error', fgKey: 'error' },
};

export default function OrderSummaryScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [period, setPeriod] = useState<Period>('month');

	// TODO: re-fetch / filter orders by period when real data is wired
	const orders = MOCK_ORDERS;

	const counts = useMemo(() => {
		const fulfilled = orders.filter((o) => o.status === 'fulfilled').length;
		const pending = orders.filter((o) => o.status === 'pending').length;
		const cancelled = orders.filter((o) => o.status === 'cancelled').length;
		return { total: orders.length, fulfilled, pending, cancelled };
	}, [orders]);

	const totalValue = useMemo(() => orders.reduce((sum, o) => sum + o.amount, 0), [orders]);

	const chipStyle = (active: boolean) => [
		styles.chip,
		{
			backgroundColor: active ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const renderItem = ({ item }: { item: OrderRow }) => {
		const cfg = STATUS_CONFIG[item.status];
		const bgColor = (c[cfg.bgKey] ?? c.primary) + '22';
		const fgColor = c[cfg.fgKey] ?? c.primary;

		const StatusIcon =
			item.status === 'fulfilled'
				? CheckCircle2
				: item.status === 'pending'
					? Clock
					: XCircle;

		return (
			<View
				style={[
					styles.row,
					{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth },
				]}
			>
				<View style={{ flex: 1, gap: 4 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
						<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.sm }}>
							{item.orderNo}
						</ThemedText>
						{/* Status badge */}
						<View
							style={[styles.badge, { backgroundColor: bgColor, borderRadius: r.sm }]}
						>
							<StatusIcon size={10} color={fgColor} strokeWidth={2.5} />
							<ThemedText variant="caption" color={fgColor} style={{ fontSize: 10 }}>
								{cfg.label}
							</ThemedText>
						</View>
					</View>
					<ThemedText variant="caption" color={c.onSurfaceVariant} numberOfLines={1}>
						{item.partyName}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{item.date} · {item.items} item{item.items !== 1 ? 's' : ''}
					</ThemedText>
				</View>
				<ThemedText weight="bold" style={{ fontSize: theme.typography.sizes.md }}>
					{formatCurrency(item.amount)}
				</ThemedText>
			</View>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader
				title="Order Summary"
				showBack
				rightElement={
					<Pressable
						onPress={() => Alert.alert('Export', 'Export feature coming soon.')}
						style={styles.exportBtn}
						accessibilityRole="button"
						accessibilityLabel="Export order summary"
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

			<FlatList
				data={orders}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<>
						{/* Summary cards row */}
						<View style={styles.summaryRow}>
							{/* Total */}
							<Card padding="sm" style={styles.summaryCard}>
								<Package size={18} color={c.primary} strokeWidth={2} />
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									Total
								</ThemedText>
								<ThemedText variant="h2" weight="bold">
									{String(counts.total)}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									numberOfLines={1}
								>
									{formatCurrency(totalValue)}
								</ThemedText>
							</Card>

							{/* Fulfilled */}
							<Card padding="sm" style={styles.summaryCard}>
								<CheckCircle2 size={18} color={c.success} strokeWidth={2} />
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									Fulfilled
								</ThemedText>
								<ThemedText variant="h2" weight="bold" color={c.success}>
									{String(counts.fulfilled)}
								</ThemedText>
							</Card>

							{/* Pending */}
							<Card padding="sm" style={styles.summaryCard}>
								<Clock size={18} color={c.warning} strokeWidth={2} />
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									Pending
								</ThemedText>
								<ThemedText variant="h2" weight="bold" color={c.warning}>
									{String(counts.pending)}
								</ThemedText>
							</Card>

							{/* Cancelled */}
							<Card padding="sm" style={styles.summaryCard}>
								<XCircle size={18} color={c.error} strokeWidth={2} />
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									Cancelled
								</ThemedText>
								<ThemedText variant="h2" weight="bold" color={c.error}>
									{String(counts.cancelled)}
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
								Order / Party
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Amount
							</ThemedText>
						</View>
					</>
				}
				renderItem={renderItem}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
							No orders found
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
	summaryRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
	},
	summaryCard: {
		flex: 1,
		alignItems: 'center',
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: 8,
		marginBottom: 4,
	},
	row: {
		flexDirection: 'row',
		paddingVertical: 12,
		alignItems: 'center',
		gap: 8,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	emptyState: {
		paddingVertical: 32,
	},
});
