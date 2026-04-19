import React, { forwardRef, useEffect, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AlertBanner } from '@/src/design-system/components/molecules/AlertBanner';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card, CardBody, CardHeader } from '@/src/design-system/components/atoms/Card';
import { ErrorState } from '@/src/design-system/components/molecules/ErrorState';
import { ProgressIndicator } from '@/src/design-system/components/molecules/ProgressIndicator';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ToastViewport, type ToastStackItem } from '@/src/design-system/components/molecules/Toast';
import {
	responsiveCardStyle,
	useResponsiveWorkbenchLayout,
} from '@/src/design-system/useResponsiveWorkbenchLayout';

type SyncState = 'tentative' | 'syncing' | 'stale' | 'confirmed';
type ConnectivityState = 'online' | 'offline' | 'reconnecting';
type JobState = 'idle' | 'processing' | 'failed' | 'completed' | 'canceled';

interface FeedbackBoundaryProps {
	children: React.ReactNode;
	onReset: () => void;
	testID?: string;
}

interface FeedbackBoundaryState {
	hasError: boolean;
}

class FeedbackSectionBoundary extends React.Component<
	FeedbackBoundaryProps,
	FeedbackBoundaryState
> {
	state: FeedbackBoundaryState = {
		hasError: false,
	};

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch() {}

	render() {
		if (this.state.hasError) {
			return (
				<ErrorState
					testID={this.props.testID}
					variant="server"
					title="Section boundary recovered"
					description="This fallback contains the failure inside the current section instead of collapsing the full workbench."
					actionLabel="Reload section"
					onAction={() => {
						this.setState({ hasError: false });
						this.props.onReset();
					}}
				/>
			);
		}

		return this.props.children;
	}
}

function ExplodingFeedbackPanel({ explode }: { explode: boolean }) {
	if (explode) {
		throw new Error('Simulated section failure');
	}

	return (
		<Card variant="outlined">
			<CardHeader>Component / section boundary</CardHeader>
			<CardBody>
				<ThemedText variant="caption">
					This section is healthy. If it fails, the fallback stays local to the affected
					block.
				</ThemedText>
			</CardBody>
		</Card>
	);
}

