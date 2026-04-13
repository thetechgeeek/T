import { FAB_SHADOW } from '@/theme/shadowMetrics';
import { SIZE_AVATAR_MD, SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { loanTypeColors, palette } from '@/src/theme/palette';

interface Loan {
	id: string;
	lenderName: string;
	loanType: string;
	principalAmount: number;
	outstandingAmount: number;
	nextEmiAmount: number;
	nextEmiDate: string;
}

const MOCK_LOANS: Loan[] = [];

export default function LoansScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [loans] = useState<Loan[]>(MOCK_LOANS);

	const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingAmount, 0);

	const renderLoan = ({ item }: { item: Loan }) => {
		const progress =
			item.principalAmount > 0
				? (item.principalAmount - item.outstandingAmount) / item.principalAmount
				: 0;
		const badgeColor = loanTypeColors[item.loanType] ?? c.primary;

		return (
			<Card style={[styles.loanCard, { marginBottom: s.sm }]} padding="md">
				<View style={styles.loanHeader}>
					<ThemedText weight="bold" style={{ flex: 1 }}>
						{item.lenderName}
					</ThemedText>
					<View
						style={[
							styles.badge,
							{
								backgroundColor: badgeColor + '22',
								borderColor: badgeColor,
								borderWidth: 1,
								borderRadius: r.xs,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={badgeColor}
							style={{ paddingHorizontal: 6 }}
						>
							{item.loanType}
						</ThemedText>
					</View>
				</View>

				<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginTop: 4 }}>
					{formatCurrency(item.principalAmount)} →{' '}
					{formatCurrency(item.outstandingAmount)} remaining
				</ThemedText>

				{/* Progress bar */}
				<View
					style={[
						styles.progressTrack,
						{ backgroundColor: c.surfaceVariant, borderRadius: r.xs, marginTop: 8 },
					]}
				>
					<View
						style={[
							styles.progressFill,
							{
								width: `${Math.min(progress * 100, 100)}%` as `${number}%`,
								backgroundColor: palette.loanAccent,
								borderRadius: r.xs,
							},
						]}
					/>
				</View>

				<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginTop: 6 }}>
					Next EMI: {formatCurrency(item.nextEmiAmount)} due{' '}
					{formatDate(item.nextEmiDate)}
				</ThemedText>
			</Card>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Loans" />

			{/* Summary card */}
			<View
				style={[
					styles.summaryCard,
					{
						backgroundColor: c.surface,
						borderRadius: r.md,
						marginHorizontal: s.lg,
						marginTop: s.sm,
					},
				]}
			>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					Total Outstanding
				</ThemedText>
				<ThemedText variant="h2" color={c.primary} style={{ marginTop: 2 }}>
					{formatCurrency(totalOutstanding)}
				</ThemedText>
				{loans.length === 0 && (
					<ThemedText variant="caption" color={c.placeholder} style={{ marginTop: 4 }}>
						No loans added yet
					</ThemedText>
				)}
			</View>

			<FlatList
				data={loans}
				keyExtractor={(item) => item.id}
				contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<ThemedText style={styles.emptyIllustration}>🏦</ThemedText>
						<ThemedText
							variant="body"
							weight="medium"
							style={{ marginTop: s.md, textAlign: 'center' }}
						>
							No loans added
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ marginTop: 4, textAlign: 'center' }}
						>
							Track your business loans here.
						</ThemedText>
					</View>
				}
				renderItem={renderLoan}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						bottom: 32 + insets.bottom,
					},
				]}
				onPress={() => router.push('/(app)/finance/loans/add' as Href)}
				accessibilityRole="button"
				accessibilityLabel="Add Loan"
			>
				<Plus color="white" size={28} />
				<ThemedText variant="caption" color="white" style={{ marginLeft: 6 }}>
					Add Loan
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	summaryCard: {
		padding: 16,
		marginBottom: 12,
		alignItems: 'center',
	},
	listContent: {
		padding: 16,
	},
	loanCard: {
		minHeight: 100,
	},
	loanHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	badge: {
		paddingVertical: 2,
	},
	progressTrack: {
		height: 6,
		width: '100%',
	},
	progressFill: {
		height: 6,
	},
	emptyState: {
		alignItems: 'center',
		paddingTop: SIZE_AVATAR_MD,
		paddingHorizontal: 32,
	},
	emptyIllustration: {
		fontSize: 48,
	},
	fab: {
		position: 'absolute',
		right: 24,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		height: SIZE_INPUT_HEIGHT,
		borderRadius: SIZE_INPUT_HEIGHT / 2,
		elevation: 4,
		shadowColor: palette.shadow,
		shadowOffset: { width: 0, height: 2 },
		...FAB_SHADOW,
	},
});
