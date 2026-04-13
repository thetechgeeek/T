import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { useFinanceStore } from '@/src/stores/financeStore';
import type { PaymentMode } from '@/src/types/invoice';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const EXPENSE_FORM_BOTTOM_PADDING = 32;

const CATEGORIES = [
	{ label: 'Rent', value: 'rent' },
	{ label: 'Transport', value: 'transport' },
	{ label: 'Labour', value: 'labour' },
	{ label: 'Utilities', value: 'utilities' },
	{ label: 'Packaging', value: 'packaging' },
	{ label: 'Maintenance', value: 'maintenance' },
	{ label: 'Miscellaneous', value: 'miscellaneous' },
];

const PAYMENT_MODES = [
	{ label: 'Cash', value: 'cash' },
	{ label: 'UPI', value: 'upi' },
	{ label: 'Bank', value: 'bank_transfer' },
	{ label: 'Cheque', value: 'cheque' },
];

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

export default function AddExpenseScreen() {
	const { c, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [expenseDate, setExpenseDate] = useState(todayISO());
	const [amount, setAmount] = useState('');
	const [category, setCategory] = useState('');
	const [paymentMode, setPaymentMode] = useState('cash');
	const [referenceNo, setReferenceNo] = useState('');
	const [notes, setNotes] = useState('');
	const [paidTo, setPaidTo] = useState('');
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		const parsedAmount = parseFloat(amount);
		if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
			Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
			return;
		}
		if (!category) {
			Alert.alert('Validation Error', 'Please select a category.');
			return;
		}

		setSaving(true);
		try {
			await useFinanceStore.getState().addExpense({
				expense_date: expenseDate,
				amount: parsedAmount,
				category,
				notes: notes || undefined,
				payment_mode: paymentMode as PaymentMode,
			});
			router.back();
		} catch (e: unknown) {
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSaving(false);
		}
	};

	const chipStyle = (selected: boolean) => [
		styles.chip,
		{
			backgroundColor: selected ? c.primary : c.surface,
			borderColor: c.primary,
			borderRadius: r.full,
		},
	];

	const chipTextColor = (selected: boolean) => (selected ? c.onPrimary : c.primary);

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard
			scrollable
			contentContainerStyle={[
				styles.scrollContent,
				{ paddingBottom: EXPENSE_FORM_BOTTOM_PADDING + insets.bottom },
			]}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			<ScreenHeader title={t('finance.newExpense')} showBackButton />
			{/* Date */}
			<View style={styles.section}>
				<DatePickerField
					label="Date"
					value={expenseDate}
					onChange={setExpenseDate}
					showShortcuts
				/>
			</View>

			{/* Amount */}
			<View style={styles.section}>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.fieldLabel}>
					Amount *
				</ThemedText>
				<View style={[styles.amountRow, { borderColor: c.border, borderRadius: r.md }]}>
					<ThemedText
						style={[
							styles.currencyPrefix,
							{
								color: c.onSurface,
								borderRightColor: c.border,
								fontSize: FONT_SIZE.h2,
							},
						]}
					>
						₹
					</ThemedText>
					<TextInput
						value={amount}
						onChangeText={setAmount}
						placeholder="0"
						placeholderTextColor={c.placeholder}
						keyboardType="numeric"
						style={[styles.amountInput, { color: c.onSurface, fontSize: FONT_SIZE.h1 }]}
						accessibilityLabel="expense-amount"
					/>
				</View>
			</View>

			{/* Category chips */}
			<View style={styles.section}>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.fieldLabel}>
					Category *
				</ThemedText>
				<View style={styles.chipGrid}>
					{CATEGORIES.map((cat) => (
						<Pressable
							key={cat.value}
							onPress={() => setCategory(cat.value)}
							style={chipStyle(category === cat.value)}
							accessibilityRole="button"
							accessibilityState={{ selected: category === cat.value }}
						>
							<ThemedText
								variant="caption"
								color={chipTextColor(category === cat.value)}
								style={{ fontWeight: category === cat.value ? '600' : '400' }}
							>
								{cat.label}
							</ThemedText>
						</Pressable>
					))}
				</View>
			</View>

			{/* Payment Mode chips */}
			<View style={styles.section}>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.fieldLabel}>
					Payment Mode
				</ThemedText>
				<View style={styles.chipRow}>
					{PAYMENT_MODES.map((mode) => (
						<Pressable
							key={mode.value}
							onPress={() => setPaymentMode(mode.value)}
							style={chipStyle(paymentMode === mode.value)}
							accessibilityRole="button"
							accessibilityState={{ selected: paymentMode === mode.value }}
						>
							<ThemedText
								variant="caption"
								color={chipTextColor(paymentMode === mode.value)}
								style={{
									fontWeight: paymentMode === mode.value ? '600' : '400',
								}}
							>
								{mode.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				{paymentMode === 'upi' ? (
					<TextInput
						value={referenceNo}
						onChangeText={setReferenceNo}
						placeholder="Reference No."
						placeholderTextColor={c.placeholder}
						style={[
							styles.textField,
							{
								color: c.onSurface,
								borderColor: c.border,
								borderRadius: r.md,
								backgroundColor: c.surface,
								marginTop: SPACING_PX.md - SPACING_PX.xxs,
							},
						]}
						accessibilityLabel="upi-reference"
					/>
				) : null}
			</View>

			{/* Description */}
			<View style={styles.section}>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.fieldLabel}>
					Description
				</ThemedText>
				<TextInput
					value={notes}
					onChangeText={setNotes}
					placeholder="What was this expense for?"
					placeholderTextColor={c.placeholder}
					multiline
					numberOfLines={3}
					style={[
						styles.textField,
						styles.multilineField,
						{
							color: c.onSurface,
							borderColor: c.border,
							borderRadius: r.md,
							backgroundColor: c.surface,
						},
					]}
					accessibilityLabel="expense-description"
				/>
			</View>

			{/* Paid To */}
			<View style={styles.section}>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.fieldLabel}>
					Paid To
				</ThemedText>
				<TextInput
					value={paidTo}
					onChangeText={setPaidTo}
					placeholder="Vendor / person name (optional)"
					placeholderTextColor={c.placeholder}
					style={[
						styles.textField,
						{
							color: c.onSurface,
							borderColor: c.border,
							borderRadius: r.md,
							backgroundColor: c.surface,
						},
					]}
					accessibilityLabel="expense-paid-to"
				/>
			</View>

			{/* Save button */}
			<Button
				title={saving ? t('common.loading') : t('finance.saveExpense')}
				onPress={handleSave}
				loading={saving}
				style={styles.saveButton}
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		padding: SPACING_PX.lg,
	},
	section: {
		marginBottom: SPACING_PX.xl,
	},
	fieldLabel: {
		marginBottom: SPACING_PX.sm,
		fontWeight: '600',
	},
	amountRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		minHeight: SIZE_INPUT_HEIGHT,
	},
	currencyPrefix: {
		paddingHorizontal: SPACING_PX.md,
		borderRightWidth: 1,
		fontWeight: '600',
	},
	amountInput: {
		flex: 1,
		paddingHorizontal: SPACING_PX.md,
		fontWeight: '600',
	},
	chipGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textField: {
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xs / 2,
		fontSize: FONT_SIZE.body,
		minHeight: TOUCH_TARGET_MIN_PX,
	},
	multilineField: {
		minHeight: SPACING_PX['4xl'] + SPACING_PX.lg,
		textAlignVertical: 'top',
	},
	saveButton: {
		height: SIZE_INPUT_HEIGHT,
		marginTop: SPACING_PX.sm,
	},
});
