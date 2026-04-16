import React from 'react';
import { View } from 'react-native';
import { Card } from '@/src/components/atoms/Card';
import { Badge } from '@/src/components/atoms/Badge';
import { Button } from '@/src/components/atoms/Button';
import { Chip } from '@/src/components/atoms/Chip';
import { TextInput } from '@/src/components/atoms/TextInput';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { SkeletonRow } from '@/src/components/molecules/SkeletonRow';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import {
	DESIGN_SYSTEM_OPERATIONAL_FIXTURE,
	DESIGN_SYSTEM_READ_ONLY_FIELDS,
	DESIGN_SYSTEM_RELAXED_FIXTURE,
	DESIGN_SYSTEM_STATE_FIXTURES,
} from '../fixtures';
import { getDesignSystemCopy, type DesignSystemLocale } from '../copy';
import { useDesignSystemQualitySignals } from '../useQualitySignals';

const SURFACE_TIER_KEYS = ['canvas', 'default', 'raised', 'overlay', 'inverse'] as const;
const DATA_SERIES_KEYS = ['focusSeries', 'comparisonSeries', 'mutedSeries'] as const;
const DATA_BAR_WIDTHS = ['100%', '72%', '56%'] as const;
const METRIC_CARD_MIN_WIDTH = 156;
const CONTENT_CARD_MIN_WIDTH = 260;
const SURFACE_SWATCH_HEIGHT = 56;
const DATA_BAR_HEIGHT = 8;
const SKELETON_SUMMARY_HEIGHT = 72;

type SurfaceTierKey = (typeof SURFACE_TIER_KEYS)[number];
type DataSeriesKey = (typeof DATA_SERIES_KEYS)[number];

function SnapshotMetricCard({
	label,
	value,
	detail,
	filters,
}: {
	label: string;
	value: string;
	detail: string;
	filters: readonly string[];
}) {
	const { c, s, visual } = useThemeTokens();

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
			<ThemedText variant="metric" style={{ color: c.primary, marginTop: s.xs }}>
				{value}
			</ThemedText>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginTop: s.xs }}>
				{detail}
			</ThemedText>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.xs, marginTop: s.sm }}>
				{filters.map((filter) => (
					<Chip key={filter} label={filter} size="sm" />
				))}
			</View>
		</Card>
	);
}

function SurfaceSwatch({ tierKey, label }: { tierKey: SurfaceTierKey; label: string }) {
	const { c, r, s, visual } = useThemeTokens();

	return (
		<View style={{ flex: 1, minWidth: METRIC_CARD_MIN_WIDTH }}>
			<View
				style={{
					height: SURFACE_SWATCH_HEIGHT,
					borderRadius: r.md,
					backgroundColor: visual.surfaces[tierKey],
					borderWidth: tierKey === 'inverse' ? 0 : 1,
					borderColor: c.border,
				}}
			/>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginTop: s.xs }}>
				{label}
			</ThemedText>
		</View>
	);
}

