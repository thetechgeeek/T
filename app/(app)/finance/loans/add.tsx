import React, { useState, useMemo } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Alert, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

/** Multi-line notes input height */
const NOTES_INPUT_HEIGHT = 88;
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Button } from '@/src/components/atoms/Button';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const LOAN_TYPES = ['Term Loan', 'OD', 'Personal', 'Vehicle', 'Mortgage'] as const;
type LoanType = (typeof LOAN_TYPES)[number];

function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
	if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
	const r = annualRate / 12 / 100;
	const n = tenureMonths;
	return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function AddLoanScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const router = useRouter();

	const [lenderName, setLenderName] = useState('');
	const [loanType, setLoanType] = useState<LoanType>('Term Loan');
	const [loanAmount, setLoanAmount] = useState('');
	const [disbursementDate, setDisbursementDate] = useState('');
	const [interestRate, setInterestRate] = useState('');
	const [tenure, setTenure] = useState('');
	const [autoCalc, setAutoCalc] = useState(true);
	const [emiAmount, setEmiAmount] = useState('');
	const [notes, setNotes] = useState('');

	const calculatedEMI = useMemo(() => {
		const p = parseFloat(loanAmount) || 0;
		const r = parseFloat(interestRate) || 0;
		const n = parseInt(tenure) || 0;
		return calculateEMI(p, r, n);
	}, [loanAmount, interestRate, tenure]);

	const inputStyle = [
		styles.input,
		{
			backgroundColor: c.surface,
			borderColor: c.border,
			borderRadius: r.sm,
			color: c.onSurface,
		},
	];

	const handleSave = () => {
		if (!lenderName.trim()) {
			Alert.alert('Validation', 'Please enter the lender name.');
			return;
		}
		if (!loanAmount || parseFloat(loanAmount) <= 0) {
			Alert.alert('Validation', 'Please enter a valid loan amount.');
			return;
		}
		Alert.alert('Success', 'Loan added successfully', [
			{ text: 'OK', onPress: () => router.back() },
		]);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard>
			<ScreenHeader title="Add Loan" />
			<ScrollView
				contentContainerStyle={[styles.scrollContent, { padding: s.lg }]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Lender Name */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Lender Name
				</ThemedText>
				<TextInput
					style={inputStyle}
					placeholder="e.g. SBI, HDFC Bank"
					placeholderTextColor={c.placeholder}
					value={lenderName}
					onChangeText={setLenderName}
					returnKeyType="next"
				/>

				{/* Loan Type chips */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Loan Type
				</ThemedText>
				<View style={styles.chipsRow}>
					{LOAN_TYPES.map((type) => {
						const active = loanType === type;
						return (
							<Pressable
								key={type}
								style={[
									styles.chip,
									{
										backgroundColor: active ? c.primary : c.surface,
										borderColor: active ? c.primary : c.border,
										borderRadius: r.sm,
									},
								]}
								onPress={() => setLoanType(type)}
							>
								<ThemedText
									variant="caption"
									color={active ? c.onPrimary : c.onSurface}
									weight={active ? 'medium' : 'regular'}
								>
									{type}
								</ThemedText>
							</Pressable>
						);
					})}
				</View>

				{/* Loan Amount */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Loan Amount
				</ThemedText>
				<View
					style={[
						styles.inputRow,
						{ backgroundColor: c.surface, borderColor: c.border, borderRadius: r.sm },
					]}
				>
					<ThemedText color={c.onSurfaceVariant} style={styles.prefix}>
						₹
					</ThemedText>
					<TextInput
						style={[styles.inputFlex, { color: c.onSurface }]}
						placeholder="0"
						placeholderTextColor={c.placeholder}
						keyboardType="numeric"
						value={loanAmount}
						onChangeText={setLoanAmount}
					/>
				</View>

				{/* Disbursement Date */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Disbursement Date
				</ThemedText>
				<DatePickerField
					label="Disbursement Date"
					value={disbursementDate}
					onChange={setDisbursementDate}
					showShortcuts
				/>

				{/* Interest Rate */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Interest Rate
				</ThemedText>
				<View
					style={[
						styles.inputRow,
						{ backgroundColor: c.surface, borderColor: c.border, borderRadius: r.sm },
					]}
				>
					<TextInput
						style={[styles.inputFlex, { color: c.onSurface }]}
						placeholder="0"
						placeholderTextColor={c.placeholder}
						keyboardType="numeric"
						value={interestRate}
						onChangeText={setInterestRate}
					/>
					<ThemedText color={c.onSurfaceVariant} style={styles.suffix}>
						% p.a.
					</ThemedText>
				</View>

				{/* Tenure */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Tenure
				</ThemedText>
				<View
					style={[
						styles.inputRow,
						{ backgroundColor: c.surface, borderColor: c.border, borderRadius: r.sm },
					]}
				>
					<TextInput
						style={[styles.inputFlex, { color: c.onSurface }]}
						placeholder="0"
						placeholderTextColor={c.placeholder}
						keyboardType="numeric"
						value={tenure}
						onChangeText={setTenure}
					/>
					<ThemedText color={c.onSurfaceVariant} style={styles.suffix}>
						months
					</ThemedText>
				</View>

				{/* Auto-calculate EMI Switch */}
				<View style={styles.switchRow}>
					<ThemedText variant="body">Auto-calculate EMI</ThemedText>
					<Switch
						value={autoCalc}
						onValueChange={setAutoCalc}
						trackColor={{ true: c.primary, false: c.border }}
						thumbColor={autoCalc ? c.onPrimary : c.placeholder}
					/>
				</View>

				{/* EMI display / input */}
				{autoCalc ? (
					calculatedEMI > 0 ? (
						<View
							style={[
								styles.emiDisplay,
								{ backgroundColor: c.surfaceVariant, borderRadius: r.sm },
							]}
						>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Monthly EMI
							</ThemedText>
							<ThemedText variant="h3" color={c.primary}>
								{formatCurrency(Math.round(calculatedEMI))}
							</ThemedText>
						</View>
					) : null
				) : (
					<>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.label}
						>
							EMI Amount
						</ThemedText>
						<View
							style={[
								styles.inputRow,
								{
									backgroundColor: c.surface,
									borderColor: c.border,
									borderRadius: r.sm,
								},
							]}
						>
							<ThemedText color={c.onSurfaceVariant} style={styles.prefix}>
								₹
							</ThemedText>
							<TextInput
								style={[styles.inputFlex, { color: c.onSurface }]}
								placeholder="0"
								placeholderTextColor={c.placeholder}
								keyboardType="numeric"
								value={emiAmount}
								onChangeText={setEmiAmount}
							/>
						</View>
					</>
				)}

				{/* Notes */}
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={styles.label}>
					Notes
				</ThemedText>
				<TextInput
					style={[inputStyle, styles.notesInput]}
					placeholder="Optional notes..."
					placeholderTextColor={c.placeholder}
					multiline
					numberOfLines={3}
					value={notes}
					onChangeText={setNotes}
					textAlignVertical="top"
				/>

				<Button title="Save Loan" onPress={handleSave} style={{ marginTop: s.xl }} />
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		paddingBottom: SPACING_PX['3xl'] - SPACING_PX.xs,
	},
	label: {
		marginBottom: SPACING_PX.xs + SPACING_PX.xxs,
		marginTop: SPACING_PX.lg,
	},
	input: {
		height: TOUCH_TARGET_MIN_PX,
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.md,
		fontSize: FONT_SIZE.body,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		height: TOUCH_TARGET_MIN_PX,
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.md,
	},
	inputFlex: {
		flex: 1,
		fontSize: FONT_SIZE.body,
	},
	prefix: {
		marginRight: SPACING_PX.sm,
		fontSize: FONT_SIZE.body,
	},
	suffix: {
		marginLeft: SPACING_PX.sm,
		fontSize: FONT_SIZE.caption,
	},
	chipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs + SPACING_PX.xxs / 2,
		borderWidth: 1,
	},
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: SPACING_PX.lg,
		paddingVertical: SPACING_PX.xs,
	},
	emiDisplay: {
		marginTop: SPACING_PX.md,
		padding: SPACING_PX.lg,
		alignItems: 'center',
	},
	notesInput: {
		height: NOTES_INPUT_HEIGHT,
		paddingTop: SPACING_PX.md,
	},
});
