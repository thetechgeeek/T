import type { Theme } from '@/src/theme';

export type OverlayDensity = 'compact' | 'default' | 'relaxed';

export interface OverlayDensityStyles {
	paddingHorizontal: number;
	paddingVertical: number;
	headerGap: number;
	sectionGap: number;
	actionGap: number;
}

export function resolveOverlayDensityStyles(
	theme: Theme,
	density: OverlayDensity = 'default',
): OverlayDensityStyles {
	if (density === 'compact') {
		return {
			paddingHorizontal: theme.spacing.lg,
			paddingVertical: theme.spacing.lg,
			headerGap: theme.spacing.xs,
			sectionGap: theme.spacing.sm,
			actionGap: theme.spacing.xs,
		};
	}

	if (density === 'relaxed') {
		return {
			paddingHorizontal: theme.spacing.xl,
			paddingVertical: theme.spacing.xl,
			headerGap: theme.spacing.sm,
			sectionGap: theme.spacing.lg,
			actionGap: theme.spacing.md,
		};
	}

	return {
		paddingHorizontal: theme.spacing.xl,
		paddingVertical: theme.spacing.lg,
		headerGap: theme.spacing.xs,
		sectionGap: theme.spacing.md,
		actionGap: theme.spacing.sm,
	};
}
