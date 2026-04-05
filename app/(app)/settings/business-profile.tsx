import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

export default function BusinessProfileScreen() {
	const { c } = useThemeTokens();
	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Business Profile" />
			<View style={styles.center}>
				<ThemedText color={c.placeholder}>Business Profile — coming soon</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
