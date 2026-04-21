import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ShellOverlayEntry {
	id: string;
	node: React.ReactNode;
}

interface ShellOverlayContextValue {
	present: (node: React.ReactNode) => string;
	dismiss: (id: string) => void;
	dismissAll: () => void;
}

const ShellOverlayContext = createContext<ShellOverlayContextValue>({
	present: () => '',
	dismiss: () => {},
	dismissAll: () => {},
});

export interface ShellOverlayProviderProps {
	children: React.ReactNode;
}

export function ShellOverlayProvider({ children }: ShellOverlayProviderProps) {
	const [entries, setEntries] = useState<ShellOverlayEntry[]>([]);
	const nextIdRef = useRef(0);

	const value = useMemo<ShellOverlayContextValue>(
		() => ({
			present: (node) => {
				const id = `shell-overlay-${nextIdRef.current}`;
				nextIdRef.current += 1;
				setEntries((current) => [...current, { id, node }]);
				return id;
			},
			dismiss: (id) => {
				setEntries((current) => current.filter((entry) => entry.id !== id));
			},
			dismissAll: () => {
				setEntries([]);
			},
		}),
		[],
	);

	return (
		<ShellOverlayContext.Provider value={value}>
			{children}
			<View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
				{entries.map((entry) => (
					<React.Fragment key={entry.id}>{entry.node}</React.Fragment>
				))}
			</View>
		</ShellOverlayContext.Provider>
	);
}

export function useShellOverlay() {
	return useContext(ShellOverlayContext);
}
