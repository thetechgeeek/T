import React from 'react';
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '../atoms/ThemedText';
import { layout } from '@/src/theme/layout';

export interface ScreenHeaderProps {
	title: string | React.ReactNode;
	onBack?: () => void;
	rightElement?: React.ReactNode;
	style?: ViewStyle;
	showBackButton?: boolean;
}

/**
 * A standardized header for all screens in the app.
 * Fulfills the user's request for a consistent back button.
 * Automatically respects the top safe area inset (status bar).
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	title,
	onBack,
	rightElement,
	style,
	showBackButton = true,
}) => {
	const { c, s } = useThemeTokens();
	const { t } = useLocale();
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const handleBack = onBack || (() => router.back());

	return (
		<View
			style={[
				styles.header,
				layout.rowBetween,
				{
					borderBottomColor: c.border,
					borderBottomWidth: 1,
					paddingHorizontal: s.lg,
					paddingBottom: s.md,
					paddingTop: Math.max(insets.top, s.sm),
				},
				style,
			]}
		>
			<View style={[layout.row, { flex: 1 }]}>
				{showBackButton && (
					<TouchableOpacity
						onPress={handleBack}
						style={styles.back}
						accessibilityRole="button"
						accessibilityLabel={t('common.back')}
					>
						<ArrowLeft size={22} color={c.primary} strokeWidth={2} />
					</TouchableOpacity>
				)}
				<ThemedText
					variant="h2"
					style={{ marginLeft: showBackButton ? s.md : 0, flex: 1 }}
					numberOfLines={1}
				>
					{title}
				</ThemedText>
			</View>
			{rightElement && <View style={styles.right}>{rightElement}</View>}
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		alignItems: 'center',
	},
	back: {
		padding: 11,
		marginLeft: -11,
	},
	right: {
		marginLeft: 12,
	},
});
