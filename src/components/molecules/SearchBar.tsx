import React, { forwardRef, useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Pressable,
	type StyleProp,
	type TextInput as NativeTextInput,
	type ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';

interface SearchBarProps {
	value?: string;
	defaultValue?: string;
	onChangeText: (text: string) => void;
	onValueChange?: (value: string, meta?: { source: 'input' | 'clear' }) => void;
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

export const SearchBar = forwardRef<NativeTextInput, SearchBarProps>(
	(
		{
			value,
			defaultValue = '',
			onChangeText,
			onValueChange,
			placeholder,
			style,
			testID,
			accessibilityLabel,
			accessibilityHint,
			clearAccessibilityLabel = 'Clear search',
		},
		ref,
	) => {
		const { theme } = useTheme();
		const searchTokens = theme.components.searchBar;
		const resolvedPlaceholder = placeholder ?? 'Search';
		const resolvedAccessibilityLabel = accessibilityLabel ?? resolvedPlaceholder;
		const [isFocused, setIsFocused] = useState(false);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue, meta) => {
				onChangeText(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'clear' ? 'clear' : 'input',
				});
			},
		});

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
					isFocused
						? buildFocusRingStyle({
								color: theme.colors.primary,
								radius: searchTokens.radius,
							})
						: null,
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
					ref={ref}
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
					value={currentValue}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					onChangeText={(nextValue) => setCurrentValue(nextValue, { source: 'input' })}
					placeholder={resolvedPlaceholder}
					placeholderTextColor={theme.colors.placeholder}
					autoCorrect={false}
				/>
				{currentValue.length > 0 && (
					<Pressable
						onPress={() => {
							setCurrentValue('', { source: 'clear' });
							void announceForScreenReader('Search cleared');
						}}
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
	},
);

SearchBar.displayName = 'SearchBar';

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
