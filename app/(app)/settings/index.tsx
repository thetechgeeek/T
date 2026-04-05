import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

export default function SettingsScreen() {
	const { c } = useThemeTokens();
	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Settings" />
			<View style={styles.center}>
				<ThemedText color={c.placeholder} accessibilityLabel="settings-coming-soon">
					Settings — coming soon
				</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
