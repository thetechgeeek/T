import { AccessibilityInfo, type AccessibilityActionEvent, findNodeHandle } from 'react-native';
import type React from 'react';

export interface AnnouncementOptions {
	delayMs?: number;
}

export interface FocusRingStyleOptions {
	color: string;
	radius: number;
	width?: number;
}

export interface StableAccessibilityAction {
	name: string;
	label: string;
}

const DEFAULT_FOCUS_RING_WIDTH = 2;

export async function announceForScreenReader(
	message: string | null | undefined,
	options?: AnnouncementOptions,
) {
	if (!message) {
		return;
	}

	if (options?.delayMs && options.delayMs > 0) {
		await new Promise((resolve) => {
			setTimeout(resolve, options.delayMs);
		});
	}

	AccessibilityInfo.announceForAccessibility?.(message);
}

export function setAccessibilityFocus(
	ref: React.RefObject<unknown> | { current: unknown } | null | undefined,
) {
	const target = ref?.current;
	if (!target) {
		return;
	}

	const nodeHandle = findNodeHandle(target as never);
	if (!nodeHandle) {
		return;
	}

	AccessibilityInfo.setAccessibilityFocus?.(nodeHandle);
}

export function buildFocusRingStyle({ color, radius, width }: FocusRingStyleOptions) {
	return {
		borderColor: color,
		borderWidth: width ?? DEFAULT_FOCUS_RING_WIDTH,
		borderRadius: radius,
	};
}

export function mapAccessibilityActionNames(actions: StableAccessibilityAction[]) {
	return actions.map((action) => ({
		name: action.name,
		label: action.label,
	}));
}

export function isAccessibilityAction(event: AccessibilityActionEvent, actionName: string) {
	return event.nativeEvent.actionName === actionName;
}
