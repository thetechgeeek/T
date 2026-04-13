import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';

type AutoLock = 'never' | '1min' | '5min' | '15min';

const AUTO_LOCK_OPTIONS: { key: AutoLock; label: string }[] = [
	{ key: 'never', label: 'Never' },
	{ key: '1min', label: '1 min' },
	{ key: '5min', label: '5 min' },
	{ key: '15min', label: '15 min' },
];

function SwitchRow({
	label,
	sub,
	value,
	onChange,
	c,
	last,
}: {
	label: string;
	sub?: string;
	value: boolean;
	onChange: (v: boolean) => void;
	c: ThemeColors;
	last?: boolean;
}) {
	return (
		<View
			style={[
				styles.row,
				!last && {
					borderBottomColor: c.border,
					borderBottomWidth: StyleSheet.hairlineWidth,
				},
			]}
		>
			<View style={{ flex: 1 }}>
				<ThemedText variant="body">{label}</ThemedText>
				{sub ? (
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						{sub}
					</ThemedText>
				) : null}
			</View>
			<Switch
				trackColor={{ true: c.primary, false: c.border }}
				value={value}
				onValueChange={onChange}
			/>
		</View>
	);
}

export default function SecuritySettingsScreen() {
	const { c } = useThemeTokens();
	const router = useRouter();

	const [biometric, setBiometric] = useState(false);
	const [autoLock, setAutoLock] = useState<AutoLock>('never');
	const [pinToEdit, setPinToEdit] = useState(false);
	const [pinToDelete, setPinToDelete] = useState(false);

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Security Settings" />
			<ScrollView contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}>
				<SectionHeader title="PIN" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<Pressable
						onPress={() => router.push('/(app)/settings/lock')}
						style={[
							styles.row,
							{
								borderBottomColor: c.border,
								borderBottomWidth: StyleSheet.hairlineWidth,
							},
						]}
					>
						<View style={{ flex: 1 }}>
							<ThemedText variant="body">Set 4-digit PIN</ThemedText>
							<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
								Protect app with a PIN code
							</ThemedText>
						</View>
						<ThemedText variant="h3" color={c.onSurfaceVariant}>
							›
						</ThemedText>
					</Pressable>
					<SwitchRow
						label="Use Biometric Authentication"
						sub="Fingerprint or Face ID"
						value={biometric}
						onChange={setBiometric}
						c={c}
						last
					/>
				</SettingsCard>

				<SectionHeader title="Auto-lock" variant="uppercase" titleColor={c.primary} />
				<View style={[styles.chipRow, { marginHorizontal: SPACING_PX.lg }]}>
					{AUTO_LOCK_OPTIONS.map((opt) => (
						<Pressable
							key={opt.key}
							onPress={() => setAutoLock(opt.key)}
							style={[
								styles.chip,
								autoLock === opt.key
									? { backgroundColor: c.primary, borderColor: c.primary }
									: { backgroundColor: c.surface, borderColor: c.border },
							]}
						>
							<ThemedText
								variant="label"
								weight="semibold"
								style={{
									color: autoLock === opt.key ? c.onPrimary : c.onSurface,
								}}
							>
								{opt.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<SectionHeader
					title="Transaction Protection"
					variant="uppercase"
					titleColor={c.primary}
				/>
				<SettingsCard
					padding="none"
					style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
				>
					<SwitchRow
						label="Require PIN to Edit Transactions"
						value={pinToEdit}
						onChange={setPinToEdit}
						c={c}
					/>
					<SwitchRow
						label="Require PIN to Delete Transactions"
						value={pinToDelete}
						onChange={setPinToDelete}
						c={c}
						last
					/>
				</SettingsCard>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: { marginHorizontal: SPACING_PX.lg, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	chipRow: { flexDirection: 'row', gap: SPACING_PX.sm, flexWrap: 'wrap' },
	chip: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.full,
		borderWidth: 1,
	},
});
