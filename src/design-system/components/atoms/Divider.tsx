import React from 'react';
import { View, StyleSheet, ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface DividerProps {
	style?: StyleProp<ViewStyle>;
	inset?: boolean;
	testID?: string;
}

export const Divider: React.FC<DividerProps> = ({ style, inset, testID }) => {
	const { theme } = useTheme();

	return (
		<View
			testID={testID}
			accessible={false}
			importantForAccessibility="no"
			style={[
				styles.divider,
				{
					backgroundColor: theme.colors.separator,
					marginStart: inset ? theme.spacing.md : 0,
				},
				style,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	divider: {
		height: StyleSheet.hairlineWidth,
		width: '100%',
	},
});
