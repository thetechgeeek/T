import React, { forwardRef, useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AlertBanner } from '@/src/design-system/components/molecules/AlertBanner';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card, CardBody, CardHeader } from '@/src/design-system/components/atoms/Card';
import { CollapsibleSection } from '@/src/design-system/components/molecules/CollapsibleSection';
import { ListItem } from '@/src/design-system/components/molecules/ListItem';
import { SegmentedControl } from '@/src/design-system/components/molecules/SegmentedControl';
import { SortableList } from '@/src/design-system/components/molecules/SortableList';
import { StatCard } from '@/src/design-system/components/molecules/StatCard';
import { SwipeableRow } from '@/src/design-system/components/molecules/SwipeableRow';
import { ToggleSwitch } from '@/src/design-system/components/atoms/ToggleSwitch';
import {
	VirtualizedList,
	type VirtualizedListSection,
} from '@/src/design-system/components/molecules/VirtualizedList';
import { TouchableCard } from '@/src/design-system/components/atoms/TouchableCard';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

type LayoutMode = 'summary' | 'dense';
type MetricId = 'late-payments' | 'blocked-orders' | 'at-risk-suppliers';

interface LayoutMetric {
	id: MetricId;
	label: string;
	value: string;
	trend: string;
	trendLabel: string;
}

interface LayoutRecord {
	id: string;
	title: string;
	subtitle: string;
	status: string;
}

interface LayoutTask {
	id: string;
	title: string;
	description: string;
}

