import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { Screen } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { useLocale } from '@/src/hooks/useLocale';

export default function SecurityLockScreen() {
	const { c } = useThemeTokens();
	const { t } = useLocale();

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title={t('settings.security')} />
			<View style={styles.center}>
				<ThemedText color={c.placeholder}>{t('settings.securityComingSoon')}</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
