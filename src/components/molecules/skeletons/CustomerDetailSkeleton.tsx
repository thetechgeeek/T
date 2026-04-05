import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export function CustomerDetailSkeleton() {
	const { s, r } = useThemeTokens();

	return (
		<View style={{ padding: s.md, gap: s.lg }}>
			{/* Outstanding balance card */}
			<View style={{ padding: s.lg, borderRadius: r.md, alignItems: 'center', gap: s.sm }}>
				<SkeletonBlock width="50%" height={12} />
				<SkeletonBlock width="70%" height={36} style={{ marginTop: 4 }} />
				{/* stats row */}
				<View style={{ flexDirection: 'row', width: '100%', marginTop: s.sm, gap: s.md }}>
					<View style={{ flex: 1, alignItems: 'center', gap: s.xs }}>
						<SkeletonBlock width="70%" height={12} />
						<SkeletonBlock width="55%" height={16} />
					</View>
					<View style={{ flex: 1, alignItems: 'center', gap: s.xs }}>
						<SkeletonBlock width="70%" height={12} />
						<SkeletonBlock width="55%" height={16} />
					</View>
				</View>
			</View>

			{/* Action buttons */}
			<View style={{ flexDirection: 'row', gap: s.md }}>
				<SkeletonBlock width="50%" height={48} borderRadius={r.md} />
				<SkeletonBlock width="50%" height={48} borderRadius={r.md} />
			</View>

			{/* Info card */}
			<View style={{ gap: s.sm }}>
				<SkeletonBlock width="35%" height={14} />
				{Array.from({ length: 3 }).map((_, i) => (
					<View
						key={i}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: s.md,
							paddingVertical: 12,
						}}
					>
						<SkeletonBlock width={18} height={18} borderRadius={r.sm} />
						<SkeletonBlock width="55%" height={14} />
					</View>
				))}
			</View>

			{/* Ledger rows */}
			<View style={{ gap: s.sm }}>
				<SkeletonBlock width="40%" height={14} />
				{Array.from({ length: 3 }).map((_, i) => (
					<View key={i} style={{ padding: 12, borderRadius: r.md, gap: s.xs }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<SkeletonBlock width="35%" height={14} />
							<SkeletonBlock width="25%" height={12} />
						</View>
						<View style={{ flexDirection: 'row', gap: s.lg, marginTop: 4 }}>
							<SkeletonBlock width="30%" height={12} />
							<SkeletonBlock width="30%" height={12} />
						</View>
					</View>
				))}
			</View>
		</View>
	);
}
