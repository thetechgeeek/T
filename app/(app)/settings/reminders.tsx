import React, { useState } from 'react';
import { View, Switch, StyleSheet, Pressable, TextInput } from 'react-native';

import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { withOpacity } from '@/src/utils/color';
import {
	BORDER_WIDTH_BASE,
	OPACITY_TINT_LIGHT,
	SIZE_DAYS_INPUT_WIDTH,
	SIZE_TEXTAREA_HEIGHT,
} from '@/theme/uiMetrics';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

type Channel = 'whatsapp' | 'sms' | 'both';

const DEFAULT_TEMPLATE =
	'नमस्ते {PartyName} जी, ₹{Amount} का भुगतान बकाया है। Invoice: {InvoiceNo}। कृपया भुगतान करें। - {BusinessName}';

const VARIABLES = ['{PartyName}', '{Amount}', '{DueDate}', '{InvoiceNo}', '{BusinessName}'];

export default function RemindersScreen() {
	const { c } = useThemeTokens();

	const [autoReminders, setAutoReminders] = useState(false);
	const [first, setFirst] = useState('7');
	const [second, setSecond] = useState('15');
	const [third, setThird] = useState('30');
	const [channel, setChannel] = useState<Channel>('whatsapp');
	const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

	const insertVariable = (v: string) => {
		setTemplate((prev) => prev + v);
	};

	return (
		<Screen
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title="Payment Reminders" />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			{/* Auto reminders toggle */}
			<SettingsCard style={styles.topCard} padding="md">
				<View style={styles.topRow}>
					<ThemedText variant="body" style={{ flex: 1 }} weight="semibold">
						Auto Reminders
					</ThemedText>
					<Switch
						trackColor={{ true: c.primary, false: c.border }}
						value={autoReminders}
						onValueChange={setAutoReminders}
					/>
				</View>
			</SettingsCard>

			{autoReminders && (
				<>
					<SectionHeader
						title="Reminder Schedule"
						variant="uppercase"
						titleColor={c.primary}
					/>
					<SettingsCard
						padding="none"
						style={{
							marginHorizontal: SPACING_PX.lg,
							overflow: 'hidden',
							backgroundColor: c.surface,
							borderWidth: 0,
						}}
					>
						{[
							{ label: 'First reminder after', value: first, setter: setFirst },
							{
								label: 'Second reminder after',
								value: second,
								setter: setSecond,
							},
							{ label: 'Third reminder after', value: third, setter: setThird },
						].map((item, idx, arr) => (
							<View
								key={item.label}
								style={[
									styles.row,
									idx < arr.length - 1 && {
										borderBottomColor: c.border,
										borderBottomWidth: StyleSheet.hairlineWidth,
									},
								]}
							>
								<ThemedText variant="body" style={{ flex: 1 }}>
									{item.label}
								</ThemedText>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										gap: SPACING_PX.xs,
									}}
								>
									<TextInput
										value={item.value}
										onChangeText={item.setter}
										keyboardType="number-pad"
										maxLength={2}
										style={[
											styles.daysInput,
											{ borderColor: c.border, color: c.onSurface },
										]}
									/>
									<ThemedText
										variant="caption"
										style={{ color: c.onSurfaceVariant }}
									>
										days
									</ThemedText>
								</View>
							</View>
						))}
					</SettingsCard>

					<SectionHeader title="Channel" variant="uppercase" titleColor={c.primary} />
					<View style={[styles.chipRow, { marginHorizontal: SPACING_PX.lg }]}>
						{(
							[
								{ key: 'whatsapp', label: 'WhatsApp' },
								{ key: 'sms', label: 'SMS' },
								{ key: 'both', label: 'Both' },
							] as { key: Channel; label: string }[]
						).map((ch) => (
							<Pressable
								key={ch.key}
								onPress={() => setChannel(ch.key)}
								style={[
									styles.chip,
									channel === ch.key
										? { backgroundColor: c.primary, borderColor: c.primary }
										: { backgroundColor: c.surface, borderColor: c.border },
								]}
							>
								<ThemedText
									variant="label"
									weight="semibold"
									style={{
										color: channel === ch.key ? c.onPrimary : c.onSurface,
									}}
								>
									{ch.label}
								</ThemedText>
							</Pressable>
						))}
					</View>

					<SectionHeader
						title="Message Template"
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
						<TextInput
							value={template}
							onChangeText={setTemplate}
							multiline
							numberOfLines={4}
							style={[
								styles.templateInput,
								{ borderColor: c.border, color: c.onSurface },
							]}
						/>
						<ThemedText
							variant="caption"
							style={{
								color: c.onSurfaceVariant,
								marginTop: SPACING_PX.md,
								marginBottom: SPACING_PX.xs,
							}}
						>
							Tap to insert variable:
						</ThemedText>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								gap: SPACING_PX.sm,
							}}
						>
							{VARIABLES.map((v) => (
								<Pressable
									key={v}
									onPress={() => insertVariable(v)}
									style={[
										styles.varChip,
										{
											backgroundColor: withOpacity(
												c.primary,
												OPACITY_TINT_LIGHT,
											),
											borderColor: c.primary,
										},
									]}
								>
									<ThemedText
										variant="caption"
										color={c.primary}
										weight="semibold"
									>
										{v}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</SettingsCard>
				</>
			)}
		</Screen>
	);
}

const styles = StyleSheet.create({
	topCard: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.xl,
	},
	topRow: { flexDirection: 'row', alignItems: 'center' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
	chipRow: { flexDirection: 'row', gap: SPACING_PX.sm },
	chip: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.full,
		borderWidth: BORDER_WIDTH_BASE,
	},
	daysInput: {
		width: SIZE_DAYS_INPUT_WIDTH,
		borderWidth: BORDER_WIDTH_BASE,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.xs,
		fontSize: FONT_SIZE.body,
		textAlign: 'center',
	},
	templateInput: {
		borderWidth: BORDER_WIDTH_BASE,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.caption,
		minHeight: SIZE_TEXTAREA_HEIGHT,
		textAlignVertical: 'top',
	},
	varChip: {
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.xs,
		borderRadius: BORDER_RADIUS_PX.lg,
		borderWidth: BORDER_WIDTH_BASE,
	},
});
