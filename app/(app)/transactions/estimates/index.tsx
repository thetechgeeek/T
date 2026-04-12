import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Plus, FileText } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

type EstimateStatus = 'open' | 'accepted' | 'expired' | 'converted';

interface Estimate {
	id: string;
	est_number: string;
	date: string;
	valid_until: string;
	customer_name: string;
	amount: number;
	status: EstimateStatus;
}

const MOCK_ESTIMATES: Estimate[] = [
	{
		id: '1',
		est_number: 'EST-001',
		date: '2025-04-08',
		valid_until: '2025-04-22',
		customer_name: 'Sharma Tiles',
		amount: 45000,
		status: 'open',
	},
	{
		id: '2',
		est_number: 'EST-002',
		date: '2025-04-05',
		valid_until: '2025-04-12',
		customer_name: 'Patel Construction',
		amount: 120000,
		status: 'accepted',
	},
	{
		id: '3',
		est_number: 'EST-003',
		date: '2025-03-20',
		valid_until: '2025-04-03',
		customer_name: 'Mehta Builders',
		amount: 78000,
		status: 'expired',
	},
];

type FilterType = 'all' | EstimateStatus;

const FILTERS: { label: string; value: FilterType }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Open', value: 'open' },
	{ label: 'Accepted', value: 'accepted' },
	{ label: 'Expired', value: 'expired' },
	{ label: 'Converted', value: 'converted' },
];

const STATUS_CONFIG: Record<EstimateStatus, { label: string; bg: string; color: string }> = {
	open: { label: 'Open', bg: '#FEF3C7', color: '#92400E' },
	accepted: { label: 'Accepted', bg: '#D1FAE5', color: '#065F46' },
	expired: { label: 'Expired', bg: '#FEE2E2', color: '#991B1B' },
	converted: { label: 'Converted', bg: '#DBEAFE', color: '#1E40AF' },
};

function isExpired(validUntil: string): boolean {
	return new Date(validUntil) < new Date();
}

export default function EstimatesScreen() {
	const { c, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const [activeFilter, setActiveFilter] = useState<FilterType>('all');

	const filtered =
		activeFilter === 'all'
			? MOCK_ESTIMATES
			: MOCK_ESTIMATES.filter((e) => e.status === activeFilter);

	const renderItem = ({ item }: { item: Estimate }) => {
		const statusCfg = STATUS_CONFIG[item.status];
		const expired = isExpired(item.valid_until);
		return (
			<Pressable
				style={[styles.row, { borderBottomColor: c.border }]}
				onPress={() =>
					Alert.alert(
						'Convert to Invoice',
						'Converting to Invoice: navigate to invoice create with pre-filled data',
					)
				}
				accessibilityRole="button"
				accessibilityLabel={item.est_number}
			>
				<View style={{ flex: 1 }}>
					<View style={styles.rowTop}>
						<ThemedText variant="bodyBold">{item.est_number}</ThemedText>
						<ThemedText variant="amount">{formatCurrency(item.amount)}</ThemedText>
					</View>
					<ThemedText variant="body" color={c.onSurfaceVariant} numberOfLines={1}>
						{item.customer_name}
					</ThemedText>
					<View style={styles.rowBottom}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{formatDate(item.date)}
						</ThemedText>
						<View style={styles.rightMeta}>
							<ThemedText
								variant="caption"
								color={expired ? c.error : c.onSurfaceVariant}
							>
								Valid until {formatDate(item.valid_until)}
							</ThemedText>
							<View
								style={[
									styles.badge,
									{
										backgroundColor: statusCfg.bg,
										borderRadius: r.full,
									},
								]}
							>
								<ThemedText variant="caption" color={statusCfg.color}>
									{statusCfg.label}
								</ThemedText>
							</View>
						</View>
					</View>
				</View>
			</Pressable>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Estimates / Quotations" />

			{/* Filter chips */}
			<View style={[styles.filterBar, { borderBottomColor: c.border }]}>
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					data={FILTERS}
					keyExtractor={(f) => f.value}
					renderItem={({ item: f }) => {
						const active = activeFilter === f.value;
						return (
							<Pressable
								onPress={() => setActiveFilter(f.value)}
								style={[
									styles.chip,
									{
										backgroundColor: active ? c.primary : c.surface,
										borderColor: active ? c.primary : c.border,
										borderRadius: r.full,
										marginRight: 8,
									},
								]}
								accessibilityRole="button"
								accessibilityState={{ selected: active }}
							>
								<ThemedText variant="caption" color={active ? '#FFF' : c.onSurface}>
									{f.label}
								</ThemedText>
							</Pressable>
						);
					}}
				/>
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 100 }}
				ListEmptyComponent={
					<View style={styles.empty}>
						<FileText size={48} color={c.onSurfaceVariant} strokeWidth={1.5} />
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							align="center"
							style={{ marginTop: 12 }}
						>
							No estimates found
						</ThemedText>
					</View>
				}
			/>

			{/* FAB */}
			<Pressable
				style={[styles.fab, { backgroundColor: c.primary, borderRadius: r.full }]}
				onPress={() => router.push('/(app)/transactions/estimates/create' as Href)}
				accessibilityLabel="new-estimate"
				accessibilityRole="button"
			>
				<Plus size={20} color="#FFF" />
				<ThemedText variant="caption" color="#FFF" style={{ marginLeft: 6 }}>
					New Estimate
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterBar: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderWidth: 1,
	},
	row: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	rowTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 2,
	},
	rowBottom: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4,
	},
	rightMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 3,
	},
	fab: {
		position: 'absolute',
		bottom: 24,
		right: 20,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 14,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	empty: {
		paddingVertical: 60,
		alignItems: 'center',
	},
});
