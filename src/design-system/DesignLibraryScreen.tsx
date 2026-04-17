import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Calendar, Moon, Package, Palette, Search, Sun } from 'lucide-react-native';
import { LucideIconGlyph, MaterialIconGlyph } from '@/src/design-system/iconography';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { Avatar } from '@/src/design-system/components/atoms/Avatar';
import { Card, CardBody, CardFooter, CardHeader } from '@/src/design-system/components/atoms/Card';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';
import { FAB, IconButton } from '@/src/design-system/components/atoms/IconButton';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Chip } from '@/src/design-system/components/atoms/Chip';
import { Checkbox, CheckboxGroup } from '@/src/design-system/components/atoms/Checkbox';
import { Radio, RadioGroup } from '@/src/design-system/components/atoms/Radio';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ToggleSwitch } from '@/src/design-system/components/atoms/ToggleSwitch';
import { AlertBanner } from '@/src/design-system/components/molecules/AlertBanner';
import { ActionMenuSheet } from '@/src/design-system/components/molecules/ActionMenuSheet';
import {
	ActivityFeed,
	type ActivityFeedItem,
} from '@/src/design-system/components/molecules/ActivityFeed';
import { AutocompleteField } from '@/src/design-system/components/molecules/AutocompleteField';
import { AvatarGroup } from '@/src/design-system/components/molecules/AvatarGroup';
import { SearchBar } from '@/src/design-system/components/molecules/SearchBar';
import { PhoneInput } from '@/src/design-system/components/molecules/PhoneInput';
import { AmountInput } from '@/src/design-system/components/molecules/AmountInput';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import { DateRangePickerField } from '@/src/design-system/components/molecules/DateRangePickerField';
import { DataChart } from '@/src/design-system/components/molecules/DataChart';
import { DescriptionList } from '@/src/design-system/components/molecules/DescriptionList';
import { TimePickerField } from '@/src/design-system/components/molecules/TimePickerField';
import { ColorPicker } from '@/src/design-system/components/molecules/ColorPicker';
import {
	FileUploadField,
	type UploadItem,
} from '@/src/design-system/components/molecules/FileUploadField';
import { FilterBar } from '@/src/design-system/components/molecules/FilterBar';
import { EmptyState } from '@/src/design-system/components/molecules/EmptyState';
import { ErrorState } from '@/src/design-system/components/molecules/ErrorState';
import {
	KanbanBoard,
	type KanbanBoardColumn,
} from '@/src/design-system/components/molecules/KanbanBoard';
import { MediaViewer } from '@/src/design-system/components/molecules/MediaViewer';
import {
	NotificationCenter,
	type NotificationItem,
} from '@/src/design-system/components/molecules/NotificationCenter';
import { BottomSheetPicker } from '@/src/design-system/components/molecules/BottomSheetPicker';
import { CollapsibleSection } from '@/src/design-system/components/molecules/CollapsibleSection';
import { ConfirmationModal } from '@/src/design-system/components/molecules/ConfirmationModal';
import { ListItem } from '@/src/design-system/components/molecules/ListItem';
import { NumericStepper } from '@/src/design-system/components/molecules/NumericStepper';
import { OtpCodeInput } from '@/src/design-system/components/molecules/OtpCodeInput';
import { ProgressIndicator } from '@/src/design-system/components/molecules/ProgressIndicator';
import { RangeSlider } from '@/src/design-system/components/molecules/RangeSlider';
import { SegmentedControl } from '@/src/design-system/components/molecules/SegmentedControl';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { SkeletonRow } from '@/src/design-system/components/molecules/SkeletonRow';
import { SortableList } from '@/src/design-system/components/molecules/SortableList';
import { Tooltip } from '@/src/design-system/components/molecules/Tooltip';
import { Popover } from '@/src/design-system/components/molecules/Popover';
import { SplitButton } from '@/src/design-system/components/molecules/SplitButton';
import { Stepper } from '@/src/design-system/components/molecules/Stepper';
import { StatCard } from '@/src/design-system/components/molecules/StatCard';
import { SwipeableRow } from '@/src/design-system/components/molecules/SwipeableRow';
import { Tabs } from '@/src/design-system/components/molecules/Tabs';
import { TextAreaField } from '@/src/design-system/components/molecules/TextAreaField';
import {
	Toast,
	ToastViewport,
	type ToastStackItem,
} from '@/src/design-system/components/molecules/Toast';
import { TokenInput } from '@/src/design-system/components/molecules/TokenInput';
import { ToggleButtonGroup } from '@/src/design-system/components/molecules/ToggleButtonGroup';
import { VirtualizedList } from '@/src/design-system/components/molecules/VirtualizedList';
import {
	DESIGN_LIBRARY_COMPONENT_OVERVIEW,
	DESIGN_LIBRARY_OVERVIEW,
	filterCatalogComponents,
	filterLibraryItems,
	formatSectionKey,
	isLivePreviewComponent,
	isPreviewableItem,
	type ComponentKindFilter,
	type LibraryCompletionFilter,
	type LibraryPlatformFilter,
} from './catalog';
import type { DesignSystemComponentKind } from './generated/componentCatalog';
import type { UiLibraryChecklistItem } from './generated/uiLibraryCatalog';
import type { ThemeMode, ThemePresetId } from '@/src/theme';
import { getDesignSystemCopy, type DesignSystemLocale } from './copy';
import { buildDesignSystemLocaleDiagnostics } from './formatters';
import { useDesignSystemQualitySignals } from './useQualitySignals';
import { WorkbenchHeader } from './components/WorkbenchHeader';
import { DESIGN_SYSTEM_COMPONENT_DOCS } from './componentDocs';
import { showNativeConfirmationAlert } from './nativeAlertDialog';
import {
	DESIGN_SYSTEM_OPERATIONAL_FIXTURE,
	DESIGN_SYSTEM_READ_ONLY_FIELDS,
	DESIGN_SYSTEM_RELAXED_FIXTURE,
	DESIGN_SYSTEM_STATE_FIXTURES,
} from './fixtures';

const AMOUNT_PREVIEW_VALUE = 125000;
const METRIC_CARD_MIN_WIDTH = 170;
const PRINCIPLE_CARD_MIN_WIDTH = 220;
const PROOF_CARD_MIN_WIDTH = 260;
const COMPONENT_CARD_MIN_WIDTH = 220;
const DATA_DISPLAY_CARD_MIN_WIDTH = 260;
const DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH = 320;
const DATA_DISPLAY_AVATAR_CARD_MIN_WIDTH = 280;
const DATA_DISPLAY_STAT_CARD_MIN_WIDTH = 220;
const DATA_DISPLAY_BOARD_CARD_MIN_WIDTH = 340;
const SINGLE_SLIDER_DEFAULT = 35;
const RANGE_SLIDER_DEFAULT: [number, number] = [20, 80];
const SURFACE_TIER_ORDER = ['canvas', 'default', 'raised', 'overlay', 'inverse'] as const;
const COMPONENT_FILE_UPLOAD_SEED: UploadItem[] = [
	{
		id: 'file-uploaded',
		name: 'invoice.pdf',
		source: 'document',
		progress: 100,
		status: 'uploaded',
		mimeType: 'application/pdf',
	},
	{
		id: 'file-error',
		name: 'inventory-fail.csv',
		source: 'document',
		progress: 100,
		status: 'error',
		error: 'Upload failed.',
		mimeType: 'text/csv',
	},
];

const PLATFORM_VARIANT: Record<UiLibraryChecklistItem['platform'], 'info' | 'success' | 'neutral'> =
	{
		Common: 'info',
		Web: 'neutral',
		'Mobile (React Native)': 'success',
	};

const COMPONENT_KIND_VARIANT: Record<
	DesignSystemComponentKind,
	'info' | 'success' | 'warning' | 'neutral'
> = {
	atoms: 'info',
	molecules: 'success',
	organisms: 'warning',
	skeletons: 'neutral',
};

type SurfaceTierKey = (typeof SURFACE_TIER_ORDER)[number];
type SliderValue = number | [number, number];

function PreviewSection({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	const { c, s, visual } = useThemeTokens();

	return (
		<Card
			variant="outlined"
			style={{
				marginBottom: s.lg,
				backgroundColor: visual.surfaces.raised,
				borderColor: c.border,
			}}
		>
			<View style={{ marginBottom: s.md }}>
				<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
					{title}
				</ThemedText>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginTop: s.xxs }}
				>
					{description}
				</ThemedText>
			</View>
			{children}
		</Card>
	);
}

function ThemeModeChip({
	label,
	selected,
	onPress,
}: {
	label: string;
	selected: boolean;
	onPress: () => void;
}) {
	return <Chip label={label} selected={selected} onPress={onPress} />;
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
	const { c, s } = useThemeTokens();

	return (
		<View style={{ marginTop: s.sm }}>
			<ThemedText variant="label" style={{ color: c.onSurface }}>
				{label}
			</ThemedText>
			<View style={{ marginTop: s.xxs }}>{children}</View>
		</View>
	);
}

function WorkbenchMetricCard({
	label,
	value,
	detail,
	variant = 'default',
}: {
	label: string;
	value: string | number;
	detail: string;
	variant?: 'default' | 'success' | 'warning' | 'info';
}) {
	const { c, s, visual } = useThemeTokens();

	const metricColor =
		variant === 'success'
			? c.success
			: variant === 'warning'
				? c.warning
				: variant === 'info'
					? c.info
					: c.primary;

	return (
		<Card
			variant="outlined"
			style={{
				flex: 1,
				minWidth: METRIC_CARD_MIN_WIDTH,
				backgroundColor: visual.surfaces.default,
				borderColor: c.border,
			}}
		>
			<ThemedText variant="metadata" style={{ color: c.onSurfaceVariant }}>
				{label}
			</ThemedText>
			<ThemedText variant="metric" style={{ color: metricColor, marginTop: s.xs }}>
				{value}
			</ThemedText>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginTop: s.xs }}>
				{detail}
			</ThemedText>
		</Card>
	);
}

function PrincipleCard({
	title,
	description,
	variant = 'neutral',
}: {
	title: string;
	description: string;
	variant?: 'neutral' | 'info' | 'warning';
}) {
	const { c, s, visual } = useThemeTokens();

	const accent =
		variant === 'warning' ? c.warning : variant === 'info' ? c.info : c.onSurfaceVariant;

	return (
		<Card
			variant="flat"
			style={{
				flex: 1,
				minWidth: PRINCIPLE_CARD_MIN_WIDTH,
				backgroundColor: visual.surfaces.quiet,
			}}
		>
			<View
				style={{
					width: s.xs,
					height: s.xl,
					borderRadius: s.xs,
					backgroundColor: accent,
					marginBottom: s.sm,
				}}
			/>
			<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
				{title}
			</ThemedText>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginTop: s.xs }}>
				{description}
			</ThemedText>
		</Card>
	);
}

function SurfaceTierCard({
	tierKey,
	label,
	description,
}: {
	tierKey: SurfaceTierKey;
	label: string;
	description: string;
}) {
	const { c, s, r, visual } = useThemeTokens();

	return (
		<Card
			variant="outlined"
			style={{
				flex: 1,
				minWidth: 180,
				backgroundColor: visual.surfaces.default,
				borderColor: c.border,
			}}
		>
			<View
				style={{
					height: s.xl,
					borderRadius: r.md,
					backgroundColor: visual.surfaces[tierKey],
					borderWidth: tierKey === 'inverse' ? 0 : 1,
					borderColor: c.border,
				}}
			/>
			<ThemedText variant="bodyStrong" style={{ color: c.onSurface, marginTop: s.sm }}>
				{label}
			</ThemedText>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginTop: s.xs }}>
				{description}
			</ThemedText>
		</Card>
	);
}

