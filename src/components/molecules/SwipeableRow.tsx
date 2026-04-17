import React, { forwardRef, useState } from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	mapAccessibilityActionNames,
} from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SIZE_SWIPE_ACTION_WIDTH } from '@/src/theme/uiMetrics';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export interface SwipeableRowProps {
	children: React.ReactNode;
	onDelete: () => void;
	onEdit?: () => void;
	onShare?: () => void;
	deleteLabel?: string;
	editLabel?: string;
	shareLabel?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

/**
 * P0.7 — SwipeableRow
 * Shows action buttons (Delete, Edit, Share) inline beside the row content.
 * Full swipe gesture support requires Reanimated gesture handler integration in production;
 * for testability the action buttons are always accessible via testID.
 *
 * In a real device build, action buttons are revealed on swipe-left; here they are
 * rendered in a horizontal layout so they remain accessible in tests.
 */
export const SwipeableRow = forwardRef<React.ElementRef<typeof View>, SwipeableRowProps>(
	(
		{
			children,
			onDelete,
			onEdit,
			onShare,
			deleteLabel = 'Delete',
			editLabel = 'Edit',
			shareLabel = 'Share',
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [focusedAction, setFocusedAction] = useState<string | null>(null);

		const triggerAction = (actionLabel: string, handler?: () => void) => {
			handler?.();
			void announceForScreenReader(`${actionLabel} action triggered`);
		};

		return (
			<View
				ref={ref}
				testID={testID}
				style={[styles.container, style]}
				accessibilityActions={mapAccessibilityActionNames([
					...(onShare ? [{ name: 'share', label: shareLabel }] : []),
					...(onEdit ? [{ name: 'edit', label: editLabel }] : []),
					{ name: 'delete', label: deleteLabel },
				])}
				onAccessibilityAction={(event) => {
					if (event.nativeEvent.actionName === 'share') {
						triggerAction(shareLabel, onShare);
						return;
					}
					if (event.nativeEvent.actionName === 'edit') {
						triggerAction(editLabel, onEdit);
						return;
					}
					if (event.nativeEvent.actionName === 'delete') {
						triggerAction(deleteLabel, onDelete);
					}
				}}
			>
				<View style={styles.content}>{children}</View>

				<View style={styles.actions}>
					{onShare ? (
						<Pressable
							testID="swipeable-share-btn"
							onPress={() => triggerAction(shareLabel, onShare)}
							onFocus={() => setFocusedAction('share')}
							onBlur={() => setFocusedAction(null)}
							accessibilityRole="button"
							accessibilityLabel={shareLabel}
							style={[
								styles.action,
								{ backgroundColor: c.success },
								focusedAction === 'share'
									? buildFocusRingStyle({
											color: c.onSuccess,
											radius: theme.borderRadius.md,
										})
									: null,
							]}
						>
							<ThemedText
								variant="caption"
								weight="semibold"
								style={[styles.actionText, { color: c.onSuccess }]}
							>
								{shareLabel}
							</ThemedText>
						</Pressable>
					) : null}

					{onEdit ? (
						<Pressable
							testID="swipeable-edit-btn"
							onPress={() => triggerAction(editLabel, onEdit)}
							onFocus={() => setFocusedAction('edit')}
							onBlur={() => setFocusedAction(null)}
							accessibilityRole="button"
							accessibilityLabel={editLabel}
							style={[
								styles.action,
								{ backgroundColor: c.info },
								focusedAction === 'edit'
									? buildFocusRingStyle({
											color: c.onInfo,
											radius: theme.borderRadius.md,
										})
									: null,
							]}
						>
							<ThemedText
								variant="caption"
								weight="semibold"
								style={[styles.actionText, { color: c.onInfo }]}
							>
								{editLabel}
							</ThemedText>
						</Pressable>
					) : null}

					<Pressable
						testID="swipeable-delete-btn"
						onPress={() => triggerAction(deleteLabel, onDelete)}
						onFocus={() => setFocusedAction('delete')}
						onBlur={() => setFocusedAction(null)}
						accessibilityRole="button"
						accessibilityLabel={deleteLabel}
						style={[
							styles.action,
							{ backgroundColor: c.error },
							focusedAction === 'delete'
								? buildFocusRingStyle({
										color: c.onError,
										radius: theme.borderRadius.md,
									})
								: null,
						]}
					>
						<ThemedText
							variant="caption"
							weight="semibold"
							style={[styles.actionText, { color: c.onError }]}
						>
							{deleteLabel}
						</ThemedText>
					</Pressable>
				</View>
			</View>
		);
	},
);

SwipeableRow.displayName = 'SwipeableRow';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		overflow: 'hidden',
	},
	content: {
		flex: 1,
	},
	actions: {
		flexDirection: 'row',
	},
	action: {
		width: SIZE_SWIPE_ACTION_WIDTH,
		minHeight: TOUCH_TARGET_MIN_PX,
		alignItems: 'center',
		justifyContent: 'center',
	},
	actionText: {
		fontSize: FONT_SIZE.label,
	},
});
