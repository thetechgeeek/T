import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export function InvoiceDetailSkeleton() {
	const { s, r } = useThemeTokens();

	return (
		<View style={{ padding: s.lg, gap: s.xl }}>
			{/* Billed to block */}
			<View style={{ gap: s.xs }}>
				<SkeletonBlock width="25%" height={11} />
				<SkeletonBlock width="55%" height={20} style={{ marginTop: s.xs }} />
				<SkeletonBlock width="40%" height={14} />
			</View>

			{/* Items section */}
			<View style={{ gap: s.sm }}>
				<SkeletonBlock width="20%" height={16} />
				{Array.from({ length: 3 }).map((_, i) => (
					<View
						key={i}
						style={{
							padding: s.md,
							borderRadius: r.md,
							gap: s.xs,
						}}
					>
						<SkeletonBlock width="60%" height={14} />
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<SkeletonBlock width="45%" height={12} />
							<SkeletonBlock width="25%" height={14} />
						</View>
					</View>
				))}
			</View>

			{/* Totals block */}
			<View style={{ padding: s.md, borderRadius: r.md, gap: s.sm }}>
				{Array.from({ length: 4 }).map((_, i) => (
					<View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<SkeletonBlock width="35%" height={14} />
						<SkeletonBlock width="25%" height={14} />
					</View>
				))}
			</View>
		</View>
	);
}
