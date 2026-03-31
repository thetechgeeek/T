import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { TextInput as AppTextInput } from '@/src/components/atoms/TextInput';
import { FormField } from '@/src/components/molecules/FormField';
import { layout } from '@/src/theme/layout';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import type { InventoryItem } from '@/src/types/inventory';

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

	return (
		<View>
			<View style={[layout.rowBetween, { marginBottom: s.md }]}>
				<ThemedText variant="h3">Line Items</ThemedText>
				<Button title="+ Add Item" onPress={() => setIsAddingItem(true)} size="sm" />
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
						No items added yet.
					</ThemedText>
				</View>
			) : (
				lineItems.map((item, index) => (
					<View
						key={index}
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
								{item.quantity} units @ ₹{item.rate_per_unit.toFixed(2)}
							</ThemedText>
							<ThemedText weight="bold" color={c.primary}>
								₹{(item.quantity * item.rate_per_unit).toFixed(2)}
							</ThemedText>
						</View>
						{!!item.discount && item.discount > 0 && (
							<ThemedText variant="caption" color={c.error}>
								Discount: ₹{item.discount.toFixed(2)}
							</ThemedText>
						)}
						<TouchableOpacity
							onPress={() => removeLineItem(index)}
							style={{ alignSelf: 'flex-end', marginTop: 8 }}
							accessibilityRole="button"
							accessibilityLabel={`Remove ${item.design_name}`}
						>
							<ThemedText variant="caption" color={c.error}>
								Remove
							</ThemedText>
						</TouchableOpacity>
					</View>
				))
			)}

			{isAddingItem && (
				<View
					style={{
						marginTop: s.xl,
						padding: s.lg,
						backgroundColor: c.surfaceVariant + '40',
						borderRadius: r.md,
						borderWidth: 1,
						borderColor: c.border,
					}}
				>
					<View style={[layout.rowBetween, { marginBottom: s.xs }]}>
						<ThemedText weight="bold">Select from Inventory</ThemedText>
						{inventoryLoading && <ActivityIndicator size="small" color={c.primary} />}
					</View>

					{!selectedItem ? (
						<>
							<AppTextInput
								placeholder="Search design name..."
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
							<ScrollView style={{ maxHeight: 200 }}>
								{inventoryItems.length === 0 && !inventoryLoading ? (
									<ThemedText
										variant="caption"
										color={c.placeholder}
										align="center"
										style={{ padding: s.md }}
									>
										No items found.
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
												Stock: {item.box_count} • Price: ₹
												{item.selling_price}
											</ThemedText>
										</TouchableOpacity>
									))
								)}
							</ScrollView>
							<Button
								title="Close"
								onPress={() => setIsAddingItem(false)}
								variant="outline"
								style={{ marginTop: s.md }}
							/>
						</>
					) : (
						<View>
							<ThemedText variant="h3">{selectedItem.design_name}</ThemedText>
							<ThemedText
								variant="body2"
								color={c.onSurfaceVariant}
								style={{ marginBottom: s.md }}
							>
								Available: {selectedItem.box_count} units
							</ThemedText>
							<FormField
								label="Quantity"
								value={inputQuantity}
								placeholder="Enter quantity"
								keyboardType="numeric"
								onChangeText={setInputQuantity}
								error={
									parseInt(inputQuantity) > selectedItem.box_count
										? `Exceeds available stock (${selectedItem.box_count})`
										: undefined
								}
							/>
							<FormField
								label="Discount (₹ total)"
								value={inputDiscount}
								placeholder="Enter discount amount"
								keyboardType="numeric"
								onChangeText={setInputDiscount}
							/>
							<View style={{ flexDirection: 'row', gap: s.sm, marginTop: s.md }}>
								<Button
									title="Cancel"
									onPress={cancelItemSelection}
									variant="outline"
									style={{ flex: 1 }}
								/>
								<Button title="Confirm" onPress={addLineItem} style={{ flex: 1 }} />
							</View>
						</View>
					)}
				</View>
			)}
		</View>
	);
}
