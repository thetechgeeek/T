import * as Haptics from 'expo-haptics';

export type DesignSystemHaptic = 'none' | 'selection' | 'success' | 'warning' | 'error' | 'light';

export async function triggerDesignSystemHaptic(kind: DesignSystemHaptic = 'none') {
	if (kind === 'none') {
		return;
	}

	try {
		if (kind === 'selection') {
			await Haptics.selectionAsync();
			return;
		}

		if (kind === 'light') {
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			return;
		}

		const feedbackType =
			kind === 'success'
				? Haptics.NotificationFeedbackType.Success
				: kind === 'warning'
					? Haptics.NotificationFeedbackType.Warning
					: Haptics.NotificationFeedbackType.Error;
		await Haptics.notificationAsync(feedbackType);
	} catch {
		// Haptics are progressive enhancement; failures should never break UI interaction.
	}
}
