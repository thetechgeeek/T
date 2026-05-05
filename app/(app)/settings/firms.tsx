import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { Screen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SettingsCard } from '@easydesign/design-system';
import { withOpacity } from '@easydesign/design-system/foundation';
import {
	BORDER_WIDTH_BASE,
	BORDER_WIDTH_MEDIUM,
	OPACITY_TINT_LIGHT,
} from '@easydesign/design-system/foundation';
import { BORDER_RADIUS_PX, SPACING_PX } from '@easydesign/design-system/foundation';
import { LINE_HEIGHT } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';

export default function FirmsScreen() {
	const { c } = useThemeTokens();
	const { t } = useLocale();

	const handleAddBusiness = () => {
		Alert.alert(t('settings.firms.addBusiness'), t('settings.firms.addBusinessMessage'), [
			{ text: t('common.ok') },
		]);
	};

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title={t('settings.firms.manageBusinesses')} />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
		>
			{/* Active firm card */}
			<SettingsCard style={[styles.firmCard, { backgroundColor: c.surface }]}>
				<View style={{ flex: 1 }}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: SPACING_PX.md,
						}}
					>
						<ThemedText variant="body" weight="bold" style={{ flex: 1 }}>
							{t('settings.firms.myBusiness')}
						</ThemedText>
						<View style={[styles.badge, { backgroundColor: c.successLight }]}>
							<ThemedText variant="caption" color={c.paid} weight="bold">
								{t('settings.firms.active')}
							</ThemedText>
						</View>
					</View>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginTop: SPACING_PX.xxs }}
					>
						22AAAAA0000A1Z5
					</ThemedText>
				</View>
			</SettingsCard>

			{/* Add business button */}
			<Pressable
				onPress={handleAddBusiness}
				style={[
					styles.addBtn,
					{
						borderColor: c.primary,
						backgroundColor: withOpacity(c.primary, OPACITY_TINT_LIGHT),
					},
				]}
			>
				<ThemedText variant="body" color={c.primary} weight="bold">
					{t('settings.firms.addAnotherBusiness')}
				</ThemedText>
			</Pressable>

			{/* Info text */}
			<View style={[styles.infoBox, { backgroundColor: c.surface, borderColor: c.border }]}>
				<ThemedText
					variant="caption"
					style={{
						color: c.onSurfaceVariant,
						textAlign: 'center',
						lineHeight: LINE_HEIGHT.caption,
					}}
				>
					{t('settings.firms.separateData')}
				</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	firmCard: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.xl,
	},
	badge: {
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.xs,
		borderRadius: BORDER_RADIUS_PX.lg,
	},
	addBtn: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.lg,
		borderRadius: BORDER_RADIUS_PX.lg,
		borderWidth: BORDER_WIDTH_MEDIUM,
		borderStyle: 'dashed',
		padding: SPACING_PX.lg,
		alignItems: 'center',
	},
	infoBox: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.lg,
		borderRadius: BORDER_RADIUS_PX.lg,
		borderWidth: BORDER_WIDTH_BASE,
		padding: SPACING_PX.lg,
	},
});
