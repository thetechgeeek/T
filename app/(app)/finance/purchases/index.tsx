import { FAB_OFFSET_BOTTOM, FAB_OFFSET_RIGHT, RADIUS_FAB, SIZE_FAB } from '@/theme/uiMetrics';
import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, RefreshControl, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Calendar, User, Plus } from 'lucide-react-native';
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
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export default function PurchasesScreen() {
	const { theme, c, r } = useThemeTokens();
	const { t, formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const { purchases, loading, fetchPurchases } = useFinanceStore(
		useShallow((s) => ({
			purchases: s.purchases,
			loading: s.loading,
			fetchPurchases: s.fetchPurchases,
		})),
	);

	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		fetchPurchases().catch((e: unknown) => {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('finance.loadPurchasesError'),
				[{ text: t('common.ok') }],
			);
		});
	}, [fetchPurchases, t]);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchPurchases();
		} finally {
			setRefreshing(false);
		}
	};

	const totalPurchases = purchases.reduce(
		(sum: number, p: Purchase) => sum + (p.grand_total ?? 0),
		0,
	);
	const totalPaid = purchases.reduce((sum: number, p: Purchase) => sum + (p.amount_paid ?? 0), 0);
	const totalToPay = totalPurchases - totalPaid;

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title={t('finance.purchases')} />

			{/* Summary Card */}
			<Card padding="sm" style={styles.summaryCard}>
				<View style={styles.summaryRow}>
					<View style={styles.summaryItem}>
						<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
							Total
						</ThemedText>
						<ThemedText variant="bodyBold">{formatCurrency(totalPurchases)}</ThemedText>
					</View>
					<View style={styles.summaryItem}>
						<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
							Paid
						</ThemedText>
						<ThemedText variant="bodyBold" color={theme.colors.success}>
							{formatCurrency(totalPaid)}
						</ThemedText>
					</View>
					<View style={styles.summaryItem}>
						<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
							To Pay
						</ThemedText>
						<ThemedText variant="bodyBold" color={theme.colors.error}>
							{formatCurrency(totalToPay)}
						</ThemedText>
					</View>
				</View>
			</Card>

			<FlashList
				data={purchases}
				estimatedItemSize={130}
				keyExtractor={(item: Purchase) => item.id}
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				ListEmptyComponent={
					!loading ? <EmptyState title={t('finance.noPurchases')} /> : null
				}
				renderItem={({ item: p }: { item: Purchase }) => (
					<Card key={p.id} style={styles.purchaseCard} padding="md">
						<View style={styles.header}>
							<View style={styles.supplierInfo}>
								<User size={16} color={theme.colors.primary} />
								<ThemedText variant="body" weight="bold">
									{p.supplier_name || t('supplier.title')}
								</ThemedText>
							</View>
							<Badge
								label={t(`invoice.${p.payment_status}`).toUpperCase()}
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

						<View style={[styles.footer, { borderTopColor: c.border }]}>
							<ThemedText variant="caption" color={theme.colors.onSurfaceVariant}>
								{t('invoice.total')}
							</ThemedText>
							<ThemedText variant="h3" weight="bold">
								{formatCurrency(p.grand_total)}
							</ThemedText>
						</View>
					</Card>
				)}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: theme.colors.primary,
						borderRadius: r.full,
						...(theme.shadows.lg as object),
					},
				]}
				onPress={() => router.push('/(app)/finance/purchases/create' as Href)}
				accessibilityLabel="New purchase bill"
			>
				<Plus size={28} color={theme.colors.onPrimary} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: { padding: SPACING_PX.lg },
	purchaseCard: { marginBottom: SPACING_PX.lg },
	summaryCard: { marginHorizontal: SPACING_PX.lg, marginTop: SPACING_PX.md },
	summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
	summaryItem: { alignItems: 'center', flex: 1 },
	fab: {
		position: 'absolute',
		bottom: FAB_OFFSET_BOTTOM + SPACING_PX.md,
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		width: SIZE_FAB,
		height: SIZE_FAB,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: RADIUS_FAB,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING_PX.md,
	},
	supplierInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING_PX.sm },
	details: { marginBottom: SPACING_PX.md },
	detailItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING_PX.xs },
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		paddingTop: SPACING_PX.md,
	},
});
