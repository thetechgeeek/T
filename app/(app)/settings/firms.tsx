import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

const ADD_FIRM_BORDER_WIDTH = 1.5;
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

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
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Manage Businesses" />
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				{/* Active firm card */}
				<View
					style={[styles.firmCard, { backgroundColor: c.surface, borderColor: c.border }]}
				>
					<View style={{ flex: 1 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
							<ThemedText variant="body" style={{ fontWeight: '700', flex: 1 }}>
								My Business
							</ThemedText>
							<View style={[styles.badge, { backgroundColor: c.successLight }]}>
								<ThemedText
									variant="caption"
									style={{ color: c.paid, fontWeight: '700' }}
								>
									Active
								</ThemedText>
							</View>
						</View>
						<ThemedText
							variant="caption"
							style={{ color: c.onSurfaceVariant, marginTop: 2 }}
						>
							22AAAAA0000A1Z5
						</ThemedText>
					</View>
				</View>

				{/* Add business button */}
				<Pressable
					onPress={handleAddBusiness}
					style={[
						styles.addBtn,
						{ borderColor: c.primary, backgroundColor: `${c.primary}10` },
					]}
				>
					<ThemedText style={{ color: c.primary, fontWeight: '700', fontSize: 15 }}>
						+ Add Another Business
					</ThemedText>
				</Pressable>

				{/* Info text */}
				<View
					style={[styles.infoBox, { backgroundColor: c.surface, borderColor: c.border }]}
				>
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, textAlign: 'center', lineHeight: 20 }}
					>
						Each business has completely separate data and settings
					</ThemedText>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	firmCard: {
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 12,
		borderWidth: 1,
		padding: 16,
	},
	badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	addBtn: {
		marginHorizontal: 16,
		marginTop: 16,
		borderRadius: 10,
		borderWidth: ADD_FIRM_BORDER_WIDTH,
		borderStyle: 'dashed',
		padding: 16,
		alignItems: 'center',
	},
	infoBox: { marginHorizontal: 16, marginTop: 16, borderRadius: 10, borderWidth: 1, padding: 16 },
});
