import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Plus, FileText } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { ThemeColors } from '@/src/theme';
import {
	MOCK_ESTIMATES,
	type Estimate,
	type EstimateStatus,
} from '@/src/mocks/transactions/estimates';
import { OPACITY_TINT_MEDIUM, SIZE_AVATAR_MD } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const EMPTY_SECTION_PADDING_VERTICAL = SIZE_AVATAR_MD;
const FAB_SHADOW_OPACITY = OPACITY_TINT_MEDIUM;
const ESTIMATES_LIST_BOTTOM_PADDING = SPACING_PX['4xl'] + SPACING_PX.xl + SPACING_PX.md;

type FilterType = 'all' | EstimateStatus;

const FILTERS: { label: string; value: FilterType }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Open', value: 'open' },
	{ label: 'Accepted', value: 'accepted' },
	{ label: 'Expired', value: 'expired' },
	{ label: 'Converted', value: 'converted' },
];

function estimateStatusConfig(
	c: ThemeColors,
): Record<EstimateStatus, { label: string; bg: string; color: string }> {
	return {
		open: { label: 'Open', bg: c.warningLight, color: c.partial },
		accepted: { label: 'Accepted', bg: c.successLight, color: c.paid },
		expired: { label: 'Expired', bg: c.errorLight, color: c.unpaid },
		converted: { label: 'Converted', bg: c.infoLight, color: c.info },
	};
}

function isExpired(validUntil: string): boolean {
	return new Date(validUntil) < new Date();
}

export default function EstimatesScreen() {
	const { c, r, theme } = useThemeTokens();
	const STATUS_CONFIG = estimateStatusConfig(c);
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
										marginRight: SPACING_PX.sm,
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
					}}
				/>
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: ESTIMATES_LIST_BOTTOM_PADDING }}
				ListEmptyComponent={
					<View style={styles.empty}>
						<FileText size={48} color={c.onSurfaceVariant} strokeWidth={1.5} />
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							align="center"
							style={{ marginTop: SPACING_PX.md }}
						>
							No estimates found
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
				onPress={() => router.push('/(app)/transactions/estimates/create' as Href)}
				accessibilityLabel="new-estimate"
				accessibilityRole="button"
			>
				<Plus size={20} color={c.white} />
				<ThemedText
					variant="caption"
					color={c.white}
					style={{ marginLeft: SPACING_PX.sm - SPACING_PX.xxs }}
				>
					New Estimate
				</ThemedText>
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	filterBar: {
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
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md + SPACING_PX.xxs,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	rowTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING_PX.xxs,
	},
	rowBottom: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: SPACING_PX.xs,
	},
	rightMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.sm,
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
