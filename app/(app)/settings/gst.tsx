import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type FilingPeriod = 'monthly' | 'quarterly';

function SectionLabel({ label, c }: { label: string; c: any }) {
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
	c: any;
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

export default function GstSettingsScreen() {
	const { c } = useThemeTokens();

	const [gstRegistered, setGstRegistered] = useState(false);
	const [gstin, setGstin] = useState('');
	const [filingPeriod, setFilingPeriod] = useState<FilingPeriod>('monthly');
	const [composite, setComposite] = useState(false);
	const [showHsn, setShowHsn] = useState(true);
	const [additionalCess, setAdditionalCess] = useState(false);

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="GST Settings" />
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				{/* GST Registered toggle card */}
				<View
					style={[
						styles.gstCard,
						{
							backgroundColor: gstRegistered ? `${c.primary}15` : c.surface,
							borderColor: gstRegistered ? c.primary : c.border,
						},
					]}
				>
					<View style={{ flex: 1 }}>
						<ThemedText variant="body" style={{ fontWeight: '700' }}>
							GST Registered Business
						</ThemedText>
						<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
							{gstRegistered
								? 'GSTIN & GST fields active'
								: 'Enable to configure GST settings'}
						</ThemedText>
					</View>
					<Switch
						trackColor={{ true: c.primary, false: c.border }}
						value={gstRegistered}
						onValueChange={setGstRegistered}
					/>
				</View>

				{gstRegistered && (
					<>
						<SectionLabel label="GSTIN" c={c} />
						<View
							style={[
								styles.card,
								{
									backgroundColor: c.surface,
									paddingHorizontal: 16,
									paddingVertical: 14,
								},
							]}
						>
							<ThemedText
								variant="caption"
								style={{ color: c.onSurfaceVariant, marginBottom: 6 }}
							>
								GSTIN Number
							</ThemedText>
							<TextInput
								value={gstin}
								onChangeText={(v) => setGstin(v.toUpperCase())}
								placeholder="22AAAAA0000A1Z5"
								placeholderTextColor={c.placeholder}
								maxLength={15}
								autoCapitalize="characters"
								style={[
									styles.textInput,
									{ borderColor: c.border, color: c.onSurface },
								]}
							/>
						</View>

						<SectionLabel label="GST Filing Period" c={c} />
						<View style={[styles.chipRow, { marginHorizontal: 16 }]}>
							{(['monthly', 'quarterly'] as FilingPeriod[]).map((p) => (
								<Pressable
									key={p}
									onPress={() => setFilingPeriod(p)}
									style={[
										styles.chip,
										filingPeriod === p
											? { backgroundColor: c.primary, borderColor: c.primary }
											: { backgroundColor: c.surface, borderColor: c.border },
									]}
								>
									<ThemedText
										variant="body"
										style={{
											color: filingPeriod === p ? '#fff' : c.onSurface,
											fontWeight: '600',
										}}
									>
										{p === 'monthly' ? 'Monthly' : 'Quarterly'}
									</ThemedText>
								</Pressable>
							))}
						</View>

						<SectionLabel label="GST Options" c={c} />
						<View style={[styles.card, { backgroundColor: c.surface }]}>
							<SwitchRow
								label="Composite Scheme"
								sub="For turnover under ₹1.5 crore"
								value={composite}
								onChange={setComposite}
								c={c}
							/>
							<SwitchRow
								label="Show HSN/SAC Code Fields"
								value={showHsn}
								onChange={setShowHsn}
								c={c}
							/>
							<SwitchRow
								label="Additional Cess"
								sub="For tobacco, pan masala etc."
								value={additionalCess}
								onChange={setAdditionalCess}
								c={c}
								last
							/>
						</View>
					</>
				)}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	gstCard: {
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 12,
		borderWidth: 1.5,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	card: { marginHorizontal: 16, borderRadius: 10, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	chipRow: { flexDirection: 'row', gap: 10 },
	chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
	textInput: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		fontFamily: 'monospace',
		letterSpacing: 1,
	},
});
