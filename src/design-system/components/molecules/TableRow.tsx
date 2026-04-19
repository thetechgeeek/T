import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { layout } from '@/src/theme/layout';
import { Tooltip } from './Tooltip';

export type TableRowVariant = 'default' | 'header' | 'total';

export interface TableColumn {
	label: string;
	value?: React.ReactNode;
	flex?: number;
	width?: number;
	align?: 'left' | 'center' | 'right';
}

export interface TableRowProps {
	columns: TableColumn[];
	variant?: TableRowVariant;
	density?: 'compact' | 'default';
	style?: StyleProp<ViewStyle>;
	textColor?: string;
	testID?: string;
}

const HEADER_TEXT_MAX_LINES = 2;
const CELL_TEXT_MAX_LINES = 1;
const TRUNCATION_TOOLTIP_MIN_LENGTH = 24;

export function TableRow({
	columns,
	variant = 'default',
	density = 'default',
	style,
	textColor,
	testID,
}: TableRowProps) {
	const { c, s } = useThemeTokens();

	const isHeader = variant === 'header';
	const isTotal = variant === 'total';

	const textVariant = isHeader ? 'caption' : 'body';
	const weight = isHeader ? 'semibold' : isTotal ? 'bold' : undefined;
	const color = textColor ?? (isHeader ? c.onSurfaceVariant : c.onSurface);
	const numberOfLines = isHeader ? HEADER_TEXT_MAX_LINES : CELL_TEXT_MAX_LINES;

	const renderCellText = (value: string, align: TableColumn['align'], tooltipTestId?: string) => {
		const textNode = (
			<ThemedText
				variant={textVariant}
				weight={weight}
				color={color}
				align={align}
				numberOfLines={numberOfLines}
				accessibilityLabel={value}
			>
				{value}
			</ThemedText>
		);

		if (value.length < TRUNCATION_TOOLTIP_MIN_LENGTH) {
			return textNode;
		}

		return (
			<Tooltip
				trigger={textNode}
				triggerLabel={value}
				content={value}
				testID={tooltipTestId}
			/>
		);
	};

	return (
		<View
			testID={testID}
			style={[
				styles.row,
				layout.row,
				{
					paddingHorizontal: s.lg,
					paddingVertical: density === 'compact' ? s.xs : s.sm,
					borderBottomColor: c.separator,
					borderBottomWidth: StyleSheet.hairlineWidth,
				},
				style,
			]}
		>
			{columns.map((col, idx) => (
				<View
					key={`${col.label}-${idx}`}
					style={col.width ? { width: col.width } : { flex: col.flex ?? 1 }}
				>
					{typeof (isHeader ? col.label : col.value) === 'string'
						? renderCellText(
								(isHeader ? col.label : (col.value as string)) ?? '',
								col.align,
								testID ? `${testID}-tooltip-${idx}` : undefined,
							)
						: isHeader
							? renderCellText(
									col.label,
									col.align,
									testID ? `${testID}-tooltip-${idx}` : undefined,
								)
							: (col.value ?? null)}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { justifyContent: 'space-between' },
});
