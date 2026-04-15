import React from 'react';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { SkeletonRow } from '../SkeletonRow';

describe('SkeletonRow', () => {
	it('renders an avatar variant with a stable test id', () => {
		const { UNSAFE_getByProps, toJSON } = renderWithTheme(
			<SkeletonRow withAvatar lines={2} testID="skeleton-row" />,
		);

		expect(UNSAFE_getByProps({ testID: 'skeleton-row' })).toBeTruthy();
		expect(toJSON()).toBeTruthy();
	});

	it('renders the compact one-line variant', () => {
		const { UNSAFE_getByProps } = renderWithTheme(
			<SkeletonRow lines={1} testID="compact-row" />,
		);

		expect(UNSAFE_getByProps({ testID: 'compact-row' })).toBeTruthy();
	});
});
