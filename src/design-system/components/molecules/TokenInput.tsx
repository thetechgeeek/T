import React, { forwardRef, useState } from 'react';
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { SwipeableRow } from '@/src/design-system/components/molecules/SwipeableRow';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface TokenInputProps {
	label: string;
	values?: string[];
	defaultValues?: string[];
	onChange: (values: string[]) => void;
	onValueChange?: (values: string[], meta?: { source: 'add' | 'remove' }) => void;
	maxTags?: number;
	placeholder?: string;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const TokenInput = forwardRef<View, TokenInputProps>(
	(
		{
			label,
			values,
			defaultValues = [],
			onChange,
			onValueChange,
			maxTags = 5,
			placeholder = 'Add a tag',
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [draftValue, setDraftValue] = useState('');
		const [limitReached, setLimitReached] = useState(false);
		const [currentValues, setCurrentValues] = useControllableState({
			value: values,
			defaultValue: defaultValues,
			onChange: (nextValues, meta) => {
				onChange(nextValues);
				onValueChange?.(nextValues, {
					source: meta?.source === 'remove' ? 'remove' : 'add',
				});
			},
		});

		const addToken = () => {
			const normalized = draftValue.trim();
			if (!normalized) {
				return;
			}

			if (currentValues.length >= maxTags) {
				setLimitReached(true);
				return;
			}

			if (currentValues.includes(normalized)) {
				setDraftValue('');
				return;
			}

			setLimitReached(false);
			setCurrentValues([...currentValues, normalized], { source: 'add' });
			setDraftValue('');
		};

		return (
			<View ref={ref} testID={testID} style={style}>
				<ThemedText
					variant="label"
					style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
				>
					{label}
				</ThemedText>
				<View
					style={{
						borderWidth: theme.borderWidth.sm,
						borderColor: limitReached ? c.warning : c.border,
						borderRadius: theme.borderRadius.md,
						padding: theme.spacing.sm,
					}}
				>
					<View style={{ gap: theme.spacing.sm }}>
						{currentValues.map((token) => (
							<SwipeableRow
								key={token}
								onDelete={() =>
									setCurrentValues(
										currentValues.filter((valueEntry) => valueEntry !== token),
										{ source: 'remove' },
									)
								}
								deleteLabel={`Remove ${token}`}
							>
								<View style={{ paddingVertical: theme.spacing.xxs }}>
									<Badge label={token} variant="neutral" />
								</View>
							</SwipeableRow>
						))}
					</View>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: theme.spacing.sm,
							marginTop: theme.spacing.sm,
						}}
					>
						<TextInput
							testID={`${testID ?? 'token-input'}-field`}
							value={draftValue}
							onChangeText={(nextValue) => {
								setDraftValue(nextValue);
								if (limitReached) {
									setLimitReached(false);
								}
							}}
							onSubmitEditing={addToken}
							placeholder={placeholder}
							placeholderTextColor={c.placeholder}
							accessibilityLabel={label}
							style={{
								flex: 1,
								minHeight: theme.touchTarget,
								color: c.onSurface,
							}}
						/>
						<Pressable
							testID={`${testID ?? 'token-input'}-add`}
							onPress={addToken}
							accessibilityRole="button"
							accessibilityLabel={`Add token for ${label}`}
							style={{
								minHeight: theme.touchTarget,
								justifyContent: 'center',
							}}
						>
							<ThemedText variant="captionBold" style={{ color: c.primary }}>
								Add
							</ThemedText>
						</Pressable>
					</View>
				</View>
				<ThemedText
					variant="caption"
					style={{
						color: limitReached ? c.warning : c.onSurfaceVariant,
						marginTop: theme.spacing.xs,
					}}
				>
					{limitReached
						? `Limit reached. Showing ${currentValues.length}/${maxTags} tags.`
						: `${currentValues.length}/${maxTags} tags`}
				</ThemedText>
			</View>
		);
	},
);

TokenInput.displayName = 'TokenInput';
