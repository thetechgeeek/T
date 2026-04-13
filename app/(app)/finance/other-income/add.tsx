import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput, Pressable } from 'react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useRouter } from 'expo-router';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const OTHER_INCOME_BOTTOM_PADDING = 32;

const CATEGORIES = [
	'Interest',
	'Commission',
	'Rent Received',
	'Dividend',
	'Sale of Assets',
	'Miscellaneous',
];

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'];

export default function AddOtherIncomeScreen() {
	const { c, s, r } = useThemeTokens();
	const router = useRouter();

	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	const [amount, setAmount] = useState('');
	const [category, setCategory] = useState('');
	const [paymentMode, setPaymentMode] = useState('Cash');
	const [receivedFrom, setReceivedFrom] = useState('');
	const [description, setDescription] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSave = async () => {
		if (!amount || parseFloat(amount) <= 0) {
			Alert.alert('Error', 'Please enter a valid amount');
			return;
		}
		if (!category) {
			Alert.alert('Error', 'Please select a category');
			return;
		}
		setSubmitting(true);
		setTimeout(() => {
			setSubmitting(false);
			Alert.alert('Success', 'Income entry saved successfully');
			router.back();
		}, 600);
	};

	return (
		<AtomicScreen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title="Add Other Income" />
			<ScrollView
				contentContainerStyle={{
					padding: s.lg,
					paddingBottom: OTHER_INCOME_BOTTOM_PADDING,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<DatePickerField label="Date" value={date} onChange={setDate} />

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Amount *
				</ThemedText>
				<View
					style={[
						styles.amountRow,
						{ borderColor: c.border, borderRadius: r.md, backgroundColor: c.surface },
					]}
				>
					<ThemedText variant="h3" color={c.onSurfaceVariant}>
						₹
					</ThemedText>
					<TextInput
						value={amount}
						onChangeText={setAmount}
						keyboardType="numeric"
						placeholder="0"
						placeholderTextColor={c.placeholder}
						style={[styles.amountInput, { color: c.onSurface }]}
					/>
				</View>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Category *
				</ThemedText>
				<View style={[styles.chipRow]}>
					{CATEGORIES.map((cat) => (
						<Pressable
							key={cat}
							onPress={() => setCategory(cat)}
							style={[
								styles.chip,
								{
									borderColor: category === cat ? c.primary : c.border,
									backgroundColor: category === cat ? c.primary : c.surface,
									borderRadius: r.full,
								},
							]}
						>
							<ThemedText
								variant="caption"
								color={category === cat ? c.onPrimary : c.onSurface}
							>
								{cat}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Payment Mode
				</ThemedText>
				<View style={styles.chipRow}>
					{PAYMENT_MODES.map((mode) => (
						<Pressable
							key={mode}
							onPress={() => setPaymentMode(mode)}
							style={[
								styles.chip,
								{
									borderColor: paymentMode === mode ? c.primary : c.border,
									backgroundColor: paymentMode === mode ? c.primary : c.surface,
									borderRadius: r.full,
								},
							]}
						>
							<ThemedText
								variant="caption"
								color={paymentMode === mode ? c.onPrimary : c.onSurface}
							>
								{mode}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Received From (optional)
				</ThemedText>
				<TextInput
					value={receivedFrom}
					onChangeText={setReceivedFrom}
					placeholder="e.g. Bank interest, Tenant name"
					placeholderTextColor={c.placeholder}
					style={[
						styles.textInput,
						{
							borderColor: c.border,
							borderRadius: r.md,
							color: c.onSurface,
							backgroundColor: c.surface,
						},
					]}
				/>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Description / Notes (optional)
				</ThemedText>
				<TextInput
					value={description}
					onChangeText={setDescription}
					placeholder="Any additional details"
					placeholderTextColor={c.placeholder}
					multiline
					numberOfLines={3}
					style={[
						styles.textArea,
						{
							borderColor: c.border,
							borderRadius: r.md,
							color: c.onSurface,
							backgroundColor: c.surface,
						},
					]}
				/>

				<View style={{ height: SPACING_PX.xl }} />
				<Button title="Save Income" onPress={handleSave} loading={submitting} />
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	label: { marginBottom: SPACING_PX.xs + SPACING_PX.xxs, marginTop: SPACING_PX.md },
	amountRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.xs,
	},
	amountInput: {
		flex: 1,
		fontSize: FONT_SIZE.h2,
		fontWeight: '700',
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.xs,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
	},
	textInput: {
		borderWidth: 1,
		padding: SPACING_PX.md,
		fontSize: FONT_SIZE.body,
		minHeight: TOUCH_TARGET_MIN_PX,
	},
	textArea: {
		borderWidth: 1,
		padding: SPACING_PX.md,
		fontSize: FONT_SIZE.body,
		minHeight: SPACING_PX['4xl'] + SPACING_PX.lg,
		textAlignVertical: 'top',
	},
});
