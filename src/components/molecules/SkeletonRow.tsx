import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from './SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

interface SkeletonRowProps {
	/** Show a square avatar/icon placeholder on the left */
	withAvatar?: boolean;
	/** Number of text lines to show */
	lines?: 1 | 2;
}

export function SkeletonRow({ withAvatar = false, lines = 2 }: SkeletonRowProps) {
	const { s, r } = useThemeTokens();

	return (
		<View
			accessibilityElementsHidden={true}
			importantForAccessibility="no-hide-descendants"
			style={{ flexDirection: 'row', alignItems: 'center', gap: s.md, paddingVertical: s.sm }}
		>
			{withAvatar && <SkeletonBlock width={44} height={44} borderRadius={r.sm} />}
			<View style={{ flex: 1, gap: s.xs }}>
				<SkeletonBlock width="70%" height={14} />
				{lines === 2 && <SkeletonBlock width="45%" height={12} />}
			</View>
		</View>
	);
}
