import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Plus, FileX } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { ThemeColors } from '@/src/theme';
import { palette } from '@/src/theme/palette';

type CreditNoteStatus = 'open' | 'adjusted' | 'refunded';

interface CreditNote {
	id: string;
	cn_number: string;
	date: string;
	customer_name: string;
	original_invoice: string;
	amount: number;
	reason: string;
	status: CreditNoteStatus;
}

const MOCK_CREDIT_NOTES: CreditNote[] = [
	{
		id: '1',
		cn_number: 'CN-001',
		date: '2025-04-08',
		customer_name: 'Rajesh Kumar',
		original_invoice: 'INV-042',
		amount: 5000,
		reason: 'Defective goods',
		status: 'open',
	},
	{
		id: '2',
		cn_number: 'CN-002',
		date: '2025-04-05',
		customer_name: 'Sharma Tiles',
		original_invoice: 'INV-038',
		amount: 12500,
		reason: 'Wrong item delivered',
		status: 'adjusted',
	},
	{
		id: '3',
		cn_number: 'CN-003',
		date: '2025-03-28',
		customer_name: 'Patel Construction',
		original_invoice: 'INV-031',
		amount: 3200,
		reason: 'Price difference',
		status: 'refunded',
	},
];

type FilterType = 'all' | CreditNoteStatus;

const FILTERS: { label: string; value: FilterType }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Open', value: 'open' },
	{ label: 'Adjusted', value: 'adjusted' },
	{ label: 'Refunded', value: 'refunded' },
];

function creditNoteStatusConfig(
	c: ThemeColors,
): Record<CreditNoteStatus, { label: string; bg: string; color: string }> {
	return {
		open: { label: 'Open', bg: c.warningLight, color: c.partial },
		adjusted: { label: 'Adjusted', bg: c.successLight, color: c.paid },
		refunded: { label: 'Refunded', bg: c.infoLight, color: palette.statusInfoFg },
	};
}

export default function CreditNotesScreen() {
	const { c, r } = useThemeTokens();
	const STATUS_CONFIG = creditNoteStatusConfig(c);
	const { formatCurrency, formatDate } = useLocale();
	const router = useRouter();
	const [activeFilter, setActiveFilter] = useState<FilterType>('all');

	const filtered =
		activeFilter === 'all'
			? MOCK_CREDIT_NOTES
			: MOCK_CREDIT_NOTES.filter((cn) => cn.status === activeFilter);

	const renderItem = ({ item }: { item: CreditNote }) => {
		const statusCfg = STATUS_CONFIG[item.status];
		return (
			<Pressable
				style={[styles.row, { borderBottomColor: c.border, minHeight: 80 }]}
				onPress={() => Alert.alert('Credit note detail coming soon')}
				accessibilityRole="button"
				accessibilityLabel={item.cn_number}
			>
				<View style={{ flex: 1, justifyContent: 'center' }}>
					<View style={styles.rowTop}>
						<ThemedText variant="bodyBold">{item.cn_number}</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{formatDate(item.date)}
						</ThemedText>
					</View>
					<ThemedText variant="body" color={c.onSurfaceVariant} numberOfLines={1}>
						{item.customer_name}
					</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant} numberOfLines={1}>
						Against: {item.original_invoice} · {item.reason}
					</ThemedText>
				</View>
				<View style={styles.rowRight}>
					<ThemedText variant="amount" color={c.error}>
						{formatCurrency(item.amount)}
					</ThemedText>
					<View
						style={[
							styles.badge,
							{ backgroundColor: statusCfg.bg, borderRadius: r.full },
						]}
					>
						<ThemedText variant="caption" color={statusCfg.color}>
							{statusCfg.label}
						</ThemedText>
					</View>
				</View>
			</Pressable>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Credit Notes / Sales Returns" />

			{/* Filter chips */}
			<View style={[styles.filterBar, { borderBottomColor: c.border }]}>
				{FILTERS.map((f) => {
					const active = activeFilter === f.value;
					return (
						<Pressable
							key={f.value}
							onPress={() => setActiveFilter(f.value)}
							style={[
								styles.chip,
								{
									backgroundColor: active ? c.primary : c.surface,
									borderColor: active ? c.primary : c.border,
									borderRadius: r.full,
								},
							]}
							accessibilityRole="button"
							accessibilityState={{ selected: active }}
						>
							<ThemedText
								variant="caption"
								color={active ? c.onPrimary : c.onSurface}
							>
								{f.label}
							</ThemedText>
						</Pressable>
					);
				})}
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 100 }}
				ListEmptyComponent={
					<View style={styles.empty}>
						<FileX size={48} color={c.onSurfaceVariant} strokeWidth={1.5} />
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							align="center"
							style={{ marginTop: 12 }}
						>
							No credit notes found
						</ThemedText>
					</View>
				}
			/>

			{/* FAB */}
			<Pressable
				style={[styles.fab, { backgroundColor: c.primary, borderRadius: r.full }]}
				onPress={() => router.push('/(app)/transactions/credit-notes/create' as Href)}
				accessibilityLabel="new-credit-note"
				accessibilityRole="button"
			>
				<Plus size={20} color={palette.white} />
				<ThemedText variant="caption" color={palette.white} style={{ marginLeft: 6 }}>
					New Return
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterBar: {
		flexDirection: 'row',
		gap: 8,
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
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	rowTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 2,
	},
	rowRight: {
		alignItems: 'flex-end',
		gap: 6,
		marginLeft: 12,
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
		shadowColor: palette.shadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	empty: {
		paddingVertical: 60,
		alignItems: 'center',
	},
});
