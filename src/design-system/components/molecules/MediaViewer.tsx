import React, { forwardRef, useState } from 'react';
import { Modal, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { Image as ExpoImage } from 'expo-image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { Card } from '@/src/design-system/components/atoms/Card';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { announceForScreenReader } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface MediaViewerItem {
	id: string;
	uri?: string;
	thumbnailUri?: string;
	alt: string;
	caption?: string;
}

export interface MediaViewerProps {
	items: MediaViewerItem[];
	index?: number;
	defaultIndex?: number;
	onIndexChange?: (index: number) => void;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const ICON_ONLY_BUTTON_TITLE = '';
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- vertical dismiss should require a deliberate swipe.
const DISMISS_SWIPE_THRESHOLD_Y = 120;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- gallery browsing should react to shorter horizontal swipes.
const GALLERY_NAVIGATION_THRESHOLD_X = 80;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- supporting caption copy stays slightly muted against the chrome.
const CAPTION_SECONDARY_OPACITY = 0.82;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- frame height accommodates portrait and landscape assets without layout jump.
const MEDIA_FRAME_MIN_HEIGHT = 280;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- full-resolution image height keeps progressive loading stable.
const MEDIA_IMAGE_HEIGHT = 320;

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(Math.max(value, minimum), maximum);
}

