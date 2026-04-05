import { View, StyleSheet } from 'react-native';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export default function SupplierDetailScreen() {
	const { c } = useThemeTokens();
	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Supplier Detail" />
			<View style={styles.center}>
				<ThemedText color={c.placeholder}>Supplier Detail — coming soon</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
