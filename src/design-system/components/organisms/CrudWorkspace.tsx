import React, { forwardRef, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader } from '@/src/utils/accessibility';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/src/design-system/components/atoms/Card';
import { Checkbox } from '@/src/design-system/components/atoms/Checkbox';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import {
	ActivityFeed,
	type ActivityFeedItem,
} from '@/src/design-system/components/molecules/ActivityFeed';
import { AlertBanner } from '@/src/design-system/components/molecules/AlertBanner';
import { ConfirmationModal } from '@/src/design-system/components/molecules/ConfirmationModal';
import { DescriptionList } from '@/src/design-system/components/molecules/DescriptionList';
import { ProgressIndicator } from '@/src/design-system/components/molecules/ProgressIndicator';
import { SegmentedControl } from '@/src/design-system/components/molecules/SegmentedControl';
import { SwipeableRow } from '@/src/design-system/components/molecules/SwipeableRow';
import { TableRow } from '@/src/design-system/components/molecules/TableRow';
import { ToastViewport, type ToastStackItem } from '@/src/design-system/components/molecules/Toast';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface CrudWorkspaceRecord {
	id: string;
	name: string;
	status: string;
	owner: string;
	versionLabel: string;
	updatedAtLabel: string;
}

export interface CrudWorkspaceProps {
	records?: CrudWorkspaceRecord[];
	defaultRecords?: CrudWorkspaceRecord[];
	onRecordsChange?: (
		records: CrudWorkspaceRecord[],
		meta?: { source: 'archive' | 'restore' | 'duplicate' | 'delete' },
	) => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

type CrudViewMode = 'summary' | 'dense';
type PendingAction =
	| {
			type: 'standard-delete';
			record: CrudWorkspaceRecord;
	  }
	| {
			type: 'hard-delete';
			record: CrudWorkspaceRecord;
	  }
	| null;

const TOTAL_RESULTS_COUNT = 24;
const ARCHIVE_TOAST_DURATION_MS = 5000;
const OWNER_COLUMN_FLEX = 1.2;
const VERSION_COLUMN_FLEX = 0.7;
const WORKSPACE_TITLE_MIN_WIDTH = 220;
const DETAIL_PANEL_MIN_WIDTH = 320;

const DEFAULT_RECORDS: CrudWorkspaceRecord[] = [
	{
		id: 'crud-1',
		name: 'Northwind supplier import',
		status: 'Needs review',
		owner: 'Priya Nair',
		versionLabel: 'v12',
		updatedAtLabel: 'Updated 14m ago',
	},
	{
		id: 'crud-2',
		name: 'Quarterly pricing matrix',
		status: 'Ready',
		owner: 'Marcus Lee',
		versionLabel: 'v7',
		updatedAtLabel: 'Updated 42m ago',
	},
	{
		id: 'crud-3',
		name: 'Warehouse transfer policy',
		status: 'Draft',
		owner: 'Amina Khan',
		versionLabel: 'v3',
		updatedAtLabel: 'Updated yesterday',
	},
];

const PREVIOUS_SNAPSHOT: Record<string, { owner: string; status: string; versionLabel: string }> = {
	'crud-1': {
		owner: 'Priya N.',
		status: 'Draft',
		versionLabel: 'v11',
	},
	'crud-2': {
		owner: 'Marcus Lee',
		status: 'Queued',
		versionLabel: 'v6',
	},
	'crud-3': {
		owner: 'Amina K.',
		status: 'Queued',
		versionLabel: 'v2',
	},
};

const HISTORY_ITEMS: ActivityFeedItem[] = [
	{
		id: 'crud-history-1',
		title: 'Approval checklist updated',
		description: 'Pricing matrix now requires finance and procurement review.',
		timeLabel: '09:20',
		dateLabel: 'Today',
		statusLabel: 'Changed',
	},
	{
		id: 'crud-history-2',
		title: 'Archive restored',
		description: 'Warehouse transfer policy came back for a compliance review.',
		timeLabel: '17:45',
		dateLabel: 'Yesterday',
		statusLabel: 'Restored',
	},
];

function buildDuplicate(record: CrudWorkspaceRecord): CrudWorkspaceRecord {
	return {
		...record,
		id: `${record.id}-copy`,
		name: `${record.name} (Copy)`,
		versionLabel: 'v1',
		updatedAtLabel: 'Duplicated just now',
	};
}

export const CrudWorkspace = forwardRef<React.ElementRef<typeof View>, CrudWorkspaceProps>(
	({ records, defaultRecords = DEFAULT_RECORDS, onRecordsChange, style, testID }, ref) => {
		const { theme } = useTheme();
		const [currentRecords, setCurrentRecords] = useControllableState({
			value: records,
			defaultValue: defaultRecords,
			onChange: (nextRecords, meta) =>
				onRecordsChange?.(nextRecords, {
					source:
						meta?.source === 'restore'
							? 'restore'
							: meta?.source === 'duplicate'
								? 'duplicate'
								: meta?.source === 'delete'
									? 'delete'
									: 'archive',
				}),
		});
		const [archivedRecords, setArchivedRecords] = useState<CrudWorkspaceRecord[]>([]);
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		const [viewMode, setViewMode] = useState<CrudViewMode>('summary');
		const [selectionMode, setSelectionMode] = useState(false);
		const [pendingAction, setPendingAction] = useState<PendingAction>(null);
		const [toasts, setToasts] = useState<ToastStackItem[]>([]);
		const [bulkProgress, setBulkProgress] = useState<number | null>(null);
		const [dirtyActionCount, setDirtyActionCount] = useState(0);
		const [selectionScope, setSelectionScope] = useState<'page' | 'all'>('page');
		const [comparisonRecordId, setComparisonRecordId] = useState<string>(
			defaultRecords[0]?.id ?? '',
		);

		const activeRecords = currentRecords;
		const comparisonRecord =
			activeRecords.find((record) => record.id === comparisonRecordId) ?? activeRecords[0];
		const comparisonSnapshot = comparisonRecord
			? (PREVIOUS_SNAPSHOT[comparisonRecord.id] ?? PREVIOUS_SNAPSHOT['crud-1'])
			: undefined;
		const selectedCount = selectedIds.length;
		const selectedRecords = activeRecords.filter((record) => selectedIds.includes(record.id));
		const visibleSelectionCount =
			selectionScope === 'all' && selectedCount > 0 ? TOTAL_RESULTS_COUNT : selectedCount;

		const pushToast = (item: Omit<ToastStackItem, 'id'>) => {
			setToasts((current) => [
				{
					id: `crud-toast-${Date.now()}-${current.length}`,
					...item,
				},
				...current,
			]);
		};

		const dismissToast = (id: string) => {
			setToasts((current) => current.filter((toast) => toast.id !== id));
		};

		const markDirty = () => {
			setDirtyActionCount((count) => count + 1);
		};

		const updateRecords = (
			nextRecords: CrudWorkspaceRecord[],
			source: 'archive' | 'restore' | 'duplicate' | 'delete',
		) => {
			setCurrentRecords(nextRecords, { source });
			markDirty();
		};

		const clearSelection = () => {
			setSelectedIds([]);
			setSelectionMode(false);
			setSelectionScope('page');
		};

		const toggleSelected = async (
			recordId: string,
			source: 'press' | 'long-press' = 'press',
		) => {
			if (source === 'long-press') {
				setSelectionMode(true);
				await triggerDesignSystemHaptic('selection');
			}

			setSelectedIds((current) =>
				current.includes(recordId)
					? current.filter((id) => id !== recordId)
					: [...current, recordId],
			);
		};

		const selectAllCurrentPage = () => {
			setSelectionMode(true);
			setSelectionScope('page');
			setSelectedIds(activeRecords.map((record) => record.id));
		};

		const selectAllAcrossResults = async () => {
			setSelectionMode(true);
			setSelectionScope('all');
			setSelectedIds(activeRecords.map((record) => record.id));
			await announceForScreenReader(`All ${TOTAL_RESULTS_COUNT} records selected`);
		};

		const restoreRecords = (recordsToRestore: CrudWorkspaceRecord[]) => {
			setArchivedRecords((current) =>
				current.filter(
					(record) => !recordsToRestore.some((entry) => entry.id === record.id),
				),
			);
			updateRecords([...recordsToRestore, ...activeRecords], 'restore');
			pushToast({
				message: `${recordsToRestore.length} record${recordsToRestore.length === 1 ? '' : 's'} restored`,
				variant: 'success',
			});
		};

		const archiveRecords = async (recordsToArchive: CrudWorkspaceRecord[]) => {
			setArchivedRecords((current) => [...recordsToArchive, ...current]);
			updateRecords(
				activeRecords.filter(
					(record) => !recordsToArchive.some((entry) => entry.id === record.id),
				),
				'archive',
			);
			setBulkProgress(100);
			clearSelection();
			pushToast({
				message: `${recordsToArchive.length} record${recordsToArchive.length === 1 ? '' : 's'} moved to archive`,
				variant: 'warning',
				actionLabel: 'Undo',
				onAction: () => restoreRecords(recordsToArchive),
				duration: ARCHIVE_TOAST_DURATION_MS,
			});
			await announceForScreenReader(`${recordsToArchive.length} records archived`);
		};

		const duplicateSelection = () => {
			const duplicated = selectedRecords.map(buildDuplicate);
			updateRecords([...duplicated, ...activeRecords], 'duplicate');
			setBulkProgress(100);
			clearSelection();
			pushToast({
				message: `${duplicated.length} draft duplicate${duplicated.length === 1 ? '' : 's'} created`,
				variant: 'success',
			});
		};

		const confirmStandardDelete = async () => {
			if (!pendingAction || pendingAction.type !== 'standard-delete') {
				return;
			}

			await triggerDesignSystemHaptic('warning');
			await archiveRecords([pendingAction.record]);
			setPendingAction(null);
		};

		const confirmPermanentDelete = async () => {
			if (!pendingAction || pendingAction.type !== 'hard-delete') {
				return;
			}

			await triggerDesignSystemHaptic('error');
			setArchivedRecords((current) =>
				current.filter((record) => record.id !== pendingAction.record.id),
			);
			markDirty();
			pushToast({
				message: `${pendingAction.record.name} permanently deleted`,
				variant: 'error',
			});
			setPendingAction(null);
		};

		const activeRows =
			viewMode === 'summary' ? (
				<View style={{ gap: theme.spacing.sm }}>
					{activeRecords.map((record) => {
						const selected = selectedIds.includes(record.id);
						return (
							<SwipeableRow
								key={record.id}
								onArchive={() => void archiveRecords([record])}
								onDelete={() =>
									setPendingAction({ type: 'standard-delete', record })
								}
								testID={`${testID ?? 'crud-workspace'}-row-${record.id}`}
							>
								<Pressable
									onPress={() => {
										if (selectionMode) {
											void toggleSelected(record.id);
											return;
										}

										setComparisonRecordId(record.id);
									}}
									onLongPress={() => void toggleSelected(record.id, 'long-press')}
									accessibilityRole="button"
									accessibilityLabel={record.name}
									style={{
										padding: theme.spacing.md,
										borderWidth: theme.borderWidth.sm,
										borderColor: selected
											? theme.colors.primary
											: theme.colors.border,
										borderRadius: theme.borderRadius.md,
										backgroundColor: selected
											? theme.colors.surfaceVariant
											: theme.visual.surfaces.default,
										flexDirection: 'row',
										alignItems: 'center',
										gap: theme.spacing.md,
									}}
								>
									<Checkbox
										label="Select record"
										checked={selected}
										onCheckedChange={() => void toggleSelected(record.id)}
										accessibilityLabel={record.name}
									/>
									<View style={{ flex: 1 }}>
										<ThemedText variant="bodyStrong">{record.name}</ThemedText>
										<ThemedText
											variant="caption"
											style={{
												color: theme.colors.onSurfaceVariant,
												marginTop: theme.spacing.xxs,
											}}
										>
											{`${record.owner} • ${record.versionLabel} • ${record.updatedAtLabel}`}
										</ThemedText>
									</View>
									<Badge label={record.status} size="sm" />
								</Pressable>
							</SwipeableRow>
						);
					})}
				</View>
			) : (
				<Card variant="outlined" density="compact">
					<CardBody>
						<TableRow
							variant="header"
							density="compact"
							columns={[
								{ label: 'Name', flex: 2 },
								{ label: 'Owner', flex: OWNER_COLUMN_FLEX },
								{ label: 'Status', flex: 1 },
								{ label: 'Version', flex: VERSION_COLUMN_FLEX, align: 'right' },
							]}
						/>
						{activeRecords.map((record) => {
							const selected = selectedIds.includes(record.id);
							return (
								<Pressable
									key={record.id}
									onPress={() => {
										if (selectionMode) {
											void toggleSelected(record.id);
											return;
										}

										setComparisonRecordId(record.id);
									}}
									onLongPress={() => void toggleSelected(record.id, 'long-press')}
									style={{
										backgroundColor: selected
											? theme.colors.surfaceVariant
											: 'transparent',
									}}
								>
									<TableRow
										density="compact"
										columns={[
											{
												label: 'Name',
												flex: 2,
												value: (
													<View
														style={{
															flexDirection: 'row',
															alignItems: 'center',
															gap: theme.spacing.sm,
														}}
													>
														<Checkbox
															label="Select record"
															checked={selected}
															onCheckedChange={() =>
																void toggleSelected(record.id)
															}
															accessibilityLabel={record.name}
														/>
														<ThemedText variant="caption">
															{record.name}
														</ThemedText>
													</View>
												),
											},
											{
												label: 'Owner',
												flex: OWNER_COLUMN_FLEX,
												value: record.owner,
											},
											{
												label: 'Status',
												flex: 1,
												value: <Badge label={record.status} size="sm" />,
											},
											{
												label: 'Version',
												flex: VERSION_COLUMN_FLEX,
												align: 'right',
												value: (
													<ThemedText variant="caption">
														{record.versionLabel}
													</ThemedText>
												),
											},
										]}
									/>
								</Pressable>
							);
						})}
					</CardBody>
				</Card>
			);

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
								<ThemedText variant="sectionTitle">CRUD workspace</ThemedText>
								<ThemedText
									variant="caption"
									style={{
										color: theme.colors.onSurfaceVariant,
										marginTop: theme.spacing.xxs,
									}}
								>
									One reusable shell for calm summary review, dense selection
									work, and tiered destructive actions.
								</ThemedText>
							</View>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								{dirtyActionCount > 0 ? (
									<Badge
										label={`Unsaved changes ${dirtyActionCount}`}
										variant="warning"
										size="sm"
									/>
								) : null}
								<Badge label={`Archive ${archivedRecords.length}`} size="sm" />
								<Badge
									label={`Results ${TOTAL_RESULTS_COUNT}`}
									variant="info"
									size="sm"
								/>
							</View>
						</View>
					</CardHeader>
					<CardBody>
						<SegmentedControl
							testID={`${testID ?? 'crud-workspace'}-mode`}
							label="Presentation"
							options={[
								{ label: 'Summary', value: 'summary' },
								{ label: 'Dense', value: 'dense' },
							]}
							value={viewMode}
							onChange={(value) => setViewMode(value as CrudViewMode)}
						/>
					</CardBody>
					<CardFooter>
						<AlertBanner
							variant="warning"
							title="Destructive actions escalate quietly"
							description="Archive uses an undo toast, delete uses a named confirmation, and purge requires an explicit hard-confirm step."
						/>
					</CardFooter>
				</Card>

				{selectedCount > 0 ? (
					<Card variant="outlined" testID={`${testID ?? 'crud-workspace'}-bulk-bar`}>
						<CardHeader>
							<ThemedText variant="bodyStrong">
								{`${visibleSelectionCount} selected`}
							</ThemedText>
						</CardHeader>
						<CardBody>
							<View style={{ gap: theme.spacing.sm }}>
								<View
									style={{
										flexDirection: 'row',
										flexWrap: 'wrap',
										gap: theme.spacing.sm,
									}}
								>
									<Button
										title="Select page"
										variant="secondary"
										size="sm"
										onPress={selectAllCurrentPage}
									/>
									<Button
										title={`Select all ${TOTAL_RESULTS_COUNT}`}
										variant="ghost"
										size="sm"
										onPress={() => void selectAllAcrossResults()}
									/>
									<Button
										title="Clear selection"
										variant="ghost"
										size="sm"
										onPress={clearSelection}
									/>
								</View>
								<View
									style={{
										flexDirection: 'row',
										flexWrap: 'wrap',
										gap: theme.spacing.sm,
									}}
								>
									<Button
										title="Archive selected"
										size="sm"
										onPress={() => void archiveRecords(selectedRecords)}
									/>
									<Button
										title="Duplicate"
										variant="secondary"
										size="sm"
										onPress={duplicateSelection}
									/>
									<Button
										title="Delete"
										variant="danger"
										size="sm"
										onPress={() => {
											if (selectedRecords[0]) {
												setPendingAction({
													type: 'standard-delete',
													record: selectedRecords[0],
												});
											}
										}}
									/>
								</View>
								{bulkProgress !== null ? (
									<ProgressIndicator
										variant="linear"
										value={bulkProgress}
										label="Bulk action progress"
										testID={`${testID ?? 'crud-workspace'}-progress`}
									/>
								) : null}
							</View>
						</CardBody>
					</Card>
				) : null}

				{activeRows}

				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
					<Card
						variant="outlined"
						style={{ flex: 1, minWidth: DETAIL_PANEL_MIN_WIDTH }}
						testID={`${testID ?? 'crud-workspace'}-comparison`}
					>
						<CardHeader>Comparison / diff view</CardHeader>
						<CardBody>
							<DescriptionList
								items={
									comparisonRecord && comparisonSnapshot
										? [
												{
													id: 'name',
													label: 'Entity',
													value: `${comparisonSnapshot.versionLabel} → ${comparisonRecord.name}`,
												},
												{
													id: 'owner',
													label: 'Owner',
													value: `${comparisonSnapshot.owner} → ${comparisonRecord.owner}`,
												},
												{
													id: 'status',
													label: 'Status',
													value: `${comparisonSnapshot.status} → ${comparisonRecord.status}`,
												},
											]
										: []
								}
								layout="vertical"
							/>
						</CardBody>
					</Card>

					<Card
						variant="outlined"
						style={{ flex: 1, minWidth: DETAIL_PANEL_MIN_WIDTH }}
						testID={`${testID ?? 'crud-workspace'}-archive`}
					>
						<CardHeader>Archive / trash</CardHeader>
						<CardBody>
							{archivedRecords.length === 0 ? (
								<ThemedText
									variant="caption"
									style={{ color: theme.colors.onSurfaceVariant }}
								>
									Archived records will appear here so restore and permanent
									delete remain explicit separate actions.
								</ThemedText>
							) : (
								<View style={{ gap: theme.spacing.sm }}>
									{archivedRecords.map((record) => (
										<Card
											key={record.id}
											variant="flat"
											density="compact"
											style={{
												backgroundColor: theme.visual.surfaces.raised,
											}}
										>
											<CardBody>
												<ThemedText variant="bodyStrong">
													{record.name}
												</ThemedText>
												<ThemedText
													variant="caption"
													style={{
														color: theme.colors.onSurfaceVariant,
														marginTop: theme.spacing.xxs,
													}}
												>
													{record.updatedAtLabel}
												</ThemedText>
												<View
													style={{
														flexDirection: 'row',
														flexWrap: 'wrap',
														gap: theme.spacing.sm,
														marginTop: theme.spacing.sm,
													}}
												>
													<Button
														title="Restore"
														size="sm"
														variant="secondary"
														onPress={() => restoreRecords([record])}
													/>
													<Button
														title="Permanently delete"
														size="sm"
														variant="danger"
														onPress={() =>
															setPendingAction({
																type: 'hard-delete',
																record,
															})
														}
													/>
												</View>
											</CardBody>
										</Card>
									))}
								</View>
							)}
						</CardBody>
					</Card>
				</View>

				<Card variant="outlined">
					<CardHeader>Version history / audit log</CardHeader>
					<CardBody>
						<ActivityFeed items={HISTORY_ITEMS} density="compact" />
					</CardBody>
				</Card>

				{pendingAction?.type === 'standard-delete' ? (
					<ConfirmationModal
						open
						title={`Delete ${pendingAction.record.name}?`}
						message="This is the standard confirmation tier. The record will move to archive first so people can still undo or restore it."
						onConfirm={() => void confirmStandardDelete()}
						onCancel={() => setPendingAction(null)}
						variant="destructive"
						confirmLabel="Move to archive"
						cancelLabel="Cancel"
						testID={`${testID ?? 'crud-workspace'}-delete-confirm`}
					/>
				) : null}

				{pendingAction?.type === 'hard-delete' ? (
					<ConfirmationModal
						open
						title={`Permanently delete ${pendingAction.record.name}?`}
						message="This hard confirmation is reserved for irreversible trash purge actions."
						onConfirm={() => void confirmPermanentDelete()}
						onCancel={() => setPendingAction(null)}
						variant="destructive"
						confirmLabel="Delete forever"
						cancelLabel="Cancel"
						hardConfirmValue="DELETE"
						hardConfirmLabel="Type DELETE to purge"
						hardConfirmHelperText="Permanent delete is intentionally a separate explicit step from archive."
						testID={`${testID ?? 'crud-workspace'}-purge-confirm`}
					/>
				) : null}

				<ToastViewport
					items={toasts}
					onDismiss={dismissToast}
					testID={`${testID ?? 'crud-workspace'}-toasts`}
				/>
			</View>
		);
	},
);

CrudWorkspace.displayName = 'CrudWorkspace';
