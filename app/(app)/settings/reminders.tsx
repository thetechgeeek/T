import React, { useState } from 'react';
import { View, Switch, StyleSheet, Pressable, TextInput } from 'react-native';

import { useThemeTokens } from '@easydesign/design-system/foundation';
import { Screen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SectionHeader } from '@easydesign/design-system';
import { SettingsCard } from '@easydesign/design-system';
import { withOpacity } from '@easydesign/design-system/foundation';
import {
	BORDER_WIDTH_BASE,
	OPACITY_TINT_LIGHT,
	SIZE_DAYS_INPUT_WIDTH,
	SIZE_TEXTAREA_HEIGHT,
} from '@easydesign/design-system/foundation';
import { BORDER_RADIUS_PX, SPACING_PX } from '@easydesign/design-system/foundation';
import { FONT_SIZE } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';

type Channel = 'whatsapp' | 'sms' | 'both';

const VARIABLES = ['{PartyName}', '{Amount}', '{DueDate}', '{InvoiceNo}', '{BusinessName}'];

export default function RemindersScreen() {
	const { c } = useThemeTokens();
	const { t } = useLocale();

	const [autoReminders, setAutoReminders] = useState(false);
	const [first, setFirst] = useState('7');
	const [second, setSecond] = useState('15');
	const [third, setThird] = useState('30');
	const [channel, setChannel] = useState<Channel>('whatsapp');
	const [template, setTemplate] = useState(() => t('settings.reminders.defaultTemplate'));

	const insertVariable = (v: string) => {
		setTemplate((prev) => prev + v);
	};

	return (
		<Screen
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title={t('settings.reminders.title')} />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
		>
			{/* Auto reminders toggle */}
			<SettingsCard style={styles.topCard} padding="md">
				<View style={styles.topRow}>
					<ThemedText variant="body" style={{ flex: 1 }} weight="semibold">
						{t('settings.reminders.autoReminders')}
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
						title={t('settings.reminders.schedule')}
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
							{
								label: t('settings.reminders.firstAfter'),
								value: first,
								setter: setFirst,
							},
							{
								label: t('settings.reminders.secondAfter'),
								value: second,
								setter: setSecond,
							},
							{
								label: t('settings.reminders.thirdAfter'),
								value: third,
								setter: setThird,
							},
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
										{t('common.days')}
									</ThemedText>
								</View>
							</View>
						))}
					</SettingsCard>

					<SectionHeader
						title={t('settings.reminders.channel')}
						variant="uppercase"
						titleColor={c.primary}
					/>
					<View style={[styles.chipRow, { marginHorizontal: SPACING_PX.lg }]}>
						{(
							[
								{ key: 'whatsapp', label: t('settings.reminders.whatsapp') },
								{ key: 'sms', label: t('settings.reminders.sms') },
								{ key: 'both', label: t('settings.reminders.both') },
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
						title={t('settings.reminders.messageTemplate')}
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
							{t('settings.reminders.insertVariable')}
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
