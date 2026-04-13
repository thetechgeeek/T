import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { OPACITY_ROW_DIVIDER } from '@/theme/uiMetrics';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { writeQueue, type QueuedMutation } from '@/src/services/writeQueueService';
import { useSyncStore } from '@/src/stores/syncStore';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@/src/theme/layout';
import { RotateCcw, Trash2, Info, AlertTriangle, Clock } from 'lucide-react-native';

export default function SyncLogScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const { refreshPendingCount } = useSyncStore();

	const [pending, setPending] = useState<QueuedMutation[]>([]);
	const [failed, setFailed] = useState<QueuedMutation[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const loadData = useCallback(async () => {
		setRefreshing(true);
		try {
			const [p, f] = await Promise.all([writeQueue.readQueue(), writeQueue.readDeadLetter()]);
			setPending(p);
			setFailed(f);
			await refreshPendingCount();
		} finally {
			setRefreshing(false);
		}
	}, [refreshPendingCount]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleRetryAll = useCallback(async () => {
		if (failed.length === 0) return;
		await writeQueue.retryAllFailed();
		Alert.alert(
			t('common.successTitle'),
			t('sync.retryStarted') || 'Retrying failed operations...',
		);
		loadData();
	}, [failed.length, loadData, t]);

	const handleClearFailed = useCallback(async () => {
		if (failed.length === 0) return;
		Alert.alert(
			t('common.confirmTitle'),
			t('sync.confirmClearFailed') ||
				'Are you sure you want to clear all failed sync operations?',
			[
				{ text: t('common.cancel'), style: 'cancel' },
				{
					text: t('common.clear'),
					style: 'destructive',
					onPress: async () => {
						await writeQueue.clearDeadLetter();
						loadData();
					},
				},
			],
		);
	}, [failed.length, loadData, t]);

	const renderItem = ({ item }: { item: QueuedMutation }) => {
		const isFailed = item.status === 'failed' || item.retryCount >= 3;

		return (
			<View
				style={[
					styles.card,
					{
						backgroundColor: c.surface,
						borderColor: c.border,
						padding: s.md,
						borderRadius: r.lg,
						borderWidth: 1,
						marginBottom: s.md,
					},
				]}
			>
				<View style={[layout.rowBetween, { marginBottom: s.xs }]}>
					<View style={layout.row}>
						{isFailed ? (
							<AlertTriangle size={16} color={c.error} />
						) : (
							<Clock size={16} color={c.primary} />
						)}
						<ThemedText
							variant="bodyBold"
							style={{ marginLeft: s.sm, textTransform: 'uppercase' }}
						>
							{`${item.type} ${item.table}`}
						</ThemedText>
					</View>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{item.pendingAt ? new Date(item.pendingAt).toLocaleTimeString() : ''}
					</ThemedText>
				</View>

				<ThemedText variant="caption" color={c.onSurfaceVariant} numberOfLines={1}>
					ID: {item.id}
				</ThemedText>

				{item.lastError && (
					<View
						style={[
							{ marginTop: s.sm, padding: s.sm },
							{
								backgroundColor: c.error,
								borderRadius: r.sm,
								opacity: OPACITY_ROW_DIVIDER,
							},
						]}
					>
						<ThemedText variant="caption" color={c.error}>
							{item.lastError}
						</ThemedText>
					</View>
				)}

				<View style={[layout.rowBetween, { marginTop: s.sm }]}>
					<ThemedText variant="caption" weight="medium">
						{`${t('sync.retries') || 'Retries'}: ${item.retryCount}`}
					</ThemedText>
					<ThemedText
						variant="caption"
						weight="bold"
						color={isFailed ? c.error : c.primary}
						style={{ textTransform: 'capitalize' }}
					>
						{item.status || 'pending'}
					</ThemedText>
				</View>
			</View>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader
				title={t('settings.syncLog') || 'Sync Log'}
				showSyncStatus={false}
				rightElement={
					failed.length > 0 ? (
						<TouchableOpacity onPress={handleRetryAll} style={{ padding: s.xs }}>
							<RotateCcw size={22} color={c.primary} />
						</TouchableOpacity>
					) : null
				}
			/>

			<View style={styles.container}>
				<FlatList
					data={[...pending, ...failed]}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={{ padding: s.lg }}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={loadData}
							tintColor={c.primary}
						/>
					}
					ListEmptyComponent={
						<View style={[styles.empty, { paddingTop: s['4xl'] }]}>
							<Info size={48} color={c.onSurfaceVariant} strokeWidth={1} />
							<ThemedText
								variant="body"
								align="center"
								color={c.onSurfaceVariant}
								style={{ marginTop: s.md }}
							>
								{t('sync.noPending') || 'No pending or failed operations'}
							</ThemedText>
						</View>
					}
					ListHeaderComponent={
						pending.length > 0 || failed.length > 0 ? (
							<View style={[layout.rowBetween, { marginBottom: s.md }]}>
								<ThemedText variant="h3">
									{`${pending.length + failed.length} ${t('sync.totalInQueue') || 'items in queue'}`}
								</ThemedText>
								{failed.length > 0 && (
									<TouchableOpacity
										onPress={handleClearFailed}
										style={layout.row}
									>
										<Trash2 size={16} color={c.error} />
										<ThemedText
											variant="caption"
											color={c.error}
											weight="bold"
											style={{ marginLeft: s.xs }}
										>
											{t('sync.clearFailed') || 'Clear Failed'}
										</ThemedText>
									</TouchableOpacity>
								)}
							</View>
						) : null
					}
				/>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	card: {},
	empty: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
