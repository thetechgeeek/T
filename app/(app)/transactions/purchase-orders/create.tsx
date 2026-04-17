import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_ROW_HIGHLIGHT } from '@/src/theme/uiMetrics';
import { useRouter } from 'expo-router';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

interface LineItem {
	id: string;
	name: string;
	qty: string;
	unit: string;
	rate: string;
}

function addDays(n: number) {
	const d = new Date();
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
}

export default function CreatePOScreen() {
	const { c, s, r } = useThemeTokens();
	const router = useRouter();

	const [poNumber] = useState('PO-001');
	const [date] = useState(new Date().toISOString().slice(0, 10));
	const [supplier, setSupplier] = useState('');
	const [expectedDate, setExpectedDate] = useState(addDays(7));
	const [items, setItems] = useState<LineItem[]>([
		{ id: '1', name: '', qty: '1', unit: 'Box', rate: '' },
	]);
	const [terms, setTerms] = useState('Delivery within 7 days; Invoice to follow with dispatch');
	const [notes, setNotes] = useState('');

	const addItem = () =>
		setItems((p) => [
			...p,
			{ id: Date.now().toString(), name: '', qty: '1', unit: 'Box', rate: '' },
		]);
	const removeItem = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
	const updateItem = (id: string, field: keyof LineItem, value: string) =>
		setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

	const estimatedTotal = items.reduce(
		(sum, i) => sum + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0),
		0,
	);
	const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

	const handleSave = () => {
		if (!supplier.trim()) {
			Alert.alert('Error', 'Please enter supplier name');
			return;
		}
		Alert.alert(
			'Purchase Order Saved',
			`${poNumber} for ${supplier}\nEstimated: ${fmt(estimatedTotal)}`,
			[
				{ text: 'Share on WhatsApp', onPress: () => router.back() },
				{ text: 'Done', onPress: () => router.back() },
			],
		);
	};

	return (
		<AtomicScreen
			withKeyboard
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title="New Purchase Order" />}
			contentContainerStyle={{ padding: s.lg, paddingBottom: s['2xl'] }}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			<View style={styles.row2}>
				<View style={{ flex: 1 }}>
					<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
						PO Number
					</ThemedText>
					<TextInput
						value={poNumber}
						editable={false}
						style={[
							styles.input,
							{
								borderColor: c.border,
								color: c.onSurfaceVariant,
								backgroundColor: c.surfaceVariant,
								borderRadius: r.md,
							},
						]}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
						Date
					</ThemedText>
					<TextInput
						value={date}
						editable={false}
						style={[
							styles.input,
							{
								borderColor: c.border,
								color: c.onSurfaceVariant,
								backgroundColor: c.surfaceVariant,
								borderRadius: r.md,
							},
						]}
					/>
				</View>
			</View>

			<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
				Supplier *
			</ThemedText>
			<TextInput
				value={supplier}
				onChangeText={setSupplier}
				placeholder="Supplier name"
				placeholderTextColor={c.placeholder}
				style={[
					styles.input,
					{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
				]}
			/>

			<DatePickerField
				label="Expected Delivery Date"
				value={expectedDate}
				onChange={setExpectedDate}
			/>
			<View style={styles.chipRow}>
				<Pressable
					onPress={() => setExpectedDate(addDays(1))}
					style={[styles.chip, { borderColor: c.error, borderRadius: r.full }]}
				>
					<ThemedText variant="caption" color={c.error}>
						Urgent (Tomorrow)
					</ThemedText>
				</Pressable>
				{[7, 14, 30].map((d) => (
					<Pressable
						key={d}
						onPress={() => setExpectedDate(addDays(d))}
						style={[
							styles.chip,
							{
								borderColor: c.border,
								borderRadius: r.full,
								backgroundColor: c.surfaceVariant,
							},
						]}
					>
						<ThemedText variant="caption">{d} days</ThemedText>
					</Pressable>
				))}
			</View>

			<ThemedText variant="h3" style={{ marginTop: s.lg, marginBottom: s.sm }}>
				Line Items
			</ThemedText>
			{items.map((item, idx) => (
				<View
					key={item.id}
					style={[styles.itemCard, { borderColor: c.border, borderRadius: r.md }]}
				>
					<View style={styles.itemHeader}>
						<ThemedText variant="bodyBold" color={c.primary}>
							Item {idx + 1}
						</ThemedText>
						{items.length > 1 && (
							<Pressable onPress={() => removeItem(item.id)}>
								<Trash2 size={18} color={c.error} />
							</Pressable>
						)}
					</View>
					<TextInput
						value={item.name}
						onChangeText={(v) => updateItem(item.id, 'name', v)}
						placeholder="Item / product name"
						placeholderTextColor={c.placeholder}
						style={[
							styles.input,
							{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
						]}
					/>
					<View style={styles.row3}>
						<View style={{ flex: 1 }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Qty
							</ThemedText>
							<TextInput
								value={item.qty}
								onChangeText={(v) => updateItem(item.id, 'qty', v)}
								keyboardType="numeric"
								style={[
									styles.inputSm,
									{
										borderColor: c.border,
										color: c.onSurface,
										borderRadius: r.sm,
									},
								]}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Unit
							</ThemedText>
							<TextInput
								value={item.unit}
								onChangeText={(v) => updateItem(item.id, 'unit', v)}
								style={[
									styles.inputSm,
									{
										borderColor: c.border,
										color: c.onSurface,
										borderRadius: r.sm,
									},
								]}
							/>
						</View>
						<View style={{ flex: 2 }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Expected Rate (₹)
							</ThemedText>
							<TextInput
								value={item.rate}
								onChangeText={(v) => updateItem(item.id, 'rate', v)}
								keyboardType="numeric"
								placeholder="optional"
								placeholderTextColor={c.placeholder}
								style={[
									styles.inputSm,
									{
										borderColor: c.border,
										color: c.onSurface,
										borderRadius: r.sm,
									},
								]}
							/>
						</View>
					</View>
				</View>
			))}
			<Pressable
				onPress={addItem}
				style={[styles.addBtn, { borderColor: c.primary, borderRadius: r.md }]}
			>
				<Plus size={18} color={c.primary} />
				<ThemedText variant="body" color={c.primary}>
					{' '}
					Add Item
				</ThemedText>
			</Pressable>

			{estimatedTotal > 0 && (
				<View
					style={[
						styles.totalCard,
						{
							backgroundColor: withOpacity(c.primary, OPACITY_ROW_HIGHLIGHT),
							borderRadius: r.md,
						},
					]}
				>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Estimated Total (may vary at delivery)
					</ThemedText>
					<ThemedText variant="amountLarge" color={c.primary}>
						{fmt(estimatedTotal)}
					</ThemedText>
				</View>
			)}

			<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
				Terms
			</ThemedText>
			<TextInput
				value={terms}
				onChangeText={setTerms}
				multiline
				numberOfLines={3}
				style={[
					styles.textarea,
					{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
				]}
			/>

			<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
				Internal Notes
			</ThemedText>
			<TextInput
				value={notes}
				onChangeText={setNotes}
				multiline
				numberOfLines={2}
				placeholder="Internal notes (not printed)"
				placeholderTextColor={c.placeholder}
				style={[
					styles.textarea,
					{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
				]}
			/>

			<View style={{ marginTop: s.lg, gap: s.sm }}>
				<Button title="Share on WhatsApp" onPress={handleSave} />
				<Button title="Save PO" variant="secondary" onPress={handleSave} />
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	label: { marginBottom: SPACING_PX.sm - SPACING_PX.xxs, marginTop: SPACING_PX.md },
	row2: { flexDirection: 'row', gap: SPACING_PX.md },
	row3: { flexDirection: 'row', gap: SPACING_PX.sm, marginTop: SPACING_PX.sm },
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.sm,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
		borderWidth: 1,
	},
	input: { borderWidth: 1, padding: SPACING_PX.md, fontSize: FONT_SIZE.body },
	inputSm: {
		borderWidth: 1,
		padding: SPACING_PX.sm + SPACING_PX.xxs,
		fontSize: FONT_SIZE.caption,
	},
	textarea: {
		borderWidth: 1,
		padding: SPACING_PX.md,
		fontSize: FONT_SIZE.caption,
		textAlignVertical: 'top',
	},
	itemCard: {
		borderWidth: 1,
		padding: SPACING_PX.md,
		marginBottom: SPACING_PX.sm + SPACING_PX.xxs,
	},
	itemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: SPACING_PX.sm,
	},
	addBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderStyle: 'dashed',
		padding: SPACING_PX.md,
		marginBottom: SPACING_PX.lg,
	},
	totalCard: {
		padding: SPACING_PX.md + SPACING_PX.xxs,
		marginBottom: SPACING_PX.sm,
		alignItems: 'flex-end',
	},
});
