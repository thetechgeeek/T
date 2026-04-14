import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';

type AutoBackup = 'off' | 'daily' | 'weekly';

export default function BackupScreen() {
	const { c } = useThemeTokens();
	const [autoBackup, setAutoBackup] = useState<AutoBackup>('off');

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title="Backup & Restore" />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
		>
			<SectionHeader title="Google Drive" variant="uppercase" titleColor={c.primary} />
			<SettingsCard
				padding="none"
				style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
			>
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
						<ThemedText variant="label" color={c.primary} weight="semibold">
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
					<View style={{ flexDirection: 'row', gap: SPACING_PX.xs }}>
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
										color: autoBackup === opt ? c.onPrimary : c.onSurface,
										fontWeight: '600',
										textTransform: 'capitalize',
									}}
								>
									{opt === 'off' ? 'Off' : opt === 'daily' ? 'Daily' : 'Weekly'}
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
						<ThemedText style={{ color: c.white, fontWeight: '700' }}>
							Backup Now
						</ThemedText>
					</Pressable>
				</View>
			</SettingsCard>

			<SectionHeader title="Local Backup" variant="uppercase" titleColor={c.primary} />
			<SettingsCard
				padding="none"
				style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
			>
				<View style={styles.row}>
					<Pressable
						onPress={() =>
							Alert.alert('Local Backup', 'Backup file will be saved to your device')
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
			</SettingsCard>

			<SectionHeader title="Restore" variant="uppercase" titleColor={c.primary} />
			<View
				style={[
					styles.warningCard,
					{
						backgroundColor: c.errorLight,
						borderColor: c.error,
					},
				]}
			>
				<ThemedText variant="caption" color={c.unpaid}>
					{'⚠  Restoring replaces ALL current data permanently'}
				</ThemedText>
			</View>
			<SettingsCard
				padding="none"
				style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
			>
				<View style={styles.row}>
					<Pressable
						onPress={() => Alert.alert('Restore', 'Select a .backup file')}
						style={[
							styles.outlineBtn,
							{
								borderColor: c.error,
								flex: 1,
								justifyContent: 'center',
							},
						]}
					>
						<ThemedText style={{ color: c.error, fontWeight: '600' }}>
							Restore from File
						</ThemedText>
					</Pressable>
				</View>
			</SettingsCard>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: { marginHorizontal: SPACING_PX.lg, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	statusRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	outlineBtn: {
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.md,
		borderWidth: 1,
	},
	miniChip: {
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.xs,
		borderRadius: BORDER_RADIUS_PX.lg,
		borderWidth: 1,
	},
	primaryBtn: {
		paddingVertical: SPACING_PX.md,
		borderRadius: BORDER_RADIUS_PX.md,
		alignItems: 'center',
	},
	warningCard: {
		marginHorizontal: SPACING_PX.lg,
		borderRadius: BORDER_RADIUS_PX.md,
		borderWidth: 1,
		padding: SPACING_PX.md,
		marginBottom: SPACING_PX.sm,
	},
});
