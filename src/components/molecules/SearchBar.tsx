import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Pressable, type StyleProp } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	/** Stable English identifier for screen readers. Defaults to placeholder or 'Search'. */
	accessibilityLabel?: string;
	/** Optional screen-reader hint for the field. */
	accessibilityHint?: string;
	/** Stable label for the clear affordance. Defaults to 'Clear search'. */
	clearAccessibilityLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	value,
	onChangeText,
	placeholder,
	style,
	testID,
	accessibilityLabel,
	accessibilityHint,
	clearAccessibilityLabel = 'Clear search',
}) => {
	const { theme } = useTheme();
	const searchTokens = theme.components.searchBar;
	const resolvedPlaceholder = placeholder ?? 'Search';
	const resolvedAccessibilityLabel = accessibilityLabel ?? resolvedPlaceholder;

	return (
		<View
			testID={testID}
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
				accessibilityLabel={resolvedAccessibilityLabel}
				accessibilityHint={accessibilityHint}
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
				placeholder={resolvedPlaceholder}
				placeholderTextColor={theme.colors.placeholder}
				autoCorrect={false}
			/>
			{value.length > 0 && (
				<Pressable
					onPress={() => onChangeText('')}
					hitSlop={10}
					accessibilityRole="button"
					accessibilityLabel={clearAccessibilityLabel}
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
