import { View, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'expo-router';
import {
	TrendingUp,
	TrendingDown,
	Wallet,
	Receipt,
	ShoppingCart,
	ArrowDownLeft,
	ArrowUpRight,
} from 'lucide-react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { StatCard } from '@/src/components/molecules/StatCard';
import { ListItem } from '@/src/components/molecules/ListItem';
import { Divider } from '@/src/components/atoms/Divider';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import React, { useEffect, useState } from 'react';

export default function FinanceOverviewScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { formatCurrency, t } = useLocale();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const { summary, fetchSummary } = useFinanceStore(
		useShallow((s) => ({
			summary: s.summary,
			fetchSummary: s.fetchSummary,
		})),
	);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchSummary();
		} finally {
			setRefreshing(false);
		}
	};

	const metrics = [
		{
			title: t('finance.grossProfit'),
			icon: TrendingUp,
			color: theme.colors.success,
			value: formatCurrency(summary?.gross_profit || 0),
			accessibilityLabel: 'stat-gross-profit',
		},
		{
			title: t('finance.netProfit'),
			icon: Wallet,
			color: theme.colors.primary,
			value: formatCurrency(summary?.net_profit || 0),
			accessibilityLabel: 'stat-net-profit',
		},
		{
			title: t('finance.totalExpenses'),
			icon: TrendingDown,
			color: theme.colors.error,
			value: formatCurrency(summary?.total_expenses || 0),
			accessibilityLabel: 'stat-total-expenses',
		},
	];

	return (
		<AtomicScreen
			scrollable
			safeAreaEdges={['bottom']}
			scrollViewProps={{
				refreshControl: (
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={theme.colors.primary}
					/>
				),
			}}
			contentContainerStyle={styles.scrollContent}
		>
			<ScreenHeader title={t('finance.title')} />
			<View style={styles.metricsGrid}>
				{metrics.map((m) => (
					<StatCard
						key={m.title}
						label={m.title}
						value={m.value}
						icon={m.icon}
						color={m.color}
						accessibilityLabel={m.accessibilityLabel}
					/>
				))}
			</View>

			{/* Quick Actions */}
			<View style={styles.quickActions}>
				<Pressable
					style={[styles.quickBtn, { backgroundColor: c.primary, borderRadius: r.md }]}
					onPress={() => router.push('/(app)/finance/payments/receive')}
					accessibilityLabel="receive-payment"
				>
					<ArrowDownLeft size={20} color={c.onPrimary} />
					<ThemedText variant="caption" color={c.onPrimary} style={{ marginTop: 4 }}>
						Receive Payment
					</ThemedText>
				</Pressable>
				<Pressable
					style={[
						styles.quickBtn,
						{ backgroundColor: theme.colors.onSurfaceVariant, borderRadius: r.md },
					]}
					onPress={() => router.push('/(app)/finance/payments/make')}
					accessibilityLabel="make-payment"
				>
					<ArrowUpRight size={20} color={c.onPrimary} />
					<ThemedText variant="caption" color={c.onPrimary} style={{ marginTop: 4 }}>
						Make Payment
					</ThemedText>
				</Pressable>
			</View>

			<Divider style={{ marginVertical: 24 }} />

			<ThemedText variant="h3" style={{ marginBottom: 16, paddingLeft: 4 }}>
				{t('finance.reportsAndManagement')}
			</ThemedText>

			<View style={styles.section}>
				<ListItem
					title={t('finance.expenses')}
					subtitle={t('finance.viewExpenses')}
					accessibilityLabel="menu-expenses"
					accessibilityHint={t('finance.viewExpenses')}
					onPress={() => router.push('/(app)/finance/expenses')}
					leftIcon={
						<Receipt
							size={24}
							color={theme.colors.primary}
							importantForAccessibility="no"
						/>
					}
				/>
				<ListItem
					title={t('finance.purchases')}
					subtitle={t('finance.viewPurchases')}
					accessibilityLabel="menu-purchases"
					accessibilityHint={t('finance.viewPurchases')}
					onPress={() => router.push('/(app)/finance/purchases')}
					leftIcon={
						<ShoppingCart
							color={theme.colors.primary}
							size={24}
							importantForAccessibility="no"
						/>
					}
				/>
				<ListItem
					title={t('customer.agingReport')}
					subtitle={t('customer.outstanding')}
					accessibilityLabel="menu-aging-report"
					accessibilityHint={t('finance.viewAging')}
					onPress={() => router.push('/(app)/customers/aging')}
					leftIcon={
						<TrendingDown
							size={24}
							color={theme.colors.error}
							importantForAccessibility="no"
						/>
					}
				/>
				<ListItem
					title={t('finance.profitLoss')}
					subtitle={t('finance.viewProfitLoss')}
					accessibilityLabel="menu-profit-loss"
					accessibilityHint={t('finance.viewProfitLoss')}
					onPress={() => router.push('/(app)/finance/profit-loss')}
					leftIcon={
						<TrendingUp color={theme.colors.success} importantForAccessibility="no" />
					}
				/>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		padding: 16,
	},
	metricsGrid: {
		gap: 16,
	},
	quickActions: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 20,
	},
	quickBtn: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
	},
	section: {
		gap: 8,
	},
});
