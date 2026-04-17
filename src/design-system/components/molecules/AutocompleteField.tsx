import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface AutocompleteOption {
	label: string;
	value: string;
}

export interface AutocompleteFieldProps {
	label: string;
	options: AutocompleteOption[];
	value?: string | string[];
	defaultValue?: string | string[];
	multiple?: boolean;
	allowCreate?: boolean;
	onChange: (value: string | string[]) => void;
	onValueChange?: (value: string | string[], meta?: { source: 'selection' | 'create' }) => void;
	onAsyncSearch?: (query: string) => Promise<AutocompleteOption[]>;
	debounceMs?: number;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const AutocompleteField = forwardRef<View, AutocompleteFieldProps>(
	(
		{
			label,
			options,
			value,
			defaultValue,
			multiple = false,
			allowCreate = false,
			onChange,
			onValueChange,
			onAsyncSearch,
			debounceMs = 250,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [query, setQuery] = useState('');
		const [remoteOptions, setRemoteOptions] = useState<AutocompleteOption[]>([]);
		const debouncedQuery = useDebounce(query, debounceMs);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue: defaultValue ?? (multiple ? [] : ''),
			onChange: (nextValue, meta) => {
				onChange(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'create' ? 'create' : 'selection',
				});
			},
		});

		useEffect(() => {
			let active = true;
			if (!onAsyncSearch) {
				return undefined;
			}

			void onAsyncSearch(debouncedQuery).then((nextOptions) => {
				if (active) {
					setRemoteOptions(nextOptions);
				}
			});

			return () => {
				active = false;
			};
		}, [debouncedQuery, onAsyncSearch]);

		const selectedValues = Array.isArray(currentValue)
			? currentValue
			: currentValue
				? [currentValue]
				: [];
		const sourceOptions = onAsyncSearch ? remoteOptions : options;
		const filteredOptions = useMemo(() => {
			const normalizedQuery = debouncedQuery.trim().toLowerCase();
			if (!normalizedQuery) {
				return sourceOptions;
			}
			return sourceOptions.filter((option) =>
				option.label.toLowerCase().includes(normalizedQuery),
			);
		}, [debouncedQuery, sourceOptions]);
		const canCreate =
			allowCreate &&
			query.trim().length > 0 &&
			!sourceOptions.some(
				(option) => option.label.toLowerCase() === query.trim().toLowerCase(),
			);

		const selectOption = (option: AutocompleteOption, source: 'selection' | 'create') => {
			if (multiple) {
				const nextValues = selectedValues.includes(option.value)
					? selectedValues
					: [...selectedValues, option.value];
				setCurrentValue(nextValues, { source });
			} else {
				setCurrentValue(option.value, { source });
			}
			setQuery('');
		};

		return (
			<View ref={ref} testID={testID} style={style}>
				<TextInput
					label={label}
					value={query}
					onChangeText={setQuery}
					helperText="Type to search or create"
				/>
				{multiple && selectedValues.length > 0 ? (
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							gap: theme.spacing.sm,
							marginBottom: theme.spacing.sm,
						}}
					>
						{selectedValues.map((selectedValue) => (
							<Badge key={selectedValue} label={selectedValue} variant="neutral" />
						))}
					</View>
				) : null}
				<View
					style={{
						borderWidth: theme.borderWidth.sm,
						borderColor: c.border,
						borderRadius: theme.borderRadius.md,
						backgroundColor: theme.visual.surfaces.raised,
					}}
				>
					{filteredOptions.map((option) => (
						<Pressable
							key={option.value}
							testID={`${testID ?? 'autocomplete'}-${option.value}`}
							onPress={() => selectOption(option, 'selection')}
							accessibilityRole="button"
							accessibilityLabel={option.label}
							style={{
								paddingHorizontal: theme.spacing.md,
								paddingVertical: theme.spacing.sm,
								borderBottomWidth: theme.borderWidth.hairline,
								borderBottomColor: c.border,
							}}
						>
							<ThemedText variant="body" style={{ color: c.onSurface }}>
								{option.label}
							</ThemedText>
						</Pressable>
					))}
					{canCreate ? (
						<Pressable
							testID={`${testID ?? 'autocomplete'}-create`}
							onPress={() =>
								selectOption(
									{
										label: query.trim(),
										value: query.trim(),
									},
									'create',
								)
							}
							accessibilityRole="button"
							accessibilityLabel={`Create ${query.trim()}`}
							style={{
								paddingHorizontal: theme.spacing.md,
								paddingVertical: theme.spacing.sm,
							}}
						>
							<ThemedText variant="bodyStrong" style={{ color: c.primary }}>
								Create “{query.trim()}”
							</ThemedText>
						</Pressable>
					) : null}
					{filteredOptions.length === 0 && !canCreate ? (
						<View
							style={{
								paddingHorizontal: theme.spacing.md,
								paddingVertical: theme.spacing.sm,
							}}
						>
							<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
								No matches found
							</ThemedText>
						</View>
					) : null}
				</View>
			</View>
		);
	},
);

AutocompleteField.displayName = 'AutocompleteField';
