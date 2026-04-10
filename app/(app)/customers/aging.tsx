import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet } from 'react-native';

import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function AgingReportScreen() {
	const { theme } = useThemeTokens();
	const { formatCurrency, t } = useLocale();
	const { customers, fetchCustomers } = useCustomerStore(
		useShallow((s) => ({
			customers: s.customers,
			fetchCustomers: s.fetchCustomers,
		})),
	);

	useEffect(() => {
		fetchCustomers();
	}, [fetchCustomers]);

	// Simple aging logic: just group by balance for now as a placeholder for real date-based aging
	const agingData = customers
		.filter((c) => (c.current_balance || 0) > 0)
		.sort((a, b) => (b.current_balance || 0) - (a.current_balance || 0));

	return (
		<AtomicScreen
			scrollable
			contentContainerStyle={styles.scrollContent}
			safeAreaEdges={['bottom']}
		>
			<ScreenHeader title={t('customer.agingReport')} />
			<View style={styles.summaryCard}>
				<Card padding="lg" variant="elevated">
					<ThemedText
						variant="caption"
						color={theme.colors.onSurfaceVariant}
						style={{ marginBottom: 4 }}
					>
						{t('customer.totalOutstanding')}
					</ThemedText>
					<ThemedText variant="h1" color={theme.colors.error} style={{ fontSize: 32 }}>
						{formatCurrency(
							agingData.reduce((acc, curr) => acc + (curr.current_balance || 0), 0),
						)}
					</ThemedText>
				</Card>
			</View>

			<ThemedText variant="h3" style={{ marginBottom: 16 }}>
				{t('customer.customerBreakup')}
			</ThemedText>

			{agingData.length === 0 ? (
				<EmptyState title={t('customer.noOutstandingBalances')} />
			) : (
				agingData.map((c) => (
					<Card key={c.id} style={styles.customerCard} padding="md">
						<View style={styles.row}>
							<View style={{ flex: 1 }}>
								<ThemedText weight="semibold" style={{ fontSize: 16 }}>
									{c.name}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={theme.colors.onSurfaceVariant}
									style={{ marginTop: 2 }}
								>
									{c.type.toUpperCase()}
								</ThemedText>
							</View>
							<View style={{ alignItems: 'flex-end' }}>
								<ThemedText
									weight="bold"
									color={theme.colors.error}
									style={{ fontSize: 16 }}
								>
									{formatCurrency(c.current_balance || 0)}
								</ThemedText>
								<Badge
									label={t('invoice.balance')}
									variant="error"
									style={{ marginTop: 4 }}
								/>
							</View>
						</View>
					</Card>
				))
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: { padding: 16 },
	summaryCard: { marginBottom: 24 },
	customerCard: { marginBottom: 12 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
