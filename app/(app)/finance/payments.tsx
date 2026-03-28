import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function PaymentsScreen() {
	const { c } = useThemeTokens();
	const router = useRouter();
	return (
		<Screen safeAreaEdges={['top', 'bottom']}>
			<View
				style={[
					styles.header,
					{
						borderBottomColor: c.border,
						borderBottomWidth: 1,
						paddingHorizontal: 20,
						paddingBottom: 16,
					},
				]}
			>
				<TouchableOpacity onPress={() => router.back()} style={styles.back}>
					<ArrowLeft size={22} color={c.primary} strokeWidth={2} />
				</TouchableOpacity>
				<ThemedText variant="h2">Payments</ThemedText>
			</View>
			<View style={styles.center}>
				<ThemedText color={c.placeholder}>Payments — coming soon</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
	back: { marginRight: 4 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