function AlertBannerPreview({
	label,
	title,
	description,
	actionLabel,
}: {
	label: string;
	title: string;
	description: string;
	actionLabel: string;
}) {
	const { theme, c, s, r, visual } = useThemeTokens();

	return (
		<Card
			variant="outlined"
			padding="none"
			style={{
				overflow: 'hidden',
				backgroundColor: visual.surfaces.default,
				borderColor: c.border,
			}}
		>
			<View
				style={{
					paddingHorizontal: s.md,
					paddingVertical: s.sm,
					backgroundColor: visual.surfaces.quiet,
					borderBottomWidth: theme.borderWidth.sm,
					borderBottomColor: c.border,
				}}
			>
				<ThemedText variant="metadata" style={{ color: c.onSurfaceVariant }}>
					{label}
				</ThemedText>
			</View>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'flex-start',
					gap: s.md,
					padding: s.md,
				}}
			>
				<View
					style={{
						width: s.xs,
						height: s['2xl'],
						borderRadius: r.full,
						backgroundColor: c.warning,
						marginTop: s.xxs,
					}}
				/>
				<View style={{ flex: 1 }}>
					<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
						{title}
					</ThemedText>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginTop: s.xxs }}
					>
						{description}
					</ThemedText>
				</View>
				<Button title={actionLabel} variant="outline" size="sm" onPress={() => {}} />
			</View>
		</Card>
	);
}

function PresentationPreviewCardContent({
	label,
	title,
	description,
	metricValue,
	metricLabel,
	metricContext,
	searchPlaceholder,
	filterLabels,
	primaryAction,
	secondaryAction,
}: {
	label: string;
	title: string;
	description: string;
	metricValue: string;
	metricLabel: string;
	metricContext: string;
	searchPlaceholder: string;
	filterLabels: readonly string[];
	primaryAction: string;
	secondaryAction: string;
}) {
	const { theme, c, s, visual } = useThemeTokens();

	return (
		<Card
			variant="outlined"
			style={{
				flex: 1,
				minWidth: 300,
				backgroundColor: visual.surfaces.default,
				borderColor: c.border,
			}}
		>
			<View
				style={{
					backgroundColor: visual.surfaces.hero,
					borderRadius: visual.silhouette.overlay,
					padding: s.md,
					marginBottom: s.md,
				}}
			>
				<Badge label={label} variant="neutral" size="sm" />
				<ThemedText
					variant="screenTitle"
					style={{ color: visual.surfaces.onHero, marginTop: s.xs }}
				>
					{title}
				</ThemedText>
				<ThemedText variant="body" style={{ color: c.onPrimaryContainer, marginTop: s.xs }}>
					{description}
				</ThemedText>
			</View>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: s.md,
				}}
			>
				<View style={{ flex: 1 }}>
					<ThemedText variant="metadata" style={{ color: c.onSurfaceVariant }}>
						{metricLabel}
					</ThemedText>
					<ThemedText variant="metric" style={{ color: c.onSurface, marginTop: s.xxs }}>
						{metricValue}
					</ThemedText>
				</View>
				<Badge
					label={metricContext}
					variant={theme.meta.expression === 'operational' ? 'warning' : 'success'}
				/>
			</View>

			<SearchBar
				value=""
				onChangeText={() => {}}
				placeholder={searchPlaceholder}
				style={{ marginTop: s.md }}
			/>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm, marginTop: s.md }}>
				{filterLabels.map((chipLabel) => (
					<Chip
						key={chipLabel}
						label={chipLabel}
						selected={chipLabel === filterLabels[0]}
					/>
				))}
			</View>

			<View style={{ gap: s.sm, marginTop: s.md }}>
				<ListItem
					title={metricLabel}
					subtitle={metricContext}
					showChevron={false}
					style={{ backgroundColor: visual.surfaces.default }}
				/>
				<ListItem
					title={label}
					subtitle={theme.meta.presetLabel}
					showChevron={false}
					style={{ backgroundColor: visual.surfaces.default }}
				/>
			</View>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm, marginTop: s.md }}>
				<Button title={primaryAction} onPress={() => {}} />
				<Button title={secondaryAction} variant="secondary" onPress={() => {}} />
			</View>
		</Card>
	);
}

function PresentationPreviewCard({
	label,
	mode,
	presetId,
	title,
	description,
	metricValue,
	metricLabel,
	metricContext,
	searchPlaceholder,
	filterLabels,
	primaryAction,
	secondaryAction,
}: {
	label: string;
	mode: ThemeMode;
	presetId: ThemePresetId;
	title: string;
	description: string;
	metricValue: string;
	metricLabel: string;
	metricContext: string;
	searchPlaceholder: string;
	filterLabels: readonly string[];
	primaryAction: string;
	secondaryAction: string;
}) {
	return (
		<ThemeProvider initialMode={mode} initialPresetId={presetId} persist={false}>
			<PresentationPreviewCardContent
				label={label}
				title={title}
				description={description}
				metricValue={metricValue}
				metricLabel={metricLabel}
				metricContext={metricContext}
				searchPlaceholder={searchPlaceholder}
				filterLabels={filterLabels}
				primaryAction={primaryAction}
				secondaryAction={secondaryAction}
			/>
		</ThemeProvider>
	);
}

function StateProofCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	const { c, s, visual } = useThemeTokens();

	return (
		<Card
			variant="outlined"
			style={{
				flex: 1,
				minWidth: PROOF_CARD_MIN_WIDTH,
				backgroundColor: visual.surfaces.default,
				borderColor: c.border,
			}}
		>
			<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
				{title}
			</ThemedText>
			<ThemedText
				variant="caption"
				style={{ color: c.onSurfaceVariant, marginTop: s.xxs, marginBottom: s.md }}
			>
				{description}
			</ThemedText>
			{children}
		</Card>
	);
}

export interface DesignLibraryScreenProps {
	locale?: DesignSystemLocale;
}