export interface FeedbackLoopWorkspaceProps {
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const JOB_ID = 'JOB-24018';
const JOB_PROGRESS_INCREMENT = 25;
const JOB_INTERVAL_MS = 250;
const FULL_PROGRESS = 100;
const INITIAL_JOB_PROGRESS = 10;
const WORKSPACE_TITLE_MIN_WIDTH = 220;

export const FeedbackLoopWorkspace = forwardRef<
	React.ElementRef<typeof View>,
	FeedbackLoopWorkspaceProps
>(({ style, testID }, ref) => {
	const { theme } = useTheme();
	const { isCompactPhone } = useResponsiveWorkbenchLayout();
	const [syncState, setSyncState] = useState<SyncState>('stale');
	const [connectivity, setConnectivity] = useState<ConnectivityState>('reconnecting');
	const [lastUpdatedLabel, setLastUpdatedLabel] = useState('Updated 9m ago');
	const [newItemsCount, setNewItemsCount] = useState(3);
	const [approvedLocally, setApprovedLocally] = useState(false);
	const [jobState, setJobState] = useState<JobState>('idle');
	const [jobProgress, setJobProgress] = useState(0);
	const [explodeSection, setExplodeSection] = useState(false);
	const [boundaryResetKey, setBoundaryResetKey] = useState(0);
	const [toasts, setToasts] = useState<ToastStackItem[]>([]);

	const pushToast = (item: Omit<ToastStackItem, 'id'>) => {
		setToasts((current) => [
			{
				id: `feedback-toast-${Date.now()}-${current.length}`,
				...item,
			},
			...current,
		]);
	};

	useEffect(() => {
		if (jobState !== 'processing') {
			return;
		}

		const timer = setInterval(() => {
			setJobProgress((current) => {
				const nextValue = current + JOB_PROGRESS_INCREMENT;
				if (nextValue >= FULL_PROGRESS) {
					clearInterval(timer);
					setJobState('completed');
					pushToast({
						message: 'Long-running export completed',
						variant: 'success',
					});
					return FULL_PROGRESS;
				}
				return nextValue;
			});
		}, JOB_INTERVAL_MS);

		return () => clearInterval(timer);
	}, [jobState]);

	const dismissToast = (id: string) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	};

	const syncVariant =
		syncState === 'confirmed'
			? 'success'
			: syncState === 'stale'
				? 'warning'
				: syncState === 'syncing'
					? 'info'
					: 'neutral';
	const connectivityVariant =
		connectivity === 'online' ? 'success' : connectivity === 'offline' ? 'error' : 'warning';

	const startJob = () => {
		setJobState('processing');
		setJobProgress(INITIAL_JOB_PROGRESS);
		pushToast({
			message: `${JOB_ID} started in the background`,
			variant: 'info',
		});
	};

	const refreshStaleData = () => {
		setSyncState('syncing');
		setLastUpdatedLabel('Refreshing cached data…');
		setTimeout(() => {
			setSyncState('confirmed');
			setLastUpdatedLabel('Updated just now');
			setConnectivity('online');
		}, 300);
	};

	const stageOptimisticUpdate = () => {
		setApprovedLocally(true);
		setSyncState('syncing');
		pushToast({
			message: 'Optimistic update applied instantly',
			variant: 'info',
		});
	};

	const confirmOptimisticUpdate = () => {
		setSyncState('confirmed');
		setLastUpdatedLabel('Updated just now');
		pushToast({
			message: 'Remote confirmation received',
			variant: 'success',
		});
	};

	const rollbackOptimisticUpdate = () => {
		setApprovedLocally(false);
		setSyncState('tentative');
		pushToast({
			message: 'Optimistic edit rolled back after failure',
			variant: 'warning',
		});
	};

	return (
		<View ref={ref} testID={testID} style={[{ gap: theme.spacing.lg }, style]}>
			<Card featured density="relaxed">
				<CardHeader>
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: theme.spacing.sm,
						}}
					>
						<View style={{ flex: 1, minWidth: WORKSPACE_TITLE_MIN_WIDTH }}>
							<ThemedText variant="sectionTitle">Feedback loop workspace</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: theme.colors.onSurfaceVariant,
									marginTop: theme.spacing.xxs,
								}}
							>
								Tentative, syncing, stale, and confirmed states stay calm, readable,
								and distinct without loud animation or duplicated noise.
							</ThemedText>
						</View>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.sm,
							}}
						>
							<Badge label={`Sync: ${syncState}`} variant={syncVariant} size="sm" />
							<Badge
								label={`Connectivity: ${connectivity}`}
								variant={connectivityVariant}
								size="sm"
							/>
							<Badge label={lastUpdatedLabel} size="sm" />
						</View>
					</View>
				</CardHeader>
				<CardBody>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
						<Button title="Refresh cached data" size="sm" onPress={refreshStaleData} />
						<Button
							title="Set offline"
							size="sm"
							variant="outline"
							onPress={() => setConnectivity('offline')}
						/>
						<Button
							title="Set reconnecting"
							size="sm"
							variant="ghost"
							onPress={() => setConnectivity('reconnecting')}
						/>
					</View>
				</CardBody>
			</Card>

			{newItemsCount > 0 ? (
				<AlertBanner
					variant="info"
					title={`${newItemsCount} new items available`}
					description="Background refresh stayed quiet until the user was ready to merge new data into the current view."
					actionLabel="Refresh now"
					onAction={() => {
						setNewItemsCount(0);
						refreshStaleData();
					}}
				/>
			) : null}

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
				<Card variant="outlined" style={responsiveCardStyle(isCompactPhone, 300)}>
					<CardHeader>Optimistic update with rollback</CardHeader>
					<CardBody>
						<View style={{ gap: theme.spacing.sm }}>
							<ThemedText variant="bodyStrong">
								Approval gate: {approvedLocally ? 'Approved locally' : 'Waiting'}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{ color: theme.colors.onSurfaceVariant }}
							>
								Local edits appear instantly, then either confirm quietly or roll
								back with a clear explanation.
							</ThemedText>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Button
									title="Apply optimistic edit"
									size="sm"
									onPress={stageOptimisticUpdate}
								/>
								<Button
									title="Confirm"
									size="sm"
									variant="secondary"
									onPress={confirmOptimisticUpdate}
								/>
								<Button
									title="Rollback"
									size="sm"
									variant="outline"
									onPress={rollbackOptimisticUpdate}
								/>
							</View>
						</View>
					</CardBody>
				</Card>

				<Card variant="outlined" style={responsiveCardStyle(isCompactPhone, 300)}>
					<CardHeader>Background job progress</CardHeader>
					<CardBody>
						<View style={{ gap: theme.spacing.sm }}>
							<ThemedText variant="bodyStrong">
								{jobState === 'idle' ? 'No job running' : `${JOB_ID} • ${jobState}`}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{ color: theme.colors.onSurfaceVariant }}
							>
								Long-running work moves into a calm progress surface instead of
								blocking the whole layout.
							</ThemedText>
							{jobState !== 'idle' ? (
								<ProgressIndicator
									variant="linear"
									value={jobProgress}
									indeterminate={jobState === 'processing' && jobProgress === 0}
									label={`Progress ${jobProgress}%`}
								/>
							) : null}
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Button title="Start job" size="sm" onPress={startJob} />
								<Button
									title="Fail"
									size="sm"
									variant="outline"
									onPress={() => {
										setJobState('failed');
										pushToast({
											message: `${JOB_ID} failed validation`,
											variant: 'error',
										});
									}}
								/>
								<Button
									title="Cancel"
									size="sm"
									variant="ghost"
									onPress={() => {
										setJobState('canceled');
										setJobProgress(0);
									}}
								/>
							</View>
						</View>
					</CardBody>
				</Card>
			</View>

			<View style={{ gap: theme.spacing.md }}>
				<AlertBanner
					variant="warning"
					title="Conflict detected"
					description="This record changed while you were editing. Review the latest server version before saving again."
				/>
				<AlertBanner
					variant="info"
					title="Collaborative lock"
					description="Anna is currently editing this record. You can still review it, but save is paused until the lock clears."
				/>
			</View>

			<View style={{ gap: theme.spacing.md }}>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
					<Button
						title="Trigger section failure"
						size="sm"
						variant="danger"
						onPress={() => setExplodeSection(true)}
					/>
					<Button
						title="Reset boundary"
						size="sm"
						variant="secondary"
						onPress={() => {
							setExplodeSection(false);
							setBoundaryResetKey((current) => current + 1);
						}}
					/>
				</View>
				<FeedbackSectionBoundary
					key={boundaryResetKey}
					testID={`${testID ?? 'feedback-loop-workspace'}-boundary`}
					onReset={() => {
						setExplodeSection(false);
						setBoundaryResetKey((current) => current + 1);
					}}
				>
					<ExplodingFeedbackPanel explode={explodeSection} />
				</FeedbackSectionBoundary>
			</View>

			<ToastViewport
				items={toasts}
				onDismiss={dismissToast}
				testID={`${testID ?? 'feedback-loop-workspace'}-toasts`}
			/>
		</View>
	);
});

FeedbackLoopWorkspace.displayName = 'FeedbackLoopWorkspace';
