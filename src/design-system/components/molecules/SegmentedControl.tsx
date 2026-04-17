import React, { forwardRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
	ToggleButtonGroup,
	type ToggleButtonOption,
} from '@/src/design-system/components/molecules/ToggleButtonGroup';

export interface SegmentedControlProps {
	label?: string;
	options: ToggleButtonOption[];
	value?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const SegmentedControl = forwardRef<View, SegmentedControlProps>(
	({ label, options, value, defaultValue, onChange, onValueChange, testID, style }, ref) => (
		<View ref={ref} style={style}>
			<ToggleButtonGroup
				label={label}
				options={options}
				value={value}
				defaultValue={defaultValue}
				onChange={(nextValue) => onChange(nextValue as string)}
				onValueChange={(nextValue, meta) =>
					onValueChange?.(nextValue as string, {
						source: meta?.source === 'selection' ? 'selection' : 'selection',
					})
				}
				testID={testID}
			/>
		</View>
	),
);

SegmentedControl.displayName = 'SegmentedControl';
