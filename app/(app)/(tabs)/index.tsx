import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { layout } from '@/src/theme/layout';
import { withOpacity } from '@/src/utils/color';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';

// Atomic Design Components
import { StatCard } from '@/src/components/molecules/StatCard';
import { DashboardSkeleton } from '@/src/components/molecules/skeletons/DashboardSkeleton';
import { DashboardHeader } from '@/src/components/organisms/DashboardHeader';
import { QuickActionsGrid } from '@/src/components/organisms/QuickActionsGrid';
import { RecentInvoicesList } from '@/src/components/organisms/RecentInvoicesList';
import {
	TrendingUp,
	AlertTriangle,
	Users,
	FileText,
	Package,
	ShoppingCart,
	ArrowDownCircle,
	ArrowUpCircle,
	Wallet,
} from 'lucide-react-native';
import type { RecentTransaction } from '@/src/types/finance';
import {
	OPACITY_TINT_LIGHT,
	SIZE_BUSINESS_TILE_MIN_HEIGHT,
	SIZE_CHIP_HEIGHT,
	SIZE_FAB_ICON,
} from '@/theme/uiMetrics';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTransactionIcon(type: RecentTransaction['type'], color: string) {
	const size = 18;
	switch (type) {
		case 'sale':
			return <TrendingUp size={size} color={color} />;
		case 'purchase':
			return <ShoppingCart size={size} color={color} />;
		case 'payment_in':
			return <ArrowDownCircle size={size} color={color} />;
		case 'payment_out':
			return <ArrowUpCircle size={size} color={color} />;
		case 'expense':
			return <Wallet size={size} color={color} />;
		default:
			return <TrendingUp size={size} color={color} />;
	}
}

