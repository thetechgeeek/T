import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export function InvoiceListSkeleton() {
	const { s, r, c } = useThemeTokens();

	return (
		<View style={{ padding: s.md, gap: s.md }}>
			{Array.from({ length: 5 }).map((_, i) => (
				<View
					key={i}
					style={{
						backgroundColor: c.card,
						borderRadius: r.md,
						padding: s.md,
						gap: s.sm,
					}}
				>
					{/* top row: invoice number + date */}
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<SkeletonBlock width="45%" height={14} />
						<SkeletonBlock width="25%" height={12} />
					</View>
					{/* customer name */}
					<SkeletonBlock width="60%" height={12} />
					{/* footer: status + amount */}
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginTop: s.xs,
						}}
					>
						<SkeletonBlock width={60} height={20} borderRadius={r.full} />
						<SkeletonBlock width="30%" height={16} />
					</View>
				</View>
			))}
		</View>
	);
}
