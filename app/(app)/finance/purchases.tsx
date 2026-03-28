import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, User } from 'lucide-react-native';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function PurchasesScreen() {
	const { theme } = useTheme();
	const { formatCurrency, formatDate } = useLocale();
	const { purchases, loading, fetchPurchases } = useFinanceStore();

	useEffect(() => {
		fetchPurchases().catch((e) => {
			Alert.alert('Error', 'Failed to load purchases. ' + e.message, [{ text: 'OK' }]);
		});
	}, []);

	return (
		<Screen safeAreaEdges={['top', 'bottom']}>
			<Stack.Screen options={{ title: 'Purchases' }} />

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPurchases} />}
			>
				{purchases.length === 0 && !loading ? (
					<EmptyState
						title="No purchases found"
						description="Track your supplier bills here"
					/>
				) : (
					purchases.map((p) => (
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
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
									>
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
					))
				)}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { padding: 16 },
	purchaseCard: { marginBottom: 16 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	supplierInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	supplierName: { fontSize: 16 },
	details: { marginBottom: 12 },
	detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	detailText: { fontSize: 13 },
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
		paddingTop: 12,
	},
	totalLabel: { fontSize: 14 },
	totalValue: { fontSize: 18 },
});
