import { SIZE_INPUT_HEIGHT, OVERLAY_COLOR_MEDIUM, Z_INDEX } from '@/theme/uiMetrics';
import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
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
import { X } from 'lucide-react-native';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { paymentService } from '@/src/services/paymentService';
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
import type { PaymentMode } from '@/src/types/invoice';
import { buildMakePaymentRecordPayload } from '@/src/features/payments/buildPaymentRecordPayload';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const PAYMENT_FORM_BOTTOM_PADDING = 40;
const PAYMENT_NOTES_MIN_HEIGHT = 72;

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'] as const;
type PaymentModeLabel = (typeof PAYMENT_MODES)[number];

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

export default function MakePaymentScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();

	const [suppliers, setSuppliers] = useState<Supplier[]>([]);

	useEffect(() => {
		supplierRepository
			.findMany({})
			.then((result) => setSuppliers(result.data))
			.catch(() => {});
	}, []);

	const [supplierSearch, setSupplierSearch] = useState('');
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
	const [paymentDate, setPaymentDate] = useState(todayString());
	const [showDateModal, setShowDateModal] = useState(false);
	const [amount, setAmount] = useState('');
	const [paymentMode, setPaymentMode] = useState<PaymentModeLabel>('Cash');
	const [upiRef, setUpiRef] = useState('');
	const [chequeNumber, setChequeNumber] = useState('');
	const [bankName, setBankName] = useState('');
	const [notes, setNotes] = useState('');
	const [submitting, setSubmitting] = useState(false);

	// Outstanding for supplier — not available without ledger call, show 0
	const outstandingBalance = 0;

	const filteredSuppliers = useCallback(() => {
		if (!supplierSearch.trim()) return [];
		const q = supplierSearch.toLowerCase();
		return suppliers.filter((s: Supplier) => s.name.toLowerCase().includes(q)).slice(0, 20);
	}, [suppliers, supplierSearch]);

	const handleSave = async () => {
		if (!selectedSupplier) {
			Alert.alert('Validation', 'Please select a supplier.');
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
				buildMakePaymentRecordPayload({
					paymentDate,
					amount: amt,
					paymentMode: modeToKey[paymentMode],
					supplierId: selectedSupplier.id,
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
			contentContainerStyle={[styles.content, { padding: s.md }]}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			<ScreenHeader title="Make Payment" />
			{/* Supplier Section */}
			<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.sectionLabel}>
				Select Supplier
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
								style={{ maxHeight: 200 }}
								keyboardShouldPersistTaps="handled"
							>
								{filteredSuppliers().map((sup) => (
									<Pressable
										key={sup.id}
										style={
											[
												styles.dropdownRow,
												{ borderBottomColor: c.border },
											] as StyleProp<ViewStyle>
										}
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
					Amount (₹)
				</ThemedText>
				<TextInput
					keyboardType="numeric"
					value={amount}
					onChangeText={setAmount}
					inputStyle={{ fontSize: FONT_SIZE.h2 }}
					placeholder="0"
					accessibilityLabel="amount-paid"
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
							Pay Full Outstanding {formatCurrency(outstandingBalance)}
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
						minHeight: PAYMENT_NOTES_MIN_HEIGHT,
						textAlignVertical: 'top',
					}}
				/>
			</View>

			{/* Save Button */}
			<Button
				title={submitting ? 'Saving...' : 'Pay Supplier'}
				onPress={handleSave}
				disabled={submitting}
				style={[styles.saveBtn, { marginTop: s.lg }]}
				accessibilityLabel="save-payment"
			/>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { paddingBottom: PAYMENT_FORM_BOTTOM_PADDING },
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
	modalCard: {
		width: SIZE_INPUT_HEIGHT * 6 + SPACING_PX.sm,
		padding: SPACING_PX.xl - SPACING_PX.xxs,
	},
	fullAmtChip: {
		alignSelf: 'flex-start',
		marginTop: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs + SPACING_PX.xxs,
		borderWidth: 1,
	},
	chipsRow: { flexDirection: 'row', gap: SPACING_PX.sm },
	modeChip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
	},
	saveBtn: { height: SIZE_INPUT_HEIGHT },
});
