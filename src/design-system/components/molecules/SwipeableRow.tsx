import React, { forwardRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	mapAccessibilityActionNames,
} from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SIZE_SWIPE_ACTION_WIDTH, Z_INDEX } from '@/src/theme/uiMetrics';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface SwipeableRowProps {
	children: React.ReactNode;
	onDelete: () => void;
	onArchive?: () => void;
	onEdit?: () => void;
	onShare?: () => void;
	deleteLabel?: string;
	archiveLabel?: string;
	editLabel?: string;
	shareLabel?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

/**
 * P0.7 — SwipeableRow
 * Reveals row actions on swipe while keeping accessible non-gesture fallbacks available.
 */
export const SwipeableRow = forwardRef<React.ElementRef<typeof View>, SwipeableRowProps>(
	(
		{
			children,
			onDelete,
			onArchive,
			onEdit,
			onShare,
			deleteLabel = 'Delete',
			archiveLabel = 'Archive',
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
		const translateX = useSharedValue(0);
		const actionsCount = [onShare, onEdit, onArchive, onDelete].filter(Boolean).length;
		const revealWidth = actionsCount * SIZE_SWIPE_ACTION_WIDTH;

		const triggerAction = (actionLabel: string, handler?: () => void) => {
			handler?.();
			translateX.value = withSpring(0);
			void announceForScreenReader(`${actionLabel} action triggered`);
		};

		const swipeGesture = Gesture.Pan()
			.runOnJS(true)
			.onUpdate((event) => {
				translateX.value = Math.max(-revealWidth, Math.min(0, event.translationX));
			})
			.onFinalize((event) => {
				translateX.value =
					event.translationX <= -SIZE_SWIPE_ACTION_WIDTH / 2
						? withSpring(-revealWidth)
						: withSpring(0);
			});

		const animatedContentStyle = useAnimatedStyle(() => ({
			transform: [{ translateX: translateX.value }],
		}));

		return (
			<GestureDetector gesture={swipeGesture}>
				<View
					ref={ref}
					testID={testID}
					style={[styles.container, style]}
					accessibilityActions={mapAccessibilityActionNames([
						...(onShare ? [{ name: 'share', label: shareLabel }] : []),
						...(onEdit ? [{ name: 'edit', label: editLabel }] : []),
						...(onArchive ? [{ name: 'archive', label: archiveLabel }] : []),
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
						if (event.nativeEvent.actionName === 'archive') {
							triggerAction(archiveLabel, onArchive);
							return;
						}
						if (event.nativeEvent.actionName === 'delete') {
							triggerAction(deleteLabel, onDelete);
						}
					}}
				>
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

						{onArchive ? (
							<Pressable
								testID="swipeable-archive-btn"
								onPress={() => triggerAction(archiveLabel, onArchive)}
								onFocus={() => setFocusedAction('archive')}
								onBlur={() => setFocusedAction(null)}
								accessibilityRole="button"
								accessibilityLabel={archiveLabel}
								style={[
									styles.action,
									{ backgroundColor: c.warning },
									focusedAction === 'archive'
										? buildFocusRingStyle({
												color: c.onWarning,
												radius: theme.borderRadius.md,
											})
										: null,
								]}
							>
								<ThemedText
									variant="caption"
									weight="semibold"
									style={[styles.actionText, { color: c.onWarning }]}
								>
									{archiveLabel}
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

					<Animated.View style={[styles.content, animatedContentStyle]}>
						{children}
					</Animated.View>
				</View>
			</GestureDetector>
		);
	},
);

SwipeableRow.displayName = 'SwipeableRow';

const styles = StyleSheet.create({
	container: {
		overflow: 'hidden',
	},
	content: {
		zIndex: Z_INDEX.base + 1,
	},
	actions: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		end: 0,
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
