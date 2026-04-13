import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { layout } from '@/src/theme/layout';

export type TableRowVariant = 'default' | 'header' | 'total';

export interface TableColumn {
	label: string;
	value?: React.ReactNode;
	flex?: number;
	align?: 'left' | 'center' | 'right';
}

export interface TableRowProps {
	columns: TableColumn[];
	variant?: TableRowVariant;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

export function TableRow({ columns, variant = 'default', style, testID }: TableRowProps) {
	const { c, s } = useThemeTokens();

	const isHeader = variant === 'header';
	const isTotal = variant === 'total';

	const textVariant = isHeader ? 'caption' : 'body';
	const weight = isHeader ? 'semibold' : isTotal ? 'bold' : undefined;
	const color = isHeader ? c.onSurfaceVariant : c.onSurface;

	return (
		<View
			testID={testID}
			style={[
				styles.row,
				layout.row,
				{
					paddingHorizontal: s.lg,
					paddingVertical: s.sm,
					borderBottomColor: c.separator,
					borderBottomWidth: StyleSheet.hairlineWidth,
				},
				style,
			]}
		>
			{columns.map((col, idx) => (
				<View key={`${col.label}-${idx}`} style={{ flex: col.flex ?? 1 }}>
					{typeof (isHeader ? col.label : col.value) === 'string' ? (
						<ThemedText
							variant={textVariant}
							weight={weight}
							color={color}
							align={col.align}
							numberOfLines={1}
						>
							{(isHeader ? col.label : (col.value as string)) ?? ''}
						</ThemedText>
					) : isHeader ? (
						<ThemedText
							variant={textVariant}
							weight={weight}
							color={color}
							align={col.align}
							numberOfLines={1}
						>
							{col.label}
						</ThemedText>
					) : (
						(col.value ?? null)
					)}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { justifyContent: 'space-between' },
});
