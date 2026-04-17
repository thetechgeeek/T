import React, { forwardRef } from 'react';
import { ScrollView, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface TabOption {
	label: string;
	value: string;
	icon?: React.ReactNode;
	badgeCount?: number;
}

export interface TabsProps {
	options: TabOption[];
	value?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const Tabs = forwardRef<View, TabsProps>(
	({ options, value, defaultValue, onChange, onValueChange, testID, style }, ref) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue: defaultValue ?? options[0]?.value ?? '',
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'selection' });
			},
		});

		return (
			<View ref={ref} testID={testID} style={style}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						flexDirection: 'row',
						gap: theme.spacing.sm,
						paddingBottom: theme.spacing.xs,
					}}
				>
					{options.map((option) => {
						const selected = option.value === currentValue;
						return (
							<Pressable
								key={option.value}
								testID={`${testID ?? 'tabs'}-${option.value}`}
								onPress={() =>
									setCurrentValue(option.value, { source: 'selection' })
								}
								accessibilityRole="tab"
								accessibilityState={{ selected }}
								style={{
									minHeight: theme.touchTarget,
									paddingHorizontal: theme.spacing.md,
									paddingVertical: theme.spacing.sm,
									borderBottomWidth: theme.borderWidth.md,
									borderBottomColor: selected ? c.primary : 'transparent',
									alignItems: 'center',
									flexDirection: 'row',
									gap: theme.spacing.xs,
								}}
							>
								{option.icon ? <View>{option.icon}</View> : null}
								<ThemedText
									variant="bodyStrong"
									style={{ color: selected ? c.onSurface : c.onSurfaceVariant }}
								>
									{option.label}
								</ThemedText>
								{typeof option.badgeCount === 'number' ? (
									<Badge label="" count={option.badgeCount} size="sm" />
								) : null}
							</Pressable>
						);
					})}
				</ScrollView>
			</View>
		);
	},
);

Tabs.displayName = 'Tabs';
