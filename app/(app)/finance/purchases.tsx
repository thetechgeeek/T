import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, User } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import type { Purchase } from '@/src/types/finance';

export default function PurchasesScreen() {
	const { theme } = useThemeTokens();
	const { t, formatCurrency, formatDate } = useLocale();
	const { purchases, loading, fetchPurchases } = useFinanceStore(
		useShallow((s) => ({
			purchases: s.purchases,
			loading: s.loading,
			fetchPurchases: s.fetchPurchases,
		})),
	);

	useEffect(() => {
		fetchPurchases().catch((_e) => {
			Alert.alert(t('common.errorTitle'), t('finance.loadPurchasesError'), [
				{ text: t('common.ok') },
			]);
		});
	}, [fetchPurchases, t]);

	return (
		<AtomicScreen safeAreaEdges={['top', 'bottom']}>
			<Stack.Screen options={{ title: 'Purchases' }} />

			<FlashList
				data={purchases}
				estimatedItemSize={130}
				keyExtractor={(item: Purchase) => item.id}
				contentContainerStyle={styles.scrollContent}
				refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPurchases} />}
				ListEmptyComponent={
					!loading ? (
						<EmptyState
							title="No purchases found"
							description="Track your supplier bills here"
						/>
					) : null
				}
				renderItem={({ item: p }: { item: Purchase }) => (
					<Card key={p.id} style={styles.purchaseCard} padding="md">
						<View style={styles.header}>
							<View style={styles.supplierInfo}>
								<User size={16} color={theme.colors.primary} />
								<ThemedText weight="bold" style={{ fontSize: 16 }}>
									{p.supplier_name || 'Generic Supplier'}
								</ThemedText>
							</View>
							<Badge
								label={p.payment_status.toUpperCase()}
								variant={p.payment_status === 'paid' ? 'success' : 'warning'}
							/>
						</View>

						<View style={styles.details}>
							<View style={styles.detailItem}>
								<Calendar size={14} color={theme.colors.onSurfaceVariant} />
								<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
									{formatDate(p.purchase_date)}
								</ThemedText>
							</View>
						</View>

						<View style={styles.footer}>
							<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
								Total Amount
							</ThemedText>
							<ThemedText weight="bold" style={{ fontSize: 18 }}>
								{formatCurrency(p.grand_total)}
							</ThemedText>
						</View>
					</Card>
				)}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: { padding: 16 },
	purchaseCard: { marginBottom: 16 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	supplierInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	details: { marginBottom: 12 },
	detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
		paddingTop: 12,
	},
});
