import React, { useState } from 'react';
import { SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import {
	View,
	ScrollView,
	StyleSheet,
	Alert,
	Pressable,
	TextInput as RNTextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Card } from '@/src/design-system/components/atoms/Card';
import { Button } from '@/src/design-system/components/atoms/Button';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

type ReasonOption = 'Defective' | 'Wrong Item' | 'Price Difference' | 'Short Supply' | 'Other';

const REASON_OPTIONS: ReasonOption[] = [
	'Defective',
	'Wrong Item',
	'Price Difference',
	'Short Supply',
	'Other',
];

type ApplyMode = 'adjust' | 'refund';

interface ReturnItem {
	id: string;
	name: string;
	qty: string;
	rate: string;
}

function todayString() {
	return new Date().toISOString().slice(0, 10);
}

export default function CreateCreditNoteScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const router = useRouter();

	const [cnNumber, setCnNumber] = useState('CN-001');
	const [date, setDate] = useState(todayString());
	const [customer, setCustomer] = useState('');
	const [originalInvoice, setOriginalInvoice] = useState('');
	const [selectedReason, setSelectedReason] = useState<ReasonOption | null>(null);
	const [customReason, setCustomReason] = useState('');
	const [applyMode, setApplyMode] = useState<ApplyMode>('adjust');

	const [items, setItems] = useState<ReturnItem[]>([{ id: '1', name: '', qty: '1', rate: '' }]);

	const addItem = () => {
		setItems((prev) => [...prev, { id: String(Date.now()), name: '', qty: '1', rate: '' }]);
	};

	const removeItem = (id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
	};

	const updateItem = (id: string, field: keyof ReturnItem, value: string) => {
		setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
	};

	const returnTotal = items.reduce((sum, item) => {
		const qty = parseFloat(item.qty) || 0;
		const rate = parseFloat(item.rate) || 0;
		return sum + qty * rate;
	}, 0);

	const handleSave = () => {
		Alert.alert('Credit Note Saved', 'Credit note saved. Party balance updated.', [
			{ text: 'OK', onPress: () => router.back() },
		]);
	};

	const inputStyle = {
		borderWidth: 1,
		borderColor: c.border,
		borderRadius: r.md,
		paddingHorizontal: s.md,
		paddingVertical: s.sm + s.xxs,
		color: c.onSurface,
		backgroundColor: c.surface,
		fontSize: FONT_SIZE.caption,
	};

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			scrollable
			header={
				<ScreenHeader
					title="New Sale Return / Credit Note"
					rightElement={
						<Pressable onPress={() => router.back()} accessibilityLabel="close">
							<X size={22} color={c.onSurface} />
						</Pressable>
					}
				/>
			}
			contentContainerStyle={[styles.content, { padding: s.md }]}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			{/* Credit Note No. */}
			<TextInput
				label="Credit Note No."
				value={cnNumber}
				onChangeText={setCnNumber}
				placeholder="CN-001"
				accessibilityLabel="cn-number"
			/>

			{/* Date */}
			<View style={{ marginTop: s.md }}>
				<DatePickerField label="Date" value={date} onChange={setDate} />
			</View>

			{/* Customer */}
			<View style={{ marginTop: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Customer / Party
				</ThemedText>
				<RNTextInput
					style={inputStyle}
					placeholder="Search customer or party name..."
					placeholderTextColor={c.placeholder}
					value={customer}
					onChangeText={setCustomer}
					accessibilityLabel="customer-input"
				/>
			</View>

			{/* Original Invoice */}
			<View style={{ marginTop: s.md }}>
				<TextInput
					label="Original Invoice No. (optional)"
					value={originalInvoice}
					onChangeText={setOriginalInvoice}
					placeholder="e.g. INV-042"
					accessibilityLabel="original-invoice"
				/>
			</View>

			{/* Reason for Return */}
			<View style={{ marginTop: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Reason for Return
				</ThemedText>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={styles.chipRow}>
						{REASON_OPTIONS.map((reason) => {
							const active = selectedReason === reason;
							return (
								<Pressable
									key={reason}
									onPress={() => setSelectedReason(reason)}
									style={[
										styles.chip,
										{
											backgroundColor: active ? c.primary : c.surface,
											borderColor: active ? c.primary : c.border,
											borderRadius: r.full,
										},
									]}
									accessibilityRole="button"
									accessibilityState={{ selected: active }}
								>
									<ThemedText
										variant="caption"
										color={active ? c.onPrimary : c.onSurface}
									>
										{reason}
									</ThemedText>
								</Pressable>
							);
						})}
					</View>
				</ScrollView>

				{selectedReason === 'Other' && (
					<View style={{ marginTop: s.sm }}>
						<RNTextInput
							style={inputStyle}
							placeholder="Describe reason..."
							placeholderTextColor={c.placeholder}
							value={customReason}
							onChangeText={setCustomReason}
							accessibilityLabel="custom-reason"
						/>
					</View>
				)}
			</View>

			{/* Items Returned */}
			<View style={{ marginTop: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Items Returned
				</ThemedText>

				{items.map((item, idx) => (
					<Card key={item.id} padding="sm" style={{ marginBottom: s.sm }}>
						<View style={styles.itemHeader}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Item {idx + 1}
							</ThemedText>
							{items.length > 1 && (
								<Pressable
									onPress={() => removeItem(item.id)}
									accessibilityLabel={`remove-item-${idx + 1}`}
								>
									<Trash2 size={16} color={c.error} />
								</Pressable>
							)}
						</View>
						<RNTextInput
							style={[inputStyle, { marginTop: s.xs }]}
							placeholder="Item Name"
							placeholderTextColor={c.placeholder}
							value={item.name}
							onChangeText={(v) => updateItem(item.id, 'name', v)}
						/>
						<View style={[styles.twoCol, { marginTop: s.xs }]}>
							<RNTextInput
								style={[inputStyle, { flex: 1 }]}
								placeholder="Qty"
								placeholderTextColor={c.placeholder}
								value={item.qty}
								onChangeText={(v) => updateItem(item.id, 'qty', v)}
								keyboardType="numeric"
							/>
							<RNTextInput
								style={[inputStyle, { flex: 1 }]}
								placeholder="Rate (₹)"
								placeholderTextColor={c.placeholder}
								value={item.rate}
								onChangeText={(v) => updateItem(item.id, 'rate', v)}
								keyboardType="numeric"
							/>
						</View>
					</Card>
				))}

				<Pressable
					style={[styles.addBtn, { borderColor: c.primary, borderRadius: r.md }]}
					onPress={addItem}
					accessibilityLabel="add-item"
				>
					<Plus size={16} color={c.primary} />
					<ThemedText variant="caption" color={c.primary} style={{ marginLeft: s.xs }}>
						Add Item
					</ThemedText>
				</Pressable>
			</View>

			{/* Return Total */}
			<Card
				padding="md"
				style={[styles.totalCard, { backgroundColor: c.surface, marginTop: s.md }]}
			>
				<ThemedText variant="label" color={c.onSurfaceVariant}>
					Return Total
				</ThemedText>
				<ThemedText variant="amount" color={c.error} style={{ marginTop: s.xs }}>
					Total Credit: {formatCurrency(returnTotal)}
				</ThemedText>
			</Card>

			{/* Apply Credit */}
			<View style={{ marginTop: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Apply Credit
				</ThemedText>
				<View style={styles.applyRow}>
					<Pressable
						style={[
							styles.applyOption,
							{
								borderColor: applyMode === 'adjust' ? c.primary : c.border,
								backgroundColor: applyMode === 'adjust' ? c.primary : c.surface,
								borderRadius: r.md,
								flex: 1,
							},
						]}
						onPress={() => setApplyMode('adjust')}
						accessibilityRole="radio"
						accessibilityState={{ checked: applyMode === 'adjust' }}
					>
						<ThemedText
							variant="caption"
							color={applyMode === 'adjust' ? c.onPrimary : c.onSurface}
							align="center"
						>
							Adjust against party balance
						</ThemedText>
					</Pressable>
					<Pressable
						style={[
							styles.applyOption,
							{
								borderColor: applyMode === 'refund' ? c.primary : c.border,
								backgroundColor: applyMode === 'refund' ? c.primary : c.surface,
								borderRadius: r.md,
								flex: 1,
							},
						]}
						onPress={() => setApplyMode('refund')}
						accessibilityRole="radio"
						accessibilityState={{ checked: applyMode === 'refund' }}
					>
						<ThemedText
							variant="caption"
							color={applyMode === 'refund' ? c.onPrimary : c.onSurface}
							align="center"
						>
							Refund via payment
						</ThemedText>
					</Pressable>
				</View>
			</View>

			<Button
				title="Save"
				onPress={handleSave}
				style={[styles.saveBtn, { marginTop: s.lg }]}
				accessibilityLabel="save-credit-note"
			/>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	content: { paddingBottom: SPACING_PX['2xl'] + SPACING_PX.sm },
	label: { marginBottom: SPACING_PX.sm - SPACING_PX.xxs },
	chipRow: { flexDirection: 'row', gap: SPACING_PX.sm },
	chip: {
		paddingHorizontal: SPACING_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs + 1,
		borderWidth: 1,
	},
	itemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	twoCol: { flexDirection: 'row', gap: SPACING_PX.sm },
	addBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		borderStyle: 'dashed',
		alignSelf: 'flex-start',
		marginTop: SPACING_PX.xs,
	},
	totalCard: {
		borderRadius: SPACING_PX.sm,
	},
	applyRow: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
	},
	applyOption: {
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.sm,
		borderWidth: 1,
		alignItems: 'center',
	},
	saveBtn: { height: SIZE_INPUT_HEIGHT },
});
