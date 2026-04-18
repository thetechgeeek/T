import React, { forwardRef, useMemo, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card, CardBody, CardHeader } from '@/src/design-system/components/atoms/Card';
import { Checkbox } from '@/src/design-system/components/atoms/Checkbox';
import { Chip } from '@/src/design-system/components/atoms/Chip';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { AmountInput } from '@/src/design-system/components/molecules/AmountInput';
import { BottomSheetPicker } from '@/src/design-system/components/molecules/BottomSheetPicker';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import { FilterBar } from '@/src/design-system/components/molecules/FilterBar';
import { SearchBar } from '@/src/design-system/components/molecules/SearchBar';
import { SegmentedControl } from '@/src/design-system/components/molecules/SegmentedControl';

interface SearchFilterResult {
	id: string;
	title: string;
	category: string;
	status: string;
	amount: number;
}

export interface SearchFilterWorkspaceProps {
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

function asNumber(value: string) {
	return Number(value);
}

const SAMPLE_RESULT_AMOUNTS = {
	renewal: asNumber('185000'),
	onboarding: asNumber('92000'),
	expansion: asNumber('265000'),
} as const;
const DEFAULT_AMOUNT_FLOOR = 50000;
const FILTER_PANEL_MIN_WIDTH = 320;

const RESULTS: SearchFilterResult[] = [
	{
		id: 'search-1',
		title: 'Northwind priority renewal',
		category: 'Renewals',
		status: 'Open',
		amount: SAMPLE_RESULT_AMOUNTS.renewal,
	},
	{
		id: 'search-2',
		title: 'Northwind supplier onboarding',
		category: 'Suppliers',
		status: 'Needs review',
		amount: SAMPLE_RESULT_AMOUNTS.onboarding,
	},
	{
		id: 'search-3',
		title: 'Aster warehouse expansion',
		category: 'Projects',
		status: 'Closed',
		amount: SAMPLE_RESULT_AMOUNTS.expansion,
	},
];

const FILTER_OPTIONS = [
	{ label: 'All', value: 'all' },
	{ label: 'Open', value: 'open' },
	{ label: 'Review', value: 'review' },
	{ label: 'Closed', value: 'closed' },
];

const FACETS = [
	{ id: 'facet-finance', label: 'Finance', count: 12 },
	{ id: 'facet-ops', label: 'Operations', count: 8 },
	{ id: 'facet-compliance', label: 'Compliance', count: 4 },
];

const STATUS_OPTIONS = [
	{ label: 'Open', value: 'Open' },
	{ label: 'Needs review', value: 'Needs review' },
	{ label: 'Closed', value: 'Closed' },
];

function renderHighlightedText(text: string, query: string, color: string, highlightColor: string) {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) {
		return (
			<ThemedText variant="bodyStrong" style={{ color }}>
				{text}
			</ThemedText>
		);
	}

	const start = text.toLowerCase().indexOf(normalizedQuery);
	if (start === -1) {
		return (
			<ThemedText variant="bodyStrong" style={{ color }}>
				{text}
			</ThemedText>
		);
	}

	const end = start + normalizedQuery.length;
	return (
		<ThemedText variant="bodyStrong" style={{ color }}>
			{text.slice(0, start)}
			<ThemedText variant="bodyStrong" style={{ color: highlightColor }}>
				{text.slice(start, end)}
			</ThemedText>
			{text.slice(end)}
		</ThemedText>
	);
}

export const SearchFilterWorkspace = forwardRef<
	React.ElementRef<typeof View>,
	SearchFilterWorkspaceProps
