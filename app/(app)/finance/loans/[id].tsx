import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { CalendarDays, TrendingDown, Percent, Clock, CreditCard } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Button } from '@/src/components/atoms/Button';
import { Badge } from '@/src/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_SUBTLE, OPACITY_DIM } from '@/src/theme/uiMetrics';
import { useLocale } from '@/src/hooks/useLocale';
import { MOCK_LOAN } from '@/src/mocks/finance/loans';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const LOAN_INFO_ICON_SIZE = 36;
const LOAN_PROGRESS_HEIGHT = 8;
const LOAN_TABLE_MIN_WIDTH = 500;
const LOAN_SCROLL_BOTTOM_PADDING = 48;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AmortisationRow {
	month: number;
	emi: number;
	principal: number;
	interest: number;
	balance: number;
}

// ---------------------------------------------------------------------------
// EMI & amortisation helpers
// ---------------------------------------------------------------------------

function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
	if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
	const r = annualRate / 12 / 100;
	const n = tenureMonths;
	return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function buildAmortisation(
	principal: number,
	annualRate: number,
	tenureMonths: number,
	rowCount: number,
): AmortisationRow[] {
	const emi = calcEMI(principal, annualRate, tenureMonths);
	const r = annualRate / 12 / 100;
	const rows: AmortisationRow[] = [];
	let balance = principal;

	for (let month = 1; month <= Math.min(rowCount, tenureMonths); month++) {
		const interest = balance * r;
		const principalPart = emi - interest;
		balance = Math.max(balance - principalPart, 0);
		rows.push({
			month,
			emi: Math.round(emi),
			principal: Math.round(principalPart),
			interest: Math.round(interest),
			balance: Math.round(balance),
		});
	}
	return rows;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({
	icon,
	label,
	value,
	iconColor,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	iconColor: string;
}) {
	const { c, r } = useThemeTokens();
	return (
		<View style={infoRowStyles.row}>
			<View
				style={[
					infoRowStyles.iconWrap,
					{
						backgroundColor: withOpacity(iconColor, OPACITY_TINT_SUBTLE),
						borderRadius: r.xs,
					},
				]}
			>
				{icon}
			</View>
			<View style={infoRowStyles.text}>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{label}
				</ThemedText>
				<ThemedText variant="body" weight="medium" color={c.onSurface}>
					{value}
				</ThemedText>
			</View>
		</View>
	);
}

const infoRowStyles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: SPACING_PX.md,
	},
	iconWrap: {
		width: LOAN_INFO_ICON_SIZE,
		height: LOAN_INFO_ICON_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: SPACING_PX.md,
	},
	text: {
		flex: 1,
	},
});

