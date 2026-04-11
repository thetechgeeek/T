import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useRouter } from 'expo-router';

interface LineItem {
	id: string;
	name: string;
	qty: string;
	rate: string;
	gst: string;
}

function addDays(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

export default function CreateEstimateScreen() {
	const { c, s, r } = useThemeTokens();
	const router = useRouter();

	const [estNumber] = useState('EST-001');
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	const [validUntil, setValidUntil] = useState(addDays(15));
	const [customer, setCustomer] = useState('');
	const [subject, setSubject] = useState('');
	const [items, setItems] = useState<LineItem[]>([
		{ id: '1', name: '', qty: '1', rate: '', gst: '18' },
	]);
	const [terms, setTerms] = useState(
		'Delivery in 7-10 working days; 50% advance required with order; balance before delivery.',
	);

	const addItem = () => {
		setItems((prev) => [
			...prev,
			{ id: Date.now().toString(), name: '', qty: '1', rate: '', gst: '18' },
		]);
	};

	const removeItem = (id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
	};

	const updateItem = (id: string, field: keyof LineItem, value: string) => {
		setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
	};

	const subtotal = items.reduce(
		(sum, i) => sum + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0),
		0,
	);
	const totalGst = items.reduce((sum, i) => {
		const base = (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0);
		return sum + base * ((parseFloat(i.gst) || 0) / 100);
	}, 0);
	const grandTotal = subtotal + totalGst;

	const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

	const handleSave = () => {
		if (!customer.trim()) {
			Alert.alert('Error', 'Please enter customer name');
			return;
		}
		if (items.every((i) => !i.name)) {
			Alert.alert('Error', 'Add at least one item');
			return;
		}
		Alert.alert('Estimate Saved', `${estNumber} for ${customer} — ${fmt(grandTotal)}`, [
			{ text: 'Share on WhatsApp', onPress: () => router.back() },
			{ text: 'Done', onPress: () => router.back() },
		]);
	};

	const VALIDITY_SHORTCUTS = [7, 15, 30];

	return (
		<AtomicScreen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title="New Estimate / Quotation" />
			<ScrollView
				contentContainerStyle={{ padding: s.lg, paddingBottom: 32 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={[styles.row2]}>
					<View style={{ flex: 1 }}>
						<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
							Estimate No.
						</ThemedText>
						<TextInput
							value={estNumber}
							editable={false}
							style={[
								styles.input,
								{
									borderColor: c.border,
									color: c.onSurfaceVariant,
									borderRadius: r.md,
									backgroundColor: c.surfaceVariant,
								},
							]}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<DatePickerField label="Date" value={date} onChange={setDate} />
					</View>
				</View>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Valid Until
				</ThemedText>
				<View style={styles.validityRow}>
					{VALIDITY_SHORTCUTS.map((d) => (
						<Pressable
							key={d}
							onPress={() => setValidUntil(addDays(d))}
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
				<DatePickerField label="" value={validUntil} onChange={setValidUntil} />

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Customer *
				</ThemedText>
				<TextInput
					value={customer}
					onChangeText={setCustomer}
					placeholder="Customer name"
					placeholderTextColor={c.placeholder}
					style={[
						styles.input,
						{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
					]}
				/>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Subject (optional)
				</ThemedText>
				<TextInput
					value={subject}
					onChangeText={setSubject}
					placeholder="e.g. Quotation for Kitchen Tiles"
					placeholderTextColor={c.placeholder}
					style={[
						styles.input,
						{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
					]}
				/>

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
							placeholder="Item name"
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
							<View style={{ flex: 2 }}>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Rate (₹)
								</ThemedText>
								<TextInput
									value={item.rate}
									onChangeText={(v) => updateItem(item.id, 'rate', v)}
									keyboardType="numeric"
									placeholder="0"
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
							<View style={{ flex: 1 }}>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									GST %
								</ThemedText>
								<TextInput
									value={item.gst}
									onChangeText={(v) => updateItem(item.id, 'gst', v)}
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
						</View>
						{item.qty && item.rate && (
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: 4 }}
							>
								Total:{' '}
								{fmt(
									(parseFloat(item.qty) || 0) *
										(parseFloat(item.rate) || 0) *
										(1 + (parseFloat(item.gst) || 0) / 100),
								)}
							</ThemedText>
						)}
					</View>
				))}
				<Pressable
					onPress={addItem}
					style={[styles.addItemBtn, { borderColor: c.primary, borderRadius: r.md }]}
				>
					<Plus size={18} color={c.primary} />
					<ThemedText variant="body" color={c.primary}>
						{' '}
						Add Item
					</ThemedText>
				</Pressable>

				{/* Totals */}
				<View
					style={[
						styles.totalsCard,
						{ backgroundColor: c.surface, borderColor: c.border, borderRadius: r.lg },
					]}
				>
					<View style={styles.totalsRow}>
						<ThemedText variant="body">Subtotal</ThemedText>
						<ThemedText variant="body">{fmt(subtotal)}</ThemedText>
					</View>
					<View style={styles.totalsRow}>
						<ThemedText variant="body">GST</ThemedText>
						<ThemedText variant="body">{fmt(totalGst)}</ThemedText>
					</View>
					<View
						style={[
							styles.totalsRow,
							{
								borderTopWidth: 1,
								borderTopColor: c.border,
								marginTop: 4,
								paddingTop: 8,
							},
						]}
					>
						<ThemedText variant="bodyBold">Grand Total</ThemedText>
						<ThemedText variant="amountLarge" color={c.primary}>
							{fmt(grandTotal)}
						</ThemedText>
					</View>
				</View>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={styles.label}>
					Terms & Conditions
				</ThemedText>
				<TextInput
					value={terms}
					onChangeText={setTerms}
					multiline
					numberOfLines={4}
					style={[
						styles.textarea,
						{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
					]}
				/>

				<View style={{ marginTop: s.lg, gap: s.sm }}>
					<Button title="Share on WhatsApp" onPress={handleSave} />
					<Button title="Save" variant="secondary" onPress={handleSave} />
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	label: { marginBottom: 6, marginTop: 12 },
	row2: { flexDirection: 'row', gap: 12 },
	row3: { flexDirection: 'row', gap: 8, marginTop: 8 },
	input: { borderWidth: 1, padding: 12, fontSize: 16 },
	inputSm: { borderWidth: 1, padding: 10, fontSize: 15 },
	textarea: { borderWidth: 1, padding: 12, fontSize: 15, textAlignVertical: 'top' },
	chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
	validityRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
	itemCard: { borderWidth: 1, padding: 12, marginBottom: 10 },
	itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
	addItemBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderStyle: 'dashed',
		padding: 12,
		marginBottom: 16,
	},
	totalsCard: { borderWidth: 1, padding: 16, marginTop: 8 },
	totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
