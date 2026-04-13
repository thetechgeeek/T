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
import {
	FAB_OFFSET_RIGHT,
	GLASS_WHITE_TEXT,
	LETTER_SPACING_ACCOUNT,
	RADIUS_FAB,
	SIZE_FAB,
} from '@/theme/uiMetrics';
import { MOCK_BANK_ACCOUNTS } from '@/src/mocks/finance/bankAccounts';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

// TODO: connect to store — fetch from bank_accounts table via Supabase
type BankAccount = (typeof MOCK_BANK_ACCOUNTS)[number] & { balance: number };

const ACCOUNT_MASK_TAIL_DIGITS = 4;
const LIST_BOTTOM_PADDING = 100;

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
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: SPACING_PX.sm,
							}}
						>
							<Building2 size={20} color={GLASS_WHITE_TEXT} />
							<ThemedText variant="caption" color={GLASS_WHITE_TEXT}>
								Total in Banks
							</ThemedText>
						</View>
						<ThemedText
							variant="h2"
							color={c.onPrimary}
							style={{ marginTop: SPACING_PX.xs }}
							accessibilityLabel={`Total bank balance ${formatCurrency(totalBalance)}`}
						>
							{formatCurrency(totalBalance)}
						</ThemedText>
					</Card>
				}
				ListEmptyComponent={
					<Card padding="lg" style={{ alignItems: 'center', marginTop: SPACING_PX.md }}>
						<Building2 size={40} color={theme.colors.onSurfaceVariant} />
						<ThemedText
							color={theme.colors.onSurfaceVariant}
							style={{ marginTop: SPACING_PX.md, textAlign: 'center' }}
						>
							No bank accounts added yet. Add your first bank account.
						</ThemedText>
					</Card>
				}
				renderItem={({ item }) => (
					<Card padding="md" style={styles.accountCard}>
						<View style={styles.accountHeader}>
							<View style={styles.accountTitleRow}>
								<ThemedText variant="body" weight="bold">
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
							style={{ marginTop: SPACING_PX.xxs }}
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
								variant="h3"
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
							bottom: SIZE_FAB - SPACING_PX.xl + insets.bottom,
							...(theme.shadows.lg as object),
						},
					] as StyleProp<ViewStyle>
				}
				onPress={() => router.push('/(app)/finance/bank-accounts/add' as Href)}
				accessibilityRole="button"
				accessibilityLabel="Add Bank Account"
			>
				<Plus color={c.onPrimary} size={28} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	listContent: {
		padding: SPACING_PX.lg,
		paddingBottom: LIST_BOTTOM_PADDING,
	},
	summaryCard: {
		marginBottom: SPACING_PX.xl,
	},
	accountCard: {
		marginBottom: SPACING_PX.md,
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
		gap: SPACING_PX.sm,
	},
	badgeRow: {
		flexDirection: 'row',
		gap: SPACING_PX.xs,
	},
	accountFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: SPACING_PX.md,
	},
	accountNumber: {
		fontFamily: 'monospace',
		letterSpacing: LETTER_SPACING_ACCOUNT,
		fontSize: FONT_SIZE.caption,
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
