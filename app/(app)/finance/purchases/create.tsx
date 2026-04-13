import React, { useEffect, useState, useCallback } from 'react';
import { SIZE_INPUT_HEIGHT, OVERLAY_COLOR_MEDIUM, Z_INDEX } from '@/theme/uiMetrics';

const DROPDOWN_MAX_HEIGHT = 160;
const MODAL_CARD_WIDTH = 320;
const PURCHASE_CREATE_BOTTOM_PADDING = 40;
import {
	View,
	ScrollView,
	StyleSheet,
	Alert,
	Modal,
	Pressable,
	TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { financeService } from '@/src/services/financeService';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { TextInput } from '@/src/components/atoms/TextInput';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import type { Supplier } from '@/src/types/supplier';
import type { InventoryItem } from '@/src/types/inventory';
import type { PaymentStatus } from '@/src/types/invoice';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Credit / No Payment'] as const;
type PaymentModeLabel = (typeof PAYMENT_MODES)[number];

function todayString() {
	return new Date().toISOString().slice(0, 10);
}

interface LineItem {
	id: string;
	item: InventoryItem;
	quantity: number;
	price: number;
}

export default function PurchaseCreateScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();

	const { items: inventoryItems, fetchItems } = useInventoryStore(
		useShallow((st) => ({ items: st.items, fetchItems: st.fetchItems })),
	);

	const [suppliers, setSuppliers] = useState<Supplier[]>([]);

	useEffect(() => {
		fetchItems();
		supplierRepository
			.findMany({})
			.then((result) => setSuppliers(result.data))
			.catch(() => {});
	}, [fetchItems]);

	// Supplier
	const [supplierSearch, setSupplierSearch] = useState('');
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

	// Bill info
	const [billNumber, setBillNumber] = useState('');
	const [billDate, setBillDate] = useState(todayString());
	const [showDateModal, setShowDateModal] = useState(false);
	const [ourRef, setOurRef] = useState('PUR-001');

	// Line items
	const [lineItems, setLineItems] = useState<LineItem[]>([]);
	const [showItemForm, setShowItemForm] = useState(false);
	const [itemSearch, setItemSearch] = useState('');
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
	const [itemQty, setItemQty] = useState('1');
	const [itemPrice, setItemPrice] = useState('');

	// Payment
	const [paymentMode, setPaymentMode] = useState<PaymentModeLabel>('Credit / No Payment');
	const [paymentAmount, setPaymentAmount] = useState('');

	// Notes
	const [notes, setNotes] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const filteredSuppliers = useCallback(() => {
		if (!supplierSearch.trim()) return [];
		const q = supplierSearch.toLowerCase();
		return suppliers.filter((s: Supplier) => s.name.toLowerCase().includes(q)).slice(0, 20);
	}, [suppliers, supplierSearch]);

	const filteredItems = useCallback(() => {
		if (!itemSearch.trim()) return [];
		const q = itemSearch.toLowerCase();
		return inventoryItems
			.filter(
				(i: InventoryItem) =>
					i.design_name.toLowerCase().includes(q) ||
					(i.brand_name?.toLowerCase().includes(q) ?? false),
			)
			.slice(0, 20);
	}, [inventoryItems, itemSearch]);

	const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.price, 0);
	const gstTotal = lineItems.reduce(
		(sum, li) => sum + li.quantity * li.price * ((li.item.gst_rate ?? 0) / 100),
		0,
	);
	const grandTotal = subtotal + gstTotal;

	const addLineItem = () => {
		if (!selectedItem) return;
		const qty = parseFloat(itemQty) || 1;
		const price = parseFloat(itemPrice) || selectedItem.cost_price;
		setLineItems((prev) => [
			...prev,
			{ id: `${Date.now()}`, item: selectedItem, quantity: qty, price },
		]);
		setSelectedItem(null);
		setItemSearch('');
		setItemQty('1');
		setItemPrice('');
		setShowItemForm(false);
		// Pre-fill payment amount
		const newTotal =
			subtotal + gstTotal + qty * price + qty * price * ((selectedItem.gst_rate ?? 0) / 100);
		setPaymentAmount(String(Math.round(newTotal)));
	};

	const removeLineItem = (id: string) => {
		setLineItems((prev) => prev.filter((li) => li.id !== id));
	};

	const handleSave = async () => {
		if (!selectedSupplier) {
			Alert.alert('Validation', 'Please select a supplier.');
			return;
		}
		if (!billNumber.trim()) {
			Alert.alert('Validation', "Please enter the supplier's bill number.");
			return;
		}
		if (lineItems.length === 0) {
			Alert.alert('Validation', 'Please add at least one line item.');
			return;
		}

		const isCredit = paymentMode === 'Credit / No Payment';
		const amtPaid = isCredit ? 0 : parseFloat(paymentAmount) || 0;
		const payStatus = amtPaid >= grandTotal ? 'paid' : amtPaid > 0 ? 'partial' : 'unpaid';

		setSubmitting(true);
		try {
			await financeService.createPurchase({
				supplier_id: selectedSupplier.id,
				purchase_date: billDate,
				subtotal,
				tax_total: gstTotal,
				grand_total: grandTotal,
				payment_status: payStatus as PaymentStatus,
				amount_paid: amtPaid,
				notes:
					[ourRef ? `Ref: ${ourRef}` : '', `Bill: ${billNumber}`, notes]
						.filter(Boolean)
						.join(' | ') || undefined,
			});
			Alert.alert('Purchase Bill Saved ✓', 'The purchase bill has been saved.', [
				{ text: 'OK', onPress: () => router.back() },
			]);
		} catch (err: unknown) {
			Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save purchase.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="New Purchase Bill" />
			<ScrollView
				contentContainerStyle={[styles.content, { padding: s.md }]}
				keyboardShouldPersistTaps="handled"
			>
				{/* Supplier Section */}
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Supplier
				</ThemedText>
				{selectedSupplier ? (
					<Card padding="sm" style={styles.selectedCard}>
						<View style={styles.selectedRow}>
							<View>
								<ThemedText variant="bodyBold">{selectedSupplier.name}</ThemedText>
								{selectedSupplier.city ? (
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										{selectedSupplier.city}
									</ThemedText>
								) : null}
							</View>
							<TouchableOpacity
								onPress={() => {
									setSelectedSupplier(null);
									setSupplierSearch('');
								}}
								accessibilityLabel="Deselect supplier"
							>
								<X size={20} color={c.onSurfaceVariant} />
							</TouchableOpacity>
						</View>
					</Card>
				) : (
					<View>
						<TextInput
							placeholder="Search supplier..."
							value={supplierSearch}
							onChangeText={setSupplierSearch}
							accessibilityLabel="supplier-search"
						/>
						{filteredSuppliers().length > 0 && (
							<Card padding="none" style={styles.dropdown}>
								<ScrollView
									style={{ maxHeight: 180 }}
									keyboardShouldPersistTaps="handled"
								>
									{filteredSuppliers().map((sup) => (
										<Pressable
											key={sup.id}
											style={[
												styles.dropdownRow,
												{ borderBottomColor: c.border },
											]}
											onPress={() => {
												setSelectedSupplier(sup);
												setSupplierSearch('');
											}}
										>
											<ThemedText variant="body">{sup.name}</ThemedText>
											{sup.city ? (
												<ThemedText
													variant="caption"
													color={c.onSurfaceVariant}
												>
													{sup.city}
												</ThemedText>
											) : null}
										</Pressable>
									))}
								</ScrollView>
							</Card>
						)}
					</View>
				)}

				{/* Bill Reference */}
				<View style={{ marginTop: s.md, gap: s.sm }}>
					<TextInput
						label="Supplier's Bill No. *"
						value={billNumber}
						onChangeText={setBillNumber}
						placeholder="e.g. INV-2024-001"
						accessibilityLabel="bill-number"
					/>

					<View style={styles.dateRow}>
						<ThemedText variant="label" color={c.onSurfaceVariant}>
							Bill Date
						</ThemedText>
						<View style={styles.dateRight}>
							<ThemedText variant="body">{formatDate(billDate)}</ThemedText>
							<Pressable
								onPress={() => setShowDateModal(true)}
								style={styles.changeBtn}
							>
								<ThemedText variant="caption" color={c.primary}>
									Change
								</ThemedText>
							</Pressable>
						</View>
					</View>

					<Modal visible={showDateModal} transparent animationType="fade">
						<Pressable
							style={styles.modalOverlay}
							onPress={() => setShowDateModal(false)}
						>
							<View
								style={[
									styles.modalCard,
									{ backgroundColor: c.surface, borderRadius: r.lg },
								]}
							>
								<DatePickerField
									label="Bill Date"
									value={billDate}
									onChange={(d) => {
										setBillDate(d);
										setShowDateModal(false);
									}}
								/>
							</View>
						</Pressable>
					</Modal>

					<TextInput
						label="Our Reference (optional)"
						value={ourRef}
						onChangeText={setOurRef}
						placeholder="PUR-001"
					/>
				</View>

				{/* Line Items */}
				<View style={{ marginTop: s.md }}>
					<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
						Items
					</ThemedText>

					{lineItems.map((li) => (
						<View
							key={li.id}
							style={[styles.lineItemRow, { borderBottomColor: c.border }]}
						>
							<View style={{ flex: 1 }}>
								<ThemedText variant="body">{li.item.design_name}</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{li.quantity} × {formatCurrency(li.price)}
								</ThemedText>
							</View>
							<ThemedText variant="bodyBold">
								{formatCurrency(li.quantity * li.price)}
							</ThemedText>
							<TouchableOpacity
								onPress={() => removeLineItem(li.id)}
								style={{ marginLeft: SPACING_PX.sm }}
							>
								<Trash2 size={18} color={c.error} />
							</TouchableOpacity>
						</View>
					))}

					{/* Running total */}
					{lineItems.length > 0 && (
						<View style={[styles.totalRow, { backgroundColor: c.surface }]}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{lineItems.length} item{lineItems.length !== 1 ? 's' : ''} ·
								Subtotal: {formatCurrency(subtotal)} · GST:{' '}
								{formatCurrency(gstTotal)}
							</ThemedText>
							<ThemedText variant="bodyBold">
								Total: {formatCurrency(grandTotal)}
							</ThemedText>
						</View>
					)}

					{/* Add Item form */}
					{showItemForm ? (
						<Card padding="sm" style={{ marginTop: s.sm }}>
							<TextInput
								placeholder="Search item..."
								value={itemSearch}
								onChangeText={setItemSearch}
								accessibilityLabel="item-search"
							/>
							{filteredItems().length > 0 && !selectedItem && (
								<ScrollView
									style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
									keyboardShouldPersistTaps="handled"
								>
									{filteredItems().map((itm) => (
										<Pressable
											key={itm.id}
											style={[
												styles.dropdownRow,
												{ borderBottomColor: c.border },
											]}
											onPress={() => {
												setSelectedItem(itm);
												setItemSearch(itm.design_name);
												setItemPrice(String(itm.cost_price));
											}}
										>
											<ThemedText variant="body">
												{itm.design_name}
											</ThemedText>
											<ThemedText
												variant="caption"
												color={c.onSurfaceVariant}
											>
												{formatCurrency(itm.cost_price)}
											</ThemedText>
										</Pressable>
									))}
								</ScrollView>
							)}
							{selectedItem && (
								<View style={{ marginTop: s.sm, gap: s.sm }}>
									<TextInput
										label="Quantity"
										value={itemQty}
										onChangeText={setItemQty}
										keyboardType="numeric"
									/>
									<TextInput
										label="Purchase Price (₹)"
										value={itemPrice}
										onChangeText={setItemPrice}
										keyboardType="numeric"
									/>
									<View style={styles.formBtns}>
										<Button
											title="Add"
											onPress={addLineItem}
											style={{ flex: 1 }}
										/>
										<Button
											title="Cancel"
											variant="outline"
											onPress={() => {
												setShowItemForm(false);
												setSelectedItem(null);
												setItemSearch('');
											}}
											style={{ flex: 1 }}
										/>
									</View>
								</View>
							)}
						</Card>
					) : (
						<Pressable
							style={[
								styles.addItemBtn,
								{ borderColor: c.primary, borderRadius: r.md },
							]}
							onPress={() => setShowItemForm(true)}
						>
							<Plus size={16} color={c.primary} />
							<ThemedText variant="caption" color={c.primary}>
								Add Item
							</ThemedText>
						</Pressable>
					)}
				</View>

				{/* Payment Section */}
				<View style={{ marginTop: s.md }}>
					<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
						Payment
					</ThemedText>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View style={styles.chipsRow}>
							{PAYMENT_MODES.map((m) => {
								const active = paymentMode === m;
								return (
									<Pressable
										key={m}
										style={[
											styles.modeChip,
											{
												backgroundColor: active ? c.primary : c.surface,
												borderColor: active ? c.primary : c.border,
												borderRadius: r.full,
											},
										]}
										onPress={() => {
											setPaymentMode(m);
											if (m === 'Credit / No Payment') setPaymentAmount('0');
										}}
									>
										<ThemedText
											variant="caption"
											color={active ? c.onPrimary : c.onSurface}
										>
											{m}
										</ThemedText>
									</Pressable>
								);
							})}
						</View>
					</ScrollView>

					{paymentMode !== 'Credit / No Payment' && (
						<TextInput
							label="Amount Paid (₹)"
							value={paymentAmount}
							onChangeText={setPaymentAmount}
							keyboardType="numeric"
							style={{ marginTop: s.sm }}
						/>
					)}
				</View>

				{/* Notes */}
				<View style={{ marginTop: s.md }}>
					<TextInput
						label="Notes (optional)"
						value={notes}
						onChangeText={setNotes}
						multiline
						numberOfLines={3}
						placeholder="Optional notes..."
						inputStyle={{ minHeight: 72, textAlignVertical: 'top' }}
					/>
				</View>

				<Button
					title={submitting ? 'Saving...' : 'Save Purchase Bill'}
					onPress={handleSave}
					disabled={submitting}
					style={[styles.saveBtn, { marginTop: s.lg }]}
					accessibilityLabel="save-purchase"
				/>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { paddingBottom: PURCHASE_CREATE_BOTTOM_PADDING },
	label: { marginBottom: SPACING_PX.xs + SPACING_PX.xxs },
	selectedCard: { marginBottom: SPACING_PX.xs },
	selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	dropdown: { marginTop: SPACING_PX.xs, zIndex: Z_INDEX.overlay },
	dropdownRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xs / 2,
		borderBottomWidth: 1,
	},
	dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	dateRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING_PX.sm },
	changeBtn: { paddingHorizontal: SPACING_PX.sm, paddingVertical: SPACING_PX.xs },
	modalOverlay: {
		flex: 1,
		backgroundColor: OVERLAY_COLOR_MEDIUM,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalCard: { width: MODAL_CARD_WIDTH, padding: SPACING_PX.xl - SPACING_PX.xxs },
	lineItemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: SPACING_PX.sm,
		borderBottomWidth: 1,
	},
	totalRow: {
		padding: SPACING_PX.sm,
		marginTop: SPACING_PX.xs,
		borderRadius: SPACING_PX.xs + SPACING_PX.xxs,
	},
	addItemBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.xs + SPACING_PX.xxs,
		marginTop: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		borderStyle: 'dashed',
		alignSelf: 'flex-start',
	},
	chipsRow: { flexDirection: 'row', gap: SPACING_PX.sm },
	modeChip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
	},
	formBtns: { flexDirection: 'row', gap: SPACING_PX.sm },
	saveBtn: { height: SIZE_INPUT_HEIGHT },
});
