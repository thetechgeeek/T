import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { SettingsCard } from '@/src/design-system/components/molecules/SettingsCard';
import { withOpacity } from '@/src/utils/color';
import { BORDER_WIDTH_BASE, BORDER_WIDTH_MEDIUM, OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { LINE_HEIGHT } from '@/src/theme/typographyMetrics';

export default function FirmsScreen() {
	const { c } = useThemeTokens();

	const handleAddBusiness = () => {
		Alert.alert(
			'Add Business',
			'This will create a completely separate business. Current data stays safe. Max 5 businesses.',
			[{ text: 'OK' }],
		);
	};

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title="Manage Businesses" />}
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
							My Business
						</ThemedText>
						<View style={[styles.badge, { backgroundColor: c.successLight }]}>
							<ThemedText variant="caption" color={c.paid} weight="bold">
								Active
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
					+ Add Another Business
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
					Each business has completely separate data and settings
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
