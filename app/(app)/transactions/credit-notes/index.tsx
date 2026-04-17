import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Plus, FileX } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { ThemeColors } from '@/src/theme';
import {
	MOCK_CREDIT_NOTES,
	type CreditNote,
	type CreditNoteStatus,
} from '@/src/mocks/transactions/creditNotes';
import { OPACITY_TINT_MEDIUM, SIZE_AVATAR_MD } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const EMPTY_SECTION_PADDING_VERTICAL = SIZE_AVATAR_MD;
const FAB_SHADOW_OPACITY = OPACITY_TINT_MEDIUM;
const CREDIT_NOTES_LIST_BOTTOM_PADDING = SPACING_PX['4xl'] + SPACING_PX.xl + SPACING_PX.md;

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
		refunded: { label: 'Refunded', bg: c.infoLight, color: c.info },
	};
}

export default function CreditNotesScreen() {
	const { c, r, theme } = useThemeTokens();
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
				style={[
					styles.row,
					{
						borderBottomColor: c.border,
						minHeight: SPACING_PX['4xl'] + SPACING_PX.md + SPACING_PX.xs,
					},
				]}
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
				contentContainerStyle={{ paddingBottom: CREDIT_NOTES_LIST_BOTTOM_PADDING }}
				ListEmptyComponent={
					<View style={styles.empty}>
						<FileX size={48} color={c.onSurfaceVariant} strokeWidth={1.5} />
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							align="center"
							style={{ marginTop: SPACING_PX.md }}
						>
							No credit notes found
						</ThemedText>
					</View>
				}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						borderRadius: r.full,
						shadowColor: c.shadow,
						...(theme.shadows.md || {}),
					},
				]}
				onPress={() => router.push('/(app)/transactions/credit-notes/create' as Href)}
				accessibilityLabel="new-credit-note"
				accessibilityRole="button"
			>
				<Plus size={20} color={c.white} />
				<ThemedText
					variant="caption"
					color={c.white}
					style={{ marginLeft: SPACING_PX.sm - SPACING_PX.xxs }}
				>
					New Return
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterBar: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.sm - SPACING_PX.xxs,
		borderWidth: 1,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	rowTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING_PX.xxs,
	},
	rowRight: {
		alignItems: 'flex-end',
		gap: SPACING_PX.sm - SPACING_PX.xxs,
		marginLeft: SPACING_PX.md,
	},
	badge: {
		paddingHorizontal: SPACING_PX.sm + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.xs,
	},
	fab: {
		position: 'absolute',
		bottom: SPACING_PX.xl,
		right: SPACING_PX.lg + SPACING_PX.xs,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.lg + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.md + SPACING_PX.xxs,
		shadowOffset: { width: 0, height: SPACING_PX.xxs },
		shadowOpacity: FAB_SHADOW_OPACITY,
		shadowRadius: SPACING_PX.xs,
	},
	empty: {
		paddingVertical: EMPTY_SECTION_PADDING_VERTICAL,
		alignItems: 'center',
	},
});
