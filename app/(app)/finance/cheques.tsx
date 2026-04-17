import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert, type AlertButton } from 'react-native';
import { FileText, AlertTriangle, Plus } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BadgeVariant } from '@/src/design-system/components/atoms/Badge';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import {
	BORDER_WIDTH_BASE,
	BORDER_WIDTH_STRONG,
	FAB_OFFSET_BOTTOM,
	FAB_OFFSET_RIGHT,
	SIZE_FAB,
	SIZE_ICON_CIRCLE_MD,
} from '@/src/theme/uiMetrics';
import { MOCK_CHEQUES_RECEIVED, MOCK_CHEQUES_ISSUED } from '@/src/mocks/finance/cheques';
import type { Cheque, ChequeStatus } from '@/src/mocks/finance/cheques';

const SECS_PER_MIN = 60;
const MS_PER_DAY = 1000 * SECS_PER_MIN * SECS_PER_MIN * 24;

type ChequeTab = 'received' | 'issued';

function statusBadgeVariant(status: ChequeStatus): BadgeVariant {
	if (status === 'deposited') return 'success';
	if (status === 'bounced') return 'error';
	return 'warning';
}

function statusLabel(status: ChequeStatus) {
	if (status === 'deposited') return 'Deposited';
	if (status === 'bounced') return 'Bounced';
	return 'Open';
}

function isChequeDueSoon(dateStr: string): boolean {
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = (date.getTime() - now.getTime()) / MS_PER_DAY;
	return diffDays >= 0 && diffDays <= 3;
}

