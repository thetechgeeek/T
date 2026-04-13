import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_SUBTLE } from '@/src/theme/uiMetrics';
import { palette } from '@/src/theme/palette';

type VerifyState = 'idle' | 'running' | 'complete';

const STEPS = [
	'Checking ledger balances...',
	'Checking stock counts...',
	'Checking orphaned records...',
	'Checking GST data...',
];

// Simulate finding a mock issue on step 4 (index 3)
const MOCK_ISSUE_STEP = 3;

export default function DataVerificationScreen() {
	const { c, s } = useThemeTokens();
	const [state, setState] = useState<VerifyState>('idle');
	const [currentStep, setCurrentStep] = useState(-1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [hasIssue, setHasIssue] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearAllTimeouts = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	const runVerification = () => {
		clearAllTimeouts();
		setState('running');
		setCurrentStep(0);
		setCompletedSteps([]);
		setHasIssue(false);
		runStep(0);
	};

	const runStep = (stepIndex: number) => {
		if (stepIndex >= STEPS.length) {
			setState('complete');
			setCurrentStep(-1);
			return;
		}
		setCurrentStep(stepIndex);
		timeoutRef.current = setTimeout(() => {
			setCompletedSteps((prev) => [...prev, stepIndex]);
			if (stepIndex === MOCK_ISSUE_STEP) {
				setHasIssue(true);
			}
			runStep(stepIndex + 1);
		}, 500);
	};

	useEffect(() => {
		return () => clearAllTimeouts();
	}, []);

	return (
		<AtomicScreen safeAreaEdges={['bottom']} scrollable>
			<ScreenHeader title="Data Verification" />
			<View style={{ padding: s.lg }}>
				{state === 'idle' && (
					<>
						<Card padding="md" style={{ marginBottom: s.lg }}>
							<ThemedText variant="body" weight="medium">
								Verify Data Integrity
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: 4 }}
							>
								Checks ledger balances, stock counts, orphaned records, and GST data
								for any issues.
							</ThemedText>
						</Card>
						<Button title="Run Verification" onPress={runVerification} />
					</>
				)}

				{(state === 'running' || state === 'complete') && (
					<>
						<Card padding="md" style={{ marginBottom: s.md }}>
							<ThemedText
								variant="body"
								weight="medium"
								style={{ marginBottom: s.sm }}
							>
								{state === 'running'
									? 'Verification in Progress'
									: 'Verification Complete'}
							</ThemedText>

							{STEPS.map((step, idx) => {
								const isDone = completedSteps.includes(idx);
								const isActive = currentStep === idx && state === 'running';

								return (
									<View
										key={step}
										style={
											[
												styles.stepRow,
												{
													borderTopColor: c.border,
													borderTopWidth:
														idx > 0 ? StyleSheet.hairlineWidth : 0,
												},
											] as const
										}
									>
										<View style={styles.stepIndicator}>
											{isActive ? (
												<ActivityIndicator size="small" color={c.primary} />
											) : isDone ? (
												<ThemedText
													color={c.success}
													style={{ fontSize: 16 }}
												>
													✓
												</ThemedText>
											) : (
												<View
													style={
														[
															styles.stepDot,
															{ backgroundColor: c.border },
														] as const
													}
												/>
											)}
										</View>
										<ThemedText
											variant="body"
											color={
												isDone
													? c.onSurface
													: isActive
														? c.primary
														: c.placeholder
											}
											weight={isActive ? 'medium' : 'regular'}
											style={{ flex: 1 }}
										>
											{step}
										</ThemedText>
									</View>
								);
							})}
						</Card>

						{state === 'complete' && (
							<>
								{!hasIssue ? (
									<Card
										padding="md"
										style={
											[
												styles.resultCard,
												{
													backgroundColor: withOpacity(
														c.success,
														OPACITY_TINT_SUBTLE,
													),
													borderColor: c.success,
													borderWidth: 1,
												},
											] as const
										}
									>
										<ThemedText variant="h3" color={c.success}>
											All Clear ✓
										</ThemedText>
										<ThemedText
											variant="caption"
											color={c.onSurfaceVariant}
											style={{ marginTop: 4 }}
										>
											No issues found
										</ThemedText>
									</Card>
								) : (
									<Card
										padding="md"
										style={
											[
												styles.resultCard,
												{
													backgroundColor: palette.verifyBannerBg,
													borderColor: palette.verifyBannerBorder,
													borderWidth: 1,
												},
											] as const
										}
									>
										<ThemedText variant="h3" color={palette.verifyBannerText}>
											1 Issue Found
										</ThemedText>
										<ThemedText
											variant="caption"
											color={palette.verifyBannerText}
											style={{ marginTop: 4 }}
										>
											Some items have no HSN code
										</ThemedText>
										<Pressable style={{ marginTop: 8 }}>
											<ThemedText
												variant="caption"
												color={c.primary}
												weight="medium"
											>
												View Items →
											</ThemedText>
										</Pressable>
									</Card>
								)}

								<Button
									title="Run Again"
									onPress={runVerification}
									variant="outline"
									style={{ marginTop: s.md }}
								/>
							</>
						)}
					</>
				)}
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	stepRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
	},
	stepIndicator: {
		width: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	resultCard: {
		borderRadius: 10,
	},
});
