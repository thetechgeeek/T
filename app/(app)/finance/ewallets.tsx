import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, Alert, Modal } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { useLocale } from '@/src/hooks/useLocale';
import {
	SIZE_INPUT_HEIGHT,
	OVERLAY_COLOR_DIVIDER,
	GLASS_WHITE_TEXT,
	OPACITY_BADGE_BG,
	FAB_OFFSET_BOTTOM,
	FAB_OFFSET_RIGHT,
	SIZE_FAB,
} from '@/theme/uiMetrics';
import { MOCK_EWALLETS } from '@/src/mocks/finance/ewallets';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

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

const EMOJI_FONT_SIZE = 26;
const EWALLETS_LIST_BOTTOM_PADDING = 100;
const EWALLET_MODAL_BOTTOM_PADDING = 40;

function walletTypeColor(type: string, colors: ReturnType<typeof useThemeTokens>['c']): string {
	if (type === 'phonePe') return colors.primary;
	if (type === 'gpay') return colors.info;
	if (type === 'paytm') return colors.success;
	return colors.secondary;
}

export default function EWalletsScreen() {
	const { theme, c, r } = useThemeTokens();
	const { formatCurrency } = useLocale();

	const insets = useSafeAreaInsets();

	const walletTypes = [
		{ label: 'PhonePe', value: 'phonePe', emoji: '📱', color: walletTypeColor('phonePe', c) },
		{ label: 'GPay', value: 'gpay', emoji: '📱', color: walletTypeColor('gpay', c) },
		{ label: 'Paytm', value: 'paytm', emoji: '📱', color: walletTypeColor('paytm', c) },
		{ label: 'Other', value: 'other', emoji: '💼', color: walletTypeColor('other', c) },
	];
	const [wallets, setWallets] = useState<EWallet[]>(
		MOCK_EWALLETS.map((w) => ({
			...w,
			phone: w.phone ?? '',
			color: walletTypeColor(w.type, c),
		})),
	);
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
		const typeInfo = walletTypes.find((t) => t.value === selectedType);
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
				color: typeInfo?.color || walletTypeColor('other', c),
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
						<ThemedText variant="caption" color={GLASS_WHITE_TEXT}>
							Total in Wallets
						</ThemedText>
						<ThemedText
							variant="h2"
							color={c.onPrimary}
							style={{ marginTop: SPACING_PX.xs + SPACING_PX.xxs }}
						>
							{formatCurrency(totalBalance)}
						</ThemedText>
					</Card>
				}
				ListEmptyComponent={
					<Card padding="lg" style={{ alignItems: 'center', marginTop: SPACING_PX.md }}>
						<ThemedText style={{ fontSize: SPACING_PX['3xl'] - SPACING_PX.sm }}>
							📱
						</ThemedText>
						<ThemedText
							color={theme.colors.onSurfaceVariant}
							style={{ marginTop: SPACING_PX.md, textAlign: 'center' }}
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
									{
										backgroundColor: withOpacity(item.color, OPACITY_BADGE_BG),
										borderRadius: r.md,
									},
								]}
							>
								<ThemedText style={{ fontSize: EMOJI_FONT_SIZE }}>
									{item.emoji}
								</ThemedText>
							</View>
							<View style={{ flex: 1, marginLeft: SPACING_PX.md }}>
								<ThemedText weight="bold" style={{ fontSize: FONT_SIZE.body }}>
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
								style={{ fontSize: FONT_SIZE.h3 }}
							>
								{formatCurrency(item.balance)}
							</ThemedText>
						</View>
					</Card>
				)}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						bottom: FAB_OFFSET_BOTTOM + SPACING_PX.md + insets.bottom,
						...(theme.shadows.lg as object),
					},
				]}
				onPress={() => setShowAddModal(true)}
				accessibilityRole="button"
				accessibilityLabel="Add E-wallet"
			>
				<Plus color={c.onPrimary} size={SIZE_FAB / 2} />
			</Pressable>

			{/* Add Wallet Modal */}
			<Modal
				visible={showAddModal}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowAddModal(false)}
			>
				<AtomicScreen
					safeAreaEdges={['top', 'bottom']}
					withKeyboard={false}
					scrollable
					backgroundColor={theme.colors.background}
					header={
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
					}
					contentContainerStyle={{
						padding: SPACING_PX.lg,
						paddingBottom: EWALLET_MODAL_BOTTOM_PADDING,
					}}
					scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
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
							{walletTypes.map((wt) => (
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
											fontWeight: selectedType === wt.value ? '700' : '400',
											paddingHorizontal: SPACING_PX.md,
											paddingVertical: SPACING_PX.sm,
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
								onChangeText={(v) => setOpeningBalance(v.replace(/[^0-9.]/g, ''))}
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
				</AtomicScreen>
			</Modal>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	listContent: {
		padding: SPACING_PX.lg,
		paddingBottom: EWALLETS_LIST_BOTTOM_PADDING,
	},
	summaryCard: {
		marginBottom: SPACING_PX.xl,
	},
	walletCard: {
		marginBottom: SPACING_PX.md,
	},
	walletRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	walletIcon: {
		width: SIZE_INPUT_HEIGHT,
		height: SIZE_INPUT_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: SIZE_FAB / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: SPACING_PX.lg,
		paddingTop: SPACING_PX.xl - SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: OVERLAY_COLOR_DIVIDER,
	},
	section: {
		marginBottom: SPACING_PX.xl,
	},
	fieldLabel: {
		marginBottom: SPACING_PX.sm,
		fontWeight: '600',
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
	},
	chip: {
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
	amountRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		minHeight: SIZE_INPUT_HEIGHT,
	},
	currencyPrefix: {
		paddingHorizontal: SPACING_PX.md,
		borderRightWidth: 1,
		fontSize: FONT_SIZE.h3,
		fontWeight: '600',
	},
	amountInput: {
		flex: 1,
		paddingHorizontal: SPACING_PX.md,
		fontSize: FONT_SIZE.h3,
		fontWeight: '600',
	},
});
