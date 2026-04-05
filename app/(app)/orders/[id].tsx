import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { orderService, Order } from '@/src/services/orderService';
import type { InventoryItem } from '@/src/types/inventory';
import { Package, CheckCircle2 } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import logger from '@/src/utils/logger';

export default function OrderDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { c, s, r } = useThemeTokens();
	const { formatDateShort } = useLocale();

	const [order, setOrder] = useState<Order | null>(null);
	const [items, setItems] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			if (!id) return;
			try {
				const orderData = await orderService.fetchOrderById(id);
				const itemsData = await orderService.fetchItemsByOrderId(id);
				setOrder(orderData);
				setItems(itemsData as InventoryItem[]);
			} catch (err: unknown) {
				logger.error('error', err);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [id]);

	if (loading || !order) {
		return (
			<AtomicScreen safeAreaEdges={['top', 'bottom']}>
				<ScreenHeader title="" />
				<View style={{ padding: s.lg, gap: s.md }}>
					<SkeletonBlock width="60%" height={28} />
					<SkeletonBlock width="40%" height={14} />
					<View style={{ marginTop: s.lg, gap: s.sm }}>
						<SkeletonBlock height={48} borderRadius={r.md} />
						<SkeletonBlock height={48} borderRadius={r.md} />
					</View>
					<SkeletonBlock width="40%" height={20} style={{ marginTop: s.lg }} />
					{[0, 1, 2].map((i) => (
						<SkeletonBlock key={i} height={64} borderRadius={r.md} />
					))}
				</View>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title={order.party_name || 'Order Details'} />
			<ScrollView>
				<View style={styles.headerArea}>
					<Package size={48} color={c.primary} style={{ marginBottom: s.md }} />
					<ThemedText variant="h1" align="center">
						{order.party_name || 'Import Name Unknown'}
					</ThemedText>
					<ThemedText
						color={c.onSurfaceVariant}
						align="center"
						style={{ marginTop: s.xs }}
					>
						Imported on {formatDateShort(order.created_at)}
					</ThemedText>
				</View>

				<View style={{ padding: s.lg }}>
					<View
						style={[
							styles.section,
							{
								backgroundColor: c.surface,
								borderRadius: r.md,
								borderColor: c.border,
							},
						]}
					>
						<ThemedText variant="h3" style={{ marginBottom: s.md }}>
							Summary
						</ThemedText>

						<View style={styles.row}>
							<ThemedText color={c.placeholder} style={{ flex: 1 }}>
								Total Box Quantity
							</ThemedText>
							<ThemedText weight="semibold">{order.total_quantity} boxes</ThemedText>
						</View>
						<View style={styles.row}>
							<ThemedText color={c.placeholder} style={{ flex: 1 }}>
								Status
							</ThemedText>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
								<CheckCircle2 size={16} color={c.success} />
								<ThemedText color={c.success} weight="semibold">
									Successfully Restocked
								</ThemedText>
							</View>
						</View>
					</View>

					<ThemedText variant="h3" style={{ marginTop: s.lg, marginBottom: s.md }}>
						Items Processed ({items.length})
					</ThemedText>

					{items.map((item: InventoryItem, index: number) => (
						<View
							key={item.id || index}
							style={[
								styles.itemCard,
								{
									backgroundColor: c.surface,
									borderRadius: r.md,
									borderColor: c.border,
								},
							]}
						>
							<View style={{ flex: 1 }}>
								<ThemedText weight="bold" style={{ fontSize: 16 }}>
									{item.design_name}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									{item.category} {item.size_name ? `• ${item.size_name}` : ''}
								</ThemedText>
							</View>
							<View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
								<ThemedText color={c.primary} variant="h3">
									+{item.box_count}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Stocked
								</ThemedText>
							</View>
						</View>
					))}

					{items.length === 0 && (
						<View style={{ padding: s.lg, alignItems: 'center' }}>
							<ThemedText color={c.placeholder}>
								No individual items were created.
							</ThemedText>
						</View>
					)}
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	headerArea: {
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	section: {
		padding: 16,
		borderWidth: 1,
	},
	row: {
		flexDirection: 'row',
		marginBottom: 12,
	},
	itemCard: {
		flexDirection: 'row',
		padding: 16,
		borderWidth: 1,
		marginBottom: 8,
	},
});
