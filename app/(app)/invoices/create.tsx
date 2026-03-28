import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
	Platform,
	ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { TextInput as AppTextInput } from '@/src/components/atoms/TextInput';
import { FormField } from '@/src/components/molecules/FormField';
import { Screen } from '@/src/components/atoms/Screen';
import { useLocale } from '@/src/hooks/useLocale';
import type { Customer } from '@/src/types/customer';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import type { InvoiceLineItemInput } from '@/src/types/invoice';

import { useInventoryStore } from '@/src/stores/inventoryStore';

import { calculateInvoiceTotals } from '@/src/utils/gstCalculator';

export default function CreateInvoiceScreen() {
	const router = useRouter();
	const { theme } = useTheme();
	const { t } = useLocale();
	const c = theme.colors;
	const s = theme.spacing;

	// Load inventory for step 2
	React.useEffect(() => {
		useInventoryStore.getState().fetchItems();
	}, []);

	const { items, loading: inventoryLoading, setFilters } = useInventoryStore();

	const [step, setStep] = useState(1);
	const [customer, setCustomer] = useState<Customer | null>(null);
	const [lineItems, setLineItems] = useState<InvoiceLineItemInput[]>([]);

	// Payment state for Step 3
	const [amountPaid, setAmountPaid] = useState('');
	const [paymentMode, setPaymentMode] = useState<any>('cash');

	// Add Item Modal state
	const [isAddingItem, setIsAddingItem] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedItem, setSelectedItem] = useState<any>(null);
	const [inputQuantity, setInputQuantity] = useState('1');
	const [inputDiscount, setInputDiscount] = useState('0');

	const [isInterState, setIsInterState] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// Debounced search for inventory
	React.useEffect(() => {
		if (!isAddingItem) return;
		const timer = setTimeout(() => {
			setFilters({ search: searchQuery });
		}, 400);
		return () => clearTimeout(timer);
	}, [searchQuery, isAddingItem]);

	const handleNext = () => setStep((s) => Math.min(s + 1, 3));
	const handleBack = () => setStep((s) => Math.max(s - 1, 1));

	// Compute grand total for Step 3
	const invoiceTotals = calculateInvoiceTotals(lineItems, isInterState);
	const grandTotal = invoiceTotals.grand_total;

	const submitInvoice = async () => {
		if (!customer || lineItems.length === 0) return;
		setSubmitting(true);
		try {
			const newInvoice = await useInvoiceStore.getState().createInvoice({
				customer_id: customer.id,
				customer_name: customer.name,
				customer_phone: customer.phone,
				customer_address: customer.address,
				customer_gstin: customer.gstin,
				is_inter_state: isInterState,
				line_items: lineItems,
				invoice_date: new Date().toISOString().split('T')[0],
				payment_status:
					parseFloat(amountPaid) >= grandTotal
						? 'paid'
						: parseFloat(amountPaid) > 0
							? 'partial'
							: 'unpaid',
				payment_mode: parseFloat(amountPaid) > 0 ? paymentMode : undefined,
				amount_paid: parseFloat(amountPaid) || 0,
			});
			router.replace(`/(app)/invoices/${newInvoice.id}`);
		} catch (e: any) {
			console.error('Failed to create invoice', e);
			Alert.alert(
				'Error Creating Invoice',
				e.message || 'An unexpected error occurred. Please try again.',
				[{ text: 'OK' }],
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Screen withKeyboard safeAreaEdges={['top', 'bottom']}>
			<View style={[styles.stepperMenu, { borderBottomColor: c.border }]}>
				<ThemedText variant="label" color={step === 1 ? c.primary : c.onSurfaceVariant}>
					1. Customer
				</ThemedText>
				<ThemedText variant="label" color={step === 2 ? c.primary : c.onSurfaceVariant}>
					2. Items
				</ThemedText>
				<ThemedText variant="label" color={step === 3 ? c.primary : c.onSurfaceVariant}>
					3. Review
				</ThemedText>
			</View>

			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: s.lg }}>
				{step === 1 && (
					<View>
						<ThemedText variant="h3" style={{ marginBottom: s.md }}>
							Customer Details
						</ThemedText>

						<FormField
							label="Name"
							required
							placeholder="e.g. Rahul Sharma"
							value={customer?.name || ''}
							onChangeText={(text) =>
								setCustomer(
									(prev) => ({ ...prev, id: prev?.id, name: text }) as any,
								)
							}
						/>

						<FormField
							label="Phone"
							placeholder="10-digit mobile number"
							keyboardType="phone-pad"
							value={customer?.phone || ''}
							onChangeText={(text) =>
								setCustomer(
									(prev) =>
										({
											...prev,
											id: prev?.id,
											name: prev?.name || '',
											phone: text,
										}) as any,
								)
							}
						/>

						<FormField
							label="GSTIN (Optional)"
							placeholder="22AAAAA0000A1Z5"
							autoCapitalize="characters"
							value={customer?.gstin || ''}
							onChangeText={(text) =>
								setCustomer(
									(prev) =>
										({
											...prev,
											id: prev?.id,
											name: prev?.name || '',
											gstin: text,
										}) as any,
								)
							}
						/>

						<TouchableOpacity
							onPress={() => setIsInterState(!isInterState)}
							style={{
								marginTop: s.lg,
								padding: s.md,
								backgroundColor: isInterState ? c.primary + '20' : c.surface,
								borderWidth: 1,
								borderColor: isInterState ? c.primary : c.border,
								borderRadius: theme.borderRadius.md,
							}}
						>
							<ThemedText weight={isInterState ? 'bold' : 'regular'}>
								Inter-State (IGST): {isInterState ? 'Yes' : 'No'}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: 4 }}
							>
								Toggle this if the customer is located in a different state.
							</ThemedText>
						</TouchableOpacity>
					</View>
				)}

				{step === 2 && (
					<View>
						<View style={[theme.layout.rowBetween, { marginBottom: s.md }]}>
							<ThemedText variant="h3">Line Items</ThemedText>
							<Button
								title="+ Add Item"
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
									borderRadius: theme.borderRadius.md,
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
										borderRadius: theme.borderRadius.sm,
										borderWidth: 1,
										borderColor: c.border,
									}}
								>
									<ThemedText weight="semibold">{item.design_name}</ThemedText>
									<View style={theme.layout.rowBetween}>
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
										onPress={() => {
											const newItems = [...lineItems];
											newItems.splice(index, 1);
											setLineItems(newItems);
										}}
										style={{ alignSelf: 'flex-end', marginTop: 8 }}
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
									borderRadius: theme.borderRadius.md,
									borderWidth: 1,
									borderColor: c.border,
								}}
							>
								<View style={[theme.layout.rowBetween, { marginBottom: s.xs }]}>
									<ThemedText weight="bold">Select from Inventory</ThemedText>
									{inventoryLoading && (
										<ActivityIndicator size="small" color={c.primary} />
									)}
								</View>

								{!selectedItem ? (
									<>
										<AppTextInput
											placeholder="Search design name..."
											value={searchQuery}
											onChangeText={setSearchQuery}
										/>
										<ScrollView style={{ maxHeight: 200 }}>
											{items.length === 0 && !inventoryLoading ? (
												<ThemedText
													variant="caption"
													color={c.placeholder}
													align="center"
													style={{ padding: s.md }}
												>
													No items found.
												</ThemedText>
											) : (
												items.map((item) => (
													<TouchableOpacity
														key={item.id}
														style={{
															padding: s.sm,
															borderBottomWidth: 1,
															borderBottomColor: c.border,
														}}
														onPress={() => {
															setSelectedItem(item);
															setInputQuantity('1');
															setInputDiscount('0');
														}}
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
										<ThemedText variant="h3">
											{selectedItem.design_name}
										</ThemedText>
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
										/>
										... (rest is okay)
										<FormField
											label="Discount (₹ total)"
											value={inputDiscount}
											placeholder="Enter discount amount"
											keyboardType="numeric"
											onChangeText={setInputDiscount}
										/>
										<View
											style={{
												flexDirection: 'row',
												gap: s.sm,
												marginTop: s.md,
											}}
										>
											<Button
												title="Cancel"
												onPress={() => setSelectedItem(null)}
												variant="outline"
												style={{ flex: 1 }}
											/>
											<Button
												title="Confirm"
												onPress={() => {
													setLineItems([
														...lineItems,
														{
															item_id: selectedItem.id,
															design_name: selectedItem.design_name,
															quantity: parseInt(inputQuantity) || 1,
															rate_per_unit:
																selectedItem.selling_price || 0,
															discount:
																parseFloat(inputDiscount) || 0,
															gst_rate: 18, // Default
															tile_image_url: selectedItem.image_url,
														},
													]);
													setSelectedItem(null);
													setIsAddingItem(false);
												}}
												style={{ flex: 1 }}
											/>
										</View>
									</View>
								)}
							</View>
						)}
					</View>
				)}

				{step === 3 && (
					<View>
						<ThemedText variant="h3" style={{ marginBottom: s.md }}>
							Review & Payment
						</ThemedText>

						<View
							style={{
								padding: s.md,
								backgroundColor: c.surface,
								borderRadius: theme.borderRadius.md,
								borderWidth: 1,
								borderColor: c.border,
								marginBottom: s.lg,
							}}
						>
							<ThemedText weight="bold">Customer: {customer?.name}</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{customer?.phone || 'No phone provided'}
							</ThemedText>

							<View style={{ marginTop: s.md }}>
								{lineItems.map((item, idx) => (
									<View
										key={idx}
										style={[theme.layout.rowBetween, { marginTop: 4 }]}
									>
										<ThemedText variant="body2">
											{item.quantity}x {item.design_name}
										</ThemedText>
										<ThemedText variant="body2">
											₹{(item.quantity * item.rate_per_unit).toFixed(2)}
										</ThemedText>
									</View>
								))}
							</View>

							<View
								style={{
									height: 1,
									backgroundColor: c.border,
									marginVertical: s.md,
								}}
							/>

							<View style={theme.layout.rowBetween}>
								<ThemedText weight="bold">Grand Total (inc. GST)</ThemedText>
								<ThemedText variant="h3" color={c.primary}>
									₹{grandTotal.toFixed(2)}
								</ThemedText>
							</View>
						</View>

						<ThemedText weight="bold" style={{ marginBottom: s.sm }}>
							Payment Collection
						</ThemedText>

						<FormField
							label="Amount Paid (₹)"
							value={amountPaid}
							placeholder="Enter amount paid"
							keyboardType="numeric"
							onChangeText={setAmountPaid}
						/>

						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ marginBottom: 4 }}
						>
							Payment Mode
						</ThemedText>
						<View
							style={[
								theme.layout.row,
								{ gap: s.sm, marginBottom: s.xl, flexWrap: 'wrap' },
							]}
						>
							{['cash', 'upi', 'bank_transfer', 'cheque'].map((mode) => (
								<TouchableOpacity
									key={mode}
									onPress={() => setPaymentMode(mode)}
									style={{
										paddingHorizontal: s.md,
										paddingVertical: s.sm,
										backgroundColor:
											paymentMode === mode ? c.primary : c.surface,
										borderRadius: theme.borderRadius.sm,
										borderWidth: 1,
										borderColor: paymentMode === mode ? c.primary : c.border,
									}}
								>
									<ThemedText
										variant="caption"
										color={paymentMode === mode ? '#FFF' : c.onSurface}
										style={{ textTransform: 'capitalize' }}
									>
										{mode.replace('_', ' ')}
									</ThemedText>
								</TouchableOpacity>
							))}
						</View>

						<View
							style={{
								padding: s.md,
								backgroundColor:
									parseFloat(amountPaid) >= grandTotal
										? c.success + '20'
										: c.warning + '20',
								borderRadius: theme.borderRadius.md,
							}}
						>
							<ThemedText
								weight="bold"
								color={parseFloat(amountPaid) >= grandTotal ? c.success : c.warning}
							>
								Balance Due: ₹
								{Math.max(0, grandTotal - (parseFloat(amountPaid) || 0)).toFixed(2)}
							</ThemedText>
						</View>
					</View>
				)}
			</ScrollView>

			<View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.surface }]}>
				<Button
					title="Back"
					variant="ghost"
					onPress={handleBack}
					disabled={step === 1 || submitting}
					style={{ flex: 1, marginRight: s.xs }}
				/>
				{step < 3 ? (
					<Button
						title="Next"
						onPress={handleNext}
						disabled={
							(step === 1 && !customer) || (step === 2 && lineItems.length === 0)
						}
						style={{ flex: 1, marginLeft: s.xs }}
					/>
				) : (
					<Button
						title={submitting ? 'Generating...' : 'Generate Invoice'}
						onPress={submitInvoice}
						loading={submitting}
						style={{ flex: 1, marginLeft: s.xs }}
					/>
				)}
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	stepperMenu: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 16,
		borderBottomWidth: 1,
	},
	footer: {
		flexDirection: 'row',
		padding: 16,
		borderTopWidth: 1,
	},
});