export default function ChequesScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const insets = useSafeAreaInsets();

	const [tab, setTab] = useState<ChequeTab>('received');
	const [statusFilter, setStatusFilter] = useState<ChequeStatus | 'all'>('all');

	const data = tab === 'received' ? MOCK_CHEQUES_RECEIVED : MOCK_CHEQUES_ISSUED;
	const filtered = statusFilter === 'all' ? data : data.filter((c) => c.status === statusFilter);

	const dueSoon =
		tab === 'received'
			? MOCK_CHEQUES_RECEIVED.filter(
					(ch) => ch.status === 'open' && isChequeDueSoon(ch.cheque_date),
				)
			: [];

	const handleAction = (cheque: Cheque, action: 'deposit' | 'bounce' | 'delete') => {
		if (action === 'deposit') {
			Alert.alert(
				'Mark as Deposited',
				`Mark cheque ${cheque.cheque_number} from ${cheque.party_name} as deposited?`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Deposited', style: 'default', onPress: () => {} },
				],
			);
		} else if (action === 'bounce') {
			Alert.alert(
				'Mark as Bounced',
				`Mark cheque ${cheque.cheque_number} as bounced? This will reverse the payment from ${cheque.party_name}.`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Bounced', style: 'destructive', onPress: () => {} },
				],
			);
		} else {
			Alert.alert('Delete', 'Delete this cheque record?', [
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Delete', style: 'destructive', onPress: () => {} },
			]);
		}
	};

	const renderItem = ({ item }: { item: Cheque }) => (
		<Pressable
			style={[styles.row, { borderBottomColor: c.border }]}
			onPress={() => {
				Alert.alert(
					item.party_name,
					`Cheque No: ${item.cheque_number}\nBank: ${item.bank_name}\nDate: ${formatDate(item.cheque_date)}\nAmount: ${formatCurrency(item.amount)}`,
					(
						[
							item.status === 'open' && tab === 'received'
								? {
										text: 'Mark Deposited',
										onPress: () => handleAction(item, 'deposit'),
									}
								: null,
							item.status === 'open' && tab === 'received'
								? {
										text: 'Mark Bounced',
										style: 'destructive',
										onPress: () => handleAction(item, 'bounce'),
									}
								: null,
							{
								text: 'Delete',
								style: 'destructive',
								onPress: () => handleAction(item, 'delete'),
							},
							{ text: 'Cancel', style: 'cancel' },
						] as (AlertButton | null)[]
					).filter((b): b is AlertButton => b != null),
				);
			}}
		>
			<View style={[styles.iconCircle, { backgroundColor: c.surfaceVariant }]}>
				<FileText size={20} color={c.primary} />
			</View>
			<View style={{ flex: 1 }}>
				<ThemedText variant="bodyBold" numberOfLines={1}>
					{item.party_name}
				</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					Cheque #{item.cheque_number} · {item.bank_name} · {formatDate(item.cheque_date)}
				</ThemedText>
			</View>
			<View style={{ alignItems: 'flex-end', gap: SPACING_PX.xs }}>
				<ThemedText variant="amount">{formatCurrency(item.amount)}</ThemedText>
				<Badge label={statusLabel(item.status)} variant={statusBadgeVariant(item.status)} />
			</View>
		</Pressable>
	);

	const STATUS_FILTERS: { label: string; value: ChequeStatus | 'all' }[] = [
		{ label: 'All', value: 'all' },
		{ label: 'Open', value: 'open' },
		{ label: 'Deposited', value: 'deposited' },
		{ label: 'Bounced', value: 'bounced' },
	];

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Cheques" />

			{/* Tab bar */}
			<View style={[styles.tabBar, { borderBottomColor: c.border }]}>
				{(['received', 'issued'] as ChequeTab[]).map((t) => (
					<Pressable
						key={t}
						onPress={() => setTab(t)}
						style={[
							styles.tabBtn,
							tab === t && {
								borderBottomColor: c.primary,
								borderBottomWidth: BORDER_WIDTH_STRONG,
							},
						]}
					>
						<ThemedText
							variant="bodyBold"
							color={tab === t ? c.primary : c.onSurfaceVariant}
						>
							{t === 'received' ? 'Received' : 'Issued'}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Due soon alert */}
			{dueSoon.length > 0 && (
				<View style={[styles.alertBanner, { backgroundColor: c.warningLight }]}>
					<AlertTriangle size={16} color={c.warning} style={{ marginRight: s.sm }} />
					<ThemedText variant="caption" color={c.warning}>
						⚠ {dueSoon.length} cheque{dueSoon.length > 1 ? 's' : ''} due to deposit
						within 3 days
					</ThemedText>
				</View>
			)}

			{/* Status filter chips */}
			<View style={[styles.filterRow, { borderBottomColor: c.border }]}>
				{STATUS_FILTERS.map((f) => (
					<Pressable
						key={f.value}
						onPress={() => setStatusFilter(f.value)}
						style={[
							styles.chip,
							{
								borderColor: statusFilter === f.value ? c.primary : c.border,
								backgroundColor: statusFilter === f.value ? c.primary : c.surface,
								borderRadius: r.full,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={statusFilter === f.value ? c.onPrimary : c.onSurface}
						>
							{f.label}
						</ThemedText>
					</Pressable>
				))}
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={{
					paddingBottom: FAB_OFFSET_BOTTOM + SIZE_FAB + SPACING_PX.xs + insets.bottom,
				}}
				ListEmptyComponent={
					<View style={styles.empty}>
						<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
							No {statusFilter === 'all' ? '' : statusFilter + ' '}cheques found
						</ThemedText>
					</View>
				}
			/>

			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						bottom: FAB_OFFSET_BOTTOM + SPACING_PX.md + insets.bottom,
						...(theme.shadows.lg as object),
					},
				]}
				onPress={() => Alert.alert('Add Cheque', 'Add a cheque record manually')}
				accessibilityRole="button"
				accessibilityLabel="Add cheque"
			>
				<Plus color={c.onPrimary} size={SIZE_FAB / 2} />
			</Pressable>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: 'row',
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	tabBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
	},
	alertBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
	},
	filterRow: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	chip: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs + SPACING_PX.xxs,
		borderWidth: BORDER_WIDTH_BASE,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: SPACING_PX.md,
	},
	iconCircle: {
		width: SIZE_ICON_CIRCLE_MD,
		height: SIZE_ICON_CIRCLE_MD,
		borderRadius: SIZE_ICON_CIRCLE_MD / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	empty: {
		paddingVertical: SPACING_PX['3xl'],
		alignItems: 'center',
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: SIZE_FAB / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
