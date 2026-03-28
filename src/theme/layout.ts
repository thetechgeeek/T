import { StyleSheet } from 'react-native';

/**
 * Static layout utilities — use these instead of theme.layout to avoid
 * pulling layout objects through the theme context on every render.
 */
export const layout = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center' },
	rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	rowEnd: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
	center: { alignItems: 'center', justifyContent: 'center' },
	flex: { flex: 1 },
	absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