export default function DesignLibraryScreen({ locale = 'en' }: DesignLibraryScreenProps) {
	const { theme, c, s, r, visual } = useThemeTokens();
	const { mode, setThemeMode, presetId, setThemePreset, cycleThemePreset, availablePresets } =
		useTheme();
	const [selectedLocale, setSelectedLocale] = useState<DesignSystemLocale | null>(null);
	const activeLocale = selectedLocale ?? locale;
	const copy = useMemo(() => getDesignSystemCopy(activeLocale), [activeLocale]);
	const dialogTriggerRefSm = useRef<React.ElementRef<typeof Button> | null>(null);
	const dialogTriggerRefMd = useRef<React.ElementRef<typeof Button> | null>(null);
	const dialogTriggerRefLg = useRef<React.ElementRef<typeof Button> | null>(null);
	const dialogTriggerRefHard = useRef<React.ElementRef<typeof Button> | null>(null);
	const autocompleteOptions = useMemo(
		() => [...copy.componentGallery.advanced.autocompleteOptions],
		[copy],
	);
	const toggleOptions = useMemo(() => [...copy.componentGallery.advanced.toggleOptions], [copy]);
	const actionMenuItems = useMemo(
		() => [...copy.componentGallery.advanced.actionMenuItems],
		[copy],
	);
	const tabOptions = useMemo(
		() =>
			copy.componentGallery.advanced.tabOptions.map((option) => ({
				...option,
				icon:
					option.value === 'overview' ? (
						<Package size={16} color={c.onSurfaceVariant} />
					) : option.value === 'approvals' ? (
						<Calendar size={16} color={c.onSurfaceVariant} />
					) : (
						<Search size={16} color={c.onSurfaceVariant} />
					),
			})),
		[c.onSurfaceVariant, copy],
	);
	const stepperSteps = useMemo(() => [...copy.componentGallery.advanced.stepperSteps], [copy]);
	const dataDisplayListItems = useMemo(
		() => [...copy.componentGallery.dataDisplay.listItems],
		[copy],
	);
	const dataDisplayListSections = useMemo(
		() => [
			{
				title: copy.componentGallery.dataDisplay.listSections[0],
				data: dataDisplayListItems.slice(0, 2),
			},
			{
				title: copy.componentGallery.dataDisplay.listSections[1],
				data: dataDisplayListItems.slice(2),
			},
		],
		[copy, dataDisplayListItems],
	);
	const dataDisplaySparklineValues = useMemo(
		() => [...(copy.componentGallery.dataDisplay.chartSeries[0]?.values ?? [])],
		[copy],
	);
	const localeDiagnostics = useMemo(
		() => buildDesignSystemLocaleDiagnostics(activeLocale),
		[activeLocale],
	);
	const qualitySignals = useDesignSystemQualitySignals(activeLocale);

	const [catalogQuery, setCatalogQuery] = useState('');
	const [platformFilter, setPlatformFilter] = useState<LibraryPlatformFilter>('common-mobile');
	const [completionFilter, setCompletionFilter] = useState<LibraryCompletionFilter>('all');
	const [componentQuery, setComponentQuery] = useState('');
	const [componentKindFilter, setComponentKindFilter] = useState<ComponentKindFilter>('all');
	const [searchValue, setSearchValue] = useState('');
	const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
	const [filterValue, setFilterValue] = useState('all');
	const [emailSummaryEnabled, setEmailSummaryEnabled] = useState(true);
	const [selectedChannels, setSelectedChannels] = useState<string[]>(['email']);
	const [digestCadence, setDigestCadence] = useState('weekly');
	const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(true);
	const [approvalRuleEnabled, setApprovalRuleEnabled] = useState(false);
	const [pickerVisible, setPickerVisible] = useState(false);
	const [pickerValue, setPickerValue] = useState('foundation');
	const [phoneValue, setPhoneValue] = useState('9876543210');
	const [amountValue, setAmountValue] = useState(AMOUNT_PREVIEW_VALUE);
	const [dateValue, setDateValue] = useState('2026-04-15');
	const [timeValue, setTimeValue] = useState('14:30');
	const [dateRangeValue, setDateRangeValue] = useState({
		start: '2026-04-10',
		end: '2026-04-17',
	});
	const [textareaValue, setTextareaValue] = useState(
		() => getDesignSystemCopy(locale).componentGallery.notesSeed,
	);
	const [approvalEmailValue, setApprovalEmailValue] = useState('approver@');
	const [toastVisible, setToastVisible] = useState(false);
	const [toastQueue, setToastQueue] = useState<ToastStackItem[]>([]);
	const [confirmationVisible, setConfirmationVisible] = useState(false);
	const [confirmationSize, setConfirmationSize] = useState<'sm' | 'md' | 'lg'>('md');
	const [confirmationRestoreTarget, setConfirmationRestoreTarget] = useState<'sm' | 'md' | 'lg'>(
		'md',
	);
	const [hardConfirmationVisible, setHardConfirmationVisible] = useState(false);
	const [noteValue, setNoteValue] = useState(
		() => getDesignSystemCopy(locale).componentGallery.notesSeed,
	);
	const [quickEditValue, setQuickEditValue] = useState(
		() => getDesignSystemCopy(locale).componentGallery.notesSeed,
	);
	const [autocompleteValue, setAutocompleteValue] = useState<string[]>(['finance']);
	const [tokenValues, setTokenValues] = useState<string[]>(['urgent', 'vip']);
	const [uploadItems, setUploadItems] = useState<UploadItem[]>(COMPONENT_FILE_UPLOAD_SEED);
	const [notificationItems, setNotificationItems] = useState<NotificationItem[]>(() => [
		...copy.componentGallery.advanced.notificationItems,
	]);
	const [singleSliderValue, setSingleSliderValue] = useState<SliderValue>(SINGLE_SLIDER_DEFAULT);
	const [rangeSliderValue, setRangeSliderValue] = useState<SliderValue>(RANGE_SLIDER_DEFAULT);
	const [stepperValue, setStepperValue] = useState(3);
	const [otpValue, setOtpValue] = useState('123456');
	const [colorValue, setColorValue] = useState(theme.colors.success);
	const [segmentedValue, setSegmentedValue] = useState('list');
	const [toggleGroupValues, setToggleGroupValues] = useState<string[]>(['list']);
	const [tabValue, setTabValue] = useState('overview');
	const [actionSheetOpen, setActionSheetOpen] = useState(false);
	const [selectedListRows, setSelectedListRows] = useState<string[]>(['list-1']);
	const [activityItems, setActivityItems] = useState<ActivityFeedItem[]>(() => [
		...getDesignSystemCopy(locale).componentGallery.dataDisplay.timelineItems,
	]);
	const [activityPendingItems, setActivityPendingItems] = useState<ActivityFeedItem[]>(() => [
		...getDesignSystemCopy(locale).componentGallery.dataDisplay.timelinePendingItems,
	]);
	const [chartFocusedSeries, setChartFocusedSeries] = useState('series-primary');
	const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
	const [quickEditPopoverOpen, setQuickEditPopoverOpen] = useState(false);
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [kanbanColumns, setKanbanColumns] = useState<KanbanBoardColumn[]>(() =>
		getDesignSystemCopy(locale).componentGallery.dataDisplay.boardColumns.map((column) => ({
			...column,
			items: column.items.map((item) => ({ ...item })),
		})),
	);
	const previewMode: ThemeMode = theme.isDark ? 'dark' : 'light';
	const confirmationRestoreFocusRef =
		confirmationRestoreTarget === 'sm'
			? dialogTriggerRefSm
			: confirmationRestoreTarget === 'lg'
				? dialogTriggerRefLg
				: dialogTriggerRefMd;
	const resolvedBodyFontSize =
		theme.typography.variants.body.fontSize ?? theme.typography.sizes.md;
	const resolvedBodyLineHeight =
		theme.typography.variants.body.lineHeight ?? theme.typography.sizes.lg;

	const handleLocaleChange = useCallback((nextLocale: DesignSystemLocale) => {
		setSelectedLocale(nextLocale);
		const nextCopy = getDesignSystemCopy(nextLocale);
		setNoteValue(nextCopy.componentGallery.notesSeed);
		setTextareaValue(nextCopy.componentGallery.notesSeed);
		setQuickEditValue(nextCopy.componentGallery.notesSeed);
		setNotificationItems([...nextCopy.componentGallery.advanced.notificationItems]);
		setActivityItems([...nextCopy.componentGallery.dataDisplay.timelineItems]);
		setActivityPendingItems([...nextCopy.componentGallery.dataDisplay.timelinePendingItems]);
		setKanbanColumns(
			nextCopy.componentGallery.dataDisplay.boardColumns.map((column) => ({
				...column,
				items: column.items.map((item) => ({ ...item })),
			})),
		);
	}, []);
	const pushToast = useCallback(
		(item: Omit<ToastStackItem, 'id'>) => {
			setToastQueue((currentQueue) => [
				...currentQueue,
				{
					id: `toast-${Date.now()}-${currentQueue.length}`,
					...item,
				},
			]);
		},
		[setToastQueue],
	);

	const filteredItems = useMemo(
		() => filterLibraryItems(catalogQuery, platformFilter, completionFilter),
		[catalogQuery, completionFilter, platformFilter],
	);
	const filteredComponents = useMemo(
		() => filterCatalogComponents(componentQuery, componentKindFilter),
		[componentKindFilter, componentQuery],
	);

	const sectionCount = useMemo(
		() => new Set(filteredItems.map((item) => formatSectionKey(item))).size,
		[filteredItems],
	);
	const filteredCompletedCount = useMemo(
		() => filteredItems.filter((item) => item.completed).length,
		[filteredItems],
	);
	const filteredOpenCount = useMemo(
		() => filteredItems.filter((item) => !item.completed).length,
		[filteredItems],
	);
	const componentGroupCount = useMemo(
		() => new Set(filteredComponents.map((component) => component.kind)).size,
		[filteredComponents],
	);
	const testedComponentCount = useMemo(
		() => filteredComponents.filter((component) => component.hasTests).length,
		[filteredComponents],
	);
	const liveDemoComponentCount = useMemo(
		() => filteredComponents.filter(isLivePreviewComponent).length,
		[filteredComponents],
	);

	const listHeader = (
		<View
			style={{
				paddingHorizontal: s.lg,
				paddingTop: s.lg,
				paddingBottom: s.xl,
				direction: copy.direction,
			}}
		>
			<Card
				style={{
					marginBottom: s.lg,
					backgroundColor: visual.surfaces.hero,
					borderRadius: visual.silhouette.overlay,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: s.md }}>
					<View
						style={{
							width: s['3xl'],
							height: s['3xl'],
							borderRadius: visual.silhouette.overlay,
							backgroundColor: c.primary,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Palette size={24} color={c.onPrimary} />
					</View>
					<View style={{ flex: 1 }}>
						<ThemedText
							variant="screenTitle"
							style={{ color: visual.surfaces.onHero, marginBottom: s.xs }}
						>
							{copy.hero.title}
						</ThemedText>
						<ThemedText variant="body" style={{ color: c.onPrimaryContainer }}>
							{copy.hero.description}
						</ThemedText>
					</View>
				</View>

				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginTop: s.md,
						marginBottom: s.md,
					}}
				>
					<Badge
						label={copy.hero.presetBadge(theme.meta.presetLabel)}
						variant="default"
					/>
					<Badge label={copy.hero.modeBadge(mode)} variant="info" />
					<Badge label={copy.hero.densityBadge(theme.meta.density)} variant="success" />
					<Badge label={copy.meta.localeBadge} variant="neutral" />
					<Badge label={copy.meta.directionBadge} variant="neutral" />
				</View>

				<Button
					title={copy.runtimeTheming.cycleLookAndFeel}
					onPress={cycleThemePreset}
					leftIcon={<LucideIconGlyph icon={Palette} size={16} color={c.onPrimary} />}
				/>
			</Card>

			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					gap: s.md,
					marginBottom: s.lg,
				}}
			>
				<WorkbenchMetricCard
					label={copy.stats.allChecklistItems}
					value={DESIGN_LIBRARY_OVERVIEW.total}
					detail={copy.stats.completed}
				/>
				<WorkbenchMetricCard
					label={copy.stats.completed}
					value={DESIGN_LIBRARY_OVERVIEW.completed}
					detail={copy.stats.open}
					variant="success"
				/>
				<WorkbenchMetricCard
					label={copy.stats.commonMobile}
					value={DESIGN_LIBRARY_OVERVIEW.commonMobile}
					detail={copy.stats.libraryComponents}
					variant="info"
				/>
				<WorkbenchMetricCard
					label={copy.stats.liveDemos}
					value={DESIGN_LIBRARY_COMPONENT_OVERVIEW.livePreviewCount}
					detail={copy.stats.libraryComponents}
					variant="warning"
				/>
			</View>

			<PreviewSection title={copy.qualityBar.title} description={copy.qualityBar.description}>
				<View style={{ gap: s.lg }}>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						{copy.qualityBar.doctrineCards.map((item) => (
							<PrincipleCard
								key={item.title}
								title={item.title}
								description={item.description}
								variant="info"
							/>
						))}
					</View>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						{copy.qualityBar.visualLawCards.map((item) => (
							<PrincipleCard
								key={item.title}
								title={item.title}
								description={item.description}
							/>
						))}
					</View>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						{copy.qualityBar.antiPatternCards.map((item) => (
							<PrincipleCard
								key={item.title}
								title={item.title}
								description={item.description}
								variant="warning"
							/>
						))}
					</View>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.runtimeTheming.title}
				description={copy.runtimeTheming.description}
			>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.runtimeTheming.themePresets}
				</ThemedText>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: s.sm, paddingBottom: s.sm }}
				>
					{availablePresets.map((preset) => (
						<Chip
							key={preset.presetId}
							label={preset.presetLabel}
							selected={presetId === preset.presetId}
							onPress={() => setThemePreset(preset.presetId)}
						/>
					))}
				</ScrollView>

				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.runtimeTheming.appearanceMode}
				</ThemedText>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginBottom: s.md,
					}}
				>
					{copy.runtimeTheming.themeModeChips.map((chip) => (
						<ThemeModeChip
							key={chip.value}
							label={chip.label}
							selected={mode === chip.value}
							onPress={() => setThemeMode(chip.value)}
						/>
					))}
				</View>

				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.runtimeTheming.currentProfile}
				</ThemedText>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginBottom: s.md,
					}}
				>
					<Badge
						label={copy.runtimeTheming.currentDensity(theme.meta.density)}
						variant="neutral"
					/>
					<Badge
						label={copy.runtimeTheming.currentExpression(theme.meta.expression)}
						variant="info"
					/>
					<Badge
						label={copy.runtimeTheming.currentAccentBudget(theme.meta.accentBudget)}
						variant="warning"
					/>
					<Badge
						label={copy.runtimeTheming.currentSurfaceBias(
							theme.visual.presentation.defaultSurfaceBias,
						)}
						variant="default"
					/>
					<Badge
						label={copy.runtimeTheming.currentBrandZones(
							theme.visual.presentation.brandExpressionZones,
						)}
						variant="warning"
					/>
					<Badge
						label={copy.runtimeTheming.currentInverseActionSurfaces(
							theme.visual.presentation.inverseActionSurfaces,
						)}
						variant="info"
					/>
					<Badge
						label={copy.runtimeTheming.currentTouchTarget(theme.touchTarget)}
						variant="info"
					/>
					<Badge
						label={copy.runtimeTheming.currentSpacing(theme.spacing.lg)}
						variant="default"
					/>
					<Badge
						label={copy.runtimeTheming.currentRadius(theme.borderRadius.md)}
						variant="success"
					/>
					<Badge
						label={copy.runtimeTheming.currentBody(
							resolvedBodyFontSize,
							resolvedBodyLineHeight,
						)}
						variant="warning"
					/>
				</View>

				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginTop: s.md, marginBottom: s.sm }}
				>
					{copy.runtimeTheming.nestedSubtreePreviews}
				</ThemedText>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
					<PresentationPreviewCard
						label={copy.runtimeTheming.operationalSurface}
						mode={previewMode}
						presetId="executive"
						title={copy.presentationModes.operational.title}
						description={copy.presentationModes.operational.description}
						metricValue={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricValue}
						metricLabel={copy.presentationModes.operational.metricLabel}
						metricContext={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricContext}
						searchPlaceholder={copy.presentationModes.operational.searchPlaceholder}
						filterLabels={copy.presentationModes.operational.filterLabels}
						primaryAction={copy.presentationModes.operational.primaryAction}
						secondaryAction={copy.presentationModes.operational.secondaryAction}
					/>
					<PresentationPreviewCard
						label={copy.runtimeTheming.showcaseSurface}
						mode={previewMode}
						presetId="studio"
						title={copy.presentationModes.relaxed.title}
						description={copy.presentationModes.relaxed.description}
						metricValue={DESIGN_SYSTEM_RELAXED_FIXTURE.metricValue}
						metricLabel={copy.presentationModes.relaxed.metricLabel}
						metricContext={DESIGN_SYSTEM_RELAXED_FIXTURE.metricContext}
						searchPlaceholder={copy.presentationModes.relaxed.searchPlaceholder}
						filterLabels={copy.presentationModes.relaxed.filterLabels}
						primaryAction={copy.presentationModes.relaxed.primaryAction}
						secondaryAction={copy.presentationModes.relaxed.secondaryAction}
					/>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.presentationModes.title}
				description={copy.presentationModes.description}
			>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginBottom: s.md,
					}}
				>
					<Badge
						label={copy.presentationModes.accentBudget(theme.meta.accentBudget)}
						variant="warning"
					/>
					<Badge
						label={copy.presentationModes.defaultSurfaceBias(
							theme.visual.presentation.defaultSurfaceBias,
						)}
						variant="neutral"
					/>
					<Badge label={copy.presentationModes.inverseAction} variant="info" />
				</View>

				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.presentationModes.surfaceTiersTitle}
				</ThemedText>
				<ThemedText
					variant="caption"
					style={{ color: c.onSurfaceVariant, marginBottom: s.md }}
				>
					{copy.presentationModes.surfaceTiersDescription}
				</ThemedText>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
					{SURFACE_TIER_ORDER.map((tierKey) => (
						<SurfaceTierCard
							key={tierKey}
							tierKey={tierKey}
							label={copy.presentationModes.tierLabels[tierKey]}
							description={copy.presentationModes.tierDescriptions[tierKey]}
						/>
					))}
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.localization.title}
				description={copy.localization.description}
			>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.localization.localeSelector}
				</ThemedText>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: s.sm, paddingBottom: s.sm }}
				>
					{copy.localization.localeOptions.map((option) => (
						<Chip
							key={option.value}
							label={option.label}
							selected={activeLocale === option.value}
							onPress={() => handleLocaleChange(option.value)}
							testID={`design-system-locale-${option.value}`}
						/>
					))}
				</ScrollView>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.localization.runtimeSignals}
				</ThemedText>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginBottom: s.md,
					}}
				>
					<Badge
						label={copy.localization.detectedLocale(qualitySignals.detectedLocale)}
						variant="default"
					/>
					<Badge
						label={copy.localization.intlLocale(localeDiagnostics.intlLocale)}
						variant="info"
					/>
					<Badge
						label={copy.localization.pixelRatio(qualitySignals.pixelRatio)}
						variant="success"
					/>
					<Badge
						label={copy.localization.fontScale(qualitySignals.fontScale)}
						variant="success"
					/>
					<Badge
						label={copy.localization.reduceMotion(qualitySignals.reduceMotionEnabled)}
						variant="warning"
					/>
					<Badge
						label={copy.localization.boldText(qualitySignals.boldTextEnabled)}
						variant="neutral"
					/>
					<Badge
						label={copy.localization.runtimeRtl(qualitySignals.runtimeRtl)}
						variant={qualitySignals.runtimeRtl ? 'success' : 'neutral'}
					/>
				</View>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginBottom: s.sm }}
				>
					{copy.localization.formatExamples}
				</ThemedText>
				<View style={{ gap: s.xs }}>
					<ListItem
						title={copy.localization.sampleLabels.number}
						subtitle={localeDiagnostics.number}
						showChevron={false}
					/>
					<ListItem
						title={copy.localization.sampleLabels.currency}
						subtitle={localeDiagnostics.currency}
						showChevron={false}
					/>
					<ListItem
						title={copy.localization.sampleLabels.dateTime}
						subtitle={localeDiagnostics.date}
						showChevron={false}
					/>
					<ListItem
						title={copy.localization.sampleLabels.relativeTime}
						subtitle={localeDiagnostics.relativeTime}
						showChevron={false}
					/>
					<ListItem
						title={copy.localization.sampleLabels.list}
						subtitle={localeDiagnostics.list}
						showChevron={false}
					/>
					<ListItem
						title={copy.localization.sampleLabels.plural}
						subtitle={localeDiagnostics.plural}
						showChevron={false}
					/>
					<ListItem
						title={copy.localization.sampleLabels.sorted}
						subtitle={localeDiagnostics.sorted}
						showChevron={false}
					/>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.componentGallery.title}
				description={copy.componentGallery.description}
			>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginBottom: s.md,
					}}
				>
					<Badge label={copy.componentGallery.categoryBadges.inputs} variant="info" />
					<Badge label={copy.componentGallery.categoryBadges.actions} variant="success" />
					<Badge
						label={copy.componentGallery.categoryBadges.feedback}
						variant="warning"
					/>
					<Badge
						label={copy.componentGallery.categoryBadges.dataDisplay}
						variant="default"
					/>
				</View>

				<View style={{ gap: s.lg }}>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Button
							title={copy.componentGallery.buttons.primary}
							onPress={() => setToastVisible(true)}
						/>
						<Button
							title={copy.componentGallery.buttons.secondary}
							variant="secondary"
							onPress={() => setToastVisible(true)}
						/>
						<Button
							title={copy.componentGallery.buttons.outline}
							variant="outline"
							onPress={() => setToastVisible(true)}
						/>
						<Button
							title={copy.componentGallery.buttons.danger}
							variant="danger"
							onPress={() => setToastVisible(true)}
						/>
					</View>

					<Card
						variant="outlined"
						style={{
							backgroundColor: theme.visual.surfaces.hero,
							borderColor: c.border,
						}}
					>
						<ThemedText
							variant="metadata"
							style={{ color: theme.visual.surfaces.onHero }}
						>
							{copy.componentGallery.buttons.inverseHint}
						</ThemedText>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: s.sm,
								marginTop: s.sm,
							}}
						>
							<Button
								title={copy.componentGallery.buttons.inverse}
								variant="inverse"
								onPress={() => setToastVisible(true)}
							/>
							<Button
								title={copy.componentGallery.buttons.secondary}
								variant="outline"
								onPress={() => setToastVisible(true)}
							/>
						</View>
					</Card>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.lg }}>
						<IconButton
							icon={<LucideIconGlyph icon={Search} size={20} color={c.primary} />}
							label={copy.componentGallery.iconButtons.search}
							onPress={() => setToastVisible(true)}
						/>
						<IconButton
							icon={
								<MaterialIconGlyph
									name="calendar-month"
									size={20}
									color={c.primary}
								/>
							}
							label={copy.componentGallery.iconButtons.calendar}
							onPress={() => setToastVisible(true)}
						/>
						<IconButton
							icon={
								mode === 'dark' ? (
									<LucideIconGlyph icon={Sun} size={20} color={c.primary} />
								) : (
									<LucideIconGlyph icon={Moon} size={20} color={c.primary} />
								)
							}
							label={copy.componentGallery.iconButtons.mode}
							onPress={() => setThemeMode(mode === 'dark' ? 'light' : 'dark')}
						/>
					</View>

					<TextInput
						label={copy.componentGallery.fields.textField}
						value={noteValue}
						onChangeText={setNoteValue}
						helperText={copy.componentGallery.fields.textFieldHelper}
					/>

					<TextInput
						label={copy.componentGallery.fields.counterField}
						value={noteValue}
						onChangeText={setNoteValue}
						helperText={copy.componentGallery.fields.counterFieldHelper}
						clearable
						showCharacterCount
						maxLength={80}
					/>

					<TextInput
						label={copy.componentGallery.fields.errorField}
						value={approvalEmailValue}
						onChangeText={setApprovalEmailValue}
						error={copy.componentGallery.fields.errorFieldError}
						keyboardType="email-address"
						autoCapitalize="none"
					/>

					<TextInput
						label={copy.componentGallery.fields.asyncField}
						defaultValue="team-ops"
						helperText={copy.componentGallery.fields.asyncFieldHelper}
						loading
					/>

					<TextInput
						label={copy.componentGallery.fields.disabledField}
						value="Managed by library policy"
						editable={false}
					/>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<TextInput
								label={copy.componentGallery.fields.emailField}
								defaultValue="owner@example.com"
								keyboardType="email-address"
								returnKeyType="next"
								autoComplete="email"
								textContentType="emailAddress"
								autoCapitalize="none"
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<TextInput
								label={copy.componentGallery.fields.numericField}
								defaultValue="42"
								keyboardType="numeric"
								returnKeyType="next"
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<TextInput
								label={copy.componentGallery.fields.phoneKeyboardField}
								defaultValue="9876543210"
								keyboardType="phone-pad"
								returnKeyType="next"
								autoComplete="tel"
								textContentType="telephoneNumber"
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<TextInput
								label={copy.componentGallery.fields.urlField}
								defaultValue="https://example.com"
								keyboardType="url"
								returnKeyType="go"
								autoCapitalize="none"
								autoCorrect={false}
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<TextInput
								label={copy.componentGallery.fields.decimalField}
								defaultValue="1250.50"
								keyboardType="decimal-pad"
								returnKeyType="done"
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<TextInput
								label={copy.componentGallery.fields.passwordField}
								defaultValue="hunter2"
								helperText={copy.componentGallery.fields.passwordFieldHelper}
								secureTextEntry
								autoComplete="password"
								textContentType="password"
								returnKeyType="send"
							/>
						</View>
					</View>

					<TextAreaField
						label={copy.componentGallery.fields.textarea}
						value={textareaValue}
						onChange={setTextareaValue}
						placeholder={copy.componentGallery.notesSeed}
						maxLength={280}
					/>

					<SearchBar
						value={searchValue}
						onChangeText={setSearchValue}
						onDebouncedChange={setDebouncedSearchValue}
						debounceMs={350}
						loading={searchValue !== debouncedSearchValue}
						placeholder={copy.componentGallery.fields.searchPlaceholder}
					/>
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						{copy.componentGallery.fields.searchDebouncedLabel}:{' '}
						{debouncedSearchValue || copy.componentGallery.fields.searchDebouncedIdle}
					</ThemedText>

					<FilterBar
						filters={[...copy.componentGallery.filterOptions]}
						activeValue={filterValue}
						defaultValue="all"
						onSelect={setFilterValue}
						onClear={() => setFilterValue('all')}
					/>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<Checkbox
								label={copy.componentGallery.selectionControls.checkbox}
								description={
									copy.componentGallery.selectionControls.checkboxDescription
								}
								checked={emailSummaryEnabled}
								onCheckedChange={setEmailSummaryEnabled}
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<Checkbox
								label={
									copy.componentGallery.selectionControls.checkboxIndeterminate
								}
								description={
									copy.componentGallery.selectionControls
										.checkboxIndeterminateDescription
								}
								indeterminate
								defaultChecked={false}
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<Checkbox
								label={copy.componentGallery.selectionControls.checkboxDisabled}
								disabled
								defaultChecked
							/>
						</View>
					</View>

					<CheckboxGroup
						label={copy.componentGallery.selectionControls.checkboxGroup}
						description={
							copy.componentGallery.selectionControls.checkboxGroupDescription
						}
						values={selectedChannels}
						onValuesChange={setSelectedChannels}
						options={[...copy.componentGallery.selectionControls.checkboxOptions]}
					/>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<Radio
								label={copy.componentGallery.selectionControls.radio}
								defaultSelected
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<Radio
								label={copy.componentGallery.selectionControls.radioDisabled}
								disabled
							/>
						</View>
					</View>

					<RadioGroup
						label={copy.componentGallery.selectionControls.radioGroup}
						description={copy.componentGallery.selectionControls.radioGroupDescription}
						value={digestCadence}
						onValueChange={setDigestCadence}
						options={[
							...copy.componentGallery.selectionControls.radioOptions.slice(0, 2),
							{
								label: copy.componentGallery.selectionControls.radioDisabled,
								value: 'monthly',
								disabled: true,
							},
						]}
					/>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<ToggleSwitch
								accessibilityLabel={
									copy.componentGallery.selectionControls.toggleBareLabel
								}
								value={approvalRuleEnabled}
								onValueChange={setApprovalRuleEnabled}
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<ToggleSwitch
								label={copy.componentGallery.selectionControls.toggle}
								description={
									copy.componentGallery.selectionControls.toggleDescription
								}
								value={autoRemindersEnabled}
								onValueChange={setAutoRemindersEnabled}
							/>
						</View>
						<View style={{ minWidth: COMPONENT_CARD_MIN_WIDTH, flex: 1 }}>
							<ToggleSwitch
								label={copy.componentGallery.selectionControls.toggleDisabled}
								description={
									copy.componentGallery.selectionControls
										.toggleDisabledDescription
								}
								disabled
								defaultValue={true}
							/>
						</View>
					</View>

					<PhoneInput
						label={copy.componentGallery.fields.phoneInput}
						value={phoneValue}
						onChange={setPhoneValue}
					/>

					<AmountInput
						label={copy.componentGallery.fields.amountInput}
						value={amountValue}
						onChange={setAmountValue}
					/>

					<DatePickerField
						label={copy.componentGallery.fields.datePicker}
						value={dateValue}
						onChange={setDateValue}
						showShortcuts
					/>

					<DatePickerField
						label={copy.componentGallery.fields.datePicker}
						value={dateValue}
						onChange={setDateValue}
						presentation="sheet"
						locale="en-US"
						disabledDates={['2026-04-18']}
					/>

					<TimePickerField
						label={copy.componentGallery.advanced.timePicker}
						value={timeValue}
						onChange={setTimeValue}
					/>

					<DateRangePickerField
						label={copy.componentGallery.advanced.dateRangePicker}
						value={dateRangeValue}
						onChange={setDateRangeValue}
					/>

					<AutocompleteField
						label={copy.componentGallery.advanced.autocomplete}
						options={autocompleteOptions}
						value={autocompleteValue}
						multiple
						allowCreate
						onAsyncSearch={async (query) => {
							if (!query.trim()) {
								return autocompleteOptions;
							}

							return autocompleteOptions.filter((option) =>
								option.label.toLowerCase().includes(query.trim().toLowerCase()),
							);
						}}
						onChange={(nextValue) => setAutocompleteValue(nextValue as string[])}
					/>

					<TokenInput
						label={copy.componentGallery.advanced.tokenInput}
						values={tokenValues}
						onChange={setTokenValues}
					/>

					<FileUploadField
						label={copy.componentGallery.advanced.fileUpload}
						files={uploadItems}
						onChange={setUploadItems}
					/>

					<RangeSlider
						label={copy.componentGallery.advanced.rangeSlider}
						value={singleSliderValue}
						onChange={setSingleSliderValue}
						testID="component-gallery-single-slider"
					/>

					<RangeSlider
						label={copy.componentGallery.advanced.rangeSlider}
						range
						value={rangeSliderValue}
						onChange={setRangeSliderValue}
						testID="component-gallery-range-slider"
					/>

					<NumericStepper
						label={copy.componentGallery.advanced.numericStepper}
						value={stepperValue}
						onChange={setStepperValue}
						min={1}
						max={10}
					/>

					<OtpCodeInput
						label={copy.componentGallery.advanced.otp}
						value={otpValue}
						onChange={setOtpValue}
						masked
					/>

					<ColorPicker
						label={copy.componentGallery.advanced.colorPicker}
						value={colorValue}
						onChange={setColorValue}
					/>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Button
							title={copy.componentGallery.buttons.primary}
							size="xs"
							onPress={() => setToastVisible(true)}
						/>
						<Button
							accessibilityLabel={copy.componentGallery.iconButtons.search}
							iconOnly
							leftIcon={
								<LucideIconGlyph icon={Search} size={16} color={c.onPrimary} />
							}
							onPress={() => setToastVisible(true)}
							hapticFeedback="selection"
						/>
						<Button
							title={copy.componentGallery.buttons.primary}
							fullWidth
							onPress={() => setToastVisible(true)}
						/>
					</View>

					<View style={{ minHeight: theme.components.fab.size + s.xl }}>
						<FAB
							accessibilityLabel={copy.componentGallery.advanced.fabLabel}
							onPress={() => setToastVisible(true)}
							hapticFeedback="success"
						/>
					</View>

					<SplitButton
						label={copy.componentGallery.advanced.splitButton}
						onPress={() => setToastVisible(true)}
						secondaryActions={actionMenuItems}
						onSecondaryAction={(value) => {
							pushToast({ message: `Queued ${value}`, variant: 'info' });
						}}
					/>

					<ToggleButtonGroup
						label={copy.componentGallery.advanced.toggleGroup}
						options={toggleOptions}
						value={toggleGroupValues}
						multiple
						onChange={(nextValue) => setToggleGroupValues(nextValue as string[])}
					/>

					<SegmentedControl
						label={copy.componentGallery.advanced.segmentedControl}
						options={toggleOptions}
						value={segmentedValue}
						onChange={setSegmentedValue}
					/>

					<Button
						title={copy.componentGallery.advanced.actionSheet}
						variant="secondary"
						onPress={() => setActionSheetOpen(true)}
						hapticFeedback="selection"
					/>

					<ActionMenuSheet
						title={copy.componentGallery.advanced.actionSheet}
						open={actionSheetOpen}
						onOpenChange={setActionSheetOpen}
						actions={actionMenuItems}
						onSelect={(value) =>
							pushToast({ message: `Ran ${value}`, variant: 'success' })
						}
					/>

					<View style={{ gap: s.sm }}>
						<AlertBanner
							title={copy.componentGallery.feedbackBanner.title}
							description={copy.componentGallery.feedbackBanner.description}
							actionLabel={copy.componentGallery.feedbackBanner.actionLabel}
							onAction={() => setToastVisible(true)}
							variant="info"
						/>
						<AlertBanner
							title={copy.componentGallery.feedbackBanner.title}
							description={copy.componentGallery.feedbackBanner.description}
							actionLabel={copy.componentGallery.feedbackBanner.actionLabel}
							onAction={() => setToastVisible(true)}
							variant="success"
						/>
						<AlertBanner
							title={copy.componentGallery.feedbackBanner.title}
							description={copy.componentGallery.feedbackBanner.description}
							actionLabel={copy.componentGallery.feedbackBanner.actionLabel}
							onAction={() => setToastVisible(true)}
							dismissible
							onDismiss={() => setToastVisible(false)}
							variant="warning"
						/>
						<AlertBanner
							title={copy.componentGallery.feedbackBanner.title}
							description={copy.componentGallery.feedbackBanner.description}
							actionLabel={copy.componentGallery.feedbackBanner.actionLabel}
							onAction={() => setToastVisible(true)}
							dismissible
							onDismiss={() => setToastVisible(false)}
							persistent
							variant="error"
						/>
					</View>

					<View style={{ gap: s.md }}>
						<ProgressIndicator
							variant="linear"
							value={64}
							label={copy.componentGallery.advanced.progressUpload}
						/>
						<ProgressIndicator
							variant="linear"
							indeterminate
							label={copy.componentGallery.advanced.progressRefresh}
						/>
						<ProgressIndicator
							variant="circular"
							value={82}
							label={copy.componentGallery.advanced.progressCoverage}
						/>
						<ProgressIndicator
							variant="circular"
							indeterminate
							label={copy.componentGallery.advanced.progressExport}
						/>
					</View>

					<ErrorState
						variant="server"
						actionLabel={copy.componentGallery.advanced.errorRetry}
						onAction={() => setToastVisible(true)}
					/>

					<NotificationCenter items={notificationItems} onChange={setNotificationItems} />

					<Tabs options={tabOptions} value={tabValue} onChange={setTabValue} />

					<View style={{ gap: s.sm }}>
						<Stepper
							steps={stepperSteps}
							onStepPress={(value) =>
								pushToast({
									message: `${copy.componentGallery.advanced.stepperReturnPrefix}${value}`,
									variant: 'info',
								})
							}
						/>
						<Stepper orientation="vertical" steps={stepperSteps} />
					</View>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm }}>
						<Button
							title={copy.componentGallery.advanced.toastQueueSuccess}
							variant="secondary"
							onPress={() =>
								pushToast({
									message: copy.componentGallery.advanced.toastSuccessMessage,
									variant: 'success',
								})
							}
						/>
						<Button
							title={copy.componentGallery.advanced.toastQueueWarning}
							variant="outline"
							onPress={() =>
								pushToast({
									message: copy.componentGallery.advanced.toastWarningMessage,
									variant: 'warning',
									actionLabel: copy.componentGallery.advanced.toastWarningAction,
									onAction: () => setToastVisible(true),
								})
							}
						/>
						<Button
							title={copy.componentGallery.advanced.toastQueueError}
							variant="danger"
							onPress={() =>
								pushToast({
									message: copy.componentGallery.advanced.toastErrorMessage,
									variant: 'error',
									dismissLabel: copy.componentGallery.advanced.toastDismiss,
								})
							}
						/>
					</View>

					<StatCard
						label={copy.stateProof.uglyData.metricLabel}
						value={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricValue}
						icon={Palette}
						color={c.primary}
						trend="+4"
						trendLabel={copy.stats.completed}
					/>

					<CollapsibleSection
						title={copy.componentGallery.accordion.title}
						subtitle={copy.componentGallery.accordion.subtitle}
						collapsedLabel={copy.componentGallery.accordion.collapsedLabel}
						expandedLabel={copy.componentGallery.accordion.expandedLabel}
						testID="component-gallery-collapsible"
						contentTestID="component-gallery-collapsible-content"
					>
						<View style={{ gap: s.xs }}>
							<ThemedText variant="body">
								{copy.componentGallery.accordion.body}
							</ThemedText>
							<Badge
								label={copy.componentGallery.accordion.badge}
								variant="info"
								size="sm"
							/>
						</View>
					</CollapsibleSection>

					<Button
						title={copy.componentGallery.buttons.openPicker}
						variant="secondary"
						onPress={() => setPickerVisible(true)}
						leftIcon={
							<LucideIconGlyph icon={Package} size={16} color={c.onSurfaceVariant} />
						}
					/>

					<Button
						title={copy.componentGallery.buttons.openDialog}
						variant="outline"
						onPress={() => setConfirmationVisible(true)}
					/>

					<AlertBannerPreview
						label={copy.componentGallery.feedbackBanner.label}
						title={copy.componentGallery.feedbackBanner.title}
						description={copy.componentGallery.feedbackBanner.description}
						actionLabel={copy.componentGallery.feedbackBanner.actionLabel}
					/>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.componentGallery.dataDisplay.sectionTitle}
				description={copy.componentGallery.dataDisplay.sectionDescription}
			>
				<View style={{ gap: s.lg }}>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Card
							header={
								<CardHeader>
									{copy.componentGallery.dataDisplay.cardHeader}
								</CardHeader>
							}
							footer={
								<CardFooter>
									<View
										style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											gap: s.sm,
										}}
									>
										<Button
											title={
												copy.componentGallery.dataDisplay.cardFooterPrimary
											}
											size="sm"
											onPress={() => setToastVisible(true)}
										/>
										<Button
											title={
												copy.componentGallery.dataDisplay
													.cardFooterSecondary
											}
											variant="secondary"
											size="sm"
											onPress={() => setToastVisible(true)}
										/>
									</View>
								</CardFooter>
							}
							style={{ flex: 1, minWidth: DATA_DISPLAY_CARD_MIN_WIDTH }}
						>
							<CardBody>
								<ThemedText variant="body" style={{ color: c.onSurfaceVariant }}>
									{copy.componentGallery.dataDisplay.listDescription}
								</ThemedText>
							</CardBody>
						</Card>

						<Card
							orientation="horizontal"
							variant="outlined"
							header={
								<CardHeader>
									{copy.componentGallery.dataDisplay.cardHorizontalTitle}
								</CardHeader>
							}
							media={
								<Avatar
									name={
										copy.componentGallery.dataDisplay.avatarItems[0]?.name ?? ''
									}
									source={
										copy.componentGallery.dataDisplay.mediaItems[0]
											?.thumbnailUri
									}
									size="xl"
									status="online"
								/>
							}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<CardBody>
								<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
									{copy.componentGallery.dataDisplay.cardHorizontalDescription}
								</ThemedText>
							</CardBody>
						</Card>

						<Card
							featured
							header={
								<CardHeader>
									{copy.componentGallery.dataDisplay.cardHeroTitle}
								</CardHeader>
							}
							footer={
								<CardFooter>
									<Badge
										label={copy.componentGallery.dataDisplay.statUpdatedAt}
										variant="info"
									/>
								</CardFooter>
							}
							style={{ flex: 1, minWidth: DATA_DISPLAY_CARD_MIN_WIDTH }}
						>
							<CardBody>
								<ThemedText
									variant="body"
									style={{ color: theme.visual.hero.promo.onSurface }}
								>
									{copy.componentGallery.dataDisplay.cardHeroDescription}
								</ThemedText>
							</CardBody>
						</Card>
					</View>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<StatCard
							label={copy.stateProof.uglyData.metricLabel}
							value={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricValue}
							trend="+4.8%"
							trendLabel={copy.stats.completed}
							comparisonBaseline={
								copy.componentGallery.dataDisplay.statComparisonBaseline
							}
							updatedAtLabel={copy.componentGallery.dataDisplay.statUpdatedAt}
							sparklineValues={dataDisplaySparklineValues}
							style={{ flex: 1, minWidth: DATA_DISPLAY_STAT_CARD_MIN_WIDTH }}
						/>
						<StatCard
							label={copy.patternSamples.previewReadyComponents}
							value={DESIGN_LIBRARY_COMPONENT_OVERVIEW.total}
							isLoading
							style={{ flex: 1, minWidth: DATA_DISPLAY_STAT_CARD_MIN_WIDTH }}
						/>
						<StatCard
							label={copy.patternSamples.accessibilityCoverage}
							value={`${Math.round(
								(DESIGN_LIBRARY_OVERVIEW.completed /
									DESIGN_LIBRARY_OVERVIEW.total) *
									100,
							)}%`}
							trend="+2"
							trendLabel={copy.stats.completed}
							errorMessage={copy.componentGallery.dataDisplay.statErrorMessage}
							density="compact"
							style={{ flex: 1, minWidth: DATA_DISPLAY_STAT_CARD_MIN_WIDTH }}
						/>
					</View>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_AVATAR_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.dataDisplay.avatarsTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.dataDisplay.avatarsDescription}
							</ThemedText>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
								{copy.componentGallery.dataDisplay.avatarItems
									.slice(0, 2)
									.map((item, index) => (
										<Avatar
											key={item.id}
											name={item.name}
											source={
												copy.componentGallery.dataDisplay.mediaItems[index]
													?.thumbnailUri
											}
											size={index === 0 ? 'lg' : 'md'}
											status={item.status}
										/>
									))}
								<AvatarGroup
									items={copy.componentGallery.dataDisplay.avatarItems.map(
										(item, index) => ({
											...item,
											source:
												index <
												copy.componentGallery.dataDisplay.mediaItems.length
													? copy.componentGallery.dataDisplay.mediaItems[
															index
														]?.thumbnailUri
													: undefined,
										}),
									)}
									maxVisible={3}
								/>
							</View>
						</Card>

						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.dataDisplay.keyValueTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.dataDisplay.keyValueDescription}
							</ThemedText>
							<DescriptionList
								items={[...copy.componentGallery.dataDisplay.keyValueItems]}
								layout="horizontal"
								density="compact"
							/>
						</Card>
					</View>

					<Card variant="outlined">
						<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
							{copy.componentGallery.dataDisplay.listTitle}
						</ThemedText>
						<ThemedText
							variant="caption"
							style={{
								color: c.onSurfaceVariant,
								marginTop: s.xxs,
								marginBottom: s.md,
							}}
						>
							{copy.componentGallery.dataDisplay.listDescription}
						</ThemedText>
						<VirtualizedList
							sections={dataDisplayListSections}
							keyExtractor={(item) => item.id}
							selectedKeys={selectedListRows}
							onSelectedKeysChange={setSelectedListRows}
							itemHeight={72}
							renderSectionHeader={(section) => (
								<Badge label={section.title} variant="default" size="sm" />
							)}
							onLoadMore={() =>
								pushToast({
									message: copy.componentGallery.dataDisplay.timelineLoadMore,
									variant: 'info',
								})
							}
							onRefresh={() =>
								pushToast({
									message: copy.componentGallery.dataDisplay.listTitle,
									variant: 'success',
								})
							}
							renderItem={({ item, selected, toggleSelected }) => (
								<ListItem
									title={item.title}
									subtitle={item.subtitle}
									density="compact"
									showChevron={false}
									onPress={toggleSelected}
									leftIcon={
										<Checkbox
											label={
												copy.componentGallery.dataDisplay.listSelectionLabel
											}
											checked={selected}
											onCheckedChange={() => toggleSelected()}
											accessibilityLabel={item.title}
											style={{
												width: theme.components.selectionControl.size,
												overflow: 'hidden',
											}}
										/>
									}
									rightElement={
										<Badge
											label={item.status}
											variant={item.id === 'list-1' ? 'warning' : 'success'}
											size="sm"
										/>
									}
									style={{
										backgroundColor: selected
											? theme.colors.surfaceVariant
											: theme.colors.card,
									}}
								/>
							)}
							emptyTitle={copy.componentGallery.dataDisplay.listEmptyTitle}
							emptyDescription={
								copy.componentGallery.dataDisplay.listEmptyDescription
							}
						/>
					</Card>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.dataDisplay.timelineTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.dataDisplay.timelineDescription}
							</ThemedText>
							<ActivityFeed
								items={activityItems}
								pendingItems={activityPendingItems}
								onItemsChange={(nextItems) => {
									setActivityItems(nextItems);
									setActivityPendingItems([]);
								}}
								onLoadMore={() =>
									pushToast({
										message: copy.componentGallery.dataDisplay.timelineLoadMore,
										variant: 'info',
									})
								}
								loadMoreLabel={copy.componentGallery.dataDisplay.timelineLoadMore}
								newItemsLabel={copy.componentGallery.dataDisplay.timelineNewItems}
							/>
						</Card>

						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.dataDisplay.swipeTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.dataDisplay.swipeDescription}
							</ThemedText>
							<SwipeableRow
								onArchive={() => setToastVisible(true)}
								onDelete={() => setToastVisible(true)}
								onEdit={() => setToastVisible(true)}
							>
								<ListItem
									title={
										copy.componentGallery.dataDisplay.listItems[0]?.title ?? ''
									}
									subtitle={
										copy.componentGallery.dataDisplay.listItems[0]?.subtitle ??
										''
									}
									showChevron={false}
									style={{ backgroundColor: theme.colors.card }}
									rightElement={
										<Badge
											label={
												copy.componentGallery.dataDisplay.listItems[0]
													?.status ?? ''
											}
											size="sm"
										/>
									}
								/>
							</SwipeableRow>
						</Card>
					</View>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="line"
							categories={[...copy.componentGallery.dataDisplay.chartCategories]}
							series={copy.componentGallery.dataDisplay.chartSeries.map((series) => ({
								...series,
								values: [...series.values],
							}))}
							annotations={[...copy.componentGallery.dataDisplay.chartAnnotations]}
							focusedSeriesId={chartFocusedSeries}
							onFocusedSeriesChange={setChartFocusedSeries}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
							testID="data-chart-line"
						/>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="bar"
							categories={[...copy.componentGallery.dataDisplay.chartCategories]}
							series={copy.componentGallery.dataDisplay.chartSeries.map((series) => ({
								...series,
								values: [...series.values],
							}))}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
							testID="data-chart-bar"
						/>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="pie"
							slices={[...copy.componentGallery.dataDisplay.chartSlices]}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
							testID="data-chart-pie"
						/>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="donut"
							slices={[...copy.componentGallery.dataDisplay.chartSlices]}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
							testID="data-chart-donut"
						/>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="scatter"
							points={[...copy.componentGallery.dataDisplay.chartPoints]}
							series={copy.componentGallery.dataDisplay.chartSeries.map((series) => ({
								...series,
								values: [...series.values],
							}))}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
							testID="data-chart-scatter"
						/>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="heatmap"
							heatmap={[...copy.componentGallery.dataDisplay.chartHeatmap]}
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
							testID="data-chart-heatmap"
						/>
						<DataChart
							title={copy.componentGallery.dataDisplay.chartsTitle}
							description={copy.componentGallery.dataDisplay.chartsDescription}
							variant="sparkline"
							series={[
								{
									id:
										copy.componentGallery.dataDisplay.chartSeries[0]?.id ??
										'series',
									label:
										copy.componentGallery.dataDisplay.chartSeries[0]?.label ??
										'',
									values: [
										...(copy.componentGallery.dataDisplay.chartSeries[0]
											?.values ?? []),
									],
								},
							]}
							style={{ flex: 1, minWidth: DATA_DISPLAY_STAT_CARD_MIN_WIDTH }}
							testID="data-chart-sparkline"
						/>
					</View>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.dataDisplay.mediaTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.dataDisplay.mediaDescription}
							</ThemedText>
							<View style={{ gap: s.sm }}>
								<Button
									title={copy.componentGallery.dataDisplay.mediaOpen}
									onPress={() => setMediaViewerOpen(true)}
								/>
								<MediaViewer
									items={[...copy.componentGallery.dataDisplay.mediaItems]}
									open={mediaViewerOpen}
									onOpenChange={setMediaViewerOpen}
								/>
							</View>
						</Card>

						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_BOARD_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.dataDisplay.boardTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.dataDisplay.boardDescription}
							</ThemedText>
							<KanbanBoard
								columns={kanbanColumns}
								onColumnsChange={setKanbanColumns}
							/>
						</Card>
					</View>

					<Card variant="outlined">
						<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
							{copy.componentGallery.dataDisplay.boardTitle}
						</ThemedText>
						<ThemedText
							variant="caption"
							style={{
								color: c.onSurfaceVariant,
								marginTop: s.xxs,
								marginBottom: s.md,
							}}
						>
							{copy.componentGallery.dataDisplay.boardDescription}
						</ThemedText>
						<SortableList
							items={kanbanColumns[0]?.items ?? []}
							onItemsChange={(nextItems) =>
								setKanbanColumns((currentColumns) =>
									currentColumns.map((column, index) =>
										index === 0 ? { ...column, items: nextItems } : column,
									),
								)
							}
							renderItem={(item) => (
								<View style={{ gap: s.xxs }}>
									<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
										{item.title}
									</ThemedText>
									{item.description ? (
										<ThemedText
											variant="caption"
											style={{ color: c.onSurfaceVariant }}
										>
											{item.description}
										</ThemedText>
									) : null}
								</View>
							)}
						/>
					</Card>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.componentGallery.overlays.sectionTitle}
				description={copy.componentGallery.overlays.sectionDescription}
			>
				<View style={{ gap: s.lg }}>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm }}>
						<Button
							ref={dialogTriggerRefSm}
							title={copy.componentGallery.overlays.sizeSmall}
							size="sm"
							variant="outline"
							onPress={() => {
								setConfirmationSize('sm');
								setConfirmationRestoreTarget('sm');
								setConfirmationVisible(true);
							}}
						/>
						<Button
							ref={dialogTriggerRefMd}
							title={copy.componentGallery.overlays.sizeMedium}
							size="sm"
							variant="secondary"
							onPress={() => {
								setConfirmationSize('md');
								setConfirmationRestoreTarget('md');
								setConfirmationVisible(true);
							}}
						/>
						<Button
							ref={dialogTriggerRefLg}
							title={copy.componentGallery.overlays.sizeLarge}
							size="sm"
							variant="ghost"
							onPress={() => {
								setConfirmationSize('lg');
								setConfirmationRestoreTarget('lg');
								setConfirmationVisible(true);
							}}
						/>
						<Button
							ref={dialogTriggerRefHard}
							title={copy.componentGallery.overlays.hardConfirmation}
							size="sm"
							onPress={() => setHardConfirmationVisible(true)}
						/>
						<Button
							title={copy.componentGallery.overlays.nativeAlertButton}
							size="sm"
							variant="outline"
							onPress={() =>
								showNativeConfirmationAlert({
									title: copy.componentGallery.overlays.nativeAlertTitle,
									message: copy.componentGallery.overlays.nativeAlertMessage,
									confirmLabel: copy.componentGallery.overlays.nativeAlertConfirm,
									cancelLabel: copy.componentGallery.overlays.nativeAlertCancel,
									onConfirm: () =>
										pushToast({
											message:
												copy.componentGallery.overlays.nativeAlertConfirmed,
											variant: 'success',
										}),
									onCancel: () =>
										pushToast({
											message:
												copy.componentGallery.overlays.nativeAlertCancelled,
											variant: 'info',
										}),
								})
							}
						/>
					</View>

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.overlays.tooltipTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.overlays.tooltipDescription}
							</ThemedText>
							<Tooltip
								triggerLabel={copy.componentGallery.overlays.tooltipTrigger}
								content={copy.componentGallery.overlays.tooltipContent}
								testID="overlay-tooltip"
								trigger={
									<View style={{ alignSelf: 'flex-start' }}>
										<Badge
											label={copy.componentGallery.overlays.tooltipTrigger}
											variant="info"
										/>
									</View>
								}
							/>
						</Card>

						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.overlays.popoverTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.overlays.popoverDescription}
							</ThemedText>
							<Popover
								open={quickEditPopoverOpen}
								onOpenChange={setQuickEditPopoverOpen}
								triggerLabel={copy.componentGallery.overlays.popoverTrigger}
								title={copy.componentGallery.overlays.popoverTitle}
								description={copy.componentGallery.overlays.popoverDescription}
								testID="overlay-popover"
								trigger={
									<View style={{ alignSelf: 'flex-start' }}>
										<Badge
											label={copy.componentGallery.overlays.popoverTrigger}
											variant="default"
										/>
									</View>
								}
							>
								<View style={{ gap: s.sm }}>
									<TextInput
										label={copy.componentGallery.overlays.popoverFieldLabel}
										helperText={
											copy.componentGallery.overlays.popoverFieldHelper
										}
										value={quickEditValue}
										onValueChange={setQuickEditValue}
									/>
									<Button
										title={copy.componentGallery.overlays.popoverAction}
										size="sm"
										onPress={() => {
											setQuickEditPopoverOpen(false);
											pushToast({
												message:
													copy.componentGallery.overlays.popoverSaved,
												variant: 'success',
											});
										}}
									/>
								</View>
							</Popover>
						</Card>

						<Card
							variant="outlined"
							style={{ flex: 1, minWidth: DATA_DISPLAY_VISUAL_CARD_MIN_WIDTH }}
						>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{copy.componentGallery.overlays.contextMenuTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: c.onSurfaceVariant,
									marginTop: s.xxs,
									marginBottom: s.md,
								}}
							>
								{copy.componentGallery.overlays.contextMenuDescription}
							</ThemedText>
							<Popover
								open={contextMenuOpen}
								onOpenChange={setContextMenuOpen}
								triggerMode="longPress"
								hapticFeedback="selection"
								triggerLabel={
									copy.componentGallery.overlays.contextMenuTriggerTitle
								}
								title={copy.componentGallery.overlays.contextMenuTitle}
								description={copy.componentGallery.overlays.contextMenuDescription}
								testID="overlay-context-menu"
								trigger={
									<Card variant="flat" padding="sm">
										<CardBody>
											<ThemedText
												variant="bodyStrong"
												style={{ color: c.onSurface }}
											>
												{
													copy.componentGallery.overlays
														.contextMenuTriggerTitle
												}
											</ThemedText>
											<ThemedText
												variant="caption"
												style={{
													color: c.onSurfaceVariant,
													marginTop: s.xxs,
												}}
											>
												{
													copy.componentGallery.overlays
														.contextMenuTriggerDescription
												}
											</ThemedText>
										</CardBody>
									</Card>
								}
							>
								<View style={{ gap: s.xs }}>
									{actionMenuItems.map((action) => (
										<Button
											key={action.value}
											title={action.label}
											size="sm"
											variant={action.destructive ? 'danger' : 'ghost'}
											onPress={() => {
												setContextMenuOpen(false);
												pushToast({
													message: `${copy.componentGallery.overlays.contextActionPrefix} ${action.label}`,
													variant: action.destructive
														? 'warning'
														: 'info',
												});
											}}
										/>
									))}
								</View>
							</Popover>
						</Card>
					</View>
				</View>
			</PreviewSection>

			<PreviewSection title={copy.stateProof.title} description={copy.stateProof.description}>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
					<StateProofCard
						title={copy.stateProof.loading.title}
						description={copy.stateProof.loading.description}
					>
						<View style={{ gap: s.sm }}>
							<SkeletonRow
								withAvatar
								lines={2}
								testID="state-proof-loading-primary"
							/>
							<SkeletonRow lines={1} />
							<SkeletonBlock width="48%" height={12} />
						</View>
					</StateProofCard>

					<StateProofCard
						title={copy.stateProof.empty.title}
						description={copy.stateProof.empty.description}
					>
						<EmptyState
							title={copy.stateProof.empty.title}
							description={copy.stateProof.empty.description}
							actionLabel={copy.stateProof.empty.actionLabel}
							onAction={() => setToastVisible(true)}
							style={{ flex: 0, padding: 0 }}
						/>
					</StateProofCard>

					<StateProofCard
						title={copy.stateProof.error.title}
						description={copy.stateProof.error.description}
					>
						<View style={{ gap: s.sm }}>
							<Badge label={copy.stateProof.error.title} variant="warning" />
							<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
								{copy.stateProof.error.description}
							</ThemedText>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm }}>
								<Button
									title={copy.stateProof.error.retryLabel}
									onPress={() => setToastVisible(true)}
								/>
								<Button
									title={copy.stateProof.error.supportLabel}
									variant="secondary"
									onPress={() => setToastVisible(true)}
								/>
							</View>
						</View>
					</StateProofCard>

					<StateProofCard
						title={copy.stateProof.readOnly.title}
						description={copy.stateProof.readOnly.description}
					>
						<View style={{ gap: s.xs }}>
							{DESIGN_SYSTEM_READ_ONLY_FIELDS.map((field) => (
								<ListItem
									key={field.label}
									title={field.label}
									subtitle={`${field.value} • ${field.meta}`}
									showChevron={false}
								/>
							))}
						</View>
					</StateProofCard>

					<StateProofCard
						title={copy.stateProof.denied.title}
						description={copy.stateProof.denied.description}
					>
						<View style={{ gap: s.sm }}>
							<Badge label={copy.stateProof.denied.title} variant="warning" />
							<ThemedText variant="body" style={{ color: c.onSurface }}>
								{copy.stateProof.denied.description}
							</ThemedText>
							<Button
								title={copy.stateProof.denied.actionLabel}
								variant="outline"
								onPress={() => setToastVisible(true)}
							/>
						</View>
					</StateProofCard>

					<StateProofCard
						title={copy.stateProof.noMedia.title}
						description={copy.stateProof.noMedia.description}
					>
						<View style={{ flexDirection: 'row', gap: s.md }}>
							<View
								style={{
									width: s['3xl'],
									height: s['3xl'],
									borderRadius: r.full,
									backgroundColor: visual.surfaces.quiet,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
									{DESIGN_SYSTEM_STATE_FIXTURES.noMedia.monogram}
								</ThemedText>
							</View>
							<View style={{ flex: 1 }}>
								<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
									{DESIGN_SYSTEM_STATE_FIXTURES.noMedia.title}
								</ThemedText>
								<ThemedText
									variant="caption"
									style={{ color: c.onSurfaceVariant, marginTop: s.xxs }}
								>
									{DESIGN_SYSTEM_STATE_FIXTURES.noMedia.meta}
								</ThemedText>
								<ThemedText
									variant="caption"
									style={{ color: c.onSurfaceVariant, marginTop: s.xs }}
								>
									{copy.stateProof.noMedia.description}
								</ThemedText>
							</View>
						</View>
					</StateProofCard>

					<StateProofCard
						title={copy.stateProof.uglyData.title}
						description={copy.stateProof.uglyData.description}
					>
						<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
							{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.title}
						</ThemedText>
						<ThemedText
							variant="caption"
							style={{ color: c.onSurfaceVariant, marginTop: s.xs }}
						>
							{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.detail}
						</ThemedText>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: s.sm,
								marginTop: s.md,
							}}
						>
							<Badge label={copy.stateProof.uglyData.metricLabel} variant="info" />
							<Badge label={copy.stateProof.uglyData.metaLabel} variant="warning" />
						</View>
						<ThemedText
							variant="metric"
							style={{ color: c.onSurface, marginTop: s.md }}
						>
							{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.metricValue}
						</ThemedText>
						<ThemedText
							variant="metadata"
							style={{ color: c.onSurfaceVariant, marginTop: s.xs }}
						>
							{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.metricContext}
						</ThemedText>
					</StateProofCard>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.componentInventory.title}
				description={copy.componentInventory.description}
			>
				<SearchBar
					value={componentQuery}
					onChangeText={setComponentQuery}
					placeholder={copy.componentInventory.searchPlaceholder}
				/>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: s.sm, paddingTop: s.md, paddingBottom: s.sm }}
				>
					{copy.componentInventory.kindFilters.map((filter) => (
						<Chip
							key={filter.value}
							label={filter.label}
							selected={componentKindFilter === filter.value}
							onPress={() => setComponentKindFilter(filter.value)}
						/>
					))}
				</ScrollView>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginBottom: s.md,
					}}
				>
					<Badge
						label={copy.componentInventory.componentsCount(filteredComponents.length)}
						variant="default"
					/>
					<Badge
						label={copy.componentInventory.testedCount(testedComponentCount)}
						variant="success"
					/>
					<Badge
						label={copy.componentInventory.liveDemoCount(liveDemoComponentCount)}
						variant="info"
					/>
					<Badge
						label={copy.componentInventory.groupCount(componentGroupCount)}
						variant="neutral"
					/>
				</View>

				<View style={{ gap: s.sm }}>
					{filteredComponents.map((component, index) => {
						const previousComponent = index > 0 ? filteredComponents[index - 1] : null;
						const showKindHeader =
							!previousComponent || previousComponent.kind !== component.kind;
						const docsEntry = DESIGN_SYSTEM_COMPONENT_DOCS[component.name];

						return (
							<View key={component.id}>
								{showKindHeader ? (
									<View
										style={{
											paddingTop: index === 0 ? 0 : s.md,
											paddingBottom: s.xs,
										}}
									>
										<ThemedText variant="label" style={{ color: c.primary }}>
											{copy.componentInventory.kindLabels[component.kind]}
										</ThemedText>
									</View>
								) : null}
								<Card
									variant="outlined"
									style={{
										marginBottom: s.xs,
										borderRadius: r.md,
										backgroundColor: visual.surfaces.default,
										borderColor: c.border,
										minWidth: COMPONENT_CARD_MIN_WIDTH,
									}}
								>
									<ThemedText
										variant="sectionTitle"
										style={{ color: c.onSurface }}
									>
										{component.name}
									</ThemedText>
									{docsEntry ? (
										<ThemedText
											variant="caption"
											style={{
												color: c.onSurfaceVariant,
												marginTop: s.xs,
											}}
										>
											{docsEntry.summary}
										</ThemedText>
									) : null}
									<ThemedText
										variant="caption"
										style={{ color: c.onSurfaceVariant, marginTop: s.xxs }}
										numberOfLines={1}
									>
										{component.filePath}
									</ThemedText>
									<View
										style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											gap: s.sm,
											marginTop: s.sm,
										}}
									>
										<Badge
											label={
												copy.componentInventory.kindLabels[component.kind]
											}
											variant={COMPONENT_KIND_VARIANT[component.kind]}
											size="sm"
										/>
										<Badge
											label={
												component.hasTests
													? copy.componentInventory.tested
													: copy.componentInventory.needsTests
											}
											variant={component.hasTests ? 'success' : 'warning'}
											size="sm"
										/>
										<Badge
											label={
												isLivePreviewComponent(component)
													? copy.componentInventory.liveDemo
													: copy.componentInventory.registryOnly
											}
											variant={
												isLivePreviewComponent(component)
													? 'info'
													: 'neutral'
											}
											size="sm"
										/>
										{docsEntry ? (
											<>
												<Badge
													label={copy.componentInventory.storyCount(
														docsEntry.exampleStories.length,
													)}
													variant="neutral"
													size="sm"
												/>
												<Badge
													label={copy.componentInventory.variantCount(
														docsEntry.variants.length,
													)}
													variant="info"
													size="sm"
												/>
												<Badge
													label={copy.componentInventory.stateCount(
														docsEntry.states.length,
													)}
													variant="warning"
													size="sm"
												/>
												<Badge
													label={copy.componentInventory.propCount(
														docsEntry.propTable.length,
													)}
													variant="success"
													size="sm"
												/>
											</>
										) : null}
									</View>
									{docsEntry ? (
										<View style={{ marginTop: s.md }}>
											<DetailBlock label={copy.componentInventory.summary}>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.summary}
												</ThemedText>
											</DetailBlock>

											<DetailBlock
												label={copy.componentInventory.exampleStories}
											>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.exampleStories.join(' • ')}
												</ThemedText>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.variants}>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.variants.join(' • ')}
												</ThemedText>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.sizes}>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.sizes.join(' • ')}
												</ThemedText>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.states}>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.states.join(' • ')}
												</ThemedText>
											</DetailBlock>

											<DetailBlock
												label={copy.componentInventory.composition}
											>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.compositionExample}
												</ThemedText>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.relaxed}>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.usage.relaxed}
												</ThemedText>
											</DetailBlock>

											<DetailBlock
												label={copy.componentInventory.operational}
											>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.usage.operational}
												</ThemedText>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.noMedia}>
												<ThemedText
													variant="caption"
													style={{ color: c.onSurfaceVariant }}
												>
													{docsEntry.usage.noMedia}
												</ThemedText>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.props}>
												<View style={{ gap: s.xs }}>
													{docsEntry.propTable.map((prop) => (
														<View key={`${component.id}-${prop.name}`}>
															<ThemedText
																variant="caption"
																weight="semibold"
																style={{ color: c.onSurface }}
															>
																{`${prop.name} • ${prop.type}`}
															</ThemedText>
															<ThemedText
																variant="metadata"
																style={{
																	color: c.onSurfaceVariant,
																}}
															>
																{prop.defaultValue
																	? `${copy.componentInventory.defaultValue}: ${prop.defaultValue} • ${prop.description}`
																	: prop.description}
															</ThemedText>
														</View>
													))}
												</View>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.doLabel}>
												<View style={{ gap: s.xxs }}>
													{docsEntry.doList.map((item) => (
														<ThemedText
															key={`${component.id}-do-${item}`}
															variant="caption"
															style={{ color: c.onSurfaceVariant }}
														>
															{`• ${item}`}
														</ThemedText>
													))}
												</View>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.dontLabel}>
												<View style={{ gap: s.xxs }}>
													{docsEntry.dontList.map((item) => (
														<ThemedText
															key={`${component.id}-dont-${item}`}
															variant="caption"
															style={{ color: c.onSurfaceVariant }}
														>
															{`• ${item}`}
														</ThemedText>
													))}
												</View>
											</DetailBlock>

											<DetailBlock
												label={copy.componentInventory.accessibility}
											>
												<View style={{ gap: s.xxs }}>
													{docsEntry.accessibilityNotes.map((item) => (
														<ThemedText
															key={`${component.id}-a11y-${item}`}
															variant="caption"
															style={{ color: c.onSurfaceVariant }}
														>
															{`• ${item}`}
														</ThemedText>
													))}
												</View>
											</DetailBlock>

											<DetailBlock label={copy.componentInventory.platform}>
												<View style={{ gap: s.xxs }}>
													{docsEntry.platformNotes.map((item) => (
														<ThemedText
															key={`${component.id}-platform-${item}`}
															variant="caption"
															style={{ color: c.onSurfaceVariant }}
														>
															{`• ${item}`}
														</ThemedText>
													))}
												</View>
											</DetailBlock>
										</View>
									) : null}
								</Card>
							</View>
						);
					})}
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.checklistExplorer.title}
				description={copy.checklistExplorer.description}
			>
				<SearchBar
					value={catalogQuery}
					onChangeText={setCatalogQuery}
					placeholder={copy.checklistExplorer.searchPlaceholder}
				/>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: s.sm, paddingTop: s.md, paddingBottom: s.sm }}
				>
					{copy.checklistExplorer.platformFilters.map((filter) => (
						<Chip
							key={filter.value}
							label={filter.label}
							selected={platformFilter === filter.value}
							onPress={() => setPlatformFilter(filter.value)}
						/>
					))}
				</ScrollView>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: s.sm, paddingBottom: s.sm }}
				>
					{copy.checklistExplorer.statusFilters.map((filter) => (
						<Chip
							key={filter.value}
							label={filter.label}
							selected={completionFilter === filter.value}
							onPress={() => setCompletionFilter(filter.value)}
						/>
					))}
				</ScrollView>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.sm,
						marginTop: s.sm,
					}}
				>
					<Badge
						label={copy.checklistExplorer.rowsCount(filteredItems.length)}
						variant="default"
					/>
					<Badge
						label={copy.checklistExplorer.completedCount(filteredCompletedCount)}
						variant="success"
					/>
					<Badge
						label={copy.checklistExplorer.openCount(filteredOpenCount)}
						variant="warning"
					/>
					<Badge
						label={copy.checklistExplorer.sectionGroups(sectionCount)}
						variant="neutral"
					/>
					<Badge
						label={
							platformFilter === 'all'
								? copy.checklistExplorer.viewingAllPlatforms
								: platformFilter === 'common'
									? copy.checklistExplorer.viewingCommonOnly
									: platformFilter === 'mobile'
										? copy.checklistExplorer.viewingMobileOnly
										: copy.checklistExplorer.viewingCommonMobile
						}
						variant="info"
					/>
				</View>
			</PreviewSection>
		</View>
	);

	return (
		<>
			<Screen
				accessibilityLabel={copy.screen.accessibilityLabel}
				safeAreaEdges={['bottom']}
				withKeyboard={false}
				contentContainerStyle={{ direction: copy.direction }}
				header={<WorkbenchHeader title={copy.screen.title} />}
			>
				<FlashList
					data={filteredItems}
					estimatedItemSize={92}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: s['4xl'] }}
					ListHeaderComponent={listHeader}
					renderItem={({ item, index }) => {
						const previousItem = index > 0 ? filteredItems[index - 1] : null;
						const showSectionHeader =
							!previousItem ||
							formatSectionKey(previousItem) !== formatSectionKey(item);

						return (
							<View style={{ paddingHorizontal: s.lg, direction: copy.direction }}>
								{showSectionHeader ? (
									<View
										style={{
											paddingTop: index === 0 ? 0 : s.lg,
											paddingBottom: s.sm,
										}}
									>
										<ThemedText variant="label" style={{ color: c.primary }}>
											{item.section}
										</ThemedText>
										<ThemedText
											variant="metadata"
											style={{ color: c.onSurfaceVariant }}
										>
											{item.subsection}
										</ThemedText>
									</View>
								) : null}

								<Card
									variant="outlined"
									style={{
										marginBottom: s.sm,
										backgroundColor: visual.surfaces.default,
										borderRadius: r.md,
										borderColor: c.border,
									}}
								>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'flex-start',
											gap: s.sm,
										}}
									>
										<View
											style={{
												paddingTop: s.xxs,
												paddingStart: item.depth * s.sm,
											}}
										>
											<View
												style={{
													width: s.sm,
													height: s.sm,
													borderRadius: r.full,
													backgroundColor: isPreviewableItem(item)
														? c.success
														: c.borderStrong,
												}}
											/>
										</View>

										<View style={{ flex: 1 }}>
											<ThemedText
												variant="body"
												style={{ color: c.onSurface }}
											>
												{item.title}
											</ThemedText>
											<View
												style={{
													flexDirection: 'row',
													flexWrap: 'wrap',
													gap: s.sm,
													marginTop: s.sm,
												}}
											>
												<Badge
													label={
														item.platform === 'Mobile (React Native)'
															? copy.checklistExplorer
																	.itemPlatformMobile
															: item.platform
													}
													variant={PLATFORM_VARIANT[item.platform]}
													size="sm"
												/>
												<Badge
													label={
														item.completed
															? copy.checklistExplorer.itemCompleted
															: copy.checklistExplorer.itemOpen
													}
													variant={item.completed ? 'success' : 'warning'}
													size="sm"
												/>
												{isPreviewableItem(item) ? (
													<Badge
														label={copy.checklistExplorer.itemPreviewed}
														variant="success"
														size="sm"
													/>
												) : (
													<Badge
														label={copy.checklistExplorer.itemPlanned}
														variant="neutral"
														size="sm"
													/>
												)}
											</View>
										</View>
									</View>
								</Card>
							</View>
						);
					}}
				/>
			</Screen>

			<BottomSheetPicker
				visible={pickerVisible}
				title={copy.componentGallery.picker.title}
				options={[...copy.componentGallery.picker.options]}
				selectedValue={pickerValue}
				onSelect={setPickerValue}
				onClose={() => setPickerVisible(false)}
				snapPoint="50%"
				snapPoints={['25%', '50%', '90%']}
				dragToDismiss
				keyboardAware
			/>

			<ConfirmationModal
				visible={confirmationVisible}
				title={copy.componentGallery.dialog.title}
				message={copy.componentGallery.dialog.message}
				confirmLabel={copy.componentGallery.dialog.confirmLabel}
				cancelLabel={copy.componentGallery.dialog.cancelLabel}
				size={confirmationSize}
				restoreFocusRef={confirmationRestoreFocusRef}
				onConfirm={() => setConfirmationVisible(false)}
				onCancel={() => setConfirmationVisible(false)}
			/>

			<ConfirmationModal
				visible={hardConfirmationVisible}
				title={copy.componentGallery.overlays.hardConfirmationTitle}
				message={copy.componentGallery.overlays.hardConfirmationMessage}
				confirmLabel={copy.componentGallery.dialog.confirmLabel}
				cancelLabel={copy.componentGallery.dialog.cancelLabel}
				variant="destructive"
				restoreFocusRef={dialogTriggerRefHard}
				hardConfirmValue={copy.componentGallery.overlays.hardConfirmationKeyword}
				hardConfirmLabel={copy.componentGallery.overlays.hardConfirmationLabel}
				hardConfirmPlaceholder={copy.componentGallery.overlays.hardConfirmationKeyword}
				hardConfirmHelperText={copy.componentGallery.overlays.hardConfirmationHelper}
				onConfirm={() => setHardConfirmationVisible(false)}
				onCancel={() => setHardConfirmationVisible(false)}
			/>

			<Toast
				visible={toastVisible}
				message={copy.toast.themeActivated(theme.meta.presetLabel)}
				variant="success"
				onDismiss={() => setToastVisible(false)}
			/>
			<ToastViewport
				items={toastQueue}
				onDismiss={(id) =>
					setToastQueue((currentQueue) => currentQueue.filter((item) => item.id !== id))
				}
				placement="top"
				testID="component-gallery-toast-queue"
			/>
		</>
	);
}
