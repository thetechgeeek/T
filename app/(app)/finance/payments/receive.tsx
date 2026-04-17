import {
	BORDER_WIDTH_BASE,
	OVERLAY_COLOR_MEDIUM,
	SIZE_DROPDOWN_MAX_HEIGHT,
	SIZE_FORM_MODAL_CARD_WIDTH,
	SIZE_INPUT_HEIGHT,
	SIZE_NOTES_MIN_HEIGHT,
	Z_INDEX,
} from '@/theme/uiMetrics';
import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
	FlatList,
	ScrollView,
	StyleSheet,
	Alert,
	Modal,
	Pressable,
	TouchableOpacity,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { X } from 'lucide-react-native';
import { useCustomerStore } from '@/src/stores/customerStore';
import { paymentService } from '@/src/services/paymentService';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card } from '@/src/design-system/components/atoms/Card';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import type { Customer } from '@/src/types/customer';
import type { PaymentMode } from '@/src/types/invoice';
import { buildReceivePaymentRecordPayload } from '@/src/features/payments/buildPaymentRecordPayload';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'] as const;
type PaymentModeLabel = (typeof PAYMENT_MODES)[number];

/** UI labels → schema `payment_mode` (Card → `credit`, matching PaymentSchema). */
const modeToKey: Record<PaymentModeLabel, PaymentMode> = {
	Cash: 'cash',
	UPI: 'upi',
	'Bank Transfer': 'bank_transfer',
	Cheque: 'cheque',
	Card: 'credit',
};

function todayString() {
	return new Date().toISOString().slice(0, 10);
}

