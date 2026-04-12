import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
	Building2,
	CalendarDays,
	TrendingDown,
	Percent,
	Clock,
	CreditCard,
} from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Button } from '@/src/components/atoms/Button';
import { Badge } from '@/src/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Loan {
	id: string;
	lenderName: string;
	loanType: string;
	principalAmount: number;
	outstandingAmount: number;
	interestRate: number; // % p.a.
	tenureMonths: number;
	disbursementDate: string;
	nextEmiDate: string;
}

interface AmortisationRow {
	month: number;
	emi: number;
	principal: number;
	interest: number;
	balance: number;
}

// ---------------------------------------------------------------------------
// Mock data — TODO: replace with Zustand store lookup by loanId once store
// supports Loan entities (see finance slice roadmap).
// ---------------------------------------------------------------------------

const MOCK_LOAN: Loan = {
	id: '1',
	lenderName: 'State Bank of India',
	loanType: 'Term Loan',
	principalAmount: 500000,
	outstandingAmount: 423180,
	interestRate: 10.5,
	tenureMonths: 60,
	disbursementDate: '2024-01-15',
	nextEmiDate: '2026-05-15',
};

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
	const { c, s, r } = useThemeTokens();
	return (
		<View style={infoRowStyles.row}>
			<View
				style={[
					infoRowStyles.iconWrap,
					{ backgroundColor: iconColor + '18', borderRadius: r.xs },
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
		marginBottom: 14,
	},
	iconWrap: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	text: {
		flex: 1,
	},
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function LoanDetailScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const { id: loanId } = useLocalSearchParams<{ id: string }>();

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
		router.push(`/(app)/finance/loans/add` as any);
	};

	const loanTypeVariant = (): 'primary' | 'info' | 'warning' | 'neutral' => {
		switch (loan.loanType) {
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

	// Amortisation table header
	const TableHeader = () => (
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

	const renderScheduleRow = ({ item, index }: { item: AmortisationRow; index: number }) => (
		<View
			style={[
				styles.tableRow,
				{ backgroundColor: index % 2 === 0 ? c.surface : c.surfaceVariant + '60' },
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
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Loan Detail" />
			<ScrollView
				contentContainerStyle={[styles.scrollContent, { padding: s.lg, paddingBottom: 48 }]}
				showsVerticalScrollIndicator={false}
			>
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
						<ThemedText
							variant="h3"
							weight="bold"
							color={c.onSurface}
							style={{ flex: 1 }}
						>
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
								backgroundColor: c.errorLight ?? c.error + '18',
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
						style={[
							styles.divider,
							{ backgroundColor: c.border, marginVertical: s.md },
						]}
					/>

					{/* Info rows */}
					<InfoRow
						icon={<Percent size={18} color={c.primary} />}
						label="Interest Rate"
						value={`${loan.interestRate}% p.a.`}
						iconColor={c.primary}
					/>
					<InfoRow
						icon={<Clock size={18} color="#9C27B0" />}
						label="Tenure"
						value={`${loan.tenureMonths} months`}
						iconColor="#9C27B0"
					/>
					<InfoRow
						icon={<CreditCard size={18} color="#2196F3" />}
						label="Monthly EMI"
						value={formatCurrency(Math.round(emi))}
						iconColor="#2196F3"
					/>
					<InfoRow
						icon={<CalendarDays size={18} color="#FF9800" />}
						label="Disbursement Date"
						value={formatDate(loan.disbursementDate)}
						iconColor="#FF9800"
					/>
					<InfoRow
						icon={<TrendingDown size={18} color="#4CAF50" />}
						label="Next EMI Date"
						value={formatDate(loan.nextEmiDate)}
						iconColor="#4CAF50"
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
									backgroundColor: '#C0643A',
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
					leftIcon={<CreditCard size={18} color="white" style={{ marginRight: 4 }} />}
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
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					style={{ marginBottom: s.md }}
				>
					First 12 months — principal {formatCurrency(loan.principalAmount)},{' '}
					{loan.interestRate}% p.a., {loan.tenureMonths} months
				</ThemedText>

				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={{ minWidth: 500 }}>
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
			</ScrollView>
		</AtomicScreen>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	scrollContent: {
		paddingBottom: 40,
	},

	// Summary card
	summaryCard: {
		padding: 16,
		borderWidth: 1,
	},
	summaryTop: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	outstandingBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	divider: {
		height: 1,
	},

	// Progress
	progressCard: {
		padding: 16,
		borderWidth: 1,
	},
	progressHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	progressTrack: {
		height: 8,
		width: '100%',
		overflow: 'hidden',
	},
	progressFill: {
		height: 8,
	},
	progressLegend: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	// Table
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	tableHeaderRow: {
		borderTopLeftRadius: 6,
		borderTopRightRadius: 6,
	},
	tableCell: {
		flex: 1,
		textAlign: 'right',
		paddingHorizontal: 4,
	},
});
