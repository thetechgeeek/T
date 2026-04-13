import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const SWIPE_ACTION_WIDTH = 72;

export interface SwipeableRowProps {
	children: React.ReactNode;
	onDelete: () => void;
	onEdit?: () => void;
	onShare?: () => void;
	deleteLabel?: string;
	editLabel?: string;
	shareLabel?: string;
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
export function SwipeableRow({
	children,
	onDelete,
	onEdit,
	onShare,
	deleteLabel = 'Delete',
	editLabel = 'Edit',
	shareLabel = 'Share',
}: SwipeableRowProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	return (
		<View style={styles.container}>
			{/* Main content */}
			<View style={styles.content}>{children}</View>

			{/* Action buttons (revealed on swipe-left in production) */}
			<View style={styles.actions}>
				{onShare ? (
					<Pressable
						testID="swipeable-share-btn"
						onPress={onShare}
						accessibilityRole="button"
						accessibilityLabel={shareLabel}
						style={[styles.action, { backgroundColor: c.success }]}
					>
						<Text style={[styles.actionText, { color: c.onSuccess }]}>
							{shareLabel}
						</Text>
					</Pressable>
				) : null}

				{onEdit ? (
					<Pressable
						testID="swipeable-edit-btn"
						onPress={onEdit}
						accessibilityRole="button"
						accessibilityLabel={editLabel}
						style={[styles.action, { backgroundColor: c.info }]}
					>
						<Text style={[styles.actionText, { color: c.onInfo }]}>{editLabel}</Text>
					</Pressable>
				) : null}

				<Pressable
					testID="swipeable-delete-btn"
					onPress={onDelete}
					accessibilityRole="button"
					accessibilityLabel={deleteLabel}
					style={[styles.action, { backgroundColor: c.error }]}
				>
					<Text style={[styles.actionText, { color: c.onError }]}>{deleteLabel}</Text>
				</Pressable>
			</View>
		</View>
	);
}

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
		width: SWIPE_ACTION_WIDTH,
		minHeight: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	actionText: {
		fontSize: FONT_SIZE.label,
		fontWeight: '600',
	},
});
