import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { resolveOverlayDensityStyles, type OverlayDensity } from '@/src/design-system/overlayUtils';
import { useControllableState } from '@/src/hooks/useControllableState';
import { triggerDesignSystemHaptic, type DesignSystemHaptic } from '@/src/design-system/haptics';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	setAccessibilityFocus,
} from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { Z_INDEX } from '@/src/theme/uiMetrics';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

interface AnchorFrame {
	x: number;
	y: number;
	width: number;
	height: number;
}

const DEFAULT_ANCHOR_FRAME: AnchorFrame = {
	x: SPACING_PX.lg,
	y: SPACING_PX['4xl'],
	width: 0,
	height: 0,
};
const POPOVER_MIN_WIDTH = 220;

export interface PopoverProps {
	trigger: React.ReactNode;
	triggerLabel: string;
	children: React.ReactNode;
	title?: string;
	description?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, meta?: { source: 'press' | 'longPress' | 'dismiss' }) => void;
	triggerMode?: 'press' | 'longPress';
	placement?: 'top' | 'bottom';
	hapticFeedback?: DesignSystemHaptic;
	maxWidth?: number;
	density?: OverlayDensity;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

export const Popover = forwardRef<React.ElementRef<typeof View>, PopoverProps>(
	(
		{
			trigger,
			triggerLabel,
			children,
			title,
			description,
			open,
			defaultOpen = false,
			onOpenChange,
			triggerMode = 'press',
			placement = 'bottom',
			hapticFeedback = 'none',
			maxWidth = 320,
			density = 'default',
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const triggerRef = useRef<React.ElementRef<typeof Pressable> | null>(null);
		const contentRef = useRef<React.ElementRef<typeof View> | null>(null);
		const wasOpenRef = useRef(false);
		const [anchorFrame, setAnchorFrame] = useState<AnchorFrame>(DEFAULT_ANCHOR_FRAME);
		const [isFocused, setIsFocused] = useState(false);
		const [isOpen, setIsOpen] = useControllableState({
			value: open,
			defaultValue: defaultOpen,
			onChange: (nextOpen, meta) =>
				onOpenChange?.(nextOpen, {
					source:
						meta?.source === 'press'
							? 'press'
							: meta?.source === 'longPress'
								? 'longPress'
								: 'dismiss',
				}),
		});
		const densityStyles = resolveOverlayDensityStyles(theme, density);

		useEffect(() => {
			if (!isOpen) {
				return;
			}

			void Promise.resolve().then(() => {
				setAccessibilityFocus(contentRef);
			});
		}, [isOpen]);

		useEffect(() => {
			if (wasOpenRef.current && !isOpen) {
				void Promise.resolve().then(() => {
					setAccessibilityFocus(triggerRef);
				});
			}

			wasOpenRef.current = isOpen;
		}, [isOpen]);

		const popoverPosition = useMemo(() => {
			const top =
				placement === 'top'
					? Math.max(SPACING_PX.md, anchorFrame.y - SPACING_PX['4xl'])
					: anchorFrame.y + anchorFrame.height + SPACING_PX.sm;
			return {
				top,
				start: Math.max(SPACING_PX.lg, anchorFrame.x),
			};
		}, [anchorFrame, placement]);

		const measureTrigger = () => {
			const target = triggerRef.current as
				| (React.ElementRef<typeof Pressable> & {
						measureInWindow?: (
							callback: (x: number, y: number, width: number, height: number) => void,
						) => void;
				  })
				| null;

			target?.measureInWindow?.((x, y, width, height) => {
				setAnchorFrame({ x, y, width, height });
			});
		};

		const openPopover = (source: 'press' | 'longPress') => {
			measureTrigger();
			void triggerDesignSystemHaptic(hapticFeedback);
			setIsOpen(true, { source });
			void announceForScreenReader(title ?? description ?? triggerLabel);
		};

		const closePopover = () => {
			setIsOpen(false, { source: 'dismiss' });
		};

		return (
			<View ref={ref} style={style}>
				<Pressable
					ref={triggerRef}
					accessibilityRole="button"
					accessibilityLabel={triggerLabel}
					onLayout={(event) => {
						const { x, y, width, height } = event.nativeEvent.layout;
						setAnchorFrame({ x, y, width, height });
					}}
					onPress={triggerMode === 'press' ? () => openPopover('press') : undefined}
					onLongPress={
						triggerMode === 'longPress' ? () => openPopover('longPress') : undefined
					}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					style={
						isFocused
							? buildFocusRingStyle({
									color: c.primary,
									radius: theme.borderRadius.md,
								})
							: undefined
					}
				>
					{trigger}
				</Pressable>

				{isOpen ? (
					<Modal transparent visible onRequestClose={closePopover}>
						<Pressable
							testID={testID ? `${testID}-backdrop` : undefined}
							style={styles.backdrop}
							onPress={closePopover}
						/>
						<View
							ref={contentRef}
							testID={testID}
							style={[
								styles.surface,
								popoverPosition,
								{
									maxWidth,
									backgroundColor: c.surface,
									borderColor: c.borderStrong,
									borderRadius: theme.borderRadius.lg,
									paddingHorizontal: densityStyles.paddingHorizontal,
									paddingVertical: densityStyles.paddingVertical,
								},
								theme.elevation.overlay,
							]}
							accessibilityViewIsModal
							importantForAccessibility="yes"
						>
							{title ? (
								<ThemedText
									variant="bodyStrong"
									style={[
										styles.title,
										{
											color: c.onSurface,
											fontSize: theme.typography.sizes.md,
											marginBottom: densityStyles.headerGap,
										},
									]}
								>
									{title}
								</ThemedText>
							) : null}
							{description ? (
								<ThemedText
									variant="caption"
									style={[
										styles.description,
										{
											color: c.onSurfaceVariant,
											fontSize: theme.typography.sizes.sm,
											marginBottom: densityStyles.sectionGap,
										},
									]}
								>
									{description}
								</ThemedText>
							) : null}
							{children}
						</View>
					</Modal>
				) : null}
			</View>
		);
	},
);

Popover.displayName = 'Popover';

const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	surface: {
		position: 'absolute',
		minWidth: POPOVER_MIN_WIDTH,
		borderWidth: 1,
		zIndex: Z_INDEX.overlay,
	},
	title: {},
	description: {},
});
