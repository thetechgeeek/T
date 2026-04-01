import { View, StyleSheet, RefreshControl } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Stack, useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Wallet, Receipt, ShoppingCart } from 'lucide-react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { StatCard } from '@/src/components/molecules/StatCard';
import { ListItem } from '@/src/components/molecules/ListItem';
import { Divider } from '@/src/components/atoms/Divider';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import React, { useEffect } from 'react';

export default function FinanceOverviewScreen() {
	const { theme } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const router = useRouter();
	const { summary, loading, fetchSummary } = useFinanceStore(
		useShallow((s) => ({
			summary: s.summary,
			loading: s.loading,
			fetchSummary: s.fetchSummary,
		})),
	);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	const metrics = [
		{
			title: 'Gross Profit',
			value: formatCurrency(summary?.gross_profit || 0),
			icon: <TrendingUp size={24} color={theme.colors.success} />,
			color: theme.colors.success,
			accessibilityLabel: 'stat-gross-profit',
		},
		{
			title: 'Net Profit',
			value: formatCurrency(summary?.net_profit || 0),
			icon: <Wallet size={24} color={theme.colors.primary} />,
			color: theme.colors.primary,
			accessibilityLabel: 'stat-net-profit',
		},
		{
			title: 'Total Expenses',
			value: formatCurrency(summary?.total_expenses || 0),
			icon: <TrendingDown size={24} color={theme.colors.error} />,
			color: theme.colors.error,
			accessibilityLabel: 'stat-total-expenses',
		},
	];

	return (
		<AtomicScreen
			scrollable
			scrollViewProps={{
				refreshControl: (
					<RefreshControl
						refreshing={loading}
						onRefresh={fetchSummary}
						tintColor={theme.colors.primary}
					/>
				),
			}}
			contentContainerStyle={styles.scrollContent}
		>
			<Stack.Screen options={{ title: 'Finance Overview' }} />
			<View style={styles.metricsGrid}>
				{metrics.map((m, i) => (
					<Card key={i} style={styles.metricCard} padding="md" variant="elevated">
						<View style={styles.metricHeader} importantForAccessibility="no">
							{m.icon}
						</View>
						<StatCard
							label={m.title}
							value={m.value}
							accessibilityLabel={m.accessibilityLabel}
						/>
					</Card>
				))}
			</View>

			<Divider style={{ marginVertical: 24 }} />

			<ThemedText variant="h3" style={{ marginBottom: 16, paddingLeft: 4 }}>
				Reports & Management
			</ThemedText>

			<View style={styles.section}>
				<ListItem
					title="Expenses"
					subtitle="View and add business expenses"
					accessibilityLabel="menu-expenses"
					accessibilityHint="Double tap to view expenses"
					onPress={() => router.push('/(app)/finance/expenses')}
					leftIcon={
						<Receipt color={theme.colors.primary} importantForAccessibility="no" />
					}
				/>
				<ListItem
					title="Purchases"
					subtitle="Supplier bills and inventory procurement"
					accessibilityLabel="menu-purchases"
					accessibilityHint="Double tap to view purchases"
					onPress={() => router.push('/finance/purchases')}
					leftIcon={
						<ShoppingCart
							color={theme.colors.primary}
							size={24}
							importantForAccessibility="no"
						/>
					}
				/>
				<ListItem
					title="Aging Report"
					subtitle="Outstanding balances from customers"
					accessibilityLabel="menu-aging-report"
					accessibilityHint="Double tap to view aging report"
					onPress={() => router.push('/customers/aging')}
					leftIcon={
						<TrendingDown color={theme.colors.error} importantForAccessibility="no" />
					}
				/>
				<ListItem
					title="Profit & Loss"
					subtitle="Detailed financial performance"
					accessibilityLabel="menu-profit-loss"
					accessibilityHint="Double tap to view profit and loss"
					onPress={() => {}} // TODO
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
	metricCard: {
		marginBottom: 8,
	},
	metricHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	section: {
		gap: 8,
	},
});
