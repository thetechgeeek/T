import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert, type AlertButton } from 'react-native';
import { FileText, AlertTriangle, Plus } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Badge } from '@/src/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { palette } from '@/src/theme/palette';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BadgeVariant } from '@/src/components/atoms/Badge';

type ChequeStatus = 'open' | 'deposited' | 'bounced';
type ChequeTab = 'received' | 'issued';

interface Cheque {
	id: string;
	party_name: string;
	cheque_number: string;
	bank_name: string;
	cheque_date: string;
	amount: number;
	status: ChequeStatus;
}

const MOCK_RECEIVED: Cheque[] = [
	{
		id: '1',
		party_name: 'Rajesh Kumar',
		cheque_number: '123456',
		bank_name: 'SBI',
		cheque_date: '2025-04-10',
		amount: 25000,
		status: 'open',
	},
	{
		id: '2',
		party_name: 'Sharma Tiles',
		cheque_number: '789012',
		bank_name: 'HDFC',
		cheque_date: '2025-04-12',
		amount: 50000,
		status: 'open',
	},
	{
		id: '3',
		party_name: 'Patel & Sons',
		cheque_number: '345678',
		bank_name: 'ICICI',
		cheque_date: '2025-03-28',
		amount: 15000,
		status: 'deposited',
	},
];

const MOCK_ISSUED: Cheque[] = [
	{
		id: '4',
		party_name: 'Kajaria Ceramics',
		cheque_number: '654321',
		bank_name: 'SBI',
		cheque_date: '2025-04-15',
		amount: 80000,
		status: 'open',
	},
];

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
	const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
	return diffDays >= 0 && diffDays <= 3;
}

export default function ChequesScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();
	const insets = useSafeAreaInsets();

	const [tab, setTab] = useState<ChequeTab>('received');
	const [statusFilter, setStatusFilter] = useState<ChequeStatus | 'all'>('all');

	const data = tab === 'received' ? MOCK_RECEIVED : MOCK_ISSUED;
	const filtered = statusFilter === 'all' ? data : data.filter((c) => c.status === statusFilter);

	const dueSoon =
		tab === 'received'
			? MOCK_RECEIVED.filter((ch) => ch.status === 'open' && isChequeDueSoon(ch.cheque_date))
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
			<View style={{ alignItems: 'flex-end', gap: 4 }}>
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
							tab === t && { borderBottomColor: c.primary, borderBottomWidth: 2 },
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
				contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
				ListEmptyComponent={
					<View style={styles.empty}>
						<ThemedText variant="caption" color={c.onSurfaceVariant} align="center">
							No {statusFilter === 'all' ? '' : statusFilter + ' '}cheques found
						</ThemedText>
					</View>
				}
			/>

			<Pressable
				style={[styles.fab, { backgroundColor: c.primary, bottom: 32 + insets.bottom }]}
				onPress={() => Alert.alert('Add Cheque', 'Add a cheque record manually')}
				accessibilityRole="button"
				accessibilityLabel="Add cheque"
			>
				<Plus color="white" size={28} />
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
		paddingVertical: 12,
	},
	alertBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		gap: 12,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	empty: {
		paddingVertical: 48,
		alignItems: 'center',
	},
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: palette.shadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
});
