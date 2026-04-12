import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	FlatList,
	Pressable,
	TextInput,
	Alert,
	Modal,
	ScrollView,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// TODO: connect to store — e-wallets table
interface EWallet {
	id: string;
	type: string;
	name: string;
	phone: string;
	balance: number;
	emoji: string;
	color: string;
}

const WALLET_TYPES = [
	{ label: 'PhonePe', value: 'phonePe', emoji: '📱', color: '#5F259F' },
	{ label: 'GPay', value: 'gpay', emoji: '📱', color: '#4285F4' },
	{ label: 'Paytm', value: 'paytm', emoji: '📱', color: '#00BAF2' },
	{ label: 'Other', value: 'other', emoji: '💼', color: '#607D8B' },
];

const mockWallets: EWallet[] = [
	{
		id: '1',
		type: 'phonePe',
		name: 'PhonePe',
		phone: '98765XXXXX',
		balance: 12500,
		emoji: '📱',
		color: '#5F259F',
	},
	{
		id: '2',
		type: 'gpay',
		name: 'GPay',
		phone: '98765XXXXX',
		balance: 4800,
		emoji: '📱',
		color: '#4285F4',
	},
];

export default function EWalletsScreen() {
	const { theme, c, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const insets = useSafeAreaInsets();

	const [wallets, setWallets] = useState<EWallet[]>(mockWallets);
	const [showAddModal, setShowAddModal] = useState(false);

	// Add form state
	const [selectedType, setSelectedType] = useState('');
	const [walletName, setWalletName] = useState('');
	const [phone, setPhone] = useState('');
	const [openingBalance, setOpeningBalance] = useState('');
	const [saving, setSaving] = useState(false);

	const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

	const resetForm = () => {
		setSelectedType('');
		setWalletName('');
		setPhone('');
		setOpeningBalance('');
	};

	const handleAdd = async () => {
		if (!selectedType) {
			Alert.alert('Validation', 'Please select a wallet type.');
			return;
		}
		const typeInfo = WALLET_TYPES.find((t) => t.value === selectedType);
		setSaving(true);
		try {
			await new Promise((res) => setTimeout(res, 400));
			// TODO: connect to store
			const newWallet: EWallet = {
				id: Date.now().toString(),
				type: selectedType,
				name: walletName || typeInfo?.label || selectedType,
				phone: phone || '',
				balance: parseFloat(openingBalance) || 0,
				emoji: typeInfo?.emoji || '📱',
				color: typeInfo?.color || '#607D8B',
			};
			setWallets((prev) => [...prev, newWallet]);
			resetForm();
			setShowAddModal(false);
		} finally {
			setSaving(false);
		}
	};

	const chipStyle = (selected: boolean) => [
		styles.chip,
		{
			backgroundColor: selected ? c.primary : theme.colors.surfaceVariant,
			borderRadius: r.full,
		},
	];

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="E-Wallets" showBackButton />

			<FlatList
				data={wallets}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<Card
						padding="lg"
						style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}
					>
						<ThemedText variant="caption" color="rgba(255,255,255,0.8)">
							Total in Wallets
						</ThemedText>
						<ThemedText variant="h2" color="#fff" style={{ marginTop: 6 }}>
							{formatCurrency(totalBalance)}
						</ThemedText>
					</Card>
				}
				ListEmptyComponent={
					<Card padding="lg" style={{ alignItems: 'center', marginTop: 12 }}>
						<ThemedText style={{ fontSize: 40 }}>📱</ThemedText>
						<ThemedText
							color={theme.colors.onSurfaceVariant}
							style={{ marginTop: 12, textAlign: 'center' }}
						>
							No e-wallets added yet. Add your first wallet.
						</ThemedText>
					</Card>
				}
				renderItem={({ item }) => (
					<Card padding="md" style={styles.walletCard}>
						<View style={styles.walletRow}>
							<View
								style={[
									styles.walletIcon,
									{ backgroundColor: item.color + '22', borderRadius: r.md },
								]}
							>
								<ThemedText style={{ fontSize: 26 }}>{item.emoji}</ThemedText>
							</View>
							<View style={{ flex: 1, marginLeft: 14 }}>
								<ThemedText weight="bold" style={{ fontSize: 16 }}>
									{item.name}
								</ThemedText>
								{item.phone ? (
									<ThemedText
										variant="caption"
										color={theme.colors.onSurfaceVariant}
									>
										{item.phone}
									</ThemedText>
								) : null}
							</View>
							<ThemedText
								weight="bold"
								color={
									item.balance >= 0 ? theme.colors.success : theme.colors.error
								}
								style={{ fontSize: 18 }}
							>
								{formatCurrency(item.balance)}
							</ThemedText>
						</View>
					</Card>
				)}
			/>

			{/* FAB */}
			<Pressable
				style={[styles.fab, { backgroundColor: c.primary, bottom: 32 + insets.bottom }]}
				onPress={() => setShowAddModal(true)}
				accessibilityRole="button"
				accessibilityLabel="Add E-wallet"
			>
				<Plus color="#fff" size={28} />
			</Pressable>

			{/* Add Wallet Modal */}
			<Modal
				visible={showAddModal}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowAddModal(false)}
			>
				<View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
					<View style={styles.modalHeader}>
						<ThemedText variant="h3">Add E-Wallet</ThemedText>
						<Pressable
							onPress={() => {
								resetForm();
								setShowAddModal(false);
							}}
							accessibilityLabel="close-modal"
						>
							<X size={24} color={c.onSurface} />
						</Pressable>
					</View>

					<ScrollView
						contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
						keyboardShouldPersistTaps="handled"
					>
						{/* Wallet type */}
						<View style={styles.section}>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.fieldLabel}
							>
								Wallet Type *
							</ThemedText>
							<View style={styles.chipRow}>
								{WALLET_TYPES.map((wt) => (
									<Pressable
										key={wt.value}
										onPress={() => {
											setSelectedType(wt.value);
											if (!walletName) setWalletName(wt.label);
										}}
										style={chipStyle(selectedType === wt.value)}
										accessibilityRole="button"
										accessibilityState={{ selected: selectedType === wt.value }}
									>
										<ThemedText
											variant="caption"
											color={
												selectedType === wt.value
													? c.onPrimary
													: c.onSurfaceVariant
											}
											style={{
												fontWeight:
													selectedType === wt.value ? '700' : '400',
												paddingHorizontal: 14,
												paddingVertical: 8,
											}}
										>
											{wt.emoji} {wt.label}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</View>

						{/* Wallet name */}
						<View style={styles.section}>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.fieldLabel}
							>
								Wallet Name
							</ThemedText>
							<TextInput
								value={walletName}
								onChangeText={setWalletName}
								placeholder="e.g. PhonePe Business"
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
							/>
						</View>

						{/* Phone */}
						<View style={styles.section}>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.fieldLabel}
							>
								Linked Phone Number
							</ThemedText>
							<TextInput
								value={phone}
								onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, ''))}
								placeholder="10-digit mobile number"
								placeholderTextColor={c.placeholder}
								keyboardType="phone-pad"
								maxLength={10}
								style={[
									styles.textField,
									{
										color: c.onSurface,
										borderColor: c.border,
										borderRadius: r.md,
										backgroundColor: theme.colors.surface,
									},
								]}
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
							<View
								style={[
									styles.amountRow,
									{ borderColor: c.border, borderRadius: r.md },
								]}
							>
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
									onChangeText={(v) =>
										setOpeningBalance(v.replace(/[^0-9.]/g, ''))
									}
									placeholder="0"
									placeholderTextColor={c.placeholder}
									keyboardType="decimal-pad"
									style={[styles.amountInput, { color: c.onSurface }]}
								/>
							</View>
						</View>

						<Button
							title={saving ? 'Saving...' : 'Add Wallet'}
							onPress={handleAdd}
							loading={saving}
							accessibilityLabel="save-wallet"
						/>
					</ScrollView>
				</View>
			</Modal>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	listContent: {
		padding: 16,
		paddingBottom: 100,
	},
	summaryCard: {
		marginBottom: 20,
	},
	walletCard: {
		marginBottom: 12,
	},
	walletRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	walletIcon: {
		width: 52,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modal: {
		flex: 1,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		paddingTop: 20,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(0,0,0,0.1)',
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
});
