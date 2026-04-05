import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

function VariantRowSkeleton({ s, r, c }: { s: any; r: any; c: any }) {
	return (
		<View
			style={{ flexDirection: 'row', alignItems: 'center', gap: s.md, paddingVertical: s.sm }}
		>
			{/* thumbnail */}
			<SkeletonBlock width={56} height={56} borderRadius={r.md} />
			<View style={{ flex: 1, gap: s.xs }}>
				<SkeletonBlock width="65%" height={14} />
				<SkeletonBlock width="40%" height={11} />
			</View>
			<View style={{ alignItems: 'flex-end', gap: s.xs }}>
				<SkeletonBlock width={48} height={14} />
				<SkeletonBlock width={36} height={11} />
			</View>
		</View>
	);
}

export function InventoryListSkeleton() {
	const { s, r, c } = useThemeTokens();

	return (
		<View style={{ padding: s.md, gap: s.md }}>
			{Array.from({ length: 3 }).map((_, i) => (
				<View
					key={i}
					style={{
						backgroundColor: c.card,
						borderRadius: r.lg,
					}}
				>
					{/* card header */}
					<View style={{ padding: s.md, gap: s.xs }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<SkeletonBlock width="50%" height={16} />
							<SkeletonBlock width={52} height={20} borderRadius={r.sm} />
						</View>
						<SkeletonBlock width="35%" height={12} />
					</View>
					{/* variant rows */}
					<View style={{ padding: s.md, gap: s.sm }}>
						<VariantRowSkeleton s={s} r={r} c={c} />
						<VariantRowSkeleton s={s} r={r} c={c} />
					</View>
				</View>
			))}
		</View>
	);
}
