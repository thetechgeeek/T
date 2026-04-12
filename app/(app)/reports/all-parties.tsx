import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, ChevronRight } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SearchBar } from '@/src/components/molecules/SearchBar';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import type { Customer } from '@/src/types/customer';
import type { Supplier } from '@/src/types/supplier';
import { layout } from '@/src/theme/layout';

type Tab = 'customers' | 'suppliers';
type Filter = 'all' | 'with-balance' | 'zero-balance';

const AVATAR_COLORS = [
	'#C1440E',
	'#1A8754',
	'#1D4ED8',
	'#B45309',
	'#7C3AED',
	'#0E7490',
	'#BE185D',
	'#047857',
];

function initials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? '')
		.join('');
}

function avatarColor(name: string): string {
	const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
	return AVATAR_COLORS[idx];
}

export default function AllPartiesScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const router = useRouter();

	const [tab, setTab] = useState<Tab>('customers');
	const [filter, setFilter] = useState<Filter>('all');
	const [search, setSearch] = useState('');
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [suppliersLoading, setSupliersLoading] = useState(false);

	const { customers, loading: customersLoading, fetchCustomers } = useCustomerStore();

	useEffect(() => {
		fetchCustomers(true).catch(() => {});
	}, [fetchCustomers]);

	useEffect(() => {
		if (tab === 'suppliers' && suppliers.length === 0) {
			supplierRepository
				.findMany({})
				.then((r) => setSuppliers((r.data as Supplier[]) ?? []))
				.catch(() => Alert.alert('Error', 'Failed to load suppliers'))
				.finally(() => setSupliersLoading(false));
		}
	}, [tab, suppliers.length]);

	const filteredCustomers = useMemo(() => {
		let list = customers;
		if (search) {
			const q = search.toLowerCase();
			list = list.filter(
				(c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q),
			);
		}
		if (filter === 'with-balance') list = list.filter((c) => (c.current_balance ?? 0) > 0);
		if (filter === 'zero-balance') list = list.filter((c) => (c.current_balance ?? 0) === 0);
		return list;
	}, [customers, search, filter]);

	const filteredSuppliers = useMemo(() => {
		let list = suppliers;
		if (search) {
			const q = search.toLowerCase();
			list = list.filter(
				(s) => s.name.toLowerCase().includes(q) || (s.phone ?? '').includes(q),
			);
		}
		return list;
	}, [suppliers, search]);

	const totalReceivable = useMemo(
		() => customers.reduce((a, c) => a + Math.max(0, c.current_balance ?? 0), 0),
		[customers],
	);
	const totalPayable = useMemo(
		() =>
			suppliers.reduce(
				(a, _s) => a + Math.max(0, 0 /* balance not on supplier type yet */),
				0,
			),
		[suppliers],
	);

	const isLoading = tab === 'customers' ? customersLoading : suppliersLoading;

	const renderCustomer = ({ item }: { item: Customer }) => {
		const balance = item.current_balance ?? 0;
		const color = avatarColor(item.name);
		return (
			<Pressable
				style={[styles.row, { borderBottomColor: c.border }]}
				onPress={() => router.push(`/(app)/customers/${item.id}`)}
				accessibilityRole="button"
				accessibilityLabel={item.name}
			>
				<View style={[styles.avatar, { backgroundColor: color }]}>
					<ThemedText variant="captionBold" color="#FFF">
						{initials(item.name)}
					</ThemedText>
				</View>
				<View style={{ flex: 1 }}>
					<ThemedText variant="bodyBold" numberOfLines={1}>
						{item.name}
					</ThemedText>
					{item.phone ? (
						<Pressable
							onPress={() => Linking.openURL(`tel:${item.phone}`)}
							style={layout.row}
							accessibilityRole="link"
							accessibilityLabel={`Call ${item.name}`}
						>
							<Phone
								size={12}
								color={c.onSurfaceVariant}
								style={{ marginRight: 4 }}
							/>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{item.phone}
							</ThemedText>
						</Pressable>
					) : null}
				</View>
				<View style={{ alignItems: 'flex-end' }}>
					{balance > 0 ? (
						<>
							<ThemedText variant="amount" color={c.error}>
								{formatCurrency(balance)}
							</ThemedText>
							<ThemedText variant="caption" color={c.error}>
								To Receive
							</ThemedText>
						</>
					) : balance < 0 ? (
						<>
							<ThemedText variant="amount" color={c.success}>
								{formatCurrency(Math.abs(balance))}
							</ThemedText>
							<ThemedText variant="caption" color={c.success}>
								Advance
							</ThemedText>
						</>
					) : (
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							Settled
						</ThemedText>
					)}
				</View>
				<ChevronRight size={16} color={c.onSurfaceVariant} style={{ marginLeft: s.sm }} />
			</Pressable>
		);
	};

	const renderSupplier = ({ item }: { item: Supplier }) => {
		const color = avatarColor(item.name);
		return (
			<Pressable
				style={[styles.row, { borderBottomColor: c.border }]}
				onPress={() => router.push(`/(app)/suppliers/${item.id}`)}
				accessibilityRole="button"
				accessibilityLabel={item.name}
			>
				<View style={[styles.avatar, { backgroundColor: color }]}>
					<ThemedText variant="captionBold" color="#FFF">
						{initials(item.name)}
					</ThemedText>
				</View>
				<View style={{ flex: 1 }}>
					<ThemedText variant="bodyBold" numberOfLines={1}>
						{item.name}
					</ThemedText>
					{item.phone ? (
						<Pressable
							onPress={() => Linking.openURL(`tel:${item.phone}`)}
							style={layout.row}
							accessibilityRole="link"
							accessibilityLabel={`Call ${item.name}`}
						>
							<Phone
								size={12}
								color={c.onSurfaceVariant}
								style={{ marginRight: 4 }}
							/>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{item.phone}
							</ThemedText>
						</Pressable>
					) : null}
					{item.city ? (
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{item.city}
						</ThemedText>
					) : null}
				</View>
				<ChevronRight size={16} color={c.onSurfaceVariant} />
			</Pressable>
		);
	};

	const FILTERS: { label: string; value: Filter }[] = [
		{ label: 'All', value: 'all' },
		{ label: 'With Balance', value: 'with-balance' },
		{ label: 'Settled', value: 'zero-balance' },
	];

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="All Parties" />

			{/* Summary card */}
			<View
				style={[
					styles.summaryRow,
					{ backgroundColor: c.surface, borderBottomColor: c.border },
				]}
			>
				<View style={styles.summaryItem}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						To Receive
					</ThemedText>
					<ThemedText variant="amount" color={c.error}>
						{formatCurrency(totalReceivable)}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{customers.filter((c) => (c.current_balance ?? 0) > 0).length} customers
					</ThemedText>
				</View>
				<View style={[styles.dividerV, { backgroundColor: c.border }]} />
				<View style={styles.summaryItem}>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						To Pay
					</ThemedText>
					<ThemedText variant="amount" color={c.warning}>
						{formatCurrency(totalPayable)}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{suppliers.length} suppliers
					</ThemedText>
				</View>
			</View>

			{/* Tab bar */}
			<View style={[styles.tabBar, { borderBottomColor: c.border }]}>
				{(['customers', 'suppliers'] as Tab[]).map((t) => (
					<Pressable
						key={t}
						onPress={() => {
							setTab(t);
							if (t === 'suppliers' && suppliers.length === 0) {
								setSupliersLoading(true);
							}
						}}
						style={[
							styles.tabBtn,
							tab === t && { borderBottomColor: c.primary, borderBottomWidth: 2 },
						]}
						accessibilityRole="tab"
						accessibilityState={{ selected: tab === t }}
					>
						<ThemedText
							variant="bodyBold"
							color={tab === t ? c.primary : c.onSurfaceVariant}
						>
							{t === 'customers' ? 'Customers' : 'Suppliers'}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Search + filter chips */}
			<View style={{ paddingHorizontal: s.md, paddingTop: s.sm }}>
				<SearchBar
					value={search}
					onChangeText={setSearch}
					placeholder="Search by name or phone..."
				/>
				{tab === 'customers' && (
					<View style={[layout.row, { gap: s.sm, marginTop: s.sm, marginBottom: s.xs }]}>
						{FILTERS.map((f) => (
							<Pressable
								key={f.value}
								onPress={() => setFilter(f.value)}
								style={[
									styles.filterChip,
									{
										borderColor: filter === f.value ? c.primary : c.border,
										backgroundColor: filter === f.value ? c.primary : c.surface,
										borderRadius: r.full,
									},
								]}
								accessibilityRole="button"
								accessibilityState={{ selected: filter === f.value }}
							>
								<ThemedText
									variant="caption"
									color={filter === f.value ? '#FFF' : c.onSurface}
								>
									{f.label}
								</ThemedText>
							</Pressable>
						))}
					</View>
				)}
			</View>

			{isLoading ? (
				<View style={{ padding: s.lg, gap: s.md }}>
					<SkeletonBlock height={60} borderRadius={r.md} />
					<SkeletonBlock height={60} borderRadius={r.md} />
					<SkeletonBlock height={60} borderRadius={r.md} />
				</View>
			) : tab === 'customers' ? (
				<FlatList
					data={filteredCustomers}
					keyExtractor={(item) => item.id}
					renderItem={renderCustomer}
					contentContainerStyle={{ paddingBottom: 32 }}
					ListEmptyComponent={
						<View style={styles.empty}>
							<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
								No customers found
							</ThemedText>
						</View>
					}
				/>
			) : (
				<FlatList
					data={filteredSuppliers}
					keyExtractor={(item) => item.id}
					renderItem={renderSupplier}
					contentContainerStyle={{ paddingBottom: 32 }}
					ListEmptyComponent={
						<View style={styles.empty}>
							<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
								No suppliers found
							</ThemedText>
						</View>
					}
				/>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	summaryRow: {
		flexDirection: 'row',
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	summaryItem: {
		flex: 1,
		alignItems: 'center',
	},
	dividerV: {
		width: StyleSheet.hairlineWidth,
		marginVertical: 4,
	},
	tabBar: {
		flexDirection: 'row',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	tabBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	filterChip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
	},
	empty: {
		paddingVertical: 40,
		alignItems: 'center',
	},
});
