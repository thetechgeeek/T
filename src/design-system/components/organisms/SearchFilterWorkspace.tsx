import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
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
import { ProgressIndicator } from '@/src/design-system/components/molecules/ProgressIndicator';
import {
	responsiveCardStyle,
	useResponsiveWorkbenchLayout,
} from '@/src/design-system/useResponsiveWorkbenchLayout';

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
const SEARCH_DEBOUNCE_MS = 300;
const FAST_SEARCH_LATENCY_MAX_MS = 100;
const FAST_SEARCH_LATENCY_MS = 80;
const MEDIUM_SEARCH_LATENCY_MAX_MS = 1000;
const MEDIUM_SEARCH_LATENCY_MS = 240;
const LONG_SEARCH_LATENCY_MS = 1400;
const LONG_SEARCH_INITIAL_PROGRESS = 18;
const LONG_SEARCH_PROGRESS_CEILING = 88;
const LONG_SEARCH_PROGRESS_STEP_MS = 220;
const LONG_SEARCH_PROGRESS_STEP_VALUE = 12;
const LONG_SEARCH_COMPLETE_PROGRESS = 100;

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

function resolveSearchLatencyMs(query: string) {
	const normalizedQuery = query.trim();
	if (normalizedQuery.length === 0) {
		return 0;
	}
	if (normalizedQuery.length <= 4) {
		return FAST_SEARCH_LATENCY_MS;
	}
	if (normalizedQuery.length <= 10) {
		return MEDIUM_SEARCH_LATENCY_MS;
	}
	return LONG_SEARCH_LATENCY_MS;
}

export const SearchFilterWorkspace = forwardRef<
	React.ElementRef<typeof View>,
	SearchFilterWorkspaceProps
