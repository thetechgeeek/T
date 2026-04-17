import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { announceForScreenReader, mapAccessibilityActionNames } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface SortableListItemShape {
	id: string;
}

export interface SortableListProps<T extends SortableListItemShape> {
	items?: T[];
	defaultItems?: T[];
	onItemsChange?: (items: T[]) => void;
	renderItem: (item: T, index: number, active: boolean) => React.ReactNode;
	itemHeight?: number;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const MOVE_UP_LABEL = 'Move up';
const MOVE_DOWN_LABEL = 'Move down';
const DRAG_HANDLE_LABEL = 'Drag to reorder';
const ICON_ONLY_BUTTON_TITLE = '';

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
	const nextItems = [...items];
	const [movedItem] = nextItems.splice(fromIndex, 1);
	nextItems.splice(toIndex, 0, movedItem);
	return nextItems;
}

const SortableListBase = forwardRef<
	React.ElementRef<typeof View>,
	SortableListProps<SortableListItemShape>
>(
	(
		{ items, defaultItems = [], onItemsChange, renderItem, itemHeight = 76, style, testID },
		ref,
	) => {
		const { theme } = useTheme();
		const [uncontrolledItems, setUncontrolledItems] = useState(defaultItems);
		const [activeId, setActiveId] = useState<string | null>(null);
		const resolvedItems = items ?? uncontrolledItems;

		const setItems = (nextItems: SortableListItemShape[]) => {
			if (items === undefined) {
				setUncontrolledItems(nextItems);
			}
			onItemsChange?.(nextItems);
		};

		const moveItem = async (fromIndex: number, toIndex: number) => {
			if (toIndex < 0 || toIndex >= resolvedItems.length || fromIndex === toIndex) {
				return;
			}

			const nextItems = moveArrayItem(resolvedItems, fromIndex, toIndex);
			setItems(nextItems);
			await triggerDesignSystemHaptic('selection');
			await announceForScreenReader(`Moved item to position ${toIndex + 1}`);
		};

		return (
			<View ref={ref} testID={testID} style={[{ gap: theme.spacing.sm }, style]}>
				{resolvedItems.map((item, index) => {
					const gesture = Gesture.Pan()
						.activateAfterLongPress(180)
						.runOnJS(true)
						.onBegin(() => {
							setActiveId(item.id);
							void triggerDesignSystemHaptic('light');
						})
						.onFinalize((event) => {
							const nextIndex = Math.max(
								0,
								Math.min(
									resolvedItems.length - 1,
									index + Math.round(event.translationY / itemHeight),
								),
							);
							void moveItem(index, nextIndex);
							setActiveId(null);
						});

					return (
						<View
							key={item.id}
							accessibilityActions={mapAccessibilityActionNames([
								{ name: 'increment', label: MOVE_DOWN_LABEL },
								{ name: 'decrement', label: MOVE_UP_LABEL },
							])}
							onAccessibilityAction={(event) => {
								if (event.nativeEvent.actionName === 'increment') {
									void moveItem(index, index + 1);
								}
								if (event.nativeEvent.actionName === 'decrement') {
									void moveItem(index, index - 1);
								}
							}}
							style={[
								styles.row,
								{
									borderColor:
										activeId === item.id
											? theme.colors.primary
											: theme.colors.border,
									backgroundColor:
										activeId === item.id
											? theme.colors.primaryLight
											: theme.colors.card,
									borderRadius: theme.borderRadius.md,
									padding: theme.spacing.sm,
								},
							]}
						>
							<GestureDetector gesture={gesture}>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel={DRAG_HANDLE_LABEL}
									style={styles.handle}
								>
									<LucideIconGlyph
										icon={GripVertical}
										size={18}
										color={theme.colors.onSurfaceVariant}
									/>
								</Pressable>
							</GestureDetector>
							<View style={{ flex: 1 }}>
								{renderItem(item, index, activeId === item.id)}
							</View>
							<View style={styles.controls}>
								<Button
									title={ICON_ONLY_BUTTON_TITLE}
									iconOnly
									variant="ghost"
									size="xs"
									accessibilityLabel={MOVE_UP_LABEL}
									leftIcon={
										<LucideIconGlyph
											icon={ArrowUp}
											size={14}
											color={theme.colors.primary}
										/>
									}
									onPress={() => void moveItem(index, index - 1)}
								/>
								<Button
									title={ICON_ONLY_BUTTON_TITLE}
									iconOnly
									variant="ghost"
									size="xs"
									accessibilityLabel={MOVE_DOWN_LABEL}
									leftIcon={
										<LucideIconGlyph
											icon={ArrowDown}
											size={14}
											color={theme.colors.primary}
										/>
									}
									onPress={() => void moveItem(index, index + 1)}
								/>
							</View>
						</View>
					);
				})}
				{resolvedItems.length === 0 ? (
					<ThemedText variant="caption" style={{ color: theme.colors.onSurfaceVariant }}>
						No items to sort
					</ThemedText>
				) : null}
			</View>
		);
	},
) as <T extends SortableListItemShape>(
	props: SortableListProps<T> & { ref?: React.Ref<React.ElementRef<typeof View>> },
) => React.ReactElement;

SortableListBase.displayName = 'SortableList';

export const SortableList = SortableListBase;

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		gap: SPACING_PX.sm,
	},
	handle: {
		padding: SPACING_PX.xxs,
	},
	controls: {
		alignItems: 'center',
		gap: SPACING_PX.xxs,
	},
});
