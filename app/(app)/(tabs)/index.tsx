import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, RefreshControl, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { layout } from '@/src/theme/layout';
import { ThemedText } from '@/src/components/atoms/ThemedText';

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
	QrCode,
	Package,
	CreditCard,
	ShoppingCart,
	ArrowDownCircle,
} from 'lucide-react-native';

export default function DashboardScreen() {
	const { c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();
	const router = useRouter();
	const [refreshing, setRefreshing] = React.useState(false);

	const { invoices, fetchInvoices } = useInvoiceStore(
		useShallow((s) => ({ invoices: s.invoices, fetchInvoices: s.fetchInvoices })),
	);
	const { stats, loading, fetchStats } = useDashboardStore(
		useShallow((s) => ({ stats: s.stats, loading: s.loading, fetchStats: s.fetchStats })),
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
			<DashboardHeader businessName={t('branding.appName')} />

			{loading && stats === null ? (
				<DashboardSkeleton />
			) : (
				<>
					{/* Stats Cards */}
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

					<QuickActionsGrid
						actions={quickActions as Parameters<typeof QuickActionsGrid>[0]['actions']}
					/>

					{/* Alerts section — shown only when alerts exist */}
					{hasAlerts && (
						<View
							style={{
								marginHorizontal: s.md,
								marginBottom: s.md,
								padding: s.md,
								backgroundColor: '#FEF3C7',
								borderRadius: r.md,
								borderLeftWidth: 4,
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

					<RecentInvoicesList
						invoices={
							recentInvoices as Parameters<typeof RecentInvoicesList>[0]['invoices']
						}
					/>
				</>
			)}
		</AtomicScreen>
	);
}
