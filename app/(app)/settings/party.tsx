import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import type { ThemeColors } from '@/src/theme';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import {
	BORDER_WIDTH_BASE,
	SIZE_FIELD_CHIP_HEIGHT,
	SIZE_FIELD_CHIP_WIDTH,
} from '@/theme/uiMetrics';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

type ExtraFields = 0 | 1 | 2 | 3;

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
				contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
				keyboardShouldPersistTaps="handled"
			>
				<SectionHeader title="Party Fields" variant="uppercase" titleColor={c.primary} />
				<SettingsCard
					padding="none"
					style={{
						marginHorizontal: SPACING_PX.lg,
						overflow: 'hidden',
						backgroundColor: c.surface,
						borderWidth: 0,
					}}
				>
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
				</SettingsCard>

				<SectionHeader
					title="Additional Party Fields"
					variant="uppercase"
					titleColor={c.primary}
				/>
				<SettingsCard
					style={{
						marginHorizontal: SPACING_PX.lg,
						overflow: 'hidden',
						backgroundColor: c.surface,
						borderWidth: 0,
					}}
					padding="md"
				>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginBottom: SPACING_PX.md }}
					>
						Number of additional fields
					</ThemedText>
					<View
						style={{
							flexDirection: 'row',
							gap: SPACING_PX.sm,
							marginBottom: SPACING_PX.lg,
						}}
					>
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
									variant="body"
									color={extraFields === n ? c.onPrimary : c.onSurface}
									weight="bold"
								>
									{n}
								</ThemedText>
							</Pressable>
						))}
					</View>

					{Array.from({ length: extraFields }).map((_, idx) => (
						<View key={idx} style={{ marginBottom: SPACING_PX.md }}>
							<ThemedText
								variant="caption"
								style={{ color: c.onSurfaceVariant, marginBottom: SPACING_PX.xs }}
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
				</SettingsCard>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	chip: {
		width: SIZE_FIELD_CHIP_WIDTH,
		height: SIZE_FIELD_CHIP_HEIGHT,
		borderRadius: BORDER_RADIUS_PX.md,
		borderWidth: BORDER_WIDTH_BASE,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textInput: {
		borderWidth: BORDER_WIDTH_BASE,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.body,
	},
});
