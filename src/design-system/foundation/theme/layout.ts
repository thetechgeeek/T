import { StyleSheet } from 'react-native';

/**
 * Static layout utilities — use these instead of theme.layout to avoid
 * pulling layout objects through the theme context on every render.
 */
export const layout = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center' },
	rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	rowEnd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
	rowStart: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
	colCenter: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
	center: { alignItems: 'center', justifyContent: 'center' },
	flex: { flex: 1 },
	absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
	gap0: { gap: 0 },
	gap1: { gap: 1 },
	gap2: { gap: 2 },
	gap3: { gap: 3 },
	gap4: { gap: 4 },
	gap5: { gap: 5 },
	gap6: { gap: 6 },
	gap8: { gap: 8 },
	gap10: { gap: 10 },
	gap12: { gap: 12 },
	gap16: { gap: 16 },
	gap20: { gap: 20 },
	gap24: { gap: 24 },
	gap32: { gap: 32 },
	gap40: { gap: 40 },
	gap48: { gap: 48 },
	gap64: { gap: 64 },
});
