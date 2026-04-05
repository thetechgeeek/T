import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useLocale } from '@/src/hooks/useLocale';

export default function PaymentsScreen() {
	const { c } = useThemeTokens();
	const { t } = useLocale();
	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title={t('common.payments')} />
			<View style={styles.center}>
				<ThemedText color={c.placeholder}>
					{t('common.payments')} — {t('common.comingSoon')}
				</ThemedText>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