>(({ style, testID }, ref) => {
	const { theme } = useTheme();
	const { isCompactPhone } = useResponsiveWorkbenchLayout();
	const [query, setQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [applyMode, setApplyMode] = useState<'live' | 'apply'>('live');
	const [topFilter, setTopFilter] = useState('all');
	const [draftStatus, setDraftStatus] = useState('Open');
	const [appliedStatus, setAppliedStatus] = useState('Open');
	const [appliedQuery, setAppliedQuery] = useState('');
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
	const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'progress'>('idle');
	const [searchProgress, setSearchProgress] = useState(0);
	const [searchEstimateMs, setSearchEstimateMs] = useState<number | null>(null);

	const resetSearchFeedback = useCallback(() => {
		setSearchStatus('idle');
		setSearchProgress(0);
		setSearchEstimateMs(null);
	}, []);

	const startLoadingFeedback = useCallback(() => {
		setSearchStatus('loading');
		setSearchProgress(0);
		setSearchEstimateMs(null);
	}, []);

	const startProgressFeedback = useCallback((latencyMs: number) => {
		setSearchStatus('progress');
		setSearchProgress(LONG_SEARCH_INITIAL_PROGRESS);
		setSearchEstimateMs(latencyMs);
	}, []);

	const applySearchResult = useCallback(
		(nextQuery: string) => {
			setAppliedQuery(nextQuery);
			resetSearchFeedback();
		},
		[resetSearchFeedback],
	);

	const activeStatus = applyMode === 'live' ? draftStatus : appliedStatus;
	const activeAmountFloor = applyMode === 'live' ? amountFloor : appliedAmountFloor;
	const activeDateAfter = applyMode === 'live' ? dateAfter : appliedDateAfter;

	useEffect(() => {
		if (applyMode === 'apply') {
			let cancelled = false;
			queueMicrotask(() => {
				if (!cancelled) {
					resetSearchFeedback();
				}
			});
			return () => {
				cancelled = true;
			};
		}

		const latencyMs = resolveSearchLatencyMs(debouncedQuery);
		if (latencyMs === 0) {
			let cancelled = false;
			queueMicrotask(() => {
				if (!cancelled) {
					applySearchResult('');
				}
			});
			return () => {
				cancelled = true;
			};
		}

		if (latencyMs <= FAST_SEARCH_LATENCY_MAX_MS) {
			let cancelled = false;
			queueMicrotask(() => {
				if (!cancelled) {
					applySearchResult(debouncedQuery);
				}
			});
			return () => {
				cancelled = true;
			};
		}

		if (latencyMs <= MEDIUM_SEARCH_LATENCY_MAX_MS) {
			let cancelled = false;
			queueMicrotask(() => {
				if (!cancelled) {
					startLoadingFeedback();
				}
			});
			const timer = setTimeout(() => {
				applySearchResult(debouncedQuery);
			}, latencyMs);

			return () => {
				cancelled = true;
				clearTimeout(timer);
			};
		}

		let cancelled = false;
		queueMicrotask(() => {
			if (!cancelled) {
				startProgressFeedback(latencyMs);
			}
		});
		const progressInterval = setInterval(() => {
			setSearchProgress((current) =>
				Math.min(current + LONG_SEARCH_PROGRESS_STEP_VALUE, LONG_SEARCH_PROGRESS_CEILING),
			);
		}, LONG_SEARCH_PROGRESS_STEP_MS);
		const finishTimer = setTimeout(() => {
			clearInterval(progressInterval);
			setSearchProgress(LONG_SEARCH_COMPLETE_PROGRESS);
			setAppliedQuery(debouncedQuery);
			resetSearchFeedback();
		}, latencyMs);

		return () => {
			cancelled = true;
			clearInterval(progressInterval);
			clearTimeout(finishTimer);
		};
	}, [
		applyMode,
		applySearchResult,
		debouncedQuery,
		resetSearchFeedback,
		startLoadingFeedback,
		startProgressFeedback,
	]);

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
				appliedQuery.trim().length === 0 ||
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
	}, [activeAmountFloor, activeStatus, appliedQuery, topFilter]);

	const activeFilterPills = [
		`Status: ${activeStatus}`,
		`Min amount: ₹${activeAmountFloor.toLocaleString('en-IN')}`,
		`After: ${activeDateAfter}`,
		...facetIds.map((id) => FACETS.find((facet) => facet.id === id)?.label ?? id),
	];

	const applyDraftFilters = () => {
		setAppliedQuery(query);
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
						{isCompactPhone ? (
							<View style={{ gap: theme.spacing.sm }}>
								<SearchBar
									value={query}
									onChangeText={setQuery}
									onDebouncedChange={setDebouncedQuery}
									debounceMs={SEARCH_DEBOUNCE_MS}
									placeholder="Search customers, projects, or approval packs"
									loading={searchStatus === 'loading'}
									loadingAccessibilityLabel="Search loading"
									testID={`${testID ?? 'search-filter-workspace'}-search`}
								/>
								<View
									style={{
										flexDirection: 'row',
										flexWrap: 'wrap',
										gap: theme.spacing.sm,
									}}
								>
									<Button
										title="Back"
										variant="ghost"
										size="sm"
										onPress={() => setQuery('')}
									/>
									<Button
										title="Cancel"
										variant="ghost"
										size="sm"
										onPress={() => setQuery('')}
									/>
								</View>
							</View>
						) : (
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
										onDebouncedChange={setDebouncedQuery}
										debounceMs={SEARCH_DEBOUNCE_MS}
										placeholder="Search customers, projects, or approval packs"
										loading={searchStatus === 'loading'}
										loadingAccessibilityLabel="Search loading"
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
						)}

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
												accessibilityRole="button"
												accessibilityLabel={suggestion}
												accessibilityHint="Double tap to use this suggested search"
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
						{searchStatus === 'progress' ? (
							<Card variant="outlined" density="compact">
								<CardHeader>Large query progress</CardHeader>
								<CardBody>
									<View style={{ gap: theme.spacing.sm }}>
										<ProgressIndicator
											variant="linear"
											value={searchProgress}
											label={`About ${Math.ceil((searchEstimateMs ?? 0) / 1000)}s remaining`}
										/>
										<ThemedText
											variant="caption"
											style={{ color: theme.colors.onSurfaceVariant }}
										>
											Searches longer than one second show progress with an
											estimate instead of an indeterminate spinner.
										</ThemedText>
									</View>
								</CardBody>
							</Card>
						) : null}
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
				<Card
					variant="outlined"
					style={responsiveCardStyle(isCompactPhone, FILTER_PANEL_MIN_WIDTH)}
				>
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

				<Card
					variant="outlined"
					style={responsiveCardStyle(isCompactPhone, FILTER_PANEL_MIN_WIDTH)}
				>
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
				<Card
					variant="outlined"
					style={responsiveCardStyle(isCompactPhone, FILTER_PANEL_MIN_WIDTH)}
				>
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

				<Card
					variant="outlined"
					style={responsiveCardStyle(isCompactPhone, FILTER_PANEL_MIN_WIDTH)}
				>
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
