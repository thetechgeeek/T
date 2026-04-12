import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type AutoBackup = 'off' | 'daily' | 'weekly';

function SectionLabel({ label, c }: { label: string; c: ThemeColors }) {
	return (
		<ThemedText
			variant="caption"
			style={{
				color: c.primary,
				marginTop: 20,
				marginBottom: 4,
				marginHorizontal: 16,
				fontWeight: '600',
				textTransform: 'uppercase',
				letterSpacing: 0.8,
			}}
		>
			{label}
		</ThemedText>
	);
}

export default function BackupScreen() {
	const { c } = useThemeTokens();
	const [autoBackup, setAutoBackup] = useState<AutoBackup>('off');

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Backup & Restore" />
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				<SectionLabel label="Google Drive" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
					<View
						style={[
							styles.statusRow,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<View style={{ flex: 1 }}>
							<ThemedText variant="body">Google Drive</ThemedText>
							<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
								Not connected
							</ThemedText>
						</View>
						<Pressable style={[styles.outlineBtn, { borderColor: c.primary }]}>
							<ThemedText
								style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}
							>
								Connect Google Account
							</ThemedText>
						</Pressable>
					</View>

					<View
						style={[
							styles.row,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<ThemedText variant="body" style={{ flex: 1 }}>
							Auto Backup
						</ThemedText>
						<View style={{ flexDirection: 'row', gap: 6 }}>
							{(['off', 'daily', 'weekly'] as AutoBackup[]).map((opt) => (
								<Pressable
									key={opt}
									onPress={() => setAutoBackup(opt)}
									style={[
										styles.miniChip,
										autoBackup === opt
											? { backgroundColor: c.primary, borderColor: c.primary }
											: {
													backgroundColor: c.background,
													borderColor: c.border,
												},
									]}
								>
									<ThemedText
										variant="caption"
										style={{
											color: autoBackup === opt ? '#fff' : c.onSurface,
											fontWeight: '600',
											textTransform: 'capitalize',
										}}
									>
										{opt === 'off'
											? 'Off'
											: opt === 'daily'
												? 'Daily'
												: 'Weekly'}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</View>

					<View
						style={[
							styles.row,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<ThemedText variant="body" style={{ flex: 1 }}>
							Last Backup
						</ThemedText>
						<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
							No backup yet
						</ThemedText>
					</View>

					<View style={[styles.row]}>
						<Pressable
							onPress={() => Alert.alert('Backup', 'Backup feature coming soon')}
							style={[styles.primaryBtn, { backgroundColor: c.primary, flex: 1 }]}
						>
							<ThemedText style={{ color: '#fff', fontWeight: '700' }}>
								Backup Now
							</ThemedText>
						</Pressable>
					</View>
				</View>

				<SectionLabel label="Local Backup" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
					<View style={styles.row}>
						<Pressable
							onPress={() =>
								Alert.alert(
									'Local Backup',
									'Backup file will be saved to your device',
								)
							}
							style={[
								styles.outlineBtn,
								{ borderColor: c.primary, flex: 1, justifyContent: 'center' },
							]}
						>
							<ThemedText style={{ color: c.primary, fontWeight: '600' }}>
								Download Backup File
							</ThemedText>
						</Pressable>
					</View>
				</View>

				<SectionLabel label="Restore" c={c} />
				<View
					style={[
						styles.warningCard,
						{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
					]}
				>
					<ThemedText style={{ color: '#991B1B', fontSize: 14 }}>
						{'⚠  Restoring replaces ALL current data permanently'}
					</ThemedText>
				</View>
				<View style={[styles.card, { backgroundColor: c.surface }]}>
					<View style={styles.row}>
						<Pressable
							onPress={() => Alert.alert('Restore', 'Select a .backup file')}
							style={[
								styles.outlineBtn,
								{ borderColor: '#EF4444', flex: 1, justifyContent: 'center' },
							]}
						>
							<ThemedText style={{ color: '#EF4444', fontWeight: '600' }}>
								Restore from File
							</ThemedText>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: { marginHorizontal: 16, borderRadius: 10, overflow: 'hidden' },
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
	statusRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	outlineBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
	miniChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
	primaryBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
	warningCard: {
		marginHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		padding: 14,
		marginBottom: 8,
	},
});
