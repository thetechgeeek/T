import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { ArrowRightLeft } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import {
	OPACITY_SKELETON_BASE,
	OPACITY_ROW_HIGHLIGHT,
	OPACITY_BORDER_TINT,
} from '@/src/theme/uiMetrics';
import { useLocale } from '@/src/hooks/useLocale';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { MOCK_TRANSFER_ACCOUNTS } from '@/src/mocks/finance/transfer';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const TRANSFER_FORM_BOTTOM_PADDING = 32;
const TRANSFER_DOT_SIZE = 10;
const TRANSFER_DOT_RADIUS = 5;
const TRANSFER_ARROW_SIZE = 40;
const TRANSFER_ARROW_RADIUS = 20;

const ACCOUNTS = MOCK_TRANSFER_ACCOUNTS;

function AccountPicker({
	label,
	selectedId,
	excludeId,
	onSelect,
}: {
	label: string;
	selectedId: string;
	excludeId: string;
	onSelect: (id: string) => void;
}) {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	return (
		<View style={{ marginBottom: s.md }}>
			<ThemedText
				variant="label"
				color={c.onSurfaceVariant}
				style={{ marginBottom: SPACING_PX.xs + SPACING_PX.xxs }}
			>
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
										? withOpacity(c.primary, OPACITY_SKELETON_BASE)
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
}

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

	return (
		<AtomicScreen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title="Fund Transfer" />
			<ScrollView
				contentContainerStyle={{
					padding: s.lg,
					paddingBottom: TRANSFER_FORM_BOTTOM_PADDING,
				}}
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

				<ThemedText
					variant="label"
					color={c.onSurfaceVariant}
					style={{ marginBottom: SPACING_PX.xs + SPACING_PX.xxs }}
				>
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
						style={[styles.amountText, { color: c.onSurface, fontSize: FONT_SIZE.h2 }]}
					/>
				</View>

				{parsedAmount > 0 && fromAccount && toAccount && (
					<View
						style={[
							styles.previewCard,
							{
								backgroundColor: withOpacity(c.primary, OPACITY_ROW_HIGHLIGHT),
								borderRadius: r.md,
								borderColor: withOpacity(c.primary, OPACITY_BORDER_TINT),
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
					style={{ marginBottom: SPACING_PX.xs + SPACING_PX.xxs, marginTop: s.sm }}
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

				<View style={{ height: SPACING_PX.xl }} />
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
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	dot: {
		width: TRANSFER_DOT_SIZE,
		height: TRANSFER_DOT_SIZE,
		borderRadius: TRANSFER_DOT_RADIUS,
	},
	arrowRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: SPACING_PX.sm,
	},
	arrowLine: {
		flex: 1,
		height: StyleSheet.hairlineWidth,
	},
	arrowCircle: {
		width: TRANSFER_ARROW_SIZE,
		height: TRANSFER_ARROW_SIZE,
		borderRadius: TRANSFER_ARROW_RADIUS,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: SPACING_PX.md,
	},
	amountInput: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		marginBottom: SPACING_PX.md,
		gap: SPACING_PX.sm,
	},
	amountText: {
		flex: 1,
		fontWeight: '700',
	},
	previewCard: {
		padding: SPACING_PX.md,
		marginBottom: SPACING_PX.lg,
	},
	notesInput: {
		borderWidth: 1,
		padding: SPACING_PX.md,
		textAlignVertical: 'top',
		fontSize: FONT_SIZE.body,
	},
});
