import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';
import { TextInput as AppTextInput } from '@/src/design-system/components/atoms/TextInput';
import { FormField } from '@/src/design-system/components/molecules/FormField';
import { layout } from '@/src/theme/layout';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import type { InventoryItem } from '@/src/types/inventory';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_SOFT, SIZE_DROPDOWN_MAX_HEIGHT } from '@/src/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

interface Props {
	lineItems: InvoiceLineItemInput[];
	removeLineItem: (index: number) => void;
	isAddingItem: boolean;
	setIsAddingItem: (v: boolean) => void;
	inventoryItems: InventoryItem[];
	inventoryLoading: boolean;
	searchQuery: string;
	setSearchQuery: (q: string) => void;
	selectedItem: InventoryItem | null;
	selectInventoryItem: (item: InventoryItem) => void;
	cancelItemSelection: () => void;
	inputQuantity: string;
	setInputQuantity: (v: string) => void;
	inputDiscount: string;
	setInputDiscount: (v: string) => void;
	addLineItem: () => void;
}

export function LineItemsStep({
	lineItems,
	removeLineItem,
	isAddingItem,
	setIsAddingItem,
	inventoryItems,
	inventoryLoading,
	searchQuery,
	setSearchQuery,
	selectedItem,
	selectInventoryItem,
	cancelItemSelection,
	inputQuantity,
	setInputQuantity,
	inputDiscount,
	setInputDiscount,
	addLineItem,
}: Props) {
	const { c, s, r } = useThemeTokens();
	const { t, formatCurrency } = useLocale();

	return (
		<View>
			<View style={[layout.rowBetween, { marginBottom: s.md }]}>
				<ThemedText variant="h3">{t('invoice.lineItems')}</ThemedText>
				<Button
					title={t('invoice.add')}
					accessibilityLabel="add-item-button"
					onPress={() => setIsAddingItem(true)}
					size="sm"
				/>
			</View>

			{lineItems.length === 0 ? (
				<View
					style={{
						padding: s.xl,
						alignItems: 'center',
						backgroundColor: c.surface,
						borderRadius: r.md,
					}}
				>
					<ThemedText variant="caption" color={c.placeholder} align="center">
						{t('invoice.noItems')}
					</ThemedText>
				</View>
			) : (
				lineItems.map((item, index) => (
					<View
						key={item.item_id ?? `${item.design_name}-${index}`}
						style={{
							padding: s.md,
							marginBottom: s.sm,
							backgroundColor: c.surface,
							borderRadius: r.sm,
							borderWidth: 1,
							borderColor: c.border,
						}}
					>
						<ThemedText weight="semibold">{item.design_name}</ThemedText>
						<View style={layout.rowBetween}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{item.quantity}{' '}
								{t('invoice.unitsAt', {
									price: formatCurrency(item.rate_per_unit),
								})}
							</ThemedText>
							<ThemedText weight="bold" color={c.primary}>
								{formatCurrency(item.quantity * item.rate_per_unit)}
							</ThemedText>
						</View>
						{!!item.discount && item.discount > 0 && (
							<ThemedText variant="caption" color={c.error}>
								{t('invoice.discountAmount')}: {formatCurrency(item.discount)}
							</ThemedText>
						)}
						<TouchableOpacity
							onPress={() => removeLineItem(index)}
							style={{ alignSelf: 'flex-end', marginTop: SPACING_PX.sm }}
							accessibilityRole="button"
							accessibilityLabel={`remove-line-item-${index}`}
							accessibilityHint={t('invoice.removeHint', { name: item.design_name })}
						>
							<ThemedText variant="caption" color={c.error}>
								{t('invoice.remove')}
							</ThemedText>
						</TouchableOpacity>
					</View>
				))
			)}

			{lineItems.length > 0 &&
				(() => {
					const subtotal = lineItems.reduce((acc, item) => {
						const lineSubtotal =
							item.quantity * item.rate_per_unit - (item.discount || 0);
						return acc + lineSubtotal;
					}, 0);
					const gst = lineItems.reduce((acc, item) => {
						const lineSubtotal =
							item.quantity * item.rate_per_unit - (item.discount || 0);
						return acc + lineSubtotal * (item.gst_rate / 100);
					}, 0);
					return (
						<View
							style={{
								marginTop: s.md,
								paddingVertical: s.sm,
								paddingHorizontal: s.md,
								backgroundColor: c.surface,
								borderTopWidth: 1,
								borderTopColor: c.border,
								borderRadius: r.sm,
							}}
						>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{lineItems.length}{' '}
								{lineItems.length === 1
									? t('invoice.itemSingular')
									: t('invoice.itemPlural')}
								{'  ·  '}
								{t('invoice.subtotal')}: {formatCurrency(subtotal)}
								{'  ·  '}GST: {formatCurrency(gst)}
							</ThemedText>
						</View>
					);
				})()}

			{isAddingItem && (
				<View
					style={{
						marginTop: s.xl,
						padding: s.lg,
						backgroundColor: withOpacity(c.surfaceVariant, OPACITY_TINT_SOFT),
						borderRadius: r.md,
						borderWidth: 1,
						borderColor: c.border,
					}}
				>
					<View style={[layout.rowBetween, { marginBottom: s.xs }]}>
						<ThemedText weight="bold">{t('invoice.selectFromInventory')}</ThemedText>
						{inventoryLoading && (
							<SkeletonBlock width={20} height={20} borderRadius={10} />
						)}
					</View>

					{!selectedItem ? (
						<>
							<AppTextInput
								accessibilityLabel="inventory-search-input"
								accessibilityHint={t('scanner.searchHint')}
								placeholder={t('invoice.searchDesign')}
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
							<ScrollView
								accessibilityRole="list"
								style={{ maxHeight: SIZE_DROPDOWN_MAX_HEIGHT }}
							>
								{inventoryItems.length === 0 && !inventoryLoading ? (
									<ThemedText
										variant="caption"
										color={c.placeholder}
										align="center"
										style={{ padding: s.md }}
									>
										{t('invoice.noResults')}
									</ThemedText>
								) : (
									inventoryItems.map((item) => (
										<TouchableOpacity
											key={item.id}
											style={{
												padding: s.sm,
												borderBottomWidth: 1,
												borderBottomColor: c.border,
											}}
											onPress={() => selectInventoryItem(item)}
											accessibilityRole="button"
											accessibilityLabel={item.design_name}
										>
											<ThemedText>{item.design_name}</ThemedText>
											<ThemedText
												variant="caption"
												color={c.onSurfaceVariant}
											>
												{t('inventory.stockStatus', {
													count: item.box_count,
												})}{' '}
												• {t('common.price')}:{' '}
												{formatCurrency(item.selling_price)}
											</ThemedText>
										</TouchableOpacity>
									))
								)}
							</ScrollView>
							<Button
								title={t('common.done')}
								onPress={() => setIsAddingItem(false)}
								variant="outline"
								style={{ marginTop: s.md }}
							/>
						</>
					) : (
						<View>
							<ThemedText variant="h3">{selectedItem.design_name}</ThemedText>
							<ThemedText
								variant="body"
								color={c.onSurfaceVariant}
								style={{ marginBottom: s.md }}
							>
								{t('invoice.availableStock', { count: selectedItem.box_count })}
							</ThemedText>
							<FormField
								label={t('inventory.quantity')}
								accessibilityLabel="item-quantity-input"
								value={inputQuantity}
								placeholder={t('invoice.placeholders.enterQuantity')}
								keyboardType="numeric"
								onChangeText={setInputQuantity}
								error={
									parseInt(inputQuantity) > selectedItem.box_count
										? t('invoice.exceedsStock', {
												count: selectedItem.box_count,
											})
										: undefined
								}
							/>
							<FormField
								label={t('invoice.discountTotal')}
								accessibilityLabel="item-discount-input"
								value={inputDiscount}
								placeholder={t('invoice.placeholders.enterDiscount')}
								keyboardType="numeric"
								onChangeText={setInputDiscount}
							/>
							<View style={{ flexDirection: 'row', gap: s.sm, marginTop: s.md }}>
								<Button
									title={t('common.cancel')}
									accessibilityLabel="cancel-add-item"
									onPress={cancelItemSelection}
									variant="outline"
									style={{ flex: 1 }}
								/>
								<Button
									title={t('common.confirm')}
									accessibilityLabel="confirm-add-item"
									onPress={addLineItem}
									style={{ flex: 1 }}
								/>
							</View>
						</View>
					)}
				</View>
			)}
		</View>
	);
}
