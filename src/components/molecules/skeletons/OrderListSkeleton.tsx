import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export function OrderListSkeleton() {
	const { s, r, c } = useThemeTokens();

	return (
		<View style={{ padding: s.md, gap: s.md }}>
			{Array.from({ length: 4 }).map((_, i) => (
				<View
					key={i}
					style={{
						backgroundColor: c.card,
						borderRadius: r.md,
						padding: s.md,
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<View style={{ flex: 1, gap: s.xs }}>
						<SkeletonBlock width="55%" height={16} />
						<SkeletonBlock width="70%" height={12} />
					</View>
					<View style={{ alignItems: 'flex-end', gap: s.xs }}>
						<SkeletonBlock width={64} height={22} borderRadius={r.full} />
						<SkeletonBlock width={20} height={20} borderRadius={r.sm} />
					</View>
				</View>
			))}
		</View>
	);
}
