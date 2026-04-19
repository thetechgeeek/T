import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Pressable,
	ActivityIndicator,
	type StyleProp,
	type TextInput as NativeTextInput,
	type ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useDebounce } from '@/src/hooks/useDebounce';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';

interface SearchBarProps {
	value?: string;
	defaultValue?: string;
	onChangeText: (text: string) => void;
	onValueChange?: (value: string, meta?: { source: 'input' | 'clear' }) => void;
	onDebouncedChange?: (value: string) => void;
	debounceMs?: number;
	placeholder?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	/** Stable English identifier for screen readers. Defaults to placeholder or 'Search'. */
	accessibilityLabel?: string;
	/** Optional screen-reader hint for the field. */
	accessibilityHint?: string;
	/** Stable label for the clear affordance. Defaults to 'Clear search'. */
	clearAccessibilityLabel?: string;
	loading?: boolean;
	loadingAccessibilityLabel?: string;
}

export const SearchBar = forwardRef<NativeTextInput, SearchBarProps>(
	(
		{
			value,
			defaultValue = '',
			onChangeText,
			onValueChange,
			onDebouncedChange,
			debounceMs,
			placeholder,
			style,
			testID,
			accessibilityLabel,
			accessibilityHint,
			clearAccessibilityLabel = 'Clear search',
			loading = false,
			loadingAccessibilityLabel = 'Search loading',
		},
		ref,
	) => {
		const { theme } = useTheme();
		const searchTokens = theme.components.searchBar;
		const resolvedPlaceholder = placeholder ?? 'Search';
		const resolvedAccessibilityLabel = accessibilityLabel ?? resolvedPlaceholder;
		const [isFocused, setIsFocused] = useState(false);
		const skipInitialDebounce = useRef(true);
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
		const debouncedValue = useDebounce(currentValue, debounceMs ?? 0);

		useEffect(() => {
			if (!onDebouncedChange) {
				return;
			}

			if (skipInitialDebounce.current) {
				skipInitialDebounce.current = false;
				return;
			}

			onDebouncedChange(debouncedValue);
		}, [debouncedValue, onDebouncedChange]);

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
				<LucideIconGlyph
					icon={Search}
					size={searchTokens.iconSize}
					color={theme.colors.onSurfaceVariant}
					style={{ marginEnd: searchTokens.iconGap }}
				/>
				<TextInput
					ref={ref}
					accessible={true}
					accessibilityRole="search"
					accessibilityLabel={resolvedAccessibilityLabel}
					accessibilityHint={accessibilityHint}
					accessibilityState={{ busy: loading }}
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
				{loading ? (
					<ActivityIndicator
						size="small"
						color={theme.colors.primary}
						accessibilityLabel={loadingAccessibilityLabel}
					/>
				) : currentValue.length > 0 ? (
					<Pressable
						onPress={() => {
							setCurrentValue('', { source: 'clear' });
							void announceForScreenReader('Search cleared');
						}}
						hitSlop={10}
						accessibilityRole="button"
						accessibilityLabel={clearAccessibilityLabel}
					>
						<LucideIconGlyph
							icon={X}
							size={searchTokens.iconSize}
							color={theme.colors.onSurfaceVariant}
						/>
					</Pressable>
				) : null}
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
