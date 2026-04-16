import { LayoutAnimation, type LayoutAnimationConfig } from 'react-native';

interface AnimateNextLayoutOptions {
	disabled?: boolean;
	config?: LayoutAnimationConfig;
}

/**
 * Centralizes layout animation calls so reduced-motion code paths can skip them
 * without duplicating guard logic across components.
 */
export function animateNextLayout({
	disabled = false,
	config = LayoutAnimation.Presets.easeInEaseOut,
}: AnimateNextLayoutOptions = {}) {
	if (disabled || typeof LayoutAnimation?.configureNext !== 'function') {
		return false;
	}

	LayoutAnimation.configureNext(config);
	return true;
}
