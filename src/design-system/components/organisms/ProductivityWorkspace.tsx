import React, { forwardRef, useMemo, useState } from 'react';
import { Share, View, type StyleProp, type ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AlertBanner } from '@/src/design-system/components/molecules/AlertBanner';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card, CardBody, CardHeader } from '@/src/design-system/components/atoms/Card';
import { DescriptionList } from '@/src/design-system/components/molecules/DescriptionList';
import {
	FileUploadField,
	type UploadItem,
} from '@/src/design-system/components/molecules/FileUploadField';
import { ProgressIndicator } from '@/src/design-system/components/molecules/ProgressIndicator';
import { SegmentedControl } from '@/src/design-system/components/molecules/SegmentedControl';
import { Stepper, type StepperStep } from '@/src/design-system/components/molecules/Stepper';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ToastViewport, type ToastStackItem } from '@/src/design-system/components/molecules/Toast';
import {
	responsiveCardStyle,
	useResponsiveWorkbenchLayout,
} from '@/src/design-system/useResponsiveWorkbenchLayout';

type ExportScope = 'current-view' | 'full-dataset';
type ExportFormat = 'csv' | 'xlsx' | 'json';

export interface ProductivityWorkspaceProps {
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

function asNumber(value: string) {
	return Number(value);
}

const DEFAULT_IMPORT_FILE_SIZE = 48200;
const SAMPLE_EXPORT_AMOUNTS = {
	needsReview: asNumber('4200'),
	ready: asNumber('9100'),
} as const;
const IMPORT_PROGRESS_START = 20;
const IMPORT_PROGRESS_MIDPOINT = 55;
const IMPORT_PROGRESS_MAX = 100;
const IMPORT_PROGRESS_MID_DELAY_MS = 200;
const IMPORT_PROGRESS_FINAL_DELAY_MS = 400;
const IMPORT_PROGRESS_CLEANUP_DELAY_MS = 550;
const WORKSPACE_TITLE_MIN_WIDTH = 220;
const DETAIL_CARD_MIN_WIDTH = 280;
const TEMPLATE_FILENAME = 'import-template.csv';

const DEFAULT_IMPORT_FILES: UploadItem[] = [
	{
		id: 'import-file-1',
		name: 'supplier-ledger.csv',
		uri: 'file:///supplier-ledger.csv',
		size: DEFAULT_IMPORT_FILE_SIZE,
		mimeType: 'text/csv',
		source: 'document',
		progress: 100,
		status: 'uploaded',
	},
];

const FORMATTED_ROWS = `invoice_id\towner\tstatus\nINV-482\tPriya Nair\tNeeds review\nINV-483\tMarcus Lee\tReady`;
const SHARE_LINK = 'https://timemaster.app/design-system/patterns/import-export';
const TEMPLATE_CONTENT = 'invoice_id,owner,status,amount\nINV-100,Owner Name,Ready,1200';

async function writeShareableFile(filename: string, contents: string) {
	const directory = FileSystem.documentDirectory ?? 'file:///tmp/';
	const uri = `${directory}${filename}`;
	await FileSystem.writeAsStringAsync(uri, contents);
	return uri;
}

function buildExportContents(format: ExportFormat, scope: ExportScope) {
	if (format === 'json') {
		return JSON.stringify(
			{
				scope,
				rows: [
					{
						id: 'INV-482',
						owner: 'Priya Nair',
						status: 'Needs review',
						amount: SAMPLE_EXPORT_AMOUNTS.needsReview,
					},
					{
						id: 'INV-483',
						owner: 'Marcus Lee',
						status: 'Ready',
						amount: SAMPLE_EXPORT_AMOUNTS.ready,
					},
				],
			},
			null,
			2,
		);
	}

	if (format === 'xlsx') {
		return `Workbook placeholder for ${scope}\nINV-482,${SAMPLE_EXPORT_AMOUNTS.needsReview}\nINV-483,${SAMPLE_EXPORT_AMOUNTS.ready}`;
	}

	return `invoice_id,owner,status,amount,scope\nINV-482,Priya Nair,Needs review,${SAMPLE_EXPORT_AMOUNTS.needsReview},${scope}\nINV-483,Marcus Lee,Ready,${SAMPLE_EXPORT_AMOUNTS.ready},${scope}`;
}

export const ProductivityWorkspace = forwardRef<
	React.ElementRef<typeof View>,
	ProductivityWorkspaceProps
>(({ style, testID }, ref) => {
	const { theme } = useTheme();
	const { isCompactPhone } = useResponsiveWorkbenchLayout();
	const [files, setFiles] = useState<UploadItem[]>(DEFAULT_IMPORT_FILES);
	const [exportScope, setExportScope] = useState<ExportScope>('current-view');
	const [wizardStep, setWizardStep] = useState(3);
	const [importProgress, setImportProgress] = useState<number | null>(null);
	const [lastShortcut, setLastShortcut] = useState('No external keyboard shortcut captured yet.');
	const [toasts, setToasts] = useState<ToastStackItem[]>([]);

	const pushToast = (item: Omit<ToastStackItem, 'id'>) => {
		setToasts((current) => [
			{
				id: `productivity-toast-${Date.now()}-${current.length}`,
				...item,
			},
			...current,
		]);
	};

	const dismissToast = (id: string) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	};

	const wizardSteps = useMemo<StepperStep[]>(
		() => [
			{
				label: 'Upload',
				value: 'upload',
				state: wizardStep > 0 ? 'completed' : 'active',
				description: 'Pick a document and preserve the original file name.',
			},
			{
				label: 'Map',
				value: 'map',
				state: wizardStep > 1 ? 'completed' : wizardStep === 1 ? 'active' : 'upcoming',
				description: 'Map incoming columns to the library contract.',
			},
			{
				label: 'Validate',
				value: 'validate',
				state: wizardStep > 2 ? 'completed' : wizardStep === 2 ? 'active' : 'upcoming',
				description: 'Surface row-level corrections before confirming.',
			},
			{
				label: 'Confirm',
				value: 'confirm',
				state: wizardStep === 3 ? 'active' : 'upcoming',
				description: 'Finalize the import when mapping and validation are clear.',
			},
		],
		[wizardStep],
	);

	const copyValue = async (label: string, value: string) => {
		await Clipboard.setStringAsync(value);
		pushToast({
			message: `${label} copied`,
			variant: 'success',
		});
	};

	const shareLink = async () => {
		await Share.share({
			message: SHARE_LINK,
			url: SHARE_LINK,
		});
		pushToast({
			message: 'Native share sheet opened',
			variant: 'info',
		});
	};

	const shareFile = async (format: ExportFormat, scope: ExportScope, filenamePrefix: string) => {
		const contents = buildExportContents(format, scope);
		const uri = await writeShareableFile(`${filenamePrefix}.${format}`, contents);
		await Sharing.shareAsync(uri);
		pushToast({
			message: `${format.toUpperCase()} export ready for Files, AirDrop, or email`,
			variant: 'success',
		});
	};

	const shareTemplate = async () => {
		const uri = await writeShareableFile(TEMPLATE_FILENAME, TEMPLATE_CONTENT);
		await Sharing.shareAsync(uri);
		pushToast({
			message: 'Template shared for download or Files handoff',
			variant: 'success',
		});
	};

	const runImport = () => {
		setImportProgress(IMPORT_PROGRESS_START);
		setTimeout(() => setImportProgress(IMPORT_PROGRESS_MIDPOINT), IMPORT_PROGRESS_MID_DELAY_MS);
		setTimeout(() => setImportProgress(IMPORT_PROGRESS_MAX), IMPORT_PROGRESS_FINAL_DELAY_MS);
		setTimeout(() => {
			pushToast({
				message: 'Import confirmed with validation notes attached',
				variant: 'success',
			});
			setImportProgress(null);
		}, IMPORT_PROGRESS_CLEANUP_DELAY_MS);
	};

	const handleShortcutKey = (key: string) => {
		const normalizedKey = key.toLowerCase();
		if (normalizedKey === 'k') {
			setLastShortcut(
				'Captured Cmd/Ctrl+K style quick-search intent from an external keyboard.',
			);
			return;
		}
		if (normalizedKey === '?') {
			setLastShortcut('Captured shortcut help request for the settings/help surface.');
			return;
		}
		if (normalizedKey === 'i') {
			setWizardStep(1);
			setLastShortcut('Captured import shortcut and jumped directly into column mapping.');
			return;
		}
		setLastShortcut(`Captured "${key}" from the external keyboard input surface.`);
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
							<ThemedText variant="sectionTitle">Productivity workspace</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: theme.colors.onSurfaceVariant,
									marginTop: theme.spacing.xxs,
								}}
							>
								Clipboard, keyboard, import, and export patterns should all
								prioritize correction speed and clarity over decorative chrome.
							</ThemedText>
						</View>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.sm,
							}}
						>
							<Badge label={`Files ${files.length}`} size="sm" />
							<Badge
								label={
									exportScope === 'current-view'
										? 'Current view export'
										: 'Full dataset handoff'
								}
								variant="info"
								size="sm"
							/>
						</View>
					</View>
				</CardHeader>
				<CardBody>
					<SegmentedControl
						label="Export scope"
						options={[
							{ label: 'Current view', value: 'current-view' },
							{ label: 'Full dataset', value: 'full-dataset' },
						]}
						value={exportScope}
						onChange={(value) => setExportScope(value as ExportScope)}
					/>
				</CardBody>
			</Card>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
				<Card variant="outlined" style={responsiveCardStyle(isCompactPhone, 300)}>
					<CardHeader>Clipboard & share</CardHeader>
					<CardBody>
						<View style={{ gap: theme.spacing.sm }}>
							<ThemedText
								variant="caption"
								style={{ color: theme.colors.onSurfaceVariant }}
							>
								Copy buttons should confirm success immediately and work for values,
								links, and formatted row payloads.
							</ThemedText>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Button
									title="Copy ID"
									size="sm"
									onPress={() => void copyValue('Invoice id', 'INV-482')}
								/>
								<Button
									title="Copy share link"
									size="sm"
									variant="secondary"
									onPress={() => void copyValue('Share link', SHARE_LINK)}
								/>
								<Button
									title="Copy formatted rows"
									size="sm"
									variant="outline"
									onPress={() => void copyValue('Formatted rows', FORMATTED_ROWS)}
								/>
								<Button
									title="Share link"
									size="sm"
									variant="ghost"
									onPress={() => void shareLink()}
								/>
							</View>
							<DescriptionList
								items={[
									{
										id: 'clipboard-link',
										label: 'Universal link',
										value: SHARE_LINK,
										copyable: true,
									},
									{
										id: 'clipboard-format',
										label: 'Formatted rows',
										value: 'TSV payload ready for paste into a spreadsheet or message',
									},
								]}
								layout="horizontal"
								density="compact"
							/>
						</View>
					</CardBody>
				</Card>

				<Card variant="outlined" style={responsiveCardStyle(isCompactPhone, 300)}>
					<CardHeader>External keyboard shortcuts</CardHeader>
					<CardBody>
						<View style={{ gap: theme.spacing.sm }}>
							<ThemedText
								variant="caption"
								style={{ color: theme.colors.onSurfaceVariant }}
							>
								These shortcuts are designed for iPad and Android tablet users
								working with an external keyboard.
							</ThemedText>
							<TextInput
								label="Shortcut capture field"
								placeholder="Press ?, K, or I"
								onKeyPress={(event) => handleShortcutKey(event.nativeEvent.key)}
								helperText={lastShortcut}
								testID={`${testID ?? 'productivity-workspace'}-shortcut-input`}
							/>
							<View style={{ gap: theme.spacing.xs }}>
								<ThemedText variant="bodyStrong">Help surface</ThemedText>
								<ThemedText
									variant="caption"
									style={{ color: theme.colors.onSurfaceVariant }}
								>
									`?` Open shortcut help, `K` quick search, `I` jump to the import
									wizard.
								</ThemedText>
							</View>
						</View>
					</CardBody>
				</Card>
			</View>

			<Card variant="outlined">
				<CardHeader>
					<View style={{ gap: theme.spacing.xs }}>
						<ThemedText variant="bodyStrong">Import / export wizard</ThemedText>
						<ThemedText
							variant="caption"
							style={{ color: theme.colors.onSurfaceVariant }}
						>
							Upload, map, preview, validate, and confirm in one structured flow.
							Template download and export live beside the same contract.
						</ThemedText>
					</View>
				</CardHeader>
				<CardBody>
					<View style={{ gap: theme.spacing.md }}>
						<Stepper
							testID={`${testID ?? 'productivity-workspace'}-wizard`}
							steps={wizardSteps}
							onStepPress={(value) => {
								if (value === 'upload') {
									setWizardStep(0);
								}
								if (value === 'map') {
									setWizardStep(1);
								}
								if (value === 'validate') {
									setWizardStep(2);
								}
							}}
						/>

						<FileUploadField
							label="Source files"
							files={files}
							onChange={setFiles}
							testID={`${testID ?? 'productivity-workspace'}-files`}
						/>

						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.sm,
							}}
						>
							<Button
								title="Template download"
								size="sm"
								variant="secondary"
								onPress={() => void shareTemplate()}
							/>
							<Button
								title="Export CSV"
								size="sm"
								onPress={() => void shareFile('csv', exportScope, 'pattern-export')}
							/>
							<Button
								title="Export Excel"
								size="sm"
								variant="outline"
								onPress={() =>
									void shareFile('xlsx', exportScope, 'pattern-export')
								}
							/>
							<Button
								title="Export JSON"
								size="sm"
								variant="ghost"
								onPress={() =>
									void shareFile('json', exportScope, 'pattern-export')
								}
							/>
						</View>

						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.md,
							}}
						>
							<Card
								variant="flat"
								density="compact"
								style={responsiveCardStyle(isCompactPhone, DETAIL_CARD_MIN_WIDTH)}
							>
								<CardHeader>Column mapping preview</CardHeader>
								<CardBody>
									<DescriptionList
										items={[
											{
												id: 'map-1',
												label: 'Invoice Number',
												value: 'invoice_id',
											},
											{ id: 'map-2', label: 'Owner', value: 'owner' },
											{
												id: 'map-3',
												label: 'Workflow Status',
												value: 'status',
											},
											{ id: 'map-4', label: 'Gross Amount', value: 'amount' },
										]}
										layout="horizontal"
										density="compact"
									/>
								</CardBody>
							</Card>

							<Card
								variant="flat"
								density="compact"
								style={responsiveCardStyle(isCompactPhone, DETAIL_CARD_MIN_WIDTH)}
							>
								<CardHeader>Validation report</CardHeader>
								<CardBody>
									<View style={{ gap: theme.spacing.sm }}>
										<AlertBanner
											variant="warning"
											title="Row 14"
											description="Owner email is missing. Suggestion: map the `approver_email` column instead."
										/>
										<AlertBanner
											variant="error"
											title="Row 21"
											description="Amount uses a comma decimal format. Suggestion: switch the locale parser before confirming."
										/>
									</View>
								</CardBody>
							</Card>
						</View>

						{importProgress !== null ? (
							<ProgressIndicator
								variant="linear"
								value={importProgress}
								label={`Import progress ${importProgress}%`}
							/>
						) : null}

						<Button title="Confirm import" onPress={runImport} />
					</View>
				</CardBody>
			</Card>

			<ToastViewport
				items={toasts}
				onDismiss={dismissToast}
				testID={`${testID ?? 'productivity-workspace'}-toasts`}
			/>
		</View>
	);
});

ProductivityWorkspace.displayName = 'ProductivityWorkspace';
