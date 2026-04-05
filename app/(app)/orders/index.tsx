import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, FileText } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useOrderStore } from '@/src/stores/orderStore';
import { Button } from '@/src/components/atoms/Button';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { OrderListSkeleton } from '@/src/components/molecules/skeletons/OrderListSkeleton';

export default function OrdersListScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatDateShort } = useLocale();
	const router = useRouter();

	const { orders, loading, fetchOrders } = useOrderStore(
		useShallow((s) => ({ orders: s.orders, loading: s.loading, fetchOrders: s.fetchOrders })),
	);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchOrders();
		setRefreshing(false);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader
				title="Purchase Orders"
				rightElement={
					<Button
						title="Import PDF"
						accessibilityLabel="import-pdf-button"
						accessibilityHint="Import a supplier PDF to create a purchase order"
						size="sm"
						leftIcon={
							<Plus size={16} color={c.onPrimary} importantForAccessibility="no" />
						}
						onPress={() => router.push('/(app)/orders/import')}
					/>
				}
			/>

			{loading && orders.length === 0 ? (
				<OrderListSkeleton />
			) : orders.length === 0 ? (
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						padding: s.xl,
					}}
				>
					<FileText size={64} color={c.placeholder} style={{ marginBottom: s.lg }} />
					<ThemedText variant="h3" style={{ marginBottom: 8 }}>
						No Orders Yet
					</ThemedText>
					<ThemedText color={c.placeholder} align="center" style={{ marginBottom: s.xl }}>
						Import a supplier performa invoice (PDF or Image) to automatically extract
						items and restock inventory using AI.
					</ThemedText>
					<Button
						title="Import First Order"
						accessibilityLabel="import-first-order-button"
						onPress={() => router.push('/(app)/orders/import')}
					/>
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(o) => o.id}
					contentContainerStyle={{ padding: s.md }}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={c.primary}
						/>
					}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[
								styles.card,
								{
									backgroundColor: c.surface,
									borderRadius: r.md,
									borderColor: c.border,
								},
							]}
							onPress={() => router.push(`/(app)/orders/${item.id}`)}
							activeOpacity={0.7}
							accessibilityRole="button"
							accessibilityLabel={`order-${item.id}`}
							accessibilityHint={`${item.party_name || 'Unknown Supplier'}, double tap to open`}
						>
							<View style={{ flex: 1 }}>
								<ThemedText weight="bold" style={{ fontSize: 16 }}>
									{item.party_name || 'Unknown Supplier'}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									{formatDateShort(item.created_at)} • {item.total_quantity} items
									imported
								</ThemedText>
							</View>
							<View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
								<View style={[styles.badge, { backgroundColor: c.success + '15' }]}>
									<ThemedText
										color={c.success}
										weight="semibold"
										style={{ fontSize: 12 }}
									>
										Imported
									</ThemedText>
								</View>
								<ChevronRight
									size={20}
									color={c.placeholder}
									style={{ marginTop: 8 }}
									importantForAccessibility="no"
								/>
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
});