export interface DataLayoutWorkspaceProps {
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const WORKSPACE_TITLE_MIN_WIDTH = 220;
const METRIC_CARD_MIN_WIDTH = 220;
const FEATURED_CARD_MIN_WIDTH = 280;
const DETAIL_PANEL_MIN_WIDTH = 340;

const METRICS: LayoutMetric[] = [
	{
		id: 'late-payments',
		label: 'Late payments',
		value: '18',
		trend: '-4',
		trendLabel: 'vs yesterday',
	},
	{
		id: 'blocked-orders',
		label: 'Blocked orders',
		value: '7',
		trend: '+2',
		trendLabel: 'needs review',
	},
	{
		id: 'at-risk-suppliers',
		label: 'At-risk suppliers',
		value: '5',
		trend: '+1',
		trendLabel: 'new this morning',
	},
];

const RECORD_SECTIONS: Record<MetricId, VirtualizedListSection<LayoutRecord>[]> = {
	'late-payments': [
		{
			title: 'Today',
			data: [
				{
					id: 'late-1',
					title: 'Northwind exports',
					subtitle: 'Invoice INV-482 • 3 days overdue',
					status: 'Escalated',
				},
				{
					id: 'late-2',
					title: 'Harbor retail group',
					subtitle: 'Invoice INV-478 • 2 days overdue',
					status: 'At risk',
				},
			],
		},
		{
			title: 'Needs follow-up',
			data: [
				{
					id: 'late-3',
					title: 'Studio Meridian',
					subtitle: 'Invoice INV-470 • promised tomorrow',
					status: 'Watching',
				},
			],
		},
	],
	'blocked-orders': [
		{
			title: 'Approval queue',
			data: [
				{
					id: 'blocked-1',
					title: 'Metro supply restock',
					subtitle: 'Inventory variance needs finance sign-off',
					status: 'Blocked',
				},
				{
					id: 'blocked-2',
					title: 'Aster medical kit',
					subtitle: 'Compliance attachment missing from order packet',
					status: 'Pending',
				},
			],
		},
		{
			title: 'Ready once released',
			data: [
				{
					id: 'blocked-3',
					title: 'South route dispatch',
					subtitle: 'Driver assignment confirmed, waiting for release',
					status: 'Queued',
				},
			],
		},
	],
	'at-risk-suppliers': [
		{
			title: 'Critical',
			data: [
				{
					id: 'supplier-1',
					title: 'Aquila packaging',
					subtitle: 'Three missed SLAs in the last 14 days',
					status: 'Critical',
				},
			],
		},
		{
			title: 'Monitor',
			data: [
				{
					id: 'supplier-2',
					title: 'Northlight logistics',
					subtitle: 'Capacity is down 18% this week',
					status: 'Monitor',
				},
				{
					id: 'supplier-3',
					title: 'Elm paper works',
					subtitle: 'Quality incidents rose after last batch',
					status: 'Monitor',
				},
			],
		},
	],
};

const DEFAULT_TASKS: LayoutTask[] = [
	{
		id: 'task-1',
		title: 'Prioritize blocked orders widget',
		description: 'Keep the escalation queue ahead of historic charts for scanners.',
	},
	{
		id: 'task-2',
		title: 'Move supplier risk board below the hero metric',
		description: 'The removable featured block should never displace the primary workflow.',
	},
	{
		id: 'task-3',
		title: 'Pin dispatch anomalies card',
		description: 'Operations leads want this card earlier in compact mode.',
	},
];

function findMetric(metricId: MetricId) {
	return METRICS.find((metric) => metric.id === metricId) ?? METRICS[0];
}

export const DataLayoutWorkspace = forwardRef<
	React.ElementRef<typeof View>,
	DataLayoutWorkspaceProps
>(({ style, testID }, ref) => {
	const { theme } = useTheme();
	const [layoutMode, setLayoutMode] = useState<LayoutMode>('summary');
	const [featuredWidgetsVisible, setFeaturedWidgetsVisible] = useState(true);
	const [activeMetricId, setActiveMetricId] = useState<MetricId>('late-payments');
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [reorderTasks, setReorderTasks] = useState(DEFAULT_TASKS);
	const [lastGestureAction, setLastGestureAction] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdatedLabel, setLastUpdatedLabel] = useState('Updated 6m ago');

	const activeMetric = findMetric(activeMetricId);
	const sections = useMemo(() => RECORD_SECTIONS[activeMetricId], [activeMetricId]);
	const compactMode = layoutMode === 'dense';

	const refreshData = () => {
		setIsRefreshing(true);
		setLastGestureAction('Refresh queued');
		setTimeout(() => {
			setIsRefreshing(false);
			setLastUpdatedLabel('Updated just now');
			setLastGestureAction('Fresh records pulled into the current sectioned list');
		}, 300);
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
							<ThemedText variant="sectionTitle">
								Data interaction workspace
							</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: theme.colors.onSurfaceVariant,
									marginTop: theme.spacing.xxs,
								}}
							>
								A summary-first shell can still collapse into dense analysis mode,
								keep one clear focal region, and preserve mobile-native gestures.
							</ThemedText>
						</View>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.sm,
							}}
						>
							<Badge label={activeMetric.label} size="sm" />
							<Badge label={lastUpdatedLabel} variant="info" size="sm" />
						</View>
					</View>
				</CardHeader>
				<CardBody>
					<View style={{ gap: theme.spacing.md }}>
						<SegmentedControl
							label="Layout mode"
							options={[
								{ label: 'Summary first', value: 'summary' },
								{ label: 'Dense analysis', value: 'dense' },
							]}
							value={layoutMode}
							onChange={(value) => setLayoutMode(value as LayoutMode)}
							testID={`${testID ?? 'data-layout-workspace'}-mode`}
						/>
						<ToggleSwitch
							label="Featured widgets"
							description="Feature cards remain optional so removing them never collapses the operational list below."
							value={featuredWidgetsVisible}
							onValueChange={setFeaturedWidgetsVisible}
						/>
					</View>
				</CardBody>
			</Card>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
				{METRICS.map((metric) => {
					const selected = metric.id === activeMetricId;
					return (
						<TouchableCard
							key={metric.id}
							testID={`${testID ?? 'data-layout-workspace'}-metric-${metric.id}`}
							onPress={() => setActiveMetricId(metric.id)}
							style={{
								flex: 1,
								minWidth: METRIC_CARD_MIN_WIDTH,
								borderWidth: theme.borderWidth.sm,
								borderColor: selected ? theme.colors.primary : theme.colors.border,
								backgroundColor: selected
									? theme.colors.surfaceVariant
									: theme.visual.surfaces.default,
								padding: theme.spacing.sm,
							}}
						>
							<StatCard
								label={metric.label}
								value={metric.value}
								trend={metric.trend}
								trendLabel={metric.trendLabel}
								density={compactMode ? 'compact' : 'default'}
								style={{ backgroundColor: 'transparent' }}
							/>
						</TouchableCard>
					);
				})}
			</View>

			{featuredWidgetsVisible ? (
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
					<Card variant="outlined" style={{ flex: 1, minWidth: FEATURED_CARD_MIN_WIDTH }}>
						<CardHeader>Featured spotlight</CardHeader>
						<CardBody>
							<ThemedText variant="bodyStrong">{activeMetric.label}</ThemedText>
							<ThemedText
								variant="caption"
								style={{
									color: theme.colors.onSurfaceVariant,
									marginTop: theme.spacing.xs,
								}}
							>
								This removable hero card can surface context or narrative without
								becoming a permanent dependency for the core workflow.
							</ThemedText>
						</CardBody>
					</Card>
					<Card variant="outlined" style={{ flex: 1, minWidth: FEATURED_CARD_MIN_WIDTH }}>
						<CardHeader>Optional insight widget</CardHeader>
						<CardBody>
							<ThemedText
								variant="caption"
								style={{ color: theme.colors.onSurfaceVariant }}
							>
								Managers can hide this widget without losing the drill-down list,
								sticky sections, or reorder controls below.
							</ThemedText>
						</CardBody>
					</Card>
				</View>
			) : null}

			{lastGestureAction ? (
				<AlertBanner
					variant="info"
					title="Latest interaction"
					description={lastGestureAction}
				/>
			) : null}

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
				<Card variant="outlined" style={{ flex: 2, minWidth: DETAIL_PANEL_MIN_WIDTH }}>
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
							<View>
								<ThemedText variant="bodyStrong">
									{activeMetric.label} drill-down
								</ThemedText>
								<ThemedText
									variant="caption"
									style={{
										color: theme.colors.onSurfaceVariant,
										marginTop: theme.spacing.xxs,
									}}
								>
									Metric taps redirect the dominant focus region into the matching
									records.
								</ThemedText>
							</View>
							<Button
								title="Refresh"
								size="sm"
								variant="secondary"
								onPress={refreshData}
							/>
						</View>
					</CardHeader>
					<CardBody>
						<VirtualizedList
							testID={`${testID ?? 'data-layout-workspace'}-records`}
							sections={sections}
							selectedKeys={selectedKeys}
							onSelectedKeysChange={setSelectedKeys}
							keyExtractor={(item) => item.id}
							density={compactMode ? 'compact' : 'default'}
							stickySectionHeadersEnabled
							onRefresh={refreshData}
							isRefreshing={isRefreshing}
							renderSectionHeader={(section) => (
								<Badge label={section.title} variant="neutral" size="sm" />
							)}
							renderItem={({ item, selected, toggleSelected }) => (
								<SwipeableRow
									onArchive={() =>
										setLastGestureAction(
											`${item.title} archived from the focused queue`,
										)
									}
									onDelete={() =>
										setLastGestureAction(
											`${item.title} flagged for escalation review`,
										)
									}
								>
									<ListItem
										title={item.title}
										subtitle={item.subtitle}
										density={compactMode ? 'compact' : 'default'}
										showChevron={false}
										onPress={toggleSelected}
										style={{
											backgroundColor: selected
												? theme.colors.surfaceVariant
												: theme.colors.card,
										}}
										rightElement={
											<Badge
												label={item.status}
												variant={
													item.status === 'Critical' ||
													item.status === 'Blocked'
														? 'error'
														: item.status === 'Escalated' ||
															  item.status === 'At risk'
															? 'warning'
															: 'info'
												}
												size="sm"
											/>
										}
									/>
								</SwipeableRow>
							)}
						/>
					</CardBody>
				</Card>

				<Card variant="outlined" style={{ flex: 1, minWidth: 300 }}>
					<CardHeader>Reorder within the same list</CardHeader>
					<CardBody>
						<SortableList
							testID={`${testID ?? 'data-layout-workspace'}-sortable`}
							items={reorderTasks}
							onItemsChange={(items) => {
								setReorderTasks(items);
								setLastGestureAction('Pinned widgets reordered with drag handles');
							}}
							renderItem={(item) => (
								<View style={{ gap: theme.spacing.xxs }}>
									<ThemedText variant="bodyStrong">{item.title}</ThemedText>
									<ThemedText
										variant="caption"
										style={{ color: theme.colors.onSurfaceVariant }}
									>
										{item.description}
									</ThemedText>
								</View>
							)}
						/>
					</CardBody>
				</Card>
			</View>

			<CollapsibleSection title="Optional analysis notes" defaultExpanded={compactMode}>
				<ThemedText variant="caption" style={{ color: theme.colors.onSurfaceVariant }}>
					Compact mode keeps the drag-and-drop controls, sticky sections, pull-to-refresh,
					and drill-down records intact while reducing padding for faster scanning.
				</ThemedText>
			</CollapsibleSection>
		</View>
	);
});

DataLayoutWorkspace.displayName = 'DataLayoutWorkspace';
