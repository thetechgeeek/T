import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useLocale } from '@/src/hooks/useLocale';

export interface DashboardHeaderProps {
	businessName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ businessName }) => {
	const { theme } = useTheme();
	const { t, currentLanguage } = useLocale();
	const insets = useSafeAreaInsets();

	const c = theme.colors;
	const s = theme.spacing;
	const today = new Date().toLocaleDateString(`${currentLanguage}-IN`, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<View
			style={[
				styles.header,
				{
					backgroundColor: c.primary,
					paddingTop: insets.top + s.md,
					paddingHorizontal: s.lg,
					paddingBottom: s.xl,
				},
			]}
		>
			<ThemedText variant="body1" color={c.onPrimary} opacity={0.9}>
				{t('dashboard.greeting')} 🙏
			</ThemedText>

			<View style={[theme.layout.rowBetween, { marginTop: s.xs }]}>
				<ThemedText variant="h2" color={c.onPrimary} style={{ flex: 1 }}>
					{businessName}
				</ThemedText>
				<View style={[styles.dateBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
					<ThemedText variant="caption" color={c.onPrimary}>
						{today}
					</ThemedText>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
	},
	dateBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
});
