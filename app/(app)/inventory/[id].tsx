import React, { useCallback, useState } from 'react';
import {
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	Modal,
	TextInput as RNTextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Package, Edit, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { inventoryService } from '@/src/services/inventoryService';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { withOpacity } from '@/src/utils/color';
import { supabase } from '@/src/config/supabase';
import { layout } from '@/src/theme/layout';
import { itemPartyRateService } from '@/src/services/itemPartyRateService';
import type { UUID } from '@/src/types/common';
import type { InventoryItem, StockOperation, ItemPartyRate } from '@/src/types/inventory';
import {
	OPACITY_ROW_HIGHLIGHT,
	OPACITY_SKELETON_BASE,
	OVERLAY_COLOR_STRONG,
} from '@/theme/uiMetrics';
import logger from '@/src/utils/logger';

type ItemPartyRateRow = ItemPartyRate & {
	customers?: { name: string };
	suppliers?: { name: string };
};

const SPEC_BOX_HALF_WIDTH = '50%' as const;

export default function ItemDetailScreen() {
	const { theme, c, s, r, typo } = useThemeTokens();
	const { formatCurrency, formatDateShort, t } = useLocale();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: UUID }>();
	const actionPaddingVertical = s.md + s.xxs;
	const modalOverlayPadding = s.lg + s.xs;
	const partyItemPadding = s.sm + s.xxs;
	const specBoxPadding = s.sm - s.xxs;

	const [item, setItem] = useState<InventoryItem | null>(null);
	const [history, setHistory] = useState<StockOperation[]>([]);
	const [partyRates, setPartyRates] = useState<ItemPartyRateRow[]>([]);
	const [loading, setLoading] = useState(true);

	// Add Rate Modal State
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [parties, setParties] = useState<
		{ id: string; name: string; type: 'customer' | 'supplier' }[]
	>([]);
	const [selectedParty, setSelectedParty] = useState<string | null>(null);
	const [customRate, setCustomRate] = useState('');
	const [partySearch, setPartySearch] = useState('');
	const filteredParties = parties.filter((party) =>
		party.name.toLowerCase().includes(partySearch.toLowerCase()),
	);

	// Re-fetch every time screen comes into focus so stock counts are fresh after stock ops.
	// Only show full-screen loading on first load (item is null); subsequent focus re-fetches
	// update silently in the background to avoid blanking the screen.
	useFocusEffect(
		useCallback(() => {
			if (!id) return;
			let isMounted = true;
			const isFirstLoad = item === null;
			if (isFirstLoad) setLoading(true);
			const fetchAll = async () => {
				try {
					const [itemData, historyData, ratesData] = await Promise.all([
						inventoryService.fetchItemById(id),
						inventoryService.fetchStockHistory(id),
						itemPartyRateService.fetchByItem(id),
					]);
					if (isMounted) {
						setItem(itemData);
						setHistory(historyData);
						setPartyRates(ratesData || []);
					}
				} catch (err) {
					logger.error('Failed to load item detail', err);
				} finally {
					if (isMounted) setLoading(false);
				}
			};
			fetchAll();
			return () => {
				isMounted = false;
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [id]),
	);

	const fetchParties = async () => {
		try {
			const [custRes, suppRes] = await Promise.all([
				supabase.from('customers').select('id, name').order('name'),
				supabase.from('suppliers').select('id, name').order('name'),
			]);

			const combined: { id: string; name: string; type: 'customer' | 'supplier' }[] = [
				...(custRes.data?.map((c) => ({
					id: c.id,
					name: c.name,
					type: 'customer' as const,
				})) || []),
				...(suppRes.data?.map((s) => ({
					id: s.id,
					name: s.name,
					type: 'supplier' as const,
				})) || []),
			];
			setParties(combined);
		} catch (err) {
			logger.error('Failed to fetch parties', err);
		}
	};

	const handleAddRate = async () => {
		if (!selectedParty || !customRate) {
			Alert.alert('Error', 'Please select a party and enter a rate');
			return;
		}

		const party = parties.find((p) => p.id === selectedParty);
		if (!party) return;

		try {
			await itemPartyRateService.upsertRate({
				item_id: id as UUID,
				customer_id: party.type === 'customer' ? (party.id as UUID) : undefined,
				supplier_id: party.type === 'supplier' ? (party.id as UUID) : undefined,
				custom_rate: parseFloat(customRate),
			});

			setIsModalVisible(false);
			setSelectedParty(null);
			setCustomRate('');

			// Refresh rates
			const ratesData = await itemPartyRateService.fetchByItem(id as UUID);
			setPartyRates(ratesData || []);
			Alert.alert('Success', 'Special rate added');
		} catch {
			Alert.alert('Error', 'Failed to add rate');
		}
	};

	if (loading) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="" />
				<View style={{ padding: s.lg, gap: s.md }}>
					<SkeletonBlock height={120} borderRadius={r.lg} />
					<SkeletonBlock height={60} borderRadius={r.md} />
					<SkeletonBlock height={60} borderRadius={r.md} />
					<SkeletonBlock width="50%" height={20} style={{ marginTop: s.sm }} />
					<SkeletonBlock height={80} borderRadius={r.md} />
				</View>
			</AtomicScreen>
		);
	}

	if (!item) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']}>
				<ScreenHeader title="" />
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<HelpCircle size={48} color={c.placeholder} strokeWidth={1} />
					<ThemedText style={{ marginTop: s.lg }}>
						{t('inventory.itemNotFound')}
					</ThemedText>
				</View>
			</AtomicScreen>
		);
	}

	const isLowStock = item.box_count <= item.low_stock_threshold;

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={
				<ScreenHeader
					title={item.design_name}
					rightElement={
						<TouchableOpacity
							style={{ padding: s.xs }}
							onPress={() => router.push(`/(app)/inventory/add?id=${item.id}`)}
						>
							<Edit size={22} color={c.primary} strokeWidth={2} />
						</TouchableOpacity>
					}
				/>
			}
			contentContainerStyle={{ padding: s.lg }}
		>
			{/* Image Card */}
			<View
				style={[
					{
						padding: s.xs,
						backgroundColor: c.surface,
						borderRadius: r.lg,
						...(theme.shadows?.sm || {}),
					},
				]}
			>
				{item.tile_image_url ? (
					<Image
						source={{ uri: item.tile_image_url }}
						style={{ width: '100%', aspectRatio: 1, borderRadius: r.lg }}
						contentFit="cover"
					/>
				) : (
					<View
						style={{
							width: '100%',
							aspectRatio: 1,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: c.surfaceVariant,
							borderRadius: r.lg,
						}}
					>
						<Package size={64} color={c.placeholder} strokeWidth={1} />
					</View>
				)}
			</View>

			{/* Specs Grid */}
			<View
				style={[
					layout.row,
					{
						flexWrap: 'wrap',
						marginTop: s.lg,
						marginHorizontal: -specBoxPadding,
					},
				]}
			>
				<SpecBox label={t('inventory.addItem')} value={item.base_item_number} />
				<SpecBox
					label={t('inventory.category')}
					value={t(`inventory.categories.${(item.category || 'OTHER').toLowerCase()}`)}
				/>
				<SpecBox label={t('inventory.size')} value={item.size_name || t('common.na')} />
				<SpecBox label={t('inventory.grade')} value={item.grade || t('common.na')} />
				<SpecBox
					label={t('inventory.pcsPerBox')}
					value={item.pcs_per_box?.toString() || t('common.na')}
				/>
				<SpecBox
					label={t('inventory.sqftPerBox')}
					value={item.sqft_per_box?.toString() || t('common.na')}
				/>
				<SpecBox
					label={t('inventory.sellingPrice')}
					value={formatCurrency(item.selling_price)}
					highlight
				/>
			</View>

			{/* Stock Status */}
			<View
				style={[
					{
						padding: s.lg,
						backgroundColor: isLowStock
							? c.errorLight
							: withOpacity(c.success, OPACITY_SKELETON_BASE),
						borderRadius: r.md,
						marginTop: s.xl,
						borderColor: isLowStock ? c.error : c.success,
						borderWidth: 1,
					},
				]}
			>
				<ThemedText variant="h3" color={isLowStock ? c.error : c.success}>
					{t('inventory.stockStatus', { count: item.box_count })}
				</ThemedText>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginTop: s.xxs }}
				>
					{t('inventory.thresholdStatus', { count: item.low_stock_threshold })}
				</ThemedText>
			</View>

			{/* Quick Actions */}
			<View style={[layout.row, { marginTop: s.md, gap: s.md }]}>
				<TouchableOpacity
					style={[
						layout.row,
						{
							flex: 1,
							paddingVertical: actionPaddingVertical,
							backgroundColor: c.surfaceVariant,
							borderRadius: r.md,
						},
					]}
					onPress={() =>
						router.push(`/(app)/inventory/stock-op?id=${item.id}&type=stock_in`)
					}
				>
					<ArrowDownRight size={20} color={c.success} strokeWidth={2.5} />
					<ThemedText weight="semibold" style={{ marginLeft: s.sm }}>
						{t('inventory.stockIn')}
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						layout.row,
						{
							flex: 1,
							paddingVertical: actionPaddingVertical,
							backgroundColor: c.surfaceVariant,
							borderRadius: r.md,
						},
					]}
					onPress={() =>
						router.push(`/(app)/inventory/stock-op?id=${item.id}&type=stock_out`)
					}
				>
					<ArrowUpRight size={20} color={c.error} strokeWidth={2.5} />
					<ThemedText weight="semibold" style={{ marginLeft: s.sm }}>
						{t('inventory.stockOut')}
					</ThemedText>
				</TouchableOpacity>
			</View>

			{/* Party-wise Special Rates */}
			<View style={{ marginTop: s.xl }}>
				<View style={[layout.rowBetween, { marginBottom: s.md }]}>
					<ThemedText variant="h3">Special Party Rates</ThemedText>
					<TouchableOpacity
						onPress={async () => {
							await fetchParties();
							setIsModalVisible(true);
						}}
						style={{ padding: s.xs }}
					>
						<ThemedText color={c.primary} weight="semibold">
							+ Add
						</ThemedText>
					</TouchableOpacity>
				</View>

				{partyRates.length === 0 ? (
					<View
						style={{
							padding: s.md,
							backgroundColor: c.surfaceVariant,
							borderRadius: r.md,
						}}
					>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							No special rates configured for this item.
						</ThemedText>
					</View>
				) : (
					partyRates.map((rate) => (
						<View
							key={rate.id}
							style={[
								layout.rowBetween,
								{
									padding: s.md,
									backgroundColor: c.surface,
									borderRadius: r.md,
									marginBottom: s.sm,
									borderWidth: 1,
									borderColor: c.border,
								},
							]}
						>
							<View>
								<ThemedText weight="semibold">
									{rate.customers?.name ||
										rate.suppliers?.name ||
										'Unknown Party'}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{rate.customer_id ? 'Customer' : 'Supplier'}
								</ThemedText>
							</View>
							<ThemedText variant="bodyBold" color={c.primary}>
								{formatCurrency(rate.custom_rate)}
							</ThemedText>
						</View>
					))
				)}
			</View>

			{/* Stock History */}
			<View style={{ marginTop: s.xl }}>
				<ThemedText variant="h3" style={{ marginBottom: s.md }}>
					{t('inventory.stockHistory')}
				</ThemedText>
				{history.length === 0 ? (
					<ThemedText color={c.placeholder}>{t('inventory.emptyFilterHint')}</ThemedText>
				) : (
					history.map((op, index) => (
						<View
							key={op.id}
							style={[
								layout.row,
								{
									paddingVertical: s.md,
									borderBottomColor: c.border,
									borderBottomWidth:
										index === history.length - 1 ? 0 : StyleSheet.hairlineWidth,
								},
							]}
						>
							<View style={{ flex: 1 }}>
								<ThemedText
									weight="semibold"
									style={{ textTransform: 'capitalize' }}
								>
									{t(`inventory.operations.${op.operation_type}`)}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: s.xxs }}
								>
									{formatDateShort(op.created_at)}
									{op.reason ? ` • ${op.reason}` : ''}
								</ThemedText>
							</View>
							<ThemedText
								weight="bold"
								color={op.quantity_change > 0 ? c.success : c.error}
							>
								{op.quantity_change > 0 ? '+' : ''}
								{op.quantity_change}
							</ThemedText>
						</View>
					))
				)}
			</View>
			{/* Add Rate Modal */}
			<Modal
				visible={isModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View
					style={[
						styles.modalOverlay,
						{
							padding: modalOverlayPadding,
							backgroundColor: OVERLAY_COLOR_STRONG,
						},
					]}
				>
					<View
						style={[
							styles.modalContent,
							{
								padding: s.xl,
								backgroundColor: c.surface,
								borderRadius: r.lg,
							},
						]}
					>
						<ThemedText variant="h3" style={{ marginBottom: s.md }}>
							Add Special Rate
						</ThemedText>

						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={{ marginBottom: s.xs }}
						>
							Select Customer or Supplier
						</ThemedText>
						<RNTextInput
							placeholder="Search party..."
							value={partySearch}
							onChangeText={setPartySearch}
							style={[
								styles.input,
								{
									padding: s.md,
									borderColor: c.border,
									borderRadius: r.md,
									color: c.onSurface,
									fontSize: typo.sizes.lg,
									marginBottom: s.md,
								},
							]}
						/>

						<FlatList
							style={{ maxHeight: 200, marginBottom: s.md }}
							data={filteredParties}
							keyExtractor={(party) => party.id}
							keyboardShouldPersistTaps="handled"
							renderItem={({ item: party }) => (
								<TouchableOpacity
									onPress={() => setSelectedParty(party.id)}
									style={[
										styles.partyItem,
										{
											padding: partyItemPadding,
											marginVertical: s.xxs,
											backgroundColor:
												selectedParty === party.id
													? c.primary
													: 'transparent',
											borderRadius: r.sm,
										},
									]}
								>
									<ThemedText
										color={
											selectedParty === party.id ? c.onPrimary : c.onSurface
										}
									>
										{party.name} (
										{party.type === 'customer' ? 'Customer' : 'Supplier'})
									</ThemedText>
								</TouchableOpacity>
							)}
						/>

						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={{ marginBottom: s.xs }}
						>
							Special Rate (₹)
						</ThemedText>
						<RNTextInput
							placeholder="0.00"
							keyboardType="numeric"
							value={customRate}
							onChangeText={setCustomRate}
							style={[
								styles.input,
								{
									padding: s.md,
									borderColor: c.border,
									borderRadius: r.md,
									color: c.onSurface,
									fontSize: typo.sizes.lg,
									marginBottom: s.lg,
								},
							]}
						/>

						<View style={[layout.row, { gap: s.md }]}>
							<TouchableOpacity
								onPress={() => setIsModalVisible(false)}
								style={[
									styles.modalBtn,
									{
										padding: actionPaddingVertical,
										backgroundColor: c.surfaceVariant,
										flex: 1,
										borderRadius: r.md,
									},
								]}
							>
								<ThemedText color={c.onSurfaceVariant} weight="semibold">
									Cancel
								</ThemedText>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleAddRate}
								style={[
									styles.modalBtn,
									{
										padding: actionPaddingVertical,
										backgroundColor: c.primary,
										flex: 1,
										borderRadius: r.md,
									},
								]}
							>
								<ThemedText color={c.onPrimary} weight="semibold">
									Save Rate
								</ThemedText>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	modalOverlay: { flex: 1, justifyContent: 'center' },
	modalContent: { elevation: 5 },
	input: {
		borderWidth: 1,
	},
	partyItem: {},
	modalBtn: { alignItems: 'center' },
});

function SpecBox({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	const { c, s, r } = useThemeTokens();
	const specBoxPadding = s.sm - s.xxs;
	return (
		<View style={{ width: SPEC_BOX_HALF_WIDTH, padding: specBoxPadding }}>
			<View
				style={{
					backgroundColor: highlight
						? withOpacity(c.primary, OPACITY_ROW_HIGHLIGHT)
						: c.surfaceVariant,
					padding: s.md,
					borderRadius: r.md,
				}}
			>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginBottom: s.xs }}
				>
					{label}
				</ThemedText>
				<ThemedText
					variant="body"
					weight="semibold"
					color={highlight ? c.primary : c.onSurface}
					numberOfLines={1}
				>
					{value}
				</ThemedText>
			</View>
		</View>
	);
}
