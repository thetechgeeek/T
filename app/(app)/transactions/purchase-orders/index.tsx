import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Plus, ShoppingCart } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Badge } from '@/src/components/atoms/Badge';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type POStatus = 'open' | 'partial' | 'received' | 'cancelled';

interface PurchaseOrder {
	id: string;
	po_number: string;
	supplier_name: string;
	date: string;
	expected_date: string;
	total_value: number;
	received_pct: number;
	status: POStatus;
}

const MOCK_POS: PurchaseOrder[] = [
	{
		id: '1',
		po_number: 'PO-001',
		supplier_name: 'Kajaria Ceramics',
		date: '2025-04-08',
		expected_date: '2025-04-15',
		total_value: 250000,
		received_pct: 0,
		status: 'open',
	},
	{
		id: '2',
		po_number: 'PO-002',
		supplier_name: 'Somany Tiles',
		date: '2025-04-05',
		expected_date: '2025-04-20',
		total_value: 180000,
		received_pct: 60,
		status: 'partial',
	},
];

const STATUS_FILTERS: { label: string; value: POStatus | 'all' }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Open', value: 'open' },
	{ label: 'Partial', value: 'partial' },
	{ label: 'Received', value: 'received' },
	{ label: 'Cancelled', value: 'cancelled' },
];

function statusColor(
	s: POStatus,
	c: { success: string; primary: string; border: string; onSurfaceVariant: string },
) {
	if (s === 'received') return c.success;
	if (s === 'open') return c.primary;
	if (s === 'partial') return '#B45309';
	return c.onSurfaceVariant;
}

export default function PurchaseOrdersScreen() {
	const { c, s, r } = useThemeTokens();
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
			<View style={[styles.iconCircle, { backgroundColor: c.primary + '20' }]}>
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
				<View style={[styles.rowBottom, { marginTop: 4 }]}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Expected: {formatDate(item.expected_date)}
					</ThemedText>
					<Badge
						label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
						color={statusColor(item.status, c)}
					/>
				</View>
				{item.status === 'partial' && (
					<View
						style={[
							styles.progressBar,
							{ backgroundColor: c.surfaceVariant, borderRadius: 3, marginTop: 6 },
						]}
					>
						<View
							style={[
								styles.progressFill,
								{
									width: `${item.received_pct}%` as any,
									backgroundColor: c.primary,
									borderRadius: 3,
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
							color={filter === f.value ? '#FFF' : c.onSurface}
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
				contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
				ListEmptyComponent={
					<View style={styles.empty}>
						<ShoppingCart size={48} color={c.border} />
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ marginTop: 12, textAlign: 'center' }}
						>
							No purchase orders yet.{'\n'}Create a PO to send to your supplier.
						</ThemedText>
					</View>
				}
			/>

			<Pressable
				style={[styles.fab, { backgroundColor: c.primary, bottom: 32 + insets.bottom }]}
				onPress={() => router.push('/(app)/transactions/purchase-orders/create')}
			>
				<Plus color="white" size={28} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		padding: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: 12,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	progressBar: { height: 4, width: '100%' },
	progressFill: { height: 4 },
	empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
});