export function ThemeSnapshotPreview({ locale = 'en' }: { locale?: DesignSystemLocale }) {
	const { theme, meta, c, s, r, visual, typo } = useThemeTokens();
	const copy = getDesignSystemCopy(locale);
	const signals = useDesignSystemQualitySignals(locale);

	return (
		<View
			accessible={true}
			accessibilityLabel={copy.screen.accessibilityLabel}
			style={{
				backgroundColor: visual.surfaces.canvas,
				padding: s.lg,
				direction: signals.runtimeRtl ? 'rtl' : 'ltr',
			}}
		>
			<Card
				variant="outlined"
				style={{
					marginBottom: s.md,
					backgroundColor: visual.surfaces.hero,
					borderColor: c.border,
				}}
			>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.xs }}>
					<Badge label={copy.hero.presetBadge(meta.presetLabel)} variant="info" />
					<Badge
						label={copy.hero.modeBadge(theme.isDark ? 'dark' : 'light')}
						variant="neutral"
					/>
					<Badge
						label={copy.runtimeTheming.currentExpression(meta.expression)}
						variant="success"
					/>
				</View>
				<ThemedText
					variant="screenTitle"
					style={{ color: visual.surfaces.onHero, marginTop: s.sm }}
				>
					{copy.screen.title}
				</ThemedText>
				<ThemedText
					variant="metadata"
					style={{ color: visual.surfaces.onHero, marginTop: s.xs }}
				>
					{copy.runtimeTheming.currentAccentBudget(meta.accentBudget)}
				</ThemedText>
				<ThemedText
					variant="caption"
					style={{ color: visual.surfaces.onHero, marginTop: s.xs }}
				>
					{copy.runtimeTheming.currentSurfaceBias(visual.presentation.defaultSurfaceBias)}
				</ThemedText>
				<View
					style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm, marginTop: s.md }}
				>
					<Button title={copy.presentationModes.relaxed.primaryAction} />
					<Button
						title={copy.presentationModes.operational.secondaryAction}
						variant="outline"
					/>
				</View>
			</Card>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md, marginBottom: s.md }}>
				<SnapshotMetricCard
					label={copy.presentationModes.relaxed.metricLabel}
					value={DESIGN_SYSTEM_RELAXED_FIXTURE.metricValue}
					detail={DESIGN_SYSTEM_RELAXED_FIXTURE.metricContext}
					filters={DESIGN_SYSTEM_RELAXED_FIXTURE.filters}
				/>
				<SnapshotMetricCard
					label={copy.presentationModes.operational.metricLabel}
					value={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricValue}
					detail={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.metricContext}
					filters={DESIGN_SYSTEM_OPERATIONAL_FIXTURE.filters}
				/>
			</View>

			<Card
				variant="outlined"
				style={{
					marginBottom: s.md,
					backgroundColor: visual.surfaces.default,
					borderColor: c.border,
				}}
			>
				<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
					{copy.presentationModes.surfaceTiersTitle}
				</ThemedText>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginTop: s.xs }}
				>
					{copy.presentationModes.surfaceTiersDescription}
				</ThemedText>
				<View
					style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm, marginTop: s.md }}
				>
					{SURFACE_TIER_KEYS.map((tierKey) => (
						<SurfaceSwatch
							key={tierKey}
							tierKey={tierKey}
							label={copy.presentationModes.tierLabels[tierKey]}
						/>
					))}
				</View>
				<View
					style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.xs, marginTop: s.md }}
				>
					<Chip label={copy.presentationModes.inverseAction} selected />
					<Chip label={copy.runtimeTheming.currentDensity(meta.density)} />
					<Chip label={copy.runtimeTheming.currentTouchTarget(theme.touchTarget)} />
				</View>
			</Card>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.md, marginBottom: s.md }}>
				<Card
					variant="outlined"
					style={{
						flex: 1,
						minWidth: CONTENT_CARD_MIN_WIDTH,
						backgroundColor: visual.surfaces.default,
						borderColor: c.border,
					}}
				>
					<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
						{copy.stateProof.loading.title}
					</ThemedText>
					<ThemedText
						variant="metadata"
						style={{ color: c.onSurfaceVariant, marginTop: s.xs, marginBottom: s.sm }}
					>
						{copy.stateProof.loading.description}
					</ThemedText>
					<SkeletonRow withAvatar />
					<SkeletonBlock height={SKELETON_SUMMARY_HEIGHT} style={{ marginTop: s.sm }} />
				</Card>
				<Card
					variant="outlined"
					style={{
						flex: 1,
						minWidth: CONTENT_CARD_MIN_WIDTH,
						backgroundColor: visual.surfaces.default,
						borderColor: c.border,
					}}
				>
					<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
						{copy.stateProof.readOnly.title}
					</ThemedText>
					<ThemedText
						variant="metadata"
						style={{ color: c.onSurfaceVariant, marginTop: s.xs, marginBottom: s.sm }}
					>
						{copy.stateProof.readOnly.description}
					</ThemedText>
					<TextInput
						label={copy.componentGallery.fields.textField}
						value={copy.presentationModes.relaxed.searchPlaceholder}
						editable={false}
						helperText={DESIGN_SYSTEM_READ_ONLY_FIELDS[0]?.meta}
					/>
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							gap: s.xs,
							marginTop: s.sm,
						}}
					>
						{DESIGN_SYSTEM_READ_ONLY_FIELDS.map((field) => (
							<Badge key={field.label} label={field.value} variant="neutral" />
						))}
					</View>
				</Card>
			</View>

			<Card
				variant="outlined"
				style={{
					backgroundColor: visual.surfaces.default,
					borderColor: c.border,
				}}
			>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.xs }}>
					<Badge label={copy.stateProof.noMedia.title} variant="warning" />
					<Badge label={copy.stateProof.uglyData.title} variant="error" />
					<Badge label={copy.stateProof.denied.title} variant="info" />
				</View>
				<ThemedText variant="bodyStrong" style={{ color: c.onSurface, marginTop: s.md }}>
					{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.title}
				</ThemedText>
				<ThemedText
					variant="metadata"
					style={{ color: c.onSurfaceVariant, marginTop: s.xs }}
				>
					{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.detail}
				</ThemedText>
				<ThemedText variant="metric" style={{ color: c.success, marginTop: s.sm }}>
					{DESIGN_SYSTEM_STATE_FIXTURES.uglyData.metricValue}
				</ThemedText>
				<View style={{ gap: s.xs, marginTop: s.md }}>
					{DATA_SERIES_KEYS.map((seriesKey, index) => (
						<View
							key={`${seriesKey}-${DATA_BAR_WIDTHS[index] ?? DATA_BAR_WIDTHS[DATA_BAR_WIDTHS.length - 1]}`}
							style={{
								height: DATA_BAR_HEIGHT,
								borderRadius: r.full,
								width:
									DATA_BAR_WIDTHS[index] ??
									DATA_BAR_WIDTHS[DATA_BAR_WIDTHS.length - 1],
								backgroundColor: visual.data[seriesKey as DataSeriesKey],
							}}
						/>
					))}
				</View>
				<View
					style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.xs, marginTop: s.md }}
				>
					<Chip label={copy.meta.localeBadge} selected={signals.runtimeRtl} />
					<Chip label={copy.meta.directionBadge} selected={signals.runtimeRtl} />
					<Chip label={copy.runtimeTheming.currentSpacing(theme.spacing.md)} />
					<Chip label={copy.runtimeTheming.currentRadius(theme.borderRadius.md)} />
					<Chip
						label={copy.runtimeTheming.currentBody(
							typo.variants.body.fontSize ?? theme.typography.sizes.md,
							typo.variants.body.lineHeight ?? theme.typography.sizes.lg,
						)}
					/>
					<Chip label={copy.runtimeTheming.subtreeMode(theme.isDark)} />
					<Chip label={copy.runtimeTheming.subtreeExpression(meta.expression)} />
				</View>
				<View
					style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm, marginTop: s.md }}
				>
					<Button title={copy.stateProof.error.retryLabel} size="sm" />
					<Button
						title={copy.stateProof.denied.actionLabel}
						size="sm"
						variant="secondary"
					/>
				</View>
			</Card>
		</View>
	);
}
