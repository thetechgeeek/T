import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { ArrowRightLeft } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';

const ACCOUNTS = [
	{ id: 'cash', name: 'Cash in Hand', balance: 15000, type: 'Cash' },
	{ id: 'sbi', name: 'SBI Savings', balance: 85000, type: 'Bank' },
	{ id: 'hdfc', name: 'HDFC Current', balance: 230000, type: 'Bank' },
];

export default function FundTransferScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const [fromId, setFromId] = useState<string>('');
	const [toId, setToId] = useState<string>('');
	const [amount, setAmount] = useState('');
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	const [notes, setNotes] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const fromAccount = ACCOUNTS.find((a) => a.id === fromId);
	const toAccount = ACCOUNTS.find((a) => a.id === toId);
	const parsedAmount = parseFloat(amount) || 0;

	const handleTransfer = async () => {
		if (!fromId || !toId) {
			Alert.alert('Error', 'Please select both accounts');
			return;
		}
		if (fromId === toId) {
			Alert.alert('Error', 'From and To accounts cannot be the same');
			return;
		}
		if (parsedAmount <= 0) {
			Alert.alert('Error', 'Please enter a valid amount');
			return;
		}
		setSubmitting(true);
		setTimeout(() => {
			setSubmitting(false);
			Alert.alert(
				'Success',
				`₹${formatCurrency(parsedAmount)} transferred from ${fromAccount?.name} to ${toAccount?.name}`,
			);
		}, 800);
	};

	const AccountPicker = ({
		label,
		selectedId,
		excludeId,
		onSelect,
	}: {
		label: string;
		selectedId: string;
		excludeId: string;
		onSelect: (id: string) => void;
	}) => {
		const selected = ACCOUNTS.find((a) => a.id === selectedId);
		return (
			<View style={{ marginBottom: s.md }}>
				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 6 }}>
					{label}
				</ThemedText>
				<View style={[styles.pickerBox, { borderColor: c.border, borderRadius: r.md }]}>
					{ACCOUNTS.filter((a) => a.id !== excludeId).map((account) => (
						<Pressable
							key={account.id}
							onPress={() => onSelect(account.id)}
							style={[
								styles.accountRow,
								{
									backgroundColor:
										selectedId === account.id
											? c.primary + '15'
											: 'transparent',
									borderBottomColor: c.border,
								},
							]}
						>
							<View style={{ flex: 1 }}>
								<ThemedText
									variant="body"
									color={selectedId === account.id ? c.primary : c.onSurface}
								>
									{account.name}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									{account.type} · Balance: {formatCurrency(account.balance)}
								</ThemedText>
							</View>
							{selectedId === account.id && (
								<View style={[styles.dot, { backgroundColor: c.primary }]} />
							)}
						</Pressable>
					))}
				</View>
			</View>
		);
	};

	return (
		<AtomicScreen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title="Fund Transfer" />
			<ScrollView
				contentContainerStyle={{ padding: s.lg, paddingBottom: 32 }}
				keyboardShouldPersistTaps="handled"
			>
				<AccountPicker
					label="From Account *"
					selectedId={fromId}
					excludeId={toId}
					onSelect={setFromId}
				/>

				{/* Arrow indicator */}
				<View style={styles.arrowRow}>
					<View style={[styles.arrowLine, { backgroundColor: c.border }]} />
					<View style={[styles.arrowCircle, { backgroundColor: c.surfaceVariant }]}>
						<ArrowRightLeft size={18} color={c.primary} />
					</View>
					<View style={[styles.arrowLine, { backgroundColor: c.border }]} />
				</View>

				<AccountPicker
					label="To Account *"
					selectedId={toId}
					excludeId={fromId}
					onSelect={setToId}
				/>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 6 }}>
					Transfer Amount *
				</ThemedText>
				<View
					style={[
						styles.amountInput,
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
						style={[styles.amountText, { color: c.onSurface, fontSize: 24 }]}
					/>
				</View>

				{parsedAmount > 0 && fromAccount && toAccount && (
					<View
						style={[
							styles.previewCard,
							{
								backgroundColor: c.primary + '10',
								borderRadius: r.md,
								borderColor: c.primary + '30',
								borderWidth: 1,
							},
						]}
					>
						<ThemedText variant="body" align="center">
							Transfer{' '}
							<ThemedText variant="bodyBold" color={c.primary}>
								{formatCurrency(parsedAmount)}
							</ThemedText>{' '}
							from <ThemedText variant="bodyBold">{fromAccount.name}</ThemedText> to{' '}
							<ThemedText variant="bodyBold">{toAccount.name}</ThemedText>
						</ThemedText>
					</View>
				)}

				<DatePickerField label="Date" value={date} onChange={setDate} />

				<ThemedText
					variant="label"
					color={c.onSurfaceVariant}
					style={{ marginBottom: 6, marginTop: s.sm }}
				>
					Notes (optional)
				</ThemedText>
				<TextInput
					value={notes}
					onChangeText={setNotes}
					placeholder="e.g. Cash deposited to HDFC"
					placeholderTextColor={c.placeholder}
					multiline
					numberOfLines={2}
					style={[
						styles.notesInput,
						{
							borderColor: c.border,
							borderRadius: r.md,
							color: c.onSurface,
							backgroundColor: c.surface,
						},
					]}
				/>

				<View style={{ height: 24 }} />
				<Button
					title="Transfer Funds"
					onPress={handleTransfer}
					loading={submitting}
					disabled={!fromId || !toId || parsedAmount <= 0}
				/>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	pickerBox: {
		borderWidth: 1,
		overflow: 'hidden',
	},
	accountRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	arrowRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
	},
	arrowLine: {
		flex: 1,
		height: 1,
	},
	arrowCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 12,
	},
	amountInput: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginBottom: 12,
		gap: 8,
	},
	amountText: {
		flex: 1,
		fontWeight: '700',
	},
	previewCard: {
		padding: 14,
		marginBottom: 16,
	},
	notesInput: {
		borderWidth: 1,
		padding: 12,
		textAlignVertical: 'top',
		fontSize: 16,
	},
});
