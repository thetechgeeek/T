import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type ExtraFields = 0 | 1 | 2 | 3;

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

export default function PartySettingsScreen() {
	const { c } = useThemeTokens();

	const [showGstin, setShowGstin] = useState(true);
	const [grouping, setGrouping] = useState(false);
	const [extraFields, setExtraFields] = useState<ExtraFields>(0);
	const [fieldLabels, setFieldLabels] = useState(['', '', '']);
	const [shippingAddr, setShippingAddr] = useState(false);
	const [printShipping, setPrintShipping] = useState(false);
	const [creditLimit, setCreditLimit] = useState(false);

	const updateLabel = (idx: number, val: string) => {
		setFieldLabels((prev) => {
			const next = [...prev];
			next[idx] = val;
			return next;
		});
	};

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Party Settings" />
			<ScrollView
				contentContainerStyle={{ paddingBottom: 32 }}
				keyboardShouldPersistTaps="handled"
			>
				<SectionLabel label="Party Fields" c={c} />
				<View style={[styles.card, { backgroundColor: c.surface }]}>
					<SwitchRow
						label="Show GSTIN Field"
						value={showGstin}
						onChange={setShowGstin}
						c={c}
					/>
					<SwitchRow
						label="Party Grouping"
						sub="Organise parties into groups/categories"
						value={grouping}
						onChange={setGrouping}
						c={c}
					/>
					<SwitchRow
						label="Shipping Address"
						value={shippingAddr}
						onChange={setShippingAddr}
						c={c}
					/>
					<SwitchRow
						label="Print Shipping Address on Invoice"
						value={printShipping}
						onChange={setPrintShipping}
						c={c}
					/>
					<SwitchRow
						label="Credit Limit Feature"
						sub="Set credit limits per party"
						value={creditLimit}
						onChange={setCreditLimit}
						c={c}
						last
					/>
				</View>

				<SectionLabel label="Additional Party Fields" c={c} />
				<View
					style={[
						styles.card,
						{
							backgroundColor: c.surface,
							paddingHorizontal: 16,
							paddingTop: 14,
							paddingBottom: 6,
						},
					]}
				>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginBottom: 10 }}
					>
						Number of additional fields
					</ThemedText>
					<View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
						{([0, 1, 2, 3] as ExtraFields[]).map((n) => (
							<Pressable
								key={n}
								onPress={() => setExtraFields(n)}
								style={[
									styles.chip,
									extraFields === n
										? { backgroundColor: c.primary, borderColor: c.primary }
										: { backgroundColor: c.background, borderColor: c.border },
								]}
							>
								<ThemedText
									style={{
										color: extraFields === n ? c.onPrimary : c.onSurface,
										fontWeight: '700',
									}}
								>
									{n}
								</ThemedText>
							</Pressable>
						))}
					</View>

					{Array.from({ length: extraFields }).map((_, idx) => (
						<View key={idx} style={{ marginBottom: 12 }}>
							<ThemedText
								variant="caption"
								style={{ color: c.onSurfaceVariant, marginBottom: 4 }}
							>
								Field {idx + 1} Label
							</ThemedText>
							<TextInput
								value={fieldLabels[idx]}
								onChangeText={(v) => updateLabel(idx, v)}
								placeholder={`e.g. GST State, Territory`}
								placeholderTextColor={c.placeholder}
								style={[
									styles.textInput,
									{ borderColor: c.border, color: c.onSurface },
								]}
							/>
						</View>
					))}
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
	chip: {
		width: 44,
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
	},
});
