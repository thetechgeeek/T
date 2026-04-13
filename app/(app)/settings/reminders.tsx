import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';

import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';

const MULTILINE_INPUT_MIN_HEIGHT = 90;

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
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Payment Reminders" />
			<ScrollView
				contentContainerStyle={{ paddingBottom: 32 }}
				keyboardShouldPersistTaps="handled"
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
							style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
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
											gap: 6,
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
						<View style={[styles.chipRow, { marginHorizontal: 16 }]}>
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
										style={{
											color: channel === ch.key ? c.onPrimary : c.onSurface,
											fontWeight: '600',
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
							style={[styles.card, { backgroundColor: c.surface, borderWidth: 0 }]}
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
									marginTop: 10,
									marginBottom: 6,
								}}
							>
								Tap to insert variable:
							</ThemedText>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
											style={{ color: c.primary, fontWeight: '600' }}
										>
											{v}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</SettingsCard>
					</>
				)}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	topCard: {
		marginHorizontal: 16,
		marginTop: 20,
	},
	topRow: { flexDirection: 'row', alignItems: 'center' },
	card: { marginHorizontal: 16, borderRadius: 10, overflow: 'hidden' },
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	chipRow: { flexDirection: 'row', gap: 8 },
	chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
	daysInput: {
		width: 44,
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 6,
		fontSize: 15,
		textAlign: 'center',
	},
	templateInput: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		minHeight: MULTILINE_INPUT_MIN_HEIGHT,
		textAlignVertical: 'top',
	},
	varChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
});
