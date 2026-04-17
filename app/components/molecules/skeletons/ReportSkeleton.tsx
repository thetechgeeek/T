import React from 'react';
import { View, ScrollView } from 'react-native';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { OVERLAY_COLOR_SEPARATOR } from '@/src/theme/uiMetrics';

/**
 * P0.12 — Report skeleton: summary card + 8 data rows
 */
export function ReportSkeleton() {
	const { s, r } = useThemeTokens();

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={{ flex: 1 }}
			contentContainerStyle={{ gap: s.lg, padding: s.md }}
		>
			{/* Summary card skeleton */}
			<View
				style={{
					padding: s.md,
					gap: s.sm,
					borderRadius: r.lg,
					borderWidth: 1,
					borderColor: OVERLAY_COLOR_SEPARATOR,
				}}
			>
				<SkeletonBlock width="40%" height={16} />
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<SkeletonBlock width="60%" height={32} />
					<SkeletonBlock width="20%" height={24} borderRadius={r.full} />
				</View>
				<View style={{ flexDirection: 'row', gap: s.md, marginTop: s.xs }}>
					<SkeletonBlock width="30%" height={12} />
					<SkeletonBlock width="30%" height={12} />
				</View>
			</View>

			{/* Filter bar skeleton */}
			<View style={{ flexDirection: 'row', gap: s.sm }}>
				{Array.from({ length: 3 }).map((_, i) => (
					<SkeletonBlock key={i} width={80} height={36} borderRadius={r.full} />
				))}
			</View>

			{/* 8 Data rows skeleton */}
			<View style={{ gap: s.md }}>
				{Array.from({ length: 8 }).map((_, i) => (
					<View
						key={i}
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							paddingVertical: s.md,
							borderBottomWidth: i === 7 ? 0 : 1,
							borderBottomColor: OVERLAY_COLOR_SEPARATOR,
						}}
					>
						<View style={{ gap: s.xs, flex: 1 }}>
							<SkeletonBlock width="70%" height={16} />
							<SkeletonBlock width="40%" height={12} />
						</View>
						<View style={{ alignItems: 'flex-end', gap: s.xs }}>
							<SkeletonBlock width={80} height={16} />
							<SkeletonBlock width={50} height={12} />
						</View>
					</View>
				))}
			</View>
		</ScrollView>
	);
}
