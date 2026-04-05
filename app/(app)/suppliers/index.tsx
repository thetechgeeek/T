import { View, StyleSheet } from 'react-native';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';

export default function SupplierListScreen() {
	const { c } = useThemeTokens();
	const { t } = useLocale();

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title={t('supplier.title')} />
			<View style={styles.center}>
				<ThemedText color={c.placeholder}>{t('supplier.comingSoon')}</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
