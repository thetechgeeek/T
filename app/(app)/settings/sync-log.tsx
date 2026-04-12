import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
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
			<View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
				<View style={[layout.rowBetween, { marginBottom: s.xs }]}>
					<View style={layout.row}>
						{isFailed ? (
							<AlertTriangle size={16} color={c.error} />
						) : (
							<Clock size={16} color={c.primary} />
						)}
						<ThemedText
							variant="bodyBold"
							style={{ marginLeft: 8, textTransform: 'uppercase' }}
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
							styles.errorBox,
							{ backgroundColor: c.error, borderRadius: r.sm, opacity: 0.1 },
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
						<TouchableOpacity onPress={handleRetryAll} style={{ padding: 4 }}>
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
						<View style={styles.empty}>
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
											style={{ marginLeft: 4 }}
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
	card: {
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 12,
	},
	errorBox: {
		marginTop: 8,
		padding: 8,
	},
	empty: {
		flex: 1,
		paddingTop: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
