import React from 'react';
import { Stack } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

export default function DesignSystemLayout() {
	const { c } = useThemeTokens();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: c.background },
			}}
		/>
	);
}
