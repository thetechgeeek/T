import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Calendar, Moon, Package, Palette, Search, Settings, Sun, Zap } from 'lucide-react-native';
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
import { ListItem } from '@/src/components/molecules/ListItem';
import { StatCard } from '@/src/components/molecules/StatCard';
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

const AMOUNT_PREVIEW_VALUE = 125000;
const KPI_CARD_MIN_WIDTH = 160;
const COMPONENT_CARD_MIN_WIDTH = 220;

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

function PreviewSection({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	const { c, s } = useThemeTokens();

	return (
		<Card style={{ marginBottom: s.lg }}>
			<View style={{ marginBottom: s.md }}>
				<ThemedText variant="h3" style={{ color: c.onSurface }}>
					{title}
				</ThemedText>
				<ThemedText
					variant="caption"
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

function ScopedThemePreviewCardContent({
	label,
	modeLabel,
	spacingLabel,
	radiusLabel,
}: {
	label: string;
	modeLabel: (isDark: boolean) => string;
	spacingLabel: (value: number) => string;
	radiusLabel: (value: number) => string;
}) {
	const { theme, c, s } = useThemeTokens();

	return (
		<Card
			variant="flat"
			style={{
				flex: 1,
				minWidth: 180,
				borderWidth: theme.borderWidth.sm,
				borderColor: c.border,
			}}
		>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
				{label}
			</ThemedText>
			<ThemedText variant="h3" style={{ color: c.onSurface, marginTop: s.xxs }}>
				{theme.meta.presetLabel}
			</ThemedText>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.xs, marginTop: s.sm }}>
				<Badge label={modeLabel(theme.isDark)} variant="info" size="sm" />
				<Badge label={spacingLabel(theme.spacing.lg)} variant="success" size="sm" />
				<Badge label={radiusLabel(theme.borderRadius.md)} variant="default" size="sm" />
			</View>
			<View
				style={{
					height: s.xl,
					borderRadius: theme.borderRadius.full,
					backgroundColor: c.primary,
					marginTop: s.sm,
				}}
			/>
		</Card>
	);
}

function ScopedThemePreviewCard({
	label,
	mode,
	presetId,
	modeLabel,
	spacingLabel,
	radiusLabel,
}: {
	label: string;
	mode: ThemeMode;
	presetId: ThemePresetId;
	modeLabel: (isDark: boolean) => string;
	spacingLabel: (value: number) => string;
	radiusLabel: (value: number) => string;
}) {
	return (
		<ThemeProvider initialMode={mode} initialPresetId={presetId} persist={false}>
			<ScopedThemePreviewCardContent
				label={label}
				modeLabel={modeLabel}
				spacingLabel={spacingLabel}
				radiusLabel={radiusLabel}
			/>
		</ThemeProvider>
	);
}

export interface DesignLibraryScreenProps {
	locale?: DesignSystemLocale;
}

export default function DesignLibraryScreen({ locale = 'en' }: DesignLibraryScreenProps) {
	const { theme, c, s, r } = useThemeTokens();
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
	const [toastVisible, setToastVisible] = useState(false);
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
		setNoteValue(getDesignSystemCopy(nextLocale).componentGallery.notesSeed);
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
					backgroundColor: c.primaryContainer,
					borderRadius: r.lg,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: s.md }}>
					<View
						style={{
							width: s['3xl'],
							height: s['3xl'],
							borderRadius: r.lg,
							backgroundColor: c.primary,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Palette size={24} color={c.onPrimary} />
					</View>
					<View style={{ flex: 1 }}>
						<ThemedText variant="h1" style={{ color: c.onSurface, marginBottom: s.xs }}>
							{copy.hero.title}
						</ThemedText>
						<ThemedText variant="body" style={{ color: c.onSurfaceVariant }}>
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
			</Card>

			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					gap: s.md,
					marginBottom: s.lg,
				}}
			>
				<StatCard
					label={copy.stats.allChecklistItems}
					value={DESIGN_LIBRARY_OVERVIEW.total}
					icon={Search}
					color={c.primary}
					style={{ flex: 1, minWidth: KPI_CARD_MIN_WIDTH }}
				/>
				<StatCard
					label={copy.stats.completed}
					value={DESIGN_LIBRARY_OVERVIEW.completed}
					icon={Zap}
					color={c.success}
					style={{ flex: 1, minWidth: KPI_CARD_MIN_WIDTH }}
				/>
				<StatCard
					label={copy.stats.open}
					value={DESIGN_LIBRARY_OVERVIEW.open}
					icon={Settings}
					color={c.warning}
					style={{ flex: 1, minWidth: KPI_CARD_MIN_WIDTH }}
				/>
				<StatCard
					label={copy.stats.commonMobile}
					value={DESIGN_LIBRARY_OVERVIEW.commonMobile}
					icon={Settings}
					color={c.info}
					style={{ flex: 1, minWidth: KPI_CARD_MIN_WIDTH }}
				/>
				<StatCard
					label={copy.stats.libraryComponents}
					value={DESIGN_LIBRARY_COMPONENT_OVERVIEW.total}
					icon={Package}
					color={c.primary}
					style={{ flex: 1, minWidth: KPI_CARD_MIN_WIDTH }}
				/>
				<StatCard
					label={copy.stats.liveDemos}
					value={DESIGN_LIBRARY_COMPONENT_OVERVIEW.livePreviewCount}
					icon={Palette}
					color={c.success}
					style={{ flex: 1, minWidth: KPI_CARD_MIN_WIDTH }}
				/>
			</View>

			<PreviewSection
				title={copy.runtimeTheming.title}
				description={copy.runtimeTheming.description}
			>
				<ThemedText
					variant="caption"
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
					variant="caption"
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
					variant="caption"
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
				<Button
					title={copy.runtimeTheming.cycleLookAndFeel}
					onPress={cycleThemePreset}
					leftIcon={<Palette size={16} color={c.onPrimary} />}
				/>
				<ThemedText
					variant="caption"
					style={{ color: c.onSurfaceVariant, marginTop: s.md, marginBottom: s.sm }}
				>
					{copy.runtimeTheming.nestedSubtreePreviews}
				</ThemedText>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md }}>
					<ScopedThemePreviewCard
						label={copy.runtimeTheming.boardroomSurface}
						mode={previewMode}
						presetId="executive"
						modeLabel={copy.runtimeTheming.subtreeMode}
						spacingLabel={copy.runtimeTheming.subtreeSpacing}
						radiusLabel={copy.runtimeTheming.subtreeRadius}
					/>
					<ScopedThemePreviewCard
						label={copy.runtimeTheming.creativeSurface}
						mode={previewMode}
						presetId="studio"
						modeLabel={copy.runtimeTheming.subtreeMode}
						spacingLabel={copy.runtimeTheming.subtreeSpacing}
						radiusLabel={copy.runtimeTheming.subtreeRadius}
					/>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.localization.title}
				description={copy.localization.description}
			>
				<ThemedText
					variant="caption"
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
					variant="caption"
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
					variant="caption"
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

					<Button
						title={copy.componentGallery.buttons.openPicker}
						variant="secondary"
						onPress={() => setPickerVisible(true)}
						leftIcon={<Package size={16} color={c.onSurfaceVariant} />}
					/>
				</View>
			</PreviewSection>

			<PreviewSection
				title={copy.patternSamples.title}
				description={copy.patternSamples.description}
			>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: s.md,
						marginBottom: s.lg,
					}}
				>
					<StatCard
						label={copy.patternSamples.previewReadyComponents}
						value="18"
						icon={Palette}
						color={c.success}
						trend={copy.patternSamples.previewReadyTrend}
						trendLabel={copy.patternSamples.previewReadyTrendLabel}
						style={{ flex: 1, minWidth: 180 }}
					/>
					<StatCard
						label={copy.patternSamples.accessibilityCoverage}
						value="94%"
						icon={Zap}
						color={c.info}
						trend={copy.patternSamples.accessibilityTrend}
						trendLabel={copy.patternSamples.accessibilityTrendLabel}
						style={{ flex: 1, minWidth: 180 }}
					/>
				</View>

				<EmptyState
					title={copy.patternSamples.emptyStateTitle}
					description={copy.patternSamples.emptyStateDescription}
					actionLabel={copy.patternSamples.emptyStateAction}
					onAction={() => setToastVisible(true)}
					icon={<Palette size={32} color={c.primary} />}
				/>
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
									style={{
										marginBottom: s.xs,
										borderRadius: r.md,
										backgroundColor: c.surface,
										minWidth: COMPONENT_CARD_MIN_WIDTH,
									}}
								>
									<ThemedText variant="h3" style={{ color: c.onSurface }}>
										{component.name}
									</ThemedText>
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
									</View>
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
											variant="caption"
											style={{ color: c.onSurfaceVariant }}
										>
											{item.subsection}
										</ThemedText>
									</View>
								) : null}

								<Card
									style={{
										marginBottom: s.sm,
										backgroundColor: c.surface,
										borderRadius: r.md,
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

			<Toast
				visible={toastVisible}
				message={copy.toast.themeActivated(theme.meta.presetLabel)}
				variant="success"
				onDismiss={() => setToastVisible(false)}
			/>
		</>
	);
}
