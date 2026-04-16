import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import type { ThemeMode, ThemePresetId } from '@/src/theme';
import { ThemeSnapshotPreview } from '../components/ThemeSnapshotPreview';

const PRESET_MATRIX: ReadonlyArray<{ presetId: ThemePresetId; mode: ThemeMode }> = [
	{ presetId: 'baseline', mode: 'light' },
	{ presetId: 'baseline', mode: 'dark' },
	{ presetId: 'executive', mode: 'light' },
	{ presetId: 'executive', mode: 'dark' },
	{ presetId: 'studio', mode: 'light' },
	{ presetId: 'studio', mode: 'dark' },
	{ presetId: 'mono', mode: 'light' },
	{ presetId: 'mono', mode: 'dark' },
];

describe('design-system theme matrix', () => {
	it.each(PRESET_MATRIX)(
		'matches the preset proof snapshot for $presetId in $mode mode',
		({ presetId, mode }) => {
			const { toJSON } = render(
				<ThemeProvider initialMode={mode} initialPresetId={presetId} persist={false}>
					<ThemeSnapshotPreview locale="en" />
				</ThemeProvider>,
			);

			expect(toJSON()).toMatchSnapshot();
		},
	);

	it('matches the accessibility stress snapshot for rtl, bold text, and reduced motion', () => {
		const { toJSON } = render(
			<ThemeProvider
				initialMode="dark"
				initialPresetId="studio"
				persist={false}
				runtimeOverrides={{
					boldTextEnabled: true,
					fontScale: 1.6,
					reduceMotionEnabled: true,
					runtimeRtl: true,
				}}
			>
				<ThemeSnapshotPreview locale="ar" />
			</ThemeProvider>,
		);

		expect(toJSON()).toMatchSnapshot();
	});
});
