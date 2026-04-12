import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type AutoLock = 'never' | '1min' | '5min' | '15min';

const AUTO_LOCK_OPTIONS: { key: AutoLock; label: string }[] = [
	{ key: 'never', label: 'Never' },
	{ key: '1min', label: '1 min' },
	{ key: '5min', label: '5 min' },
	{ key: '15min', label: '15 min' },
];

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
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				<SectionLabel label="PIN" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
						<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 18 }}>
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
				</View>

				<SectionLabel label="Auto-lock" c={c} />
				<View style={[styles.chipRow, { marginHorizontal: 16 }]}>
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
								style={{
									color: autoLock === opt.key ? c.onPrimary : c.onSurface,
									fontWeight: '600',
								}}
							>
								{opt.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				<SectionLabel label="Transaction Protection" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
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
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	card: { marginHorizontal: 16, borderRadius: 10, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
	chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
});
