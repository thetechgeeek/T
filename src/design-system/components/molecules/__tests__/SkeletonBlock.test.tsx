import React from 'react';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { SkeletonBlock } from '../SkeletonBlock';

describe('SkeletonBlock', () => {
	it('renders a hidden accessibility placeholder with custom dimensions', () => {
		const { toJSON } = renderWithTheme(
			<SkeletonBlock width={120} height={18} borderRadius={10} style={{ opacity: 0.8 }} />,
		);

		const tree = toJSON();

		expect(tree).toBeTruthy();
		expect(tree?.props.importantForAccessibility).toBe('no-hide-descendants');
	});
});
