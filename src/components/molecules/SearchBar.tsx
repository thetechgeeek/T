import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	style?: ViewStyle;
	/** Stable English identifier for screen readers. Defaults to placeholder or 'Search'. */
	accessibilityLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	value,
	onChangeText,
	placeholder,
	style,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();
	const { t } = useLocale();
	const searchTokens = theme.components.searchBar;

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: theme.colors.surfaceVariant,
					borderRadius: searchTokens.radius,
					paddingHorizontal: searchTokens.paddingX,
					height: searchTokens.height,
				},
				style,
			]}
		>
			<Search
				size={searchTokens.iconSize}
				color={theme.colors.onSurfaceVariant}
				style={{ marginRight: searchTokens.iconGap }}
				importantForAccessibility="no"
			/>
			<TextInput
				accessible={true}
				accessibilityLabel={accessibilityLabel ?? placeholder ?? t('common.search')}
				accessibilityHint={t('inventory.emptyFilterHint')}
				style={[
					styles.input,
					{
						color: theme.colors.onSurface,
						fontSize: theme.typography.sizes.md,
						fontFamily: theme.typography.fontFamily,
					},
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder ?? t('common.search')}
				placeholderTextColor={theme.colors.placeholder}
				autoCorrect={false}
			/>
			{value.length > 0 && (
				<Pressable
					onPress={() => onChangeText('')}
					hitSlop={10}
					accessibilityRole="button"
					accessibilityLabel={t('common.clear')}
				>
					<X
						size={searchTokens.iconSize}
						color={theme.colors.onSurfaceVariant}
						importantForAccessibility="no"
					/>
				</Pressable>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: {
		flex: 1,
		height: '100%',
		padding: 0,
	},
});