function isIncoming(type: RecentTransaction['type']): boolean {
	return type === 'sale' || type === 'payment_in';
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
	const { c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();
	const router = useRouter();
	const [refreshing, setRefreshing] = React.useState(false);

	const { invoices, fetchInvoices } = useInvoiceStore(
		useShallow((st) => ({ invoices: st.invoices, fetchInvoices: st.fetchInvoices })),
	);
	const { stats, loading, fetchStats } = useDashboardStore(
		useShallow((st) => ({
			stats: st.stats,
			loading: st.loading,
			fetchStats: st.fetchStats,
		})),
	);

	React.useEffect(() => {
		fetchStats();
		fetchInvoices(1);
	}, [fetchStats, fetchInvoices]);

	const quickActions = [
		{
			label: t('dashboard.newInvoice'),
			accessibilityLabel: 'quick-action-new-invoice',
			icon: FileText,
			route: '/(app)/invoices/create',
			color: c.primary,
		},
		{
			label: 'Receive Payment',
			accessibilityLabel: 'quick-action-record-payment',
			icon: ArrowDownCircle,
			route: '/(app)/finance/payments/receive',
			color: c.success,
		},
		{
			label: 'New Purchase',
			accessibilityLabel: 'quick-action-scan-item',
			icon: ShoppingCart,
			route: '/(app)/finance/purchases/create',
			color: c.info,
		},
		{
			label: t('dashboard.addStock'),
			accessibilityLabel: 'quick-action-add-stock',
			icon: Package,
			route: '/(app)/(tabs)/inventory',
			color: c.warning,
		},
	];

	const dashboardStats = [
		{
			label: t('dashboard.todaySales'),
			accessibilityLabel: 'stat-today-sales',
			value: formatCurrency(stats?.today_sales ?? 0),
			icon: TrendingUp,
			color: c.success,
		},
		{
			label: 'To Receive',
			accessibilityLabel: 'stat-outstanding',
			value: formatCurrency(stats?.total_outstanding_credit ?? 0),
			icon: Users,
			color: c.error,
		},
		{
			label: t('dashboard.lowStock'),
			accessibilityLabel: 'stat-low-stock',
			value: t('inventory.stockStatus', { count: stats?.low_stock_count ?? 0 }),
			icon: AlertTriangle,
			color: c.warning,
		},
	];

	const hasAlerts = (stats?.low_stock_count ?? 0) > 0;
	const recentInvoices = invoices.slice(0, 5);

	const recentTransactions = stats?.recentTransactions ?? [];

	const onRefresh = React.useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.allSettled([fetchStats(), fetchInvoices(1)]);
		} finally {
			setRefreshing(false);
		}
	}, [fetchStats, fetchInvoices]);

	return (
		<AtomicScreen
			scrollable
			accessibilityLabel="dashboard-screen"
			safeAreaEdges={[]}
			scrollViewProps={{
				keyboardDismissMode: 'on-drag',
				refreshControl: (
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={c.primary}
					/>
				),
			}}
			contentContainerStyle={{ paddingBottom: s.xl }}
		>
			<DashboardHeader businessName={t('branding.appName')} onSyncPress={fetchStats} />

			{loading && stats === null ? (
				<DashboardSkeleton />
			) : (
				<>
					{/* ── Main Stats Cards ── */}
					<View style={[layout.row, { paddingHorizontal: s.md, marginTop: -s.lg }]}>
						{dashboardStats.map((stat) => (
							<StatCard
								key={stat.accessibilityLabel}
								label={stat.label}
								accessibilityLabel={stat.accessibilityLabel}
								value={stat.value}
								icon={stat.icon}
								color={stat.color}
								style={{ flex: 1, marginHorizontal: s.xs }}
							/>
						))}
					</View>

					{/* ── Today's Business ── */}
					<SectionHeader
						title="Today's Business"
						style={{
							marginTop: s.lg,
							marginBottom: s.sm,
							paddingHorizontal: s.md,
							paddingVertical: 0,
						}}
					/>
					<View style={[layout.row, { paddingHorizontal: s.md, gap: s.sm }]}>
						{/* Today's Sale */}
						<Card
							style={[styles.businessTile, { flex: 1 }]}
							padding="md"
							accessibilityLabel="stat-today-sale-tile"
						>
							<View
								style={[layout.row, { alignItems: 'center', marginBottom: s.xs }]}
							>
								<View
									style={[
										styles.tileIcon,
										{
											borderRadius: r.full,
											backgroundColor: withOpacity(
												c.success,
												OPACITY_TINT_LIGHT,
											),
										},
									]}
								>
									<TrendingUp size={16} color={c.success} />
								</View>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginLeft: s.xs }}
								>
									Today&apos;s Sale
								</ThemedText>
							</View>
							<ThemedText variant="h3" color={c.success}>
								{formatCurrency(stats?.today_sales ?? 0)}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{stats?.today_invoice_count ?? 0} invoices
							</ThemedText>
						</Card>

						{/* Today's Collection */}
						<Card
							style={[styles.businessTile, { flex: 1 }]}
							padding="md"
							accessibilityLabel="stat-today-collection-tile"
						>
							<View
								style={[layout.row, { alignItems: 'center', marginBottom: s.xs }]}
							>
								<View
									style={[
										styles.tileIcon,
										{
											borderRadius: r.full,
											backgroundColor: withOpacity(
												c.info,
												OPACITY_TINT_LIGHT,
											),
										},
									]}
								>
									<ArrowDownCircle size={16} color={c.info} />
								</View>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginLeft: s.xs }}
								>
									Today&apos;s Collection
								</ThemedText>
							</View>
							<ThemedText variant="h3" color={c.info}>
								{formatCurrency(stats?.today_collection ?? 0)}
							</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Payments received
							</ThemedText>
						</Card>
					</View>

					<QuickActionsGrid actions={quickActions} />

					{/* ── Alerts ── */}
					{hasAlerts && (
						<View
							style={{
								marginHorizontal: s.md,
								marginBottom: s.md,
								padding: s.md,
								backgroundColor: c.warningLight,
								borderRadius: r.md,
								borderLeftWidth: s.xs,
								borderLeftColor: c.warning,
							}}
						>
							<ThemedText variant="bodyBold" style={{ marginBottom: s.xs }}>
								Alerts
							</ThemedText>
							{(stats?.low_stock_count ?? 0) > 0 && (
								<Pressable
									onPress={() => router.push('/(app)/(tabs)/inventory')}
									accessibilityRole="button"
									accessibilityLabel="alert-low-stock"
									style={[layout.rowBetween, { paddingVertical: s.xs }]}
								>
									<View style={layout.row}>
										<AlertTriangle
											size={16}
											color={c.error}
											style={{ marginRight: s.sm }}
										/>
										<ThemedText variant="body">
											{stats?.low_stock_count} items low on stock
										</ThemedText>
									</View>
									<ThemedText variant="caption" color={c.primary}>
										View →
									</ThemedText>
								</Pressable>
							)}
						</View>
					)}

					{/* ── Recent Activity ── */}
					{recentTransactions.length > 0 && (
						<View style={{ marginBottom: s.md }}>
							<SectionHeader
								title="Recent Activity"
								actionLabel="View All"
								onActionPress={() =>
									router.push('/(app)/reports/all-transactions' as never)
								}
								style={{
									marginBottom: s.sm,
									paddingHorizontal: s.md,
									paddingVertical: 0,
								}}
							/>

							<Card style={{ marginHorizontal: s.md }} padding="none">
								{recentTransactions.slice(0, 5).map((tx, idx) => {
									const incoming = isIncoming(tx.type);
									const iconColor = incoming ? c.success : c.error;
									const amountColor = incoming ? c.success : c.error;
									const amountPrefix = incoming ? '+' : '-';
									return (
										<View
											key={tx.id}
											style={[
												layout.rowBetween,
												styles.txRow,
												{
													paddingHorizontal: s.md,
													paddingVertical: s.sm,
													borderBottomWidth:
														idx < recentTransactions.length - 1 &&
														idx < 4
															? StyleSheet.hairlineWidth
															: 0,
													borderBottomColor: c.border,
												},
											]}
											accessibilityLabel={`transaction-${tx.id}`}
										>
											<View style={layout.row}>
												<View
													style={[
														styles.txIconWrap,
														{
															backgroundColor: withOpacity(
																iconColor,
																OPACITY_TINT_LIGHT,
															),
															borderRadius: r.full,
														},
													]}
												>
													{getTransactionIcon(tx.type, iconColor)}
												</View>
												<View style={{ marginLeft: s.sm, flex: 1 }}>
													<ThemedText
														variant="body"
														weight="bold"
														numberOfLines={1}
													>
														{tx.party_name ?? tx.description ?? tx.type}
													</ThemedText>
													{tx.description && tx.party_name ? (
														<ThemedText
															variant="caption"
															color={c.onSurfaceVariant}
															numberOfLines={1}
														>
															{tx.description}
														</ThemedText>
													) : null}
												</View>
											</View>
											<ThemedText variant="bodyBold" color={amountColor}>
												{amountPrefix}
												{formatCurrency(tx.amount)}
											</ThemedText>
										</View>
									);
								})}
							</Card>
						</View>
					)}

					{/* ── Recent Invoices ── */}
					<RecentInvoicesList invoices={recentInvoices} />
				</>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	businessTile: {
		minHeight: SIZE_BUSINESS_TILE_MIN_HEIGHT,
	},
	tileIcon: {
		width: SIZE_FAB_ICON,
		height: SIZE_FAB_ICON,
		alignItems: 'center',
		justifyContent: 'center',
	},
	txRow: {
		alignItems: 'center',
	},
	txIconWrap: {
		width: SIZE_CHIP_HEIGHT,
		height: SIZE_CHIP_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
