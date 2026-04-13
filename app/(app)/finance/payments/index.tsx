import {
	FAB_OFFSET_BOTTOM,
	FAB_OFFSET_RIGHT,
	RADIUS_FAB,
	SIZE_CHIP_HEIGHT,
	SIZE_FAB,
} from '@/theme/uiMetrics';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Banknote, CreditCard, Smartphone, Building2, Coins } from 'lucide-react-native';
import { paymentService } from '@/src/services/paymentService';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Card } from '@/src/components/atoms/Card';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import type { Payment } from '@/src/types/finance';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const LIST_BOTTOM_PADDING = 100;

function getModeIcon(mode: string, color: string) {
	const size = 20;
	switch (mode) {
		case 'cash':
			return <Banknote size={size} color={color} />;
		case 'upi':
			return <Smartphone size={size} color={color} />;
		case 'bank_transfer':
			return <Building2 size={size} color={color} />;
		case 'cheque':
			return <Coins size={size} color={color} />;
		default:
			return <CreditCard size={size} color={color} />;
	}
}

function thisMonthCount(payments: Payment[]) {
	const now = new Date();
	const y = now.getFullYear();
	const m = now.getMonth() + 1;
	return payments.filter((p) => {
		const d = p.payment_date.slice(0, 7);
		return d === `${y}-${String(m).padStart(2, '0')}`;
	}).length;
}

export default function PaymentsScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const { t, formatCurrency, formatDateShort } = useLocale();
	const router = useRouter();

	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const data = await paymentService.fetchPayments({});
				if (!cancelled) setPayments(data ?? []);
			} catch {
				// silently ignore — empty state shown
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const loadPayments = async () => {
		try {
			const data = await paymentService.fetchPayments({});
			setPayments(data ?? []);
		} catch {
			// silently ignore — empty state shown
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadPayments();
		setRefreshing(false);
	};

	const monthCount = thisMonthCount(payments);

	const renderItem = ({ item: p }: { item: Payment }) => {
		const isReceived = p.direction === 'received';
		const customerName = p.customer?.name ?? p.supplier?.name ?? 'Unknown';
		const amountColor = isReceived ? c.success : c.error;

		return (
			<Card padding="sm" style={[styles.row, { borderRadius: r.md }]}>
				<View style={styles.modeIcon}>
					{getModeIcon(p.payment_mode, c.onSurfaceVariant)}
				</View>
				<View style={styles.info}>
					<ThemedText variant="bodyBold">{customerName}</ThemedText>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{formatDateShort(p.payment_date)}
						{p.payment_mode ? ` · ${p.payment_mode.replace('_', ' ')}` : ''}
					</ThemedText>
				</View>
				<ThemedText variant="bodyBold" color={amountColor}>
					{isReceived ? '+' : '-'}
					{formatCurrency(p.amount)}
				</ThemedText>
			</Card>
		);
	};

	return (
		<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={t('common.payments')} />

			{/* Summary bar */}
			<View
				style={[
					styles.summaryBar,
					{ backgroundColor: c.surface, borderBottomColor: c.border },
				]}
			>
				<ThemedText variant="caption" color={c.onSurfaceVariant}>
					{monthCount} payment{monthCount !== 1 ? 's' : ''} this month
				</ThemedText>
			</View>

			{loading ? (
				<View style={{ padding: s.md, gap: s.sm }}>
					<SkeletonBlock height={64} borderRadius={8} />
					<SkeletonBlock height={64} borderRadius={8} />
					<SkeletonBlock height={64} borderRadius={8} />
				</View>
			) : (
				<FlatList
					data={payments}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={[styles.listContent, { padding: s.md }]}
					ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={c.primary}
						/>
					}
					ListEmptyComponent={
						<EmptyState title="No payments yet" subtitle="Tap + to record a payment" />
					}
				/>
			)}

			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						borderRadius: r.full,
						...(theme.shadows.lg as object),
					},
				]}
				onPress={() => router.push('/(app)/finance/payments/receive')}
				accessibilityLabel="Record payment"
			>
				<Plus size={28} color={c.onPrimary} />
			</Pressable>
		</Screen>
	);
}

const styles = StyleSheet.create({
	summaryBar: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
		borderBottomWidth: 1,
	},
	listContent: { paddingBottom: LIST_BOTTOM_PADDING },
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.md,
	},
	modeIcon: {
		width: SIZE_CHIP_HEIGHT,
		height: SIZE_CHIP_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	info: { flex: 1 },
	fab: {
		position: 'absolute',
		bottom: FAB_OFFSET_BOTTOM + SPACING_PX.md,
		right: FAB_OFFSET_RIGHT + SPACING_PX.xs,
		width: SIZE_FAB,
		height: SIZE_FAB,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: RADIUS_FAB,
	},
});