function TableHeader() {
	const { c } = useThemeTokens();
	return (
		<View
			style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: c.surfaceVariant }]}
		>
			{['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map((col) => (
				<ThemedText
					key={col}
					variant="caption"
					weight="semibold"
					color={c.onSurfaceVariant}
					style={styles.tableCell}
				>
					{col}
				</ThemedText>
			))}
		</View>
	);
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function LoanDetailScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const { id: _loanId } = useLocalSearchParams<{ id: string }>();

	// TODO: look up loan from Zustand store by loanId when store is ready.
	// For now always use mock data regardless of loanId.
	const loan = MOCK_LOAN;

	const emi = useMemo(
		() => calcEMI(loan.principalAmount, loan.interestRate, loan.tenureMonths),
		[loan],
	);

	const schedule = useMemo(
		() => buildAmortisation(loan.principalAmount, loan.interestRate, loan.tenureMonths, 12),
		[loan],
	);

	const repaidAmount = loan.principalAmount - loan.outstandingAmount;
	const repaidPct = loan.principalAmount > 0 ? repaidAmount / loan.principalAmount : 0;
	const clampedPct = Math.max(0, Math.min(repaidPct, 1));

	const handleRecordEmi = () => {
		Alert.alert('Coming Soon', 'EMI recording flow');
	};

	const handleEdit = () => {
		router.push('/(app)/finance/loans/add' as Href);
	};

	/** Widen mock literal so variant mapping stays exhaustive when real data loads */
	type LoanTypeKey = 'Term Loan' | 'OD' | 'Mortgage' | 'Personal' | 'Vehicle';

	const loanTypeVariant = (): 'primary' | 'info' | 'warning' | 'neutral' => {
		const t = loan.loanType as LoanTypeKey;
		switch (t) {
			case 'OD':
				return 'info';
			case 'Mortgage':
				return 'warning';
			case 'Personal':
			case 'Vehicle':
				return 'neutral';
			default:
				return 'primary';
		}
	};

	const renderScheduleRow = ({ item, index }: { item: AmortisationRow; index: number }) => (
		<View
			style={[
				styles.tableRow,
				{
					backgroundColor:
						index % 2 === 0 ? c.surface : withOpacity(c.surfaceVariant, OPACITY_DIM),
				},
			]}
		>
			<ThemedText variant="caption" color={c.onSurface} style={styles.tableCell}>
				{item.month}
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurface} style={styles.tableCell}>
				{formatCurrency(item.emi, false)}
			</ThemedText>
			<ThemedText variant="caption" color={c.primary} style={styles.tableCell}>
				{formatCurrency(item.principal, false)}
			</ThemedText>
			<ThemedText variant="caption" color={c.error} style={styles.tableCell}>
				{formatCurrency(item.interest, false)}
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurface} style={styles.tableCell}>
				{formatCurrency(item.balance, false)}
			</ThemedText>
		</View>
	);

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			contentContainerStyle={[
				styles.scrollContent,
				{ padding: s.lg, paddingBottom: LOAN_SCROLL_BOTTOM_PADDING },
			]}
			scrollViewProps={{ showsVerticalScrollIndicator: false }}
		>
			<ScreenHeader title="Loan Detail" />
			{/* ── Summary card ─────────────────────────────────────────── */}
			<View
				style={[
					styles.summaryCard,
					{
						backgroundColor: c.surface,
						borderRadius: r.md,
						borderColor: c.border,
					},
				]}
			>
				{/* Lender & badge */}
				<View style={styles.summaryTop}>
					<ThemedText variant="h3" weight="bold" color={c.onSurface} style={{ flex: 1 }}>
						{loan.lenderName}
					</ThemedText>
					<Badge label={loan.loanType} variant={loanTypeVariant()} size="md" />
				</View>

				{/* Principal */}
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginTop: s.md }}
				>
					Principal Amount
				</ThemedText>
				<ThemedText variant="h1" weight="bold" color={c.primary}>
					{formatCurrency(loan.principalAmount)}
				</ThemedText>

				{/* Outstanding */}
				<View
					style={[
						styles.outstandingBadge,
						{
							backgroundColor:
								c.errorLight ?? withOpacity(c.error, OPACITY_TINT_SUBTLE),
							borderRadius: r.sm,
							marginTop: s.sm,
						},
					]}
				>
					<ThemedText variant="caption" color={c.error}>
						Outstanding: {formatCurrency(loan.outstandingAmount)}
					</ThemedText>
				</View>

				{/* Divider */}
				<View
					style={[styles.divider, { backgroundColor: c.border, marginVertical: s.md }]}
				/>

				{/* Info rows */}
				<InfoRow
					icon={<Percent size={18} color={c.primary} />}
					label="Interest Rate"
					value={`${loan.interestRate}% p.a.`}
					iconColor={c.primary}
				/>
				<InfoRow
					icon={<Clock size={18} color={c.info} />}
					label="Tenure"
					value={`${loan.tenureMonths} months`}
					iconColor={c.info}
				/>
				<InfoRow
					icon={<CreditCard size={18} color={c.primary} />}
					label="Monthly EMI"
					value={formatCurrency(Math.round(emi))}
					iconColor={c.primary}
				/>
				<InfoRow
					icon={<CalendarDays size={18} color={c.warning} />}
					label="Disbursement Date"
					value={formatDate(loan.disbursementDate)}
					iconColor={c.warning}
				/>
				<InfoRow
					icon={<TrendingDown size={18} color={c.success} />}
					label="Next EMI Date"
					value={formatDate(loan.nextEmiDate)}
					iconColor={c.success}
				/>
			</View>

			{/* ── Repayment progress ───────────────────────────────────── */}
			<View
				style={[
					styles.progressCard,
					{
						backgroundColor: c.surface,
						borderRadius: r.md,
						borderColor: c.border,
						marginTop: s.md,
					},
				]}
			>
				<View style={styles.progressHeader}>
					<ThemedText variant="body" weight="medium" color={c.onSurface}>
						Repayment Progress
					</ThemedText>
					<ThemedText variant="body" weight="bold" color={c.primary}>
						{Math.round(clampedPct * 100)}%
					</ThemedText>
				</View>
				<View
					style={[
						styles.progressTrack,
						{
							backgroundColor: c.surfaceVariant,
							borderRadius: r.xs,
							marginTop: s.sm,
						},
					]}
				>
					<View
						style={[
							styles.progressFill,
							{
								width: `${Math.round(clampedPct * 100)}%` as `${number}%`,
								backgroundColor: c.primary,
								borderRadius: r.xs,
							},
						]}
					/>
				</View>
				<View style={[styles.progressLegend, { marginTop: s.xs }]}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Paid: {formatCurrency(repaidAmount)}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						Remaining: {formatCurrency(loan.outstandingAmount)}
					</ThemedText>
				</View>
			</View>

			{/* ── Record EMI button ────────────────────────────────────── */}
			<Button
				title="Record EMI Payment"
				variant="primary"
				onPress={handleRecordEmi}
				style={{ marginTop: s.lg }}
				leftIcon={
					<CreditCard
						size={18}
						color={c.onPrimary}
						style={{ marginRight: SPACING_PX.xs }}
					/>
				}
			/>

			{/* ── Amortisation schedule ────────────────────────────────── */}
			<ThemedText
				variant="h3"
				weight="semibold"
				color={c.onSurface}
				style={{ marginTop: s.xl, marginBottom: s.sm }}
			>
				Amortisation Schedule
			</ThemedText>
			<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginBottom: s.md }}>
				First 12 months — principal {formatCurrency(loan.principalAmount)},{' '}
				{loan.interestRate}% p.a., {loan.tenureMonths} months
			</ThemedText>

			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View style={{ minWidth: LOAN_TABLE_MIN_WIDTH }}>
					<TableHeader />
					<FlatList
						data={schedule}
						keyExtractor={(item) => String(item.month)}
						renderItem={renderScheduleRow}
						scrollEnabled={false}
					/>
				</View>
			</ScrollView>

			{/* ── Edit Loan button ─────────────────────────────────────── */}
			<Button
				title="Edit Loan"
				variant="secondary"
				onPress={handleEdit}
				style={{ marginTop: s.xl }}
			/>
		</AtomicScreen>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	scrollContent: {
		paddingBottom: SPACING_PX['3xl'] - SPACING_PX.xs,
	},

	// Summary card
	summaryCard: {
		padding: SPACING_PX.lg,
		borderWidth: 1,
	},
	summaryTop: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	outstandingBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
	},

	// Progress
	progressCard: {
		padding: SPACING_PX.lg,
		borderWidth: 1,
	},
	progressHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	progressTrack: {
		height: LOAN_PROGRESS_HEIGHT,
		width: '100%',
		overflow: 'hidden',
	},
	progressFill: {
		height: LOAN_PROGRESS_HEIGHT,
	},
	progressLegend: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	// Table
	tableRow: {
		flexDirection: 'row',
		paddingVertical: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.xs,
	},
	tableHeaderRow: {
		borderTopLeftRadius: SPACING_PX.xs + SPACING_PX.xxs,
		borderTopRightRadius: SPACING_PX.xs + SPACING_PX.xxs,
	},
	tableCell: {
		flex: 1,
		textAlign: 'right',
		paddingHorizontal: SPACING_PX.xs,
	},
});
