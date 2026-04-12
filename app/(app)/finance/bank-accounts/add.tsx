import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// TODO: connect to store — save to bank_accounts table via Supabase
const BANKS = [
	'SBI',
	'HDFC',
	'ICICI',
	'Axis',
	'Kotak',
	'PNB',
	'BOB',
	'Canara',
	'Union Bank',
	'Yes Bank',
	'IndusInd',
	'IDFC',
	'Federal Bank',
	'Other',
];

const ACCOUNT_TYPES = ['Savings', 'Current', 'Overdraft'] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

export default function AddBankAccountScreen() {
	const { theme, c, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [selectedBank, setSelectedBank] = useState('');
	const [accountNumber, setAccountNumber] = useState('');
	const [ifscCode, setIfscCode] = useState('');
	const [accountType, setAccountType] = useState<AccountType>('Savings');
	const [accountHolder, setAccountHolder] = useState('');
	const [openingBalance, setOpeningBalance] = useState('');
	const [isPrimary, setIsPrimary] = useState(false);
	const [saving, setSaving] = useState(false);

	const chipStyle = (selected: boolean) => [
		styles.chip,
		{
			backgroundColor: selected ? c.primary : theme.colors.surfaceVariant,
			borderRadius: r.full,
		},
	];

	const chipTextColor = (selected: boolean) =>
		selected ? c.onPrimary : theme.colors.onSurfaceVariant;

	const handleSave = async () => {
		if (!selectedBank) {
			Alert.alert('Validation', 'Please select a bank.');
			return;
		}
		if (!accountNumber || accountNumber.length < 9 || accountNumber.length > 18) {
			Alert.alert('Validation', 'Account number must be between 9 and 18 digits.');
			return;
		}
		if (!ifscCode || ifscCode.length !== 11) {
			Alert.alert('Validation', 'IFSC code must be exactly 11 characters.');
			return;
		}
		if (!accountHolder.trim()) {
			Alert.alert('Validation', 'Please enter account holder name.');
			return;
		}

		setSaving(true);
		try {
			// TODO: connect to store
			await new Promise((res) => setTimeout(res, 600));
			Alert.alert('Success', `${selectedBank} account added successfully.`, [
				{ text: 'OK', onPress: () => router.back() },
			]);
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

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard>
			<ScreenHeader title="Add Bank Account" showBackButton />

			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
				keyboardShouldPersistTaps="handled"
			>
				{/* Bank selection */}
				<View style={styles.section}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.fieldLabel}
					>
						Bank Name *
					</ThemedText>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View style={styles.chipRow}>
							{BANKS.map((bank) => (
								<Pressable
									key={bank}
									onPress={() => setSelectedBank(bank)}
									style={chipStyle(selectedBank === bank)}
									accessibilityRole="button"
									accessibilityState={{ selected: selectedBank === bank }}
									accessibilityLabel={`bank-${bank}`}
								>
									<ThemedText
										variant="caption"
										color={chipTextColor(selectedBank === bank)}
										style={{
											fontWeight: selectedBank === bank ? '700' : '400',
											paddingHorizontal: 14,
											paddingVertical: 8,
										}}
									>
										{bank}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</ScrollView>
				</View>

				{/* Account Number */}
				<View style={styles.section}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.fieldLabel}
					>
						Account Number * (9–18 digits)
					</ThemedText>
					<TextInput
						value={accountNumber}
						onChangeText={(v) => setAccountNumber(v.replace(/[^0-9]/g, ''))}
						placeholder="Enter account number"
						placeholderTextColor={c.placeholder}
						keyboardType="numeric"
						maxLength={18}
						style={[
							styles.textField,
							{
								color: c.onSurface,
								borderColor: c.border,
								borderRadius: r.md,
								backgroundColor: theme.colors.surface,
							},
						]}
						accessibilityLabel="account-number"
					/>
				</View>

				{/* IFSC Code */}
				<View style={styles.section}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.fieldLabel}
					>
						IFSC Code * (11 characters)
					</ThemedText>
					<TextInput
						value={ifscCode}
						onChangeText={(v) => setIfscCode(v.toUpperCase())}
						placeholder="e.g. HDFC0001234"
						placeholderTextColor={c.placeholder}
						autoCapitalize="characters"
						maxLength={11}
						style={[
							styles.textField,
							{
								color: c.onSurface,
								borderColor: c.border,
								borderRadius: r.md,
								backgroundColor: theme.colors.surface,
								fontFamily: 'monospace',
								letterSpacing: 1.5,
							},
						]}
						accessibilityLabel="ifsc-code"
					/>
				</View>

				{/* Account Type */}
				<View style={styles.section}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.fieldLabel}
					>
						Account Type *
					</ThemedText>
					<View style={styles.chipRow}>
						{ACCOUNT_TYPES.map((type) => (
							<Pressable
								key={type}
								onPress={() => setAccountType(type)}
								style={chipStyle(accountType === type)}
								accessibilityRole="button"
								accessibilityState={{ selected: accountType === type }}
								accessibilityLabel={`type-${type}`}
							>
								<ThemedText
									variant="caption"
									color={chipTextColor(accountType === type)}
									style={{
										fontWeight: accountType === type ? '700' : '400',
										paddingHorizontal: 14,
										paddingVertical: 8,
									}}
								>
									{type}
								</ThemedText>
							</Pressable>
						))}
					</View>
				</View>

				{/* Account Holder Name */}
				<View style={styles.section}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.fieldLabel}
					>
						Account Holder Name *
					</ThemedText>
					<TextInput
						value={accountHolder}
						onChangeText={setAccountHolder}
						placeholder="Name as on bank account"
						placeholderTextColor={c.placeholder}
						style={[
							styles.textField,
							{
								color: c.onSurface,
								borderColor: c.border,
								borderRadius: r.md,
								backgroundColor: theme.colors.surface,
							},
						]}
						accessibilityLabel="account-holder"
					/>
				</View>

				{/* Opening Balance */}
				<View style={styles.section}>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={styles.fieldLabel}
					>
						Opening Balance
					</ThemedText>
					<View style={[styles.amountRow, { borderColor: c.border, borderRadius: r.md }]}>
						<ThemedText
							style={[
								styles.currencyPrefix,
								{ color: c.onSurface, borderRightColor: c.border },
							]}
						>
							₹
						</ThemedText>
						<TextInput
							value={openingBalance}
							onChangeText={(v) => setOpeningBalance(v.replace(/[^0-9.]/g, ''))}
							placeholder="0"
							placeholderTextColor={c.placeholder}
							keyboardType="decimal-pad"
							style={[styles.amountInput, { color: c.onSurface }]}
							accessibilityLabel="opening-balance"
						/>
					</View>
				</View>

				{/* Set as Primary */}
				<View style={styles.section}>
					<View style={styles.primaryRow}>
						<View style={{ flex: 1 }}>
							<ThemedText weight="medium">Set as Primary Account</ThemedText>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Payments will default to this account
							</ThemedText>
						</View>
						<Switch
							value={isPrimary}
							onValueChange={setIsPrimary}
							trackColor={{ false: theme.colors.surfaceVariant, true: c.primary }}
							thumbColor="#fff"
							accessibilityLabel="set-primary"
						/>
					</View>
				</View>

				<Button
					title={saving ? 'Saving...' : 'Save Bank Account'}
					onPress={handleSave}
					loading={saving}
					accessibilityLabel="save-bank-account"
					style={{ marginTop: 8 }}
				/>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: 16,
	},
	section: {
		marginBottom: 20,
	},
	fieldLabel: {
		marginBottom: 8,
		fontWeight: '600',
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	chip: {
		paddingHorizontal: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textField: {
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		minHeight: 48,
	},
	amountRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		minHeight: 52,
	},
	currencyPrefix: {
		paddingHorizontal: 14,
		borderRightWidth: 1,
		fontSize: 18,
		fontWeight: '600',
	},
	amountInput: {
		flex: 1,
		paddingHorizontal: 14,
		fontSize: 18,
		fontWeight: '600',
	},
	primaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
});