export const MediaViewer = forwardRef<React.ElementRef<typeof View>, MediaViewerProps>(
	(
		{
			items,
			index,
			defaultIndex = 0,
			onIndexChange,
			open,
			defaultOpen = true,
			onOpenChange,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
		const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
		const [loadedIds, setLoadedIds] = useState<string[]>([]);
		const [failedIds, setFailedIds] = useState<string[]>([]);
		const currentIndex = index ?? uncontrolledIndex;
		const isOpen = open ?? uncontrolledOpen;
		const currentItem = items[currentIndex];

		const scale = useSharedValue(1);
		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}));

		const setViewerIndex = async (nextIndex: number) => {
			const resolvedIndex = clamp(nextIndex, 0, Math.max(items.length - 1, 0));
			if (index === undefined) {
				setUncontrolledIndex(resolvedIndex);
			}
			onIndexChange?.(resolvedIndex);
			await announceForScreenReader(`Viewing item ${resolvedIndex + 1} of ${items.length}`);
		};

		const setViewerOpen = (nextOpen: boolean) => {
			if (open === undefined) {
				setUncontrolledOpen(nextOpen);
			}
			onOpenChange?.(nextOpen);
		};

		const pinchGesture = Gesture.Pinch()
			.onUpdate((event) => {
				scale.value = clamp(event.scale, 1, 3);
			})
			.onEnd(() => {
				scale.value = withSpring(1);
			});

		const panGesture = Gesture.Pan().onFinalize((event) => {
			if (event.translationY > DISMISS_SWIPE_THRESHOLD_Y) {
				runOnJS(setViewerOpen)(false);
				return;
			}
			if (event.translationX < -GALLERY_NAVIGATION_THRESHOLD_X) {
				runOnJS(triggerDesignSystemHaptic)('selection');
				runOnJS(setViewerIndex)(currentIndex + 1);
			}
			if (event.translationX > GALLERY_NAVIGATION_THRESHOLD_X) {
				runOnJS(triggerDesignSystemHaptic)('selection');
				runOnJS(setViewerIndex)(currentIndex - 1);
			}
		});

		const loadedSet = new Set(loadedIds);
		const failedSet = new Set(failedIds);
		const imageFailed = currentItem ? failedSet.has(currentItem.id) : false;
		const imageLoaded = currentItem ? loadedSet.has(currentItem.id) : false;

		return (
			<View ref={ref} testID={testID} style={style}>
				<Modal
					visible={isOpen}
					transparent
					animationType="fade"
					onRequestClose={() => setViewerOpen(false)}
				>
					<View
						style={[styles.overlay, { backgroundColor: theme.colors.scrim }]}
						accessibilityViewIsModal
						importantForAccessibility="yes"
					>
						<View style={styles.header}>
							<ThemedText variant="captionBold" style={{ color: theme.colors.white }}>
								{`${currentIndex + 1} / ${items.length}`}
							</ThemedText>
							<Button
								title={ICON_ONLY_BUTTON_TITLE}
								iconOnly
								variant="ghost"
								accessibilityLabel="Close media viewer"
								leftIcon={
									<LucideIconGlyph
										icon={X}
										size={18}
										color={theme.colors.white}
									/>
								}
								onPress={() => setViewerOpen(false)}
							/>
						</View>

						<View style={styles.viewer}>
							<Button
								title={ICON_ONLY_BUTTON_TITLE}
								iconOnly
								variant="ghost"
								accessibilityLabel="Previous media item"
								disabled={currentIndex === 0}
								leftIcon={
									<LucideIconGlyph
										icon={ChevronLeft}
										size={20}
										color={theme.colors.white}
									/>
								}
								onPress={() => void setViewerIndex(currentIndex - 1)}
							/>
							<GestureDetector
								gesture={Gesture.Simultaneous(pinchGesture, panGesture)}
							>
								<Animated.View style={[styles.mediaFrame, animatedStyle]}>
									{currentItem?.thumbnailUri && !imageLoaded && !imageFailed ? (
										<ExpoImage
											source={{ uri: currentItem.thumbnailUri }}
											style={styles.image}
											contentFit="cover"
											cachePolicy="memory-disk"
											priority="high"
											recyclingKey={`${currentItem.id}-thumbnail`}
											accessible={false}
										/>
									) : null}
									{currentItem?.uri && !imageFailed ? (
										<ExpoImage
											source={{ uri: currentItem.uri }}
											style={styles.image}
											contentFit="contain"
											cachePolicy="memory-disk"
											priority="high"
											recyclingKey={currentItem.id}
											onLoad={() =>
												setLoadedIds((current) =>
													currentItem && !current.includes(currentItem.id)
														? [...current, currentItem.id]
														: current,
												)
											}
											onError={() =>
												setFailedIds((current) =>
													currentItem && !current.includes(currentItem.id)
														? [...current, currentItem.id]
														: current,
												)
											}
											accessible={false}
										/>
									) : (
										<Card
											variant="outlined"
											style={{
												backgroundColor: theme.visual.media.fallbackSurface,
												padding: theme.spacing.lg,
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<ThemedText
												variant="bodyStrong"
												style={{ color: theme.colors.onSurface }}
											>
												{currentItem?.alt ?? 'Missing media'}
											</ThemedText>
											{currentItem?.caption ? (
												<ThemedText
													variant="caption"
													style={{ color: theme.colors.onSurfaceVariant }}
												>
													{currentItem.caption}
												</ThemedText>
											) : null}
										</Card>
									)}
								</Animated.View>
							</GestureDetector>
							<Button
								title={ICON_ONLY_BUTTON_TITLE}
								iconOnly
								variant="ghost"
								accessibilityLabel="Next media item"
								disabled={currentIndex >= items.length - 1}
								leftIcon={
									<LucideIconGlyph
										icon={ChevronRight}
										size={20}
										color={theme.colors.white}
									/>
								}
								onPress={() => void setViewerIndex(currentIndex + 1)}
							/>
						</View>

						{currentItem ? (
							<View style={styles.captionBlock}>
								<ThemedText
									variant="bodyStrong"
									style={{ color: theme.colors.white }}
								>
									{currentItem.alt}
								</ThemedText>
								{currentItem.caption ? (
									<ThemedText
										variant="caption"
										style={{
											color: theme.colors.white,
											opacity: CAPTION_SECONDARY_OPACITY,
										}}
									>
										{currentItem.caption}
									</ThemedText>
								) : null}
							</View>
						) : null}
					</View>
				</Modal>
			</View>
		);
	},
);

MediaViewer.displayName = 'MediaViewer';

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'center',
		padding: SPACING_PX.lg,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: SPACING_PX.md,
	},
	viewer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: SPACING_PX.sm,
	},
	mediaFrame: {
		flex: 1,
		minHeight: MEDIA_FRAME_MIN_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	image: {
		width: '100%',
		height: MEDIA_IMAGE_HEIGHT,
	},
	captionBlock: {
		marginTop: SPACING_PX.lg,
		gap: SPACING_PX.xxs,
	},
});
