import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	FlatList,
	RefreshControl,
	Pressable,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Building2, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { palette } from '@/src/theme/palette';
import { FAB_SHADOW } from '@/theme/shadowMetrics';
import { LETTER_SPACING_ACCOUNT } from '@/theme/uiMetrics';
import { MOCK_BANK_ACCOUNTS } from '@/src/mocks/finance/bankAccounts';

// TODO: connect to store — fetch from bank_accounts table via Supabase
type BankAccount = (typeof MOCK_BANK_ACCOUNTS)[number] & { balance: number };

const ACCOUNT_MASK_TAIL_DIGITS = 4;

function maskAccountNumber(num: string): string {
	if (num.length <= ACCOUNT_MASK_TAIL_DIGITS) return num;
	return '••••' + num.slice(-ACCOUNT_MASK_TAIL_DIGITS);
}

export default function BankAccountsScreen() {
	const { theme, c } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [refreshing, setRefreshing] = useState(false);

	// TODO: connect to store
	const accounts = MOCK_BANK_ACCOUNTS as unknown as BankAccount[];
	const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

	const accountTypeBadgeVariant = (type: BankAccount['account_type']) => {
		if (type === 'Current') return 'info' as const;
		if (type === 'Overdraft') return 'warning' as const;
		return 'neutral' as const;
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Bank Accounts" showBackButton />

			<FlatList
				data={accounts}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => {
							setRefreshing(true);
							setTimeout(() => setRefreshing(false), 600);
						}}
						tintColor={theme.colors.primary}
					/>
				}
				ListHeaderComponent={
					<Card
						padding="lg"
						style={
							[
								styles.summaryCard,
								{ backgroundColor: theme.colors.primary },
							] as StyleProp<ViewStyle>
						}
					>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<Building2 size={20} color="rgba(255,255,255,0.8)" />
							<ThemedText variant="caption" color="rgba(255,255,255,0.8)">
								Total in Banks
							</ThemedText>
						</View>
						<ThemedText
							variant="h2"
							color={palette.white}
							style={{ marginTop: 6 }}
							accessibilityLabel={`Total bank balance ${formatCurrency(totalBalance)}`}
						>
							{formatCurrency(totalBalance)}
						</ThemedText>
					</Card>
				}
				ListEmptyComponent={
					<Card padding="lg" style={{ alignItems: 'center', marginTop: 12 }}>
						<Building2 size={40} color={theme.colors.onSurfaceVariant} />
						<ThemedText
							color={theme.colors.onSurfaceVariant}
							style={{ marginTop: 12, textAlign: 'center' }}
						>
							No bank accounts added yet. Add your first bank account.
						</ThemedText>
					</Card>
				}
				renderItem={({ item }) => (
					<Card padding="md" style={styles.accountCard}>
						<View style={styles.accountHeader}>
							<View style={styles.accountTitleRow}>
								<ThemedText weight="bold" style={{ fontSize: 16 }}>
									{item.bank_name}
								</ThemedText>
								<View style={styles.badgeRow}>
									<Badge
										label={item.account_type}
										variant={accountTypeBadgeVariant(item.account_type)}
										size="sm"
									/>
									{item.is_primary && (
										<Badge label="Primary" variant="primary" size="sm" />
									)}
								</View>
							</View>
						</View>

						<ThemedText
							variant="caption"
							color={theme.colors.onSurfaceVariant}
							style={{ marginTop: 2 }}
						>
							{item.account_holder}
						</ThemedText>

						<View style={styles.accountFooter}>
							<ThemedText
								variant="caption"
								color={theme.colors.onSurfaceVariant}
								style={styles.accountNumber}
							>
								{maskAccountNumber(item.account_number)}
							</ThemedText>
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
				style={
					[
						styles.fab,
						{
							backgroundColor: c.primary,
							bottom: 32 + insets.bottom,
						},
					] as StyleProp<ViewStyle>
				}
				onPress={() => router.push('/(app)/finance/bank-accounts/add' as Href)}
				accessibilityRole="button"
				accessibilityLabel="Add Bank Account"
			>
				<Plus color={palette.white} size={28} />
			</Pressable>
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
	accountCard: {
		marginBottom: 12,
	},
	accountHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	accountTitleRow: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
	},
	badgeRow: {
		flexDirection: 'row',
		gap: 6,
	},
	accountFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 12,
	},
	accountNumber: {
		fontFamily: 'monospace',
		letterSpacing: LETTER_SPACING_ACCOUNT,
		fontSize: 14,
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
		shadowColor: palette.shadow,
		shadowOffset: { width: 0, height: 2 },
		...FAB_SHADOW,
	},
});
