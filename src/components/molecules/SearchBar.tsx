import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

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

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: theme.colors.surfaceVariant,
					borderRadius: theme.borderRadius.md,
					paddingHorizontal: theme.spacing.md,
				},
				style,
			]}
		>
			<Search
				size={20}
				color={theme.colors.onSurfaceVariant}
				style={styles.icon}
				importantForAccessibility="no"
			/>
			<TextInput
				accessible={true}
				accessibilityLabel={accessibilityLabel ?? placeholder ?? 'Search'}
				accessibilityHint="Type to filter results"
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
				placeholder={placeholder}
				placeholderTextColor={theme.colors.placeholder}
				autoCorrect={false}
			/>
			{value.length > 0 && (
				<Pressable
					onPress={() => onChangeText('')}
					hitSlop={10}
					accessibilityRole="button"
					accessibilityLabel="Clear search"
				>
					<X
						size={20}
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
		height: 48,
	},
	icon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		height: '100%',
		padding: 0,
	},
});
