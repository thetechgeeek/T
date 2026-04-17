import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet } from 'react-native';

import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/design-system/components/atoms/Card';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { EmptyState } from '@/src/design-system/components/molecules/EmptyState';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export default function AgingReportScreen() {
	const { c: colors, s } = useThemeTokens();
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
			contentContainerStyle={{ padding: s.lg }}
			safeAreaEdges={['bottom']}
			header={<ScreenHeader title={t('customer.agingReport')} />}
		>
			<View style={{ marginBottom: s.xl }}>
				<Card padding="lg" variant="elevated">
					<ThemedText
						variant="caption"
						color={colors.onSurfaceVariant}
						style={{ marginBottom: s.xs }}
					>
						{t('customer.totalOutstanding')}
					</ThemedText>
					<ThemedText variant="display" color={colors.error}>
						{formatCurrency(
							agingData.reduce((acc, curr) => acc + (curr.current_balance || 0), 0),
						)}
					</ThemedText>
				</Card>
			</View>

			<ThemedText variant="h3" style={{ marginBottom: s.lg }}>
				{t('customer.customerBreakup')}
			</ThemedText>

			{agingData.length === 0 ? (
				<EmptyState title={t('customer.noOutstandingBalances')} />
			) : (
				agingData.map((customer) => (
					<Card key={customer.id} style={{ marginBottom: s.md }} padding="md">
						<View style={styles.row}>
							<View style={{ flex: 1 }}>
								<ThemedText variant="body" weight="semibold">
									{customer.name}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={colors.onSurfaceVariant}
									style={{ marginTop: s.xxs }}
								>
									{customer.type.toUpperCase()}
								</ThemedText>
							</View>
							<View style={{ alignItems: 'flex-end' }}>
								<ThemedText variant="bodyBold" color={colors.error}>
									{formatCurrency(customer.current_balance || 0)}
								</ThemedText>
								<Badge
									label={t('invoice.balance')}
									variant="error"
									style={{ marginTop: s.xs }}
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
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
