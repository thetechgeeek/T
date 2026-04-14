import {
	SIZE_AVATAR_MD,
	SIZE_INPUT_HEIGHT,
	OPACITY_BADGE_BG,
	FAB_OFFSET_BOTTOM,
	FAB_OFFSET_RIGHT,
	SIZE_FAB,
} from '@/theme/uiMetrics';
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
import { withOpacity } from '@/src/utils/color';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

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
const LOANS_LIST_BOTTOM_PADDING = 100;
const LOAN_EMPTY_EMOJI_SIZE = 48;

function getLoanTypeColor(
	loanType: string,
	colors: ReturnType<typeof useThemeTokens>['c'],
): string {
	if (loanType === 'OD') return colors.info;
	if (loanType === 'Mortgage') return colors.warning;
	if (loanType === 'Personal' || loanType === 'Vehicle') return colors.secondary;
	return colors.primary;
}

export default function LoansScreen() {
	const { c, s, r, theme } = useThemeTokens();
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
		const badgeColor = getLoanTypeColor(item.loanType, c);

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
								backgroundColor: withOpacity(badgeColor, OPACITY_BADGE_BG),
								borderColor: badgeColor,
								borderWidth: 1,
								borderRadius: r.xs,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={badgeColor}
							style={{ paddingHorizontal: SPACING_PX.xs + SPACING_PX.xxs }}
						>
							{item.loanType}
						</ThemedText>
					</View>
				</View>

				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginTop: SPACING_PX.xs }}
				>
					{formatCurrency(item.principalAmount)} →{' '}
					{formatCurrency(item.outstandingAmount)} remaining
				</ThemedText>

				{/* Progress bar */}
				<View
					style={[
						styles.progressTrack,
						{
							backgroundColor: c.surfaceVariant,
							borderRadius: r.xs,
							marginTop: SPACING_PX.sm,
						},
					]}
				>
					<View
						style={[
							styles.progressFill,
							{
								width: `${Math.min(progress * 100, 100)}%` as `${number}%`,
								backgroundColor: badgeColor,
								borderRadius: r.xs,
							},
						]}
					/>
				</View>

				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginTop: SPACING_PX.xs + SPACING_PX.xxs }}
				>
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
				<ThemedText variant="h2" color={c.primary} style={{ marginTop: SPACING_PX.xxs }}>
					{formatCurrency(totalOutstanding)}
				</ThemedText>
				{loans.length === 0 && (
					<ThemedText
						variant="caption"
						color={c.placeholder}
						style={{ marginTop: SPACING_PX.xs }}
					>
						No loans added yet
					</ThemedText>
				)}
			</View>

			<FlatList
				data={loans}
				keyExtractor={(item) => item.id}
				contentContainerStyle={[
					styles.listContent,
					{ paddingBottom: LOANS_LIST_BOTTOM_PADDING + insets.bottom },
				]}
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
							style={{ marginTop: SPACING_PX.xs, textAlign: 'center' }}
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
						bottom: FAB_OFFSET_BOTTOM + SPACING_PX.md + insets.bottom,
						...(theme.shadows.lg as object),
					},
				]}
				onPress={() => router.push('/(app)/finance/loans/add' as Href)}
				accessibilityRole="button"
				accessibilityLabel="Add Loan"
			>
				<Plus color={c.onPrimary} size={SIZE_FAB / 2} />
				<ThemedText
					variant="caption"
					color={c.onPrimary}
					style={{ marginLeft: SPACING_PX.xs + SPACING_PX.xxs }}
				>
					Add Loan
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	summaryCard: {
		padding: SPACING_PX.lg,
		marginBottom: SPACING_PX.md,
		alignItems: 'center',
	},
	listContent: {
		padding: SPACING_PX.lg,
	},
	loanCard: {
		minHeight: SPACING_PX['4xl'] + SPACING_PX.xl + SPACING_PX.md,
	},
	loanHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	badge: {
		paddingVertical: SPACING_PX.xxs,
	},
	progressTrack: {
		height: SPACING_PX.xs + SPACING_PX.xxs,
		width: '100%',
	},
	progressFill: {
		height: SPACING_PX.xs + SPACING_PX.xxs,
	},
	emptyState: {
		alignItems: 'center',
		paddingTop: SIZE_AVATAR_MD,
		paddingHorizontal: SPACING_PX['2xl'],
	},
	emptyIllustration: {
		fontSize: LOAN_EMPTY_EMOJI_SIZE,
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.xl,
		height: SIZE_INPUT_HEIGHT,
		borderRadius: SIZE_INPUT_HEIGHT / 2,
	},
});
