import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { buildFocusRingStyle, announceForScreenReader } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { Z_INDEX } from '@/src/theme/uiMetrics';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface TooltipProps {
	trigger: React.ReactNode;
	triggerLabel: string;
	content: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, meta?: { source: 'press' | 'longPress' | 'dismiss' }) => void;
	triggerMode?: 'press' | 'longPress';
	placement?: 'top' | 'bottom';
	maxWidth?: number;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

interface AnchorFrame {
	x: number;
	y: number;
	width: number;
	height: number;
}

const DEFAULT_ANCHOR_FRAME: AnchorFrame = {
	x: SPACING_PX.lg,
	y: SPACING_PX['2xl'],
	width: 0,
	height: 0,
};

export const Tooltip = forwardRef<React.ElementRef<typeof View>, TooltipProps>(
	(
		{
			trigger,
			triggerLabel,
			content,
			open,
			defaultOpen = false,
			onOpenChange,
			triggerMode = 'longPress',
			placement = 'top',
			maxWidth = 240,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const triggerRef = useRef<React.ElementRef<typeof Pressable> | null>(null);
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

		const bubblePosition = useMemo(() => {
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

		const openTooltip = (source: 'press' | 'longPress') => {
			measureTrigger();
			setIsOpen(true, { source });
			void announceForScreenReader(content);
		};

		const closeTooltip = () => {
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
					onPress={triggerMode === 'press' ? () => openTooltip('press') : undefined}
					onLongPress={
						triggerMode === 'longPress' ? () => openTooltip('longPress') : undefined
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
					<Modal transparent visible onRequestClose={closeTooltip}>
						<Pressable
							testID={testID ? `${testID}-backdrop` : undefined}
							accessible={false}
							accessibilityElementsHidden
							importantForAccessibility="no-hide-descendants"
							style={styles.backdrop}
							onPress={closeTooltip}
						/>
						<View
							testID={testID}
							style={[
								styles.bubble,
								bubblePosition,
								{
									maxWidth,
									backgroundColor: c.surface,
									borderColor: c.borderStrong,
									borderRadius: theme.borderRadius.lg,
								},
								theme.elevation.tooltip,
							]}
							accessibilityRole="text"
							accessibilityLabel={content}
							accessibilityViewIsModal
							importantForAccessibility="yes"
						>
							<ThemedText
								variant="caption"
								style={{ color: c.onSurface, fontSize: theme.typography.sizes.sm }}
							>
								{content}
							</ThemedText>
						</View>
					</Modal>
				) : null}
			</View>
		);
	},
);

Tooltip.displayName = 'Tooltip';

const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	bubble: {
		position: 'absolute',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		borderWidth: 1,
		zIndex: Z_INDEX.modal,
	},
});
