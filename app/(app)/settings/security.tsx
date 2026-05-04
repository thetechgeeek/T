import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { Screen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SectionHeader } from '@easydesign/design-system';
import { SettingsCard } from '@easydesign/design-system';
import { SPACING_PX } from '@easydesign/design-system/foundation';

export default function SecuritySettingsScreen() {
	const { c } = useThemeTokens();

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title="Security Settings" />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
		>
			<SectionHeader title="Status" variant="uppercase" titleColor={c.primary} />
			<SettingsCard
				padding="lg"
				style={{
					marginHorizontal: SPACING_PX.lg,
					backgroundColor: c.surface,
					borderWidth: 0,
				}}
			>
				<View style={styles.notice}>
					<ThemedText variant="body" weight="semibold">
						Security controls are unavailable
					</ThemedText>
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						PIN, biometric authentication, auto-lock, and transaction protection are not
						enforced in this build.
					</ThemedText>
				</View>
			</SettingsCard>
		</Screen>
	);
}

const styles = StyleSheet.create({
	notice: {
		gap: SPACING_PX.xs,
	},
});
