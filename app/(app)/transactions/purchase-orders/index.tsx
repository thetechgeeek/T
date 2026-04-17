import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Plus, ShoppingCart } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	MOCK_PURCHASE_ORDERS,
	type PurchaseOrder,
	type POStatus,
} from '@/src/mocks/transactions/purchaseOrders';
import { FAB_SHADOW } from '@/theme/shadowMetrics';
import {
	FAB_OFFSET_BOTTOM,
	FAB_OFFSET_RIGHT,
	OPACITY_BADGE_BG,
	RADIUS_FAB,
	SIZE_FAB,
	SIZE_ICON_CIRCLE_MD,
} from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { withOpacity } from '@/src/utils/color';

const MOCK_POS = MOCK_PURCHASE_ORDERS;
const PURCHASE_ORDER_LIST_BOTTOM_PADDING = SPACING_PX['4xl'] + SPACING_PX.md + SPACING_PX.xs;

const STATUS_FILTERS: { label: string; value: POStatus | 'all' }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Open', value: 'open' },
	{ label: 'Partial', value: 'partial' },
	{ label: 'Received', value: 'received' },
	{ label: 'Cancelled', value: 'cancelled' },
];

export default function PurchaseOrdersScreen() {
	const { c, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [filter, setFilter] = useState<POStatus | 'all'>('all');

	const filtered = filter === 'all' ? MOCK_POS : MOCK_POS.filter((p) => p.status === filter);

	const renderItem = ({ item }: { item: PurchaseOrder }) => (
		<Pressable
			style={[styles.row, { borderBottomColor: c.border }]}
			onPress={() =>
				Alert.alert(
					item.po_number,
					`Supplier: ${item.supplier_name}\nExpected: ${formatDate(item.expected_date)}\nValue: ${formatCurrency(item.total_value)}`,
					[
						{
							text: 'Receive Against PO',
							onPress: () => Alert.alert('Coming Soon', 'PO receipt flow'),
						},
						{ text: 'Cancel', style: 'cancel' },
					],
				)
			}
		>
			<View
				style={[
					styles.iconCircle,
					{ backgroundColor: withOpacity(c.primary, OPACITY_BADGE_BG) },
				]}
			>
				<ShoppingCart size={20} color={c.primary} />
			</View>
			<View style={{ flex: 1 }}>
				<View style={styles.rowTop}>
					<ThemedText variant="bodyBold">{item.po_number}</ThemedText>
					<ThemedText variant="amount" color={c.primary}>
						{formatCurrency(item.total_value)}
					</ThemedText>
				</View>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{item.supplier_name}
				</ThemedText>
				<View style={[styles.rowBottom, { marginTop: SPACING_PX.xs }]}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Expected: {formatDate(item.expected_date)}
					</ThemedText>
					<Badge
						label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
						variant={
							item.status === 'received'
								? 'success'
								: item.status === 'open'
									? 'primary'
									: item.status === 'partial'
										? 'warning'
										: 'neutral'
						}
					/>
				</View>
				{item.status === 'partial' && (
					<View
						style={[
							styles.progressBar,
							{
								backgroundColor: c.surfaceVariant,
								borderRadius: SPACING_PX.xs,
								marginTop: SPACING_PX.sm - SPACING_PX.xxs,
							},
						]}
					>
						<View
							style={[
								styles.progressFill,
								{
									width: `${item.received_pct}%` as `${number}%`,
									backgroundColor: c.primary,
									borderRadius: SPACING_PX.xs,
								},
							]}
						/>
					</View>
				)}
			</View>
		</Pressable>
	);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Purchase Orders" />

			{/* Filter chips */}
			<View style={[styles.filterRow, { borderBottomColor: c.border }]}>
				{STATUS_FILTERS.map((f) => (
					<Pressable
						key={f.value}
						onPress={() => setFilter(f.value)}
						style={[
							styles.chip,
							{
								borderColor: filter === f.value ? c.primary : c.border,
								backgroundColor: filter === f.value ? c.primary : c.surface,
								borderRadius: r.full,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={filter === f.value ? c.onPrimary : c.onSurface}
						>
							{f.label}
						</ThemedText>
					</Pressable>
				))}
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(i) => i.id}
				renderItem={renderItem}
				contentContainerStyle={{
					paddingBottom: PURCHASE_ORDER_LIST_BOTTOM_PADDING + insets.bottom,
				}}
				ListEmptyComponent={
					<View style={styles.empty}>
						<ShoppingCart size={48} color={c.border} />
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ marginTop: SPACING_PX.md, textAlign: 'center' }}
						>
							No purchase orders yet.{'\n'}Create a PO to send to your supplier.
						</ThemedText>
					</View>
				}
			/>

			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						bottom: FAB_OFFSET_BOTTOM + insets.bottom,
						right: FAB_OFFSET_RIGHT,
						shadowColor: c.shadow,
					},
				]}
				onPress={() => router.push('/(app)/transactions/purchase-orders/create' as Href)}
			>
				<Plus color="white" size={28} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterRow: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		padding: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
		borderWidth: 1,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: SPACING_PX.lg,
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: SPACING_PX.md,
	},
	iconCircle: {
		width: SIZE_ICON_CIRCLE_MD,
		height: SIZE_ICON_CIRCLE_MD,
		borderRadius: SIZE_ICON_CIRCLE_MD / 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: SPACING_PX.xxs,
	},
	rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	progressBar: { height: SPACING_PX.xs, width: '100%' },
	progressFill: { height: SPACING_PX.xs },
	empty: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: PURCHASE_ORDER_LIST_BOTTOM_PADDING,
	},
	fab: {
		position: 'absolute',
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: SPACING_PX.xs,
		shadowOffset: { width: 0, height: SPACING_PX.xxs },
		...FAB_SHADOW,
	},
});
