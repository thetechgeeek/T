import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import {
	SIZE_SKELETON_AVATAR,
	SIZE_SKELETON_BADGE_HEIGHT,
	SIZE_SKELETON_BADGE_WIDTH,
	SIZE_SKELETON_TEXT_MD,
	SIZE_SKELETON_TEXT_SM,
} from '@/src/theme/uiMetrics';

export function CustomerListSkeleton() {
	const { s, r } = useThemeTokens();

	return (
		<View style={{ gap: 0 }}>
			{Array.from({ length: 6 }).map((_, i) => (
				<View
					key={i}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingVertical: s.md,
						paddingHorizontal: s.lg,
						gap: s.md,
					}}
				>
					{/* circular avatar */}
					<SkeletonBlock
						width={SIZE_SKELETON_AVATAR}
						height={SIZE_SKELETON_AVATAR}
						borderRadius={r.full}
					/>
					<View style={{ flex: 1, gap: s.xs }}>
						<SkeletonBlock width="55%" height={SIZE_SKELETON_TEXT_MD} />
						<SkeletonBlock width="38%" height={SIZE_SKELETON_TEXT_SM} />
					</View>
					<SkeletonBlock
						width={SIZE_SKELETON_BADGE_WIDTH}
						height={SIZE_SKELETON_BADGE_HEIGHT}
						borderRadius={r.full}
					/>
				</View>
			))}
		</View>
	);
}
