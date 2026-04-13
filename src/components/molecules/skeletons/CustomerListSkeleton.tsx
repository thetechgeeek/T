import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

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
					<SkeletonBlock width={40} height={40} borderRadius={20} />
					<View style={{ flex: 1, gap: s.xs }}>
						<SkeletonBlock width="55%" height={14} />
						<SkeletonBlock width="38%" height={12} />
					</View>
					<SkeletonBlock width={48} height={20} borderRadius={r.full} />
				</View>
			))}
		</View>
	);
}
