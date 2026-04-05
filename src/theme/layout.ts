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
	gap4: { gap: 4 },
	gap8: { gap: 8 },
	gap12: { gap: 12 },
	gap16: { gap: 16 },
});