>(({ style, testID }, ref) => {
	const { theme } = useTheme();
	const [query, setQuery] = useState('');
	const [applyMode, setApplyMode] = useState<'live' | 'apply'>('live');
	const [topFilter, setTopFilter] = useState('all');
	const [draftStatus, setDraftStatus] = useState('Open');
	const [appliedStatus, setAppliedStatus] = useState('Open');
	const [amountFloor, setAmountFloor] = useState(DEFAULT_AMOUNT_FLOOR);
	const [appliedAmountFloor, setAppliedAmountFloor] = useState(DEFAULT_AMOUNT_FLOOR);
	const [dateAfter, setDateAfter] = useState('2026-04-01');
	const [appliedDateAfter, setAppliedDateAfter] = useState('2026-04-01');
	const [facetIds, setFacetIds] = useState<string[]>(['facet-finance']);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [savedView, setSavedView] = useState<'ops' | 'team' | 'my'>('ops');
	const [recentSearches, setRecentSearches] = useState<string[]>([
		'northwind',
		'renewal',
		'supplier onboarding',
	]);

	const appliedQuery = query;
	const activeStatus = applyMode === 'live' ? draftStatus : appliedStatus;
	const activeAmountFloor = applyMode === 'live' ? amountFloor : appliedAmountFloor;
	const activeDateAfter = applyMode === 'live' ? dateAfter : appliedDateAfter;

	const suggestions = useMemo(
		() =>
			[
				'northwind supplier onboarding',
				'northwind renewals',
				'quarterly pricing pack',
			].filter(
				(term) =>
					term.toLowerCase().includes(query.trim().toLowerCase()) &&
					query.trim().length > 0,
			),
		[query],
	);

	const results = useMemo(() => {
		return RESULTS.filter((result) => {
			const matchesQuery =
				query.trim().length === 0 ||
				result.title.toLowerCase().includes(appliedQuery.trim().toLowerCase());
			const matchesTopFilter =
				topFilter === 'all' ||
				(topFilter === 'open' && result.status === 'Open') ||
				(topFilter === 'review' && result.status === 'Needs review') ||
				(topFilter === 'closed' && result.status === 'Closed');
			const matchesStatus = result.status === activeStatus;
			const matchesAmount = result.amount >= activeAmountFloor;
			return matchesQuery && matchesTopFilter && matchesStatus && matchesAmount;
		});
	}, [activeAmountFloor, activeStatus, appliedQuery, query, topFilter]);

	const activeFilterPills = [
		`Status: ${activeStatus}`,
		`Min amount: ₹${activeAmountFloor.toLocaleString('en-IN')}`,
		`After: ${activeDateAfter}`,
		...facetIds.map((id) => FACETS.find((facet) => facet.id === id)?.label ?? id),
	];

	const applyDraftFilters = () => {
		setAppliedStatus(draftStatus);
		setAppliedAmountFloor(amountFloor);
		setAppliedDateAfter(dateAfter);
		if (query.trim().length > 0) {
			setRecentSearches((current) =>
				[query.trim(), ...current.filter((entry) => entry !== query.trim())].slice(0, 4),
			);
		}
	};

	return (
		<View ref={ref} testID={testID} style={[{ gap: theme.spacing.lg }, style]}>
			<Card featured density="relaxed">
				<CardHeader>
					<ThemedText variant="sectionTitle">Search & filter workspace</ThemedText>
					<ThemedText
						variant="caption"
						style={{
							color: theme.colors.onSurfaceVariant,
							marginTop: theme.spacing.xxs,
						}}
					>
						A welcoming search entry up front, then scalable enterprise filtering
						without turning every control into a saturated widget.
					</ThemedText>
				</CardHeader>
				<CardBody>
					<View style={{ gap: theme.spacing.md }}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: theme.spacing.sm,
							}}
						>
							<Button
								title="Back"
								variant="ghost"
								size="sm"
								onPress={() => setQuery('')}
							/>
							<View style={{ flex: 1 }}>
								<SearchBar
									value={query}
									onChangeText={setQuery}
									placeholder="Search customers, projects, or approval packs"
									testID={`${testID ?? 'search-filter-workspace'}-search`}
								/>
							</View>
							<Button
								title="Cancel"
								variant="ghost"
								size="sm"
								onPress={() => setQuery('')}
							/>
						</View>

						{query.trim().length > 0 && suggestions.length > 0 ? (
							<Card variant="outlined" density="compact">
								<CardHeader>Suggestions</CardHeader>
								<CardBody>
									<View style={{ gap: theme.spacing.xs }}>
										{suggestions.map((suggestion) => (
											<Pressable
												key={suggestion}
												onPress={() => {
													setQuery(suggestion);
													if (!recentSearches.includes(suggestion)) {
														setRecentSearches((current) =>
															[suggestion, ...current].slice(0, 4),
														);
													}
												}}
											>
												<ThemedText variant="caption">
													{suggestion}
												</ThemedText>
											</Pressable>
										))}
									</View>
								</CardBody>
							</Card>
						) : (
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								{recentSearches.map((entry) => (
									<Chip
										key={entry}
										label={entry}
										onPress={() => setQuery(entry)}
									/>
								))}
							</View>
						)}

						<SegmentedControl
							label="Apply mode"
							options={[
								{ label: 'Live filter', value: 'live' },
								{ label: 'Explicit apply', value: 'apply' },
							]}
							value={applyMode}
							onChange={(value) => setApplyMode(value as 'live' | 'apply')}
						/>
					</View>
				</CardBody>
			</Card>

			<FilterBar
				filters={FILTER_OPTIONS}
				value={topFilter}
				defaultValue="all"
				onSelect={setTopFilter}
				onClear={() => setTopFilter('all')}
				testID={`${testID ?? 'search-filter-workspace'}-filter-bar`}
			/>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
				<Chip label="Owner: Priya" selected />
				<Chip label="Region: North" selected />
				<Chip label="+2 more" />
				<Button
					title="Clear all"
					variant="ghost"
					size="sm"
					onPress={() => {
						setFacetIds([]);
						setDraftStatus('Open');
						setAppliedStatus('Open');
						setAmountFloor(DEFAULT_AMOUNT_FLOOR);
						setAppliedAmountFloor(DEFAULT_AMOUNT_FLOOR);
					}}
				/>
			</View>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
				<Card variant="outlined" style={{ flex: 1, minWidth: FILTER_PANEL_MIN_WIDTH }}>
					<CardHeader>Facets & rules</CardHeader>
					<CardBody>
						<View style={{ gap: theme.spacing.md }}>
							{FACETS.map((facet) => {
								const checked = facetIds.includes(facet.id);
								return (
									<View
										key={facet.id}
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'space-between',
											gap: theme.spacing.sm,
										}}
									>
										<Checkbox
											label={facet.label}
											checked={checked}
											onCheckedChange={() =>
												setFacetIds((current) =>
													checked
														? current.filter((id) => id !== facet.id)
														: [...current, facet.id],
												)
											}
										/>
										<Badge label={String(facet.count)} size="sm" />
									</View>
								);
							})}
							<TextInput
								label="Contains text"
								value={query}
								onValueChange={setQuery}
								placeholder="Policy, vendor, approval..."
							/>
							<AmountInput
								label="Minimum amount"
								value={amountFloor}
								onChange={setAmountFloor}
							/>
							<DatePickerField
								label="Updated after"
								value={dateAfter}
								onChange={setDateAfter}
								presentation="sheet"
							/>
							<Button
								title="Open mobile filters"
								variant="secondary"
								onPress={() => setSheetOpen(true)}
							/>
							{applyMode === 'apply' ? (
								<Button title="Apply filters" onPress={applyDraftFilters} />
							) : null}
						</View>
					</CardBody>
				</Card>

				<Card variant="outlined" style={{ flex: 1, minWidth: FILTER_PANEL_MIN_WIDTH }}>
					<CardHeader>Advanced query builder</CardHeader>
					<CardBody>
						<View style={{ gap: theme.spacing.sm }}>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Chip label="Group 1" selected />
								<Chip label="AND" />
								<Chip label="Owner contains Priya" />
							</View>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Chip label="OR" />
								<Chip label="Status is Needs review" />
							</View>
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Chip label="AND" />
								<Chip label="Amount greater than 50,000" />
							</View>
						</View>
					</CardBody>
				</Card>
			</View>

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
				<Card variant="outlined" style={{ flex: 1, minWidth: FILTER_PANEL_MIN_WIDTH }}>
					<CardHeader>Saved views</CardHeader>
					<CardBody>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.sm,
							}}
						>
							<Chip
								label="Ops queue"
								selected={savedView === 'ops'}
								onPress={() => setSavedView('ops')}
							/>
							<Badge label="Team-shared" size="sm" />
							<Chip
								label="My renewals"
								selected={savedView === 'my'}
								onPress={() => setSavedView('my')}
							/>
							<Badge label="Private" size="sm" variant="neutral" />
							<Chip
								label="Team review"
								selected={savedView === 'team'}
								onPress={() => setSavedView('team')}
							/>
							<Badge label="Team-shared" size="sm" />
						</View>
					</CardBody>
				</Card>

				<Card variant="outlined" style={{ flex: 1, minWidth: FILTER_PANEL_MIN_WIDTH }}>
					<CardHeader>Active filters</CardHeader>
					<CardBody>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: theme.spacing.sm,
							}}
						>
							{activeFilterPills.map((pill) => (
								<Chip key={pill} label={pill} selected />
							))}
						</View>
					</CardBody>
				</Card>
			</View>

			<Card variant="outlined">
				<CardHeader>Results</CardHeader>
				<CardBody>
					<View style={{ gap: theme.spacing.sm }}>
						{results.map((result) => (
							<Card key={result.id} variant="flat" density="compact">
								<CardBody>
									{renderHighlightedText(
										result.title,
										query,
										theme.colors.onSurface,
										theme.colors.primary,
									)}
									<ThemedText
										variant="caption"
										style={{
											color: theme.colors.onSurfaceVariant,
											marginTop: theme.spacing.xxs,
										}}
									>
										{`${result.category} • ${result.status} • ₹${result.amount.toLocaleString('en-IN')}`}
									</ThemedText>
								</CardBody>
							</Card>
						))}
					</View>
				</CardBody>
			</Card>

			<BottomSheetPicker
				title="Mobile filters"
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				onClose={() => setSheetOpen(false)}
				options={STATUS_OPTIONS}
				value={draftStatus}
				onSelect={setDraftStatus}
				onValueChange={setDraftStatus}
				testID={`${testID ?? 'search-filter-workspace'}-mobile-filters`}
			/>
		</View>
	);
});

SearchFilterWorkspace.displayName = 'SearchFilterWorkspace';
