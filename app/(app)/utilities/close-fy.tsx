import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useRouter } from 'expo-router';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const CURRENT_FY = '2024-25';
const NEXT_FY = '2025-26';

/** Delay between progress-step ticks in the close-FY animation */
const MS_CLOSE_FY_STEP_DELAY = 700;

const PROCESSING_STEPS = [
	'Creating opening balance entries for all parties...',
	'Creating opening cash balance for FY ' + NEXT_FY + '...',
	'Creating opening bank balances...',
	'Resetting invoice sequence...',
	'Archiving FY ' + CURRENT_FY + '...',
];
const CLOSE_FY_STEP_SIZE = SPACING_PX['2xl'];
const CLOSE_FY_ROW_PADDING = SPACING_PX.md + SPACING_PX.xxs;
const CLOSE_FY_CARD_PADDING = SPACING_PX.lg + SPACING_PX.xs;
const CLOSE_FY_CONFIRM_LABEL_MARGIN_BOTTOM = SPACING_PX.sm - SPACING_PX.xxs;

export default function CloseFYScreen() {
	const { c, s, r } = useThemeTokens();
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3 | 'processing' | 'done'>(1);
	const [confirmText, setConfirmText] = useState('');
	const [resetSequence, setResetSequence] = useState(true);
	const [archiveFY, setArchiveFY] = useState(true);
	const [processingStep, setProcessingStep] = useState(0);

	const handleClose = () => {
		if (confirmText !== CURRENT_FY) return;
		setStep('processing');
		let i = 0;
		const tick = () => {
			if (i < PROCESSING_STEPS.length) {
				setProcessingStep(i);
				i++;
				setTimeout(tick, MS_CLOSE_FY_STEP_DELAY);
			} else {
				setStep('done');
			}
		};
		setTimeout(tick, 300);
	};

	const SwitchRow = ({
		label,
		value,
		onToggle,
	}: {
		label: string;
		value: boolean;
		onToggle: () => void;
	}) => (
		<View style={[styles.switchRow, { borderColor: c.border }]}>
			<ThemedText variant="body" style={{ flex: 1 }}>
				{label}
			</ThemedText>
			<Button
				title={value ? 'ON' : 'OFF'}
				onPress={onToggle}
				size="sm"
				variant={value ? 'primary' : 'secondary'}
			/>
		</View>
	);

	if (step === 'done') {
		return (
			<AtomicScreen safeAreaEdges={['bottom']}>
				<ScreenHeader title="Close Financial Year" />
				<View style={styles.center}>
					<CheckCircle2 size={72} color={c.success} />
					<ThemedText variant="h1" style={{ marginTop: s.lg, textAlign: 'center' }}>
						FY {CURRENT_FY} Closed ✓
					</ThemedText>
					<ThemedText
						variant="body"
						color={c.onSurfaceVariant}
						style={{ textAlign: 'center', marginTop: s.sm }}
					>
						App is now operating in FY {NEXT_FY}. Old FY data is accessible via
						&quot;Previous FY&quot; filter in all screens.
					</ThemedText>
					<View style={{ marginTop: s.xl, width: '100%' }}>
						<Button
							title="Go to Dashboard"
							onPress={() => router.replace('/(app)/(tabs)')}
						/>
					</View>
				</View>
			</AtomicScreen>
		);
	}

	if (step === 'processing') {
		return (
			<AtomicScreen safeAreaEdges={['bottom']}>
				<ScreenHeader title="Closing FY..." />
				<View style={styles.center}>
					<ActivityIndicator size="large" color={c.primary} />
					<View style={{ marginTop: s.xl, width: '100%', gap: s.md }}>
						{PROCESSING_STEPS.map((label, i) => (
							<View key={i} style={[styles.progressRow]}>
								{i < processingStep ? (
									<CheckCircle2 size={20} color={c.success} />
								) : i === processingStep ? (
									<ActivityIndicator size="small" color={c.primary} />
								) : (
									<Circle size={20} color={c.border} />
								)}
								<ThemedText
									variant="body"
									color={
										i < processingStep
											? c.success
											: i === processingStep
												? c.primary
												: c.onSurfaceVariant
									}
									style={{ marginLeft: s.sm, flex: 1 }}
								>
									{label}
								</ThemedText>
							</View>
						))}
					</View>
				</View>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen
			withKeyboard
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title="Close Financial Year" />}
			contentContainerStyle={{ padding: s.lg }}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			{/* Step indicator */}
			<View style={[styles.stepRow, { marginBottom: s.lg }]}>
				{[1, 2, 3].map((n) => (
					<View key={n} style={{ alignItems: 'center', flex: 1 }}>
						<View
							style={[
								styles.stepCircle,
								{ backgroundColor: step >= n ? c.primary : c.surfaceVariant },
							]}
						>
							<ThemedText
								variant="caption"
								color={step >= n ? c.onPrimary : c.onSurfaceVariant}
							>
								{n}
							</ThemedText>
						</View>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={{ marginTop: SPACING_PX.xs, textAlign: 'center' }}
						>
							{n === 1 ? 'Summary' : n === 2 ? 'Verify' : 'Confirm'}
						</ThemedText>
					</View>
				))}
			</View>

			{/* Step 1 */}
			{step === 1 && (
				<>
					<ThemedText variant="h2" style={{ marginBottom: s.sm }}>
						Closing FY {CURRENT_FY}
					</ThemedText>
					<ThemedText
						variant="body"
						color={c.onSurfaceVariant}
						style={{ marginBottom: s.lg }}
					>
						1 Apr 2024 – 31 Mar 2025
					</ThemedText>
					<View
						style={[
							styles.summaryCard,
							{
								backgroundColor: c.surface,
								borderColor: c.border,
								borderRadius: r.lg,
							},
						]}
					>
						{[
							['Total Sale', '₹ 0'],
							['Total Purchase', '₹ 0'],
							['Net Profit', '₹ 0'],
							['Outstanding Receivable', '₹ 0'],
							['Outstanding Payable', '₹ 0'],
							['Stock Value', '₹ 0'],
						].map(([label, value]) => (
							<View
								key={label}
								style={[styles.summaryRow, { borderBottomColor: c.border }]}
							>
								<ThemedText variant="body">{label}</ThemedText>
								<ThemedText variant="bodyBold">{value}</ThemedText>
							</View>
						))}
					</View>
					<View style={{ marginTop: s.lg }}>
						<Button title="Proceed to Verification" onPress={() => setStep(2)} />
					</View>
				</>
			)}

			{/* Step 2 */}
			{step === 2 && (
				<>
					<ThemedText variant="h2" style={{ marginBottom: s.lg }}>
						Data Verification
					</ThemedText>
					<View
						style={[
							styles.allClearCard,
							{ backgroundColor: c.successLight, borderRadius: r.lg },
						]}
					>
						<CheckCircle2 size={32} color={c.paid} />
						<View style={{ marginLeft: s.md }}>
							<ThemedText variant="h3" color={c.paid}>
								All Clear ✓
							</ThemedText>
							<ThemedText variant="caption" color={c.paid}>
								No issues found. Safe to close FY.
							</ThemedText>
						</View>
					</View>
					<View style={{ marginTop: s.lg, gap: s.md }}>
						<Button title="Continue to Configuration" onPress={() => setStep(3)} />
						<Button title="Back" variant="secondary" onPress={() => setStep(1)} />
					</View>
				</>
			)}

			{/* Step 3 */}
			{step === 3 && (
				<>
					<ThemedText variant="h2" style={{ marginBottom: s.md }}>
						Configuration
					</ThemedText>
					<SwitchRow
						label="Reset invoice sequence to 1"
						value={resetSequence}
						onToggle={() => setResetSequence(!resetSequence)}
					/>
					<SwitchRow
						label="Archive old FY (make read-only)"
						value={archiveFY}
						onToggle={() => setArchiveFY(!archiveFY)}
					/>

					<View
						style={[
							styles.warningCard,
							{
								backgroundColor: c.errorLight,
								borderRadius: r.lg,
								marginTop: s.lg,
							},
						]}
					>
						<ThemedText variant="bodyBold" color={c.unpaid}>
							⚠ This cannot be undone
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.unpaid}
							style={{ marginTop: SPACING_PX.xs }}
						>
							Closing FY {CURRENT_FY} will freeze all transactions before 1 Apr 2025.
							You cannot add or edit transactions in the closed FY.
						</ThemedText>
					</View>

					<ThemedText
						variant="label"
						color={c.onSurfaceVariant}
						style={{
							marginTop: s.lg,
							marginBottom: CLOSE_FY_CONFIRM_LABEL_MARGIN_BOTTOM,
						}}
					>
						Type &quot;{CURRENT_FY}&quot; to confirm
					</ThemedText>
					<TextInput
						value={confirmText}
						onChangeText={setConfirmText}
						placeholder={CURRENT_FY}
						placeholderTextColor={c.placeholder}
						style={[
							styles.confirmInput,
							{ borderColor: c.border, color: c.onSurface, borderRadius: r.md },
						]}
					/>

					<View style={{ marginTop: s.lg, gap: s.md }}>
						<Button
							title={`Close FY ${CURRENT_FY}`}
							onPress={handleClose}
							disabled={confirmText !== CURRENT_FY}
							variant="danger"
						/>
						<Button title="Back" variant="secondary" onPress={() => setStep(2)} />
					</View>
				</>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: SPACING_PX['2xl'],
	},
	stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
	stepCircle: {
		width: CLOSE_FY_STEP_SIZE,
		height: CLOSE_FY_STEP_SIZE,
		borderRadius: CLOSE_FY_STEP_SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	summaryCard: { borderWidth: 1, overflow: 'hidden' },
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: CLOSE_FY_ROW_PADDING,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	allClearCard: { flexDirection: 'row', alignItems: 'center', padding: CLOSE_FY_CARD_PADDING },
	warningCard: { padding: SPACING_PX.lg },
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: CLOSE_FY_ROW_PADDING,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	progressRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX['2xl'],
	},
	confirmInput: {
		borderWidth: 1,
		padding: CLOSE_FY_ROW_PADDING,
		fontSize: FONT_SIZE.h3,
		letterSpacing: 2,
	},
});
