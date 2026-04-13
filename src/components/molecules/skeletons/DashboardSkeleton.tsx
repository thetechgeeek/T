import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export function DashboardSkeleton() {
	const { s, r } = useThemeTokens();

	return (
		<View style={{ gap: s.lg, padding: s.md, marginTop: s.md }}>
			{/* Stats row */}
			<View style={{ flexDirection: 'row', gap: s.sm }}>
				{Array.from({ length: 3 }).map((_, i) => (
					<View
						key={i}
						style={{
							flex: 1,
							padding: s.md,
							gap: s.xs,
						}}
					>
						<SkeletonBlock width={24} height={24} borderRadius={r.sm} />
						<SkeletonBlock
							width="80%"
							height={20}
							style={{ marginTop: s.xs + s.xxs }}
						/>
						<SkeletonBlock width="60%" height={11} />
					</View>
				))}
			</View>

			{/* Quick actions grid */}
			<View>
				<SkeletonBlock width="45%" height={16} style={{ marginBottom: s.md }} />
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm }}>
					{Array.from({ length: 4 }).map((_, i) => (
						<View
							key={i}
							style={{
								width: '47%',
								padding: s.md,
								gap: s.sm,
								borderRadius: r.lg,
							}}
						>
							<SkeletonBlock width={40} height={40} borderRadius={r.md} />
							<SkeletonBlock width="70%" height={14} />
						</View>
					))}
				</View>
			</View>

			{/* Recent invoices */}
			<View>
				<SkeletonBlock width="50%" height={16} style={{ marginBottom: s.md }} />
				{Array.from({ length: 3 }).map((_, i) => (
					<View
						key={i}
						style={{ gap: s.xs, marginBottom: s.sm, padding: s.md, borderRadius: r.md }}
					>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<SkeletonBlock width="40%" height={14} />
							<SkeletonBlock width="25%" height={14} />
						</View>
						<SkeletonBlock width="55%" height={12} />
					</View>
				))}
			</View>
		</View>
	);
}
