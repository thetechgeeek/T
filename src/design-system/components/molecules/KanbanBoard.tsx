import React, { forwardRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowLeftRight } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card } from '@/src/design-system/components/atoms/Card';
import {
	SortableList,
	type SortableListItemShape,
} from '@/src/design-system/components/molecules/SortableList';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface KanbanBoardCard extends SortableListItemShape {
	title: string;
	description?: string;
	statusLabel?: string;
}

export interface KanbanBoardColumn {
	id: string;
	title: string;
	wipLimit?: number;
	items: KanbanBoardCard[];
}

export interface KanbanBoardProps {
	columns?: KanbanBoardColumn[];
	defaultColumns?: KanbanBoardColumn[];
	onColumnsChange?: (columns: KanbanBoardColumn[]) => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const ICON_ONLY_BUTTON_TITLE = '';
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- board columns need a stable width for scanning and drag targets.
const KANBAN_COLUMN_WIDTH = 296;

export const KanbanBoard = forwardRef<React.ElementRef<typeof ScrollView>, KanbanBoardProps>(
	({ columns, defaultColumns = [], onColumnsChange, style, testID }, ref) => {
		const { theme } = useTheme();
		const [uncontrolledColumns, setUncontrolledColumns] = useState(defaultColumns);
		const resolvedColumns = columns ?? uncontrolledColumns;

		const setColumns = (nextColumns: KanbanBoardColumn[]) => {
			if (columns === undefined) {
				setUncontrolledColumns(nextColumns);
			}
			onColumnsChange?.(nextColumns);
		};

		const moveCardBetweenColumns = (columnIndex: number, cardId: string, direction: -1 | 1) => {
			const targetIndex = columnIndex + direction;
			if (targetIndex < 0 || targetIndex >= resolvedColumns.length) {
				return;
			}

			const sourceColumn = resolvedColumns[columnIndex];
			const card = sourceColumn.items.find((entry) => entry.id === cardId);

			if (!card) {
				return;
			}

			const nextColumns = resolvedColumns.map((column, index) => {
				if (index === columnIndex) {
					return {
						...column,
						items: column.items.filter((entry) => entry.id !== cardId),
					};
				}

				if (index === targetIndex) {
					return {
						...column,
						items: [...column.items, card],
					};
				}

				return column;
			});

			setColumns(nextColumns);
		};

		return (
			<ScrollView
				ref={ref}
				testID={testID}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[styles.board, style]}
			>
				{resolvedColumns.map((column, columnIndex) => {
					const overLimit =
						typeof column.wipLimit === 'number' &&
						column.items.length > column.wipLimit;
					return (
						<Card
							key={column.id}
							variant="outlined"
							style={[
								styles.column,
								{
									backgroundColor: theme.visual.surfaces.raised,
									borderColor: overLimit
										? theme.colors.warning
										: theme.colors.border,
								},
							]}
						>
							<View style={styles.columnHeader}>
								<View style={{ flex: 1, gap: theme.spacing.xxs }}>
									<ThemedText
										variant="bodyStrong"
										style={{ color: theme.colors.onSurface }}
									>
										{column.title}
									</ThemedText>
									<ThemedText
										variant="caption"
										style={{ color: theme.colors.onSurfaceVariant }}
									>
										{`${column.items.length} cards`}
									</ThemedText>
								</View>
								{typeof column.wipLimit === 'number' ? (
									<Badge
										label={
											overLimit
												? `Limit ${column.items.length}/${column.wipLimit}`
												: `WIP ${column.wipLimit}`
										}
										variant={overLimit ? 'warning' : 'info'}
										size="sm"
									/>
								) : null}
							</View>

							<SortableList
								items={column.items}
								onItemsChange={(nextItems) =>
									setColumns(
										resolvedColumns.map((entry) =>
											entry.id === column.id
												? { ...entry, items: nextItems }
												: entry,
										),
									)
								}
								renderItem={(item, index, active) => (
									<Card
										variant={active ? 'flat' : 'outlined'}
										padding="sm"
										style={{
											backgroundColor: active
												? theme.visual.surfaces.default
												: theme.colors.card,
											borderColor: theme.colors.border,
										}}
									>
										<View style={{ gap: theme.spacing.sm }}>
											<View style={styles.cardHeader}>
												<View style={{ flex: 1, gap: theme.spacing.xxs }}>
													<ThemedText
														variant="bodyStrong"
														style={{ color: theme.colors.onSurface }}
													>
														{item.title}
													</ThemedText>
													{item.description ? (
														<ThemedText
															variant="caption"
															style={{
																color: theme.colors
																	.onSurfaceVariant,
															}}
														>
															{item.description}
														</ThemedText>
													) : null}
												</View>
												{item.statusLabel ? (
													<Badge label={item.statusLabel} size="sm" />
												) : null}
											</View>
											<View style={styles.transferActions}>
												<Button
													title={ICON_ONLY_BUTTON_TITLE}
													iconOnly
													size="xs"
													variant="ghost"
													disabled={columnIndex === 0}
													accessibilityLabel="Move card to previous column"
													leftIcon={
														<LucideIconGlyph
															icon={ArrowLeftRight}
															size={14}
															color={theme.colors.primary}
															style={{
																transform: [{ rotate: '180deg' }],
															}}
														/>
													}
													onPress={() =>
														moveCardBetweenColumns(
															columnIndex,
															item.id,
															-1,
														)
													}
												/>
												<Button
													title={ICON_ONLY_BUTTON_TITLE}
													iconOnly
													size="xs"
													variant="ghost"
													disabled={
														columnIndex === resolvedColumns.length - 1
													}
													accessibilityLabel="Move card to next column"
													leftIcon={
														<LucideIconGlyph
															icon={ArrowLeftRight}
															size={14}
															color={theme.colors.primary}
														/>
													}
													onPress={() =>
														moveCardBetweenColumns(
															columnIndex,
															item.id,
															1,
														)
													}
												/>
											</View>
										</View>
									</Card>
								)}
							/>
						</Card>
					);
				})}
			</ScrollView>
		);
	},
);

KanbanBoard.displayName = 'KanbanBoard';

const styles = StyleSheet.create({
	board: {
		gap: SPACING_PX.md,
		paddingBottom: SPACING_PX.sm,
	},
	column: {
		width: KANBAN_COLUMN_WIDTH,
		gap: SPACING_PX.md,
	},
	columnHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.sm,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: SPACING_PX.sm,
	},
	transferActions: {
		flexDirection: 'row',
		gap: SPACING_PX.xxs,
	},
});
