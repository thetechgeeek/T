import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, RefreshControl } from 'react-native';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { layout } from '@/src/theme/layout';

// Atomic Design Components
import { StatCard } from '@/src/components/molecules/StatCard';
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
} from 'lucide-react-native';

export default function DashboardScreen() {
	const { c, s } = useThemeTokens();
	const { t, formatCurrency } = useLocale();
	const [refreshing, setRefreshing] = React.useState(false);

	const { invoices, fetchInvoices } = useInvoiceStore(
		useShallow((s) => ({ invoices: s.invoices, fetchInvoices: s.fetchInvoices })),
	);
	const { stats, fetchStats } = useDashboardStore(
		useShallow((s) => ({ stats: s.stats, fetchStats: s.fetchStats })),
	);

	React.useEffect(() => {
		fetchStats();
		fetchInvoices(1);
	}, []);

	const quickActions = [
		{
			label: t('dashboard.newInvoice'),
			accessibilityLabel: 'quick-action-new-invoice',
			icon: FileText,
			route: '/(app)/invoices/create',
			color: c.primary,
		},
		{
			label: t('dashboard.scanItem'),
			accessibilityLabel: 'quick-action-scan-item',
			icon: QrCode,
			route: '/(app)/(tabs)/scan',
			color: c.info,
		},
		{
			label: t('dashboard.addStock'),
			accessibilityLabel: 'quick-action-add-stock',
			icon: Package,
			route: '/(app)/inventory/stock-op',
			color: c.success,
		},
		{
			label: t('dashboard.recordPayment'),
			accessibilityLabel: 'quick-action-record-payment',
			icon: CreditCard,
			route: '/(app)/finance/payments',
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
			label: t('dashboard.outstandingCredit'),
			accessibilityLabel: 'stat-outstanding',
			value: formatCurrency(stats?.total_outstanding_credit ?? 0),
			icon: Users,
			color: c.warning,
		},
		{
			label: t('dashboard.lowStock'),
			accessibilityLabel: 'stat-low-stock',
			value: `${stats?.low_stock_count ?? 0} items`,
			icon: AlertTriangle,
			color: c.error,
		},
	];

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
		<Screen
			scrollable
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
			<DashboardHeader businessName="TileMaster" />

			{/* Stats Cards */}
			<View style={[layout.row, { paddingHorizontal: s.md, marginTop: -s.lg }]}>
				{dashboardStats.map((stat, i) => (
					<StatCard
						key={i}
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

			<RecentInvoicesList
				invoices={recentInvoices as Parameters<typeof RecentInvoicesList>[0]['invoices']}
			/>
		</Screen>
	);
}