export default function ReceivePaymentScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();

	const { customers, fetchCustomers } = useCustomerStore(
		useShallow((st) => ({ customers: st.customers, fetchCustomers: st.fetchCustomers })),
	);

	useEffect(() => {
		fetchCustomers();
	}, [fetchCustomers]);

	const [customerSearch, setCustomerSearch] = useState('');
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [paymentDate, setPaymentDate] = useState(todayString());
	const [showDateModal, setShowDateModal] = useState(false);
	const [amount, setAmount] = useState('');
	const [paymentMode, setPaymentMode] = useState<PaymentModeLabel>('Cash');
	const [upiRef, setUpiRef] = useState('');
	const [chequeNumber, setChequeNumber] = useState('');
	const [bankName, setBankName] = useState('');
	const [notes, setNotes] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const filteredCustomers = useCallback(() => {
		if (!customerSearch.trim()) return [];
		const q = customerSearch.toLowerCase();
		return customers.filter((c: Customer) => c.name.toLowerCase().includes(q)).slice(0, 20);
	}, [customers, customerSearch]);
	const customerMatches = filteredCustomers();

	const outstandingBalance = selectedCustomer?.current_balance ?? 0;

	const handleSave = async () => {
		if (!selectedCustomer) {
			Alert.alert('Validation', 'Please select a customer.');
			return;
		}
		const amt = parseFloat(amount);
		if (!amt || amt <= 0) {
			Alert.alert('Validation', 'Please enter a valid amount.');
			return;
		}

		setSubmitting(true);
		try {
			await paymentService.recordPayment(
				buildReceivePaymentRecordPayload({
					paymentDate,
					amount: amt,
					paymentMode: modeToKey[paymentMode],
					customerId: selectedCustomer.id,
					notes: notes.trim() || undefined,
				}),
			);
			Alert.alert('Payment Recorded ✓', 'The payment has been saved.', [
				{ text: 'OK', onPress: () => router.back() },
			]);
		} catch (err: unknown) {
			Alert.alert('Error', err instanceof Error ? err.message : 'Failed to record payment.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard
			scrollable
			header={<ScreenHeader title="Receive Payment" />}
			contentContainerStyle={[styles.content, { padding: s.md }]}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			{/* Customer Section */}
			<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.sectionLabel}>
				Select Customer
			</ThemedText>
			{selectedCustomer ? (
				<Card padding="sm" style={styles.selectedCard}>
					<View style={styles.selectedRow}>
						<View>
							<ThemedText variant="bodyBold">{selectedCustomer.name}</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Outstanding: {formatCurrency(outstandingBalance)}
							</ThemedText>
						</View>
						<TouchableOpacity
							onPress={() => {
								setSelectedCustomer(null);
								setCustomerSearch('');
							}}
							accessibilityLabel="Deselect customer"
						>
							<X size={20} color={c.onSurfaceVariant} />
						</TouchableOpacity>
					</View>
				</Card>
			) : (
				<View>
					<TextInput
						placeholder="Search customer..."
						value={customerSearch}
						onChangeText={setCustomerSearch}
						accessibilityLabel="customer-search"
					/>
					{customerMatches.length > 0 && (
						<Card padding="none" style={styles.dropdown}>
							<FlatList
								style={{ maxHeight: SIZE_DROPDOWN_MAX_HEIGHT }}
								keyboardShouldPersistTaps="handled"
								data={customerMatches}
								keyExtractor={(customer) => customer.id}
								renderItem={({ item: customer }) => (
									<Pressable
										style={
											[
												styles.dropdownRow,
												{ borderBottomColor: c.border },
											] as StyleProp<ViewStyle>
										}
										onPress={() => {
											setSelectedCustomer(customer);
											setCustomerSearch('');
										}}
									>
										<ThemedText variant="body">{customer.name}</ThemedText>
										<ThemedText variant="caption" color={c.onSurfaceVariant}>
											{formatCurrency(customer.current_balance ?? 0)}
										</ThemedText>
									</Pressable>
								)}
							/>
						</Card>
					)}
				</View>
			)}

			{/* Payment Date */}
			<View style={[styles.dateRow, { marginTop: s.md }] as StyleProp<ViewStyle>}>
				<ThemedText variant="label" color={c.onSurfaceVariant}>
					Payment Date
				</ThemedText>
				<View style={styles.dateRight}>
					<ThemedText variant="body">{formatDate(paymentDate)}</ThemedText>
					<Pressable onPress={() => setShowDateModal(true)} style={styles.changeBtn}>
						<ThemedText variant="caption" color={c.primary}>
							Change
						</ThemedText>
					</Pressable>
				</View>
			</View>

			<Modal visible={showDateModal} transparent animationType="fade">
				<Pressable style={styles.modalOverlay} onPress={() => setShowDateModal(false)}>
					<View
						style={
							[
								styles.modalCard,
								{ backgroundColor: c.surface, borderRadius: r.lg },
							] as StyleProp<ViewStyle>
						}
					>
						<DatePickerField
							label="Payment Date"
							value={paymentDate}
							onChange={(d) => {
								setPaymentDate(d);
								setShowDateModal(false);
							}}
						/>
					</View>
				</Pressable>
			</Modal>

			{/* Amount */}
			<View style={{ marginTop: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.sectionLabel}>
					Amount Received (₹)
				</ThemedText>
				<TextInput
					keyboardType="numeric"
					value={amount}
					onChangeText={setAmount}
					inputStyle={{ fontSize: FONT_SIZE.h2 }}
					placeholder="0"
					accessibilityLabel="amount-received"
				/>
				{outstandingBalance > 0 && (
					<Pressable
						style={
							[
								styles.fullAmtChip,
								{ borderColor: c.primary, borderRadius: r.full },
							] as StyleProp<ViewStyle>
						}
						onPress={() => setAmount(String(outstandingBalance))}
					>
						<ThemedText variant="caption" color={c.primary}>
							Full Amount {formatCurrency(outstandingBalance)}
						</ThemedText>
					</Pressable>
				)}
			</View>

			{/* Payment Mode */}
			<View style={{ marginTop: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.sectionLabel}>
					Payment Mode
				</ThemedText>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={styles.chipsRow}>
						{PAYMENT_MODES.map((m) => {
							const active = paymentMode === m;
							return (
								<Pressable
									key={m}
									style={
										[
											styles.modeChip,
											{
												backgroundColor: active ? c.primary : c.surface,
												borderColor: active ? c.primary : c.border,
												borderRadius: r.full,
											},
										] as StyleProp<ViewStyle>
									}
									onPress={() => setPaymentMode(m)}
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

				{paymentMode === 'UPI' && (
					<TextInput
						label="UPI Reference (optional)"
						value={upiRef}
						onChangeText={setUpiRef}
						placeholder="UPI transaction ID"
						style={{ marginTop: s.sm }}
					/>
				)}
				{paymentMode === 'Cheque' && (
					<View style={{ marginTop: s.sm, gap: s.sm }}>
						<TextInput
							label="Cheque Number"
							value={chequeNumber}
							onChangeText={setChequeNumber}
							keyboardType="numeric"
						/>
						<TextInput
							label="Bank Name"
							value={bankName}
							onChangeText={setBankName}
							placeholder="e.g. SBI"
						/>
					</View>
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
					inputStyle={{
						minHeight: SIZE_NOTES_MIN_HEIGHT,
						textAlignVertical: 'top',
					}}
				/>
			</View>

			{/* Save Button */}
			<Button
				title={submitting ? 'Saving...' : 'Save Payment'}
				onPress={handleSave}
				disabled={submitting}
				style={[styles.saveBtn, { marginTop: s.lg }]}
				accessibilityLabel="save-payment"
			/>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { paddingBottom: SPACING_PX['2xl'] + SPACING_PX.sm },
	sectionLabel: { marginBottom: SPACING_PX.xs + SPACING_PX.xxs },
	selectedCard: { marginBottom: SPACING_PX.xs },
	selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	dropdown: { marginTop: SPACING_PX.xs, zIndex: Z_INDEX.overlay },
	dropdownRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xs / 2,
		borderBottomWidth: BORDER_WIDTH_BASE,
	},
	dateRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dateRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING_PX.sm },
	changeBtn: { paddingHorizontal: SPACING_PX.sm, paddingVertical: SPACING_PX.xs },
	modalOverlay: {
		flex: 1,
		backgroundColor: OVERLAY_COLOR_MEDIUM,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalCard: {
		width: SIZE_FORM_MODAL_CARD_WIDTH,
		padding: SPACING_PX.xl - SPACING_PX.xxs,
	},
	fullAmtChip: {
		alignSelf: 'flex-start',
		marginTop: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs + SPACING_PX.xxs,
		borderWidth: BORDER_WIDTH_BASE,
	},
	chipsRow: { flexDirection: 'row', gap: SPACING_PX.sm },
	modeChip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: BORDER_WIDTH_BASE,
	},
	saveBtn: { height: SIZE_INPUT_HEIGHT },
});
