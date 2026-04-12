import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

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
				<View
					style={[styles.topCard, { backgroundColor: c.surface, borderColor: c.border }]}
				>
					<ThemedText variant="body" style={{ flex: 1, fontWeight: '700' }}>
						Auto Reminders
					</ThemedText>
					<Switch
						trackColor={{ true: c.primary, false: c.border }}
						value={autoReminders}
						onValueChange={setAutoReminders}
					/>
				</View>

				{autoReminders && (
					<>
						<ThemedText
							variant="caption"
							style={[styles.sectionLabel, { color: c.primary }]}
						>
							Reminder Schedule
						</ThemedText>
						<View style={[styles.card, { backgroundColor: c.surface }]}>
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
						</View>

						<ThemedText
							variant="caption"
							style={[styles.sectionLabel, { color: c.primary }]}
						>
							Channel
						</ThemedText>
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

						<ThemedText
							variant="caption"
							style={[styles.sectionLabel, { color: c.primary }]}
						>
							Message Template
						</ThemedText>
						<View style={[styles.card, { backgroundColor: c.surface, padding: 14 }]}>
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
												backgroundColor: `${c.primary}15`,
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
						</View>
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
		borderRadius: 12,
		borderWidth: 1,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	sectionLabel: {
		marginTop: 20,
		marginBottom: 4,
		marginHorizontal: 16,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
	},
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
		minHeight: 90,
		textAlignVertical: 'top',
	},
	varChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
});
