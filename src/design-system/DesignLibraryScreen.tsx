import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Calendar, Moon, Package, Palette, Search, Sun } from 'lucide-react-native';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { Card } from '@/src/components/atoms/Card';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { IconButton } from '@/src/components/atoms/IconButton';
import { Badge } from '@/src/components/atoms/Badge';
import { Chip } from '@/src/components/atoms/Chip';
import { TextInput } from '@/src/components/atoms/TextInput';
import { SearchBar } from '@/src/components/molecules/SearchBar';
import { PhoneInput } from '@/src/components/molecules/PhoneInput';
import { AmountInput } from '@/src/components/molecules/AmountInput';
import { DatePickerField } from '@/src/components/molecules/DatePickerField';
import { FilterBar } from '@/src/components/molecules/FilterBar';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { Toast } from '@/src/components/molecules/Toast';
import { BottomSheetPicker } from '@/src/components/molecules/BottomSheetPicker';
import { CollapsibleSection } from '@/src/components/molecules/CollapsibleSection';
import { ConfirmationModal } from '@/src/components/molecules/ConfirmationModal';
import { ListItem } from '@/src/components/molecules/ListItem';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { SkeletonRow } from '@/src/components/molecules/SkeletonRow';
import { StatCard } from '@/src/components/molecules/StatCard';
import { TextAreaField } from '@/src/components/molecules/TextAreaField';
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
const SURFACE_TIER_ORDER = ['canvas', 'default', 'raised', 'overlay', 'inverse'] as const;

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
	const [filterValue, setFilterValue] = useState('all');
	const [pickerVisible, setPickerVisible] = useState(false);
	const [pickerValue, setPickerValue] = useState('foundation');
	const [phoneValue, setPhoneValue] = useState('9876543210');
	const [amountValue, setAmountValue] = useState(AMOUNT_PREVIEW_VALUE);
	const [dateValue, setDateValue] = useState('2026-04-15');
	const [textareaValue, setTextareaValue] = useState(
		() => getDesignSystemCopy(locale).componentGallery.notesSeed,
	);
	const [approvalEmailValue, setApprovalEmailValue] = useState('approver@');
	const [toastVisible, setToastVisible] = useState(false);
	const [confirmationVisible, setConfirmationVisible] = useState(false);
	const [noteValue, setNoteValue] = useState(
		() => getDesignSystemCopy(locale).componentGallery.notesSeed,
	);
	const previewMode: ThemeMode = theme.isDark ? 'dark' : 'light';
	const resolvedBodyFontSize =
		theme.typography.variants.body.fontSize ?? theme.typography.sizes.md;
	const resolvedBodyLineHeight =
		theme.typography.variants.body.lineHeight ?? theme.typography.sizes.lg;

	const handleLocaleChange = useCallback((nextLocale: DesignSystemLocale) => {
		setSelectedLocale(nextLocale);
		const nextCopy = getDesignSystemCopy(nextLocale);
		setNoteValue(nextCopy.componentGallery.notesSeed);
		setTextareaValue(nextCopy.componentGallery.notesSeed);
	}, []);

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
					leftIcon={<Palette size={16} color={c.onPrimary} />}
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
							icon={<Search size={20} color={c.primary} />}
							label={copy.componentGallery.iconButtons.search}
							onPress={() => setToastVisible(true)}
						/>
						<IconButton
							icon={<Calendar size={20} color={c.primary} />}
							label={copy.componentGallery.iconButtons.calendar}
							onPress={() => setToastVisible(true)}
						/>
						<IconButton
							icon={
								mode === 'dark' ? (
									<Sun size={20} color={c.primary} />
								) : (
									<Moon size={20} color={c.primary} />
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
						label={copy.componentGallery.fields.errorField}
						value={approvalEmailValue}
						onChangeText={setApprovalEmailValue}
						error={copy.componentGallery.fields.errorFieldError}
						keyboardType="email-address"
						autoCapitalize="none"
					/>

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
						placeholder={copy.componentGallery.fields.searchPlaceholder}
					/>

					<FilterBar
						filters={[...copy.componentGallery.filterOptions]}
						activeValue={filterValue}
						defaultValue="all"
						onSelect={setFilterValue}
						onClear={() => setFilterValue('all')}
					/>

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
						leftIcon={<Package size={16} color={c.onSurfaceVariant} />}
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
			/>

			<ConfirmationModal
				visible={confirmationVisible}
				title={copy.componentGallery.dialog.title}
				message={copy.componentGallery.dialog.message}
				confirmLabel={copy.componentGallery.dialog.confirmLabel}
				cancelLabel={copy.componentGallery.dialog.cancelLabel}
				onConfirm={() => setConfirmationVisible(false)}
				onCancel={() => setConfirmationVisible(false)}
			/>

			<Toast
				visible={toastVisible}
				message={copy.toast.themeActivated(theme.meta.presetLabel)}
				variant="success"
				onDismiss={() => setToastVisible(false)}
			/>
		</>
	);
}
