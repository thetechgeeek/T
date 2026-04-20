import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ThemeSnapshotPreview } from '../components/ThemeSnapshotPreview';
import type { DesignSystemLocale } from '../copy';

const LOCALE_MATRIX: ReadonlyArray<{
	label: string;
	locale: DesignSystemLocale;
	runtimeOverrides?: React.ComponentProps<typeof ThemeProvider>['runtimeOverrides'];
}> = [
	{ label: 'english', locale: 'en' },
	{ label: 'german', locale: 'de' },
	{ label: 'arabic', locale: 'ar', runtimeOverrides: { runtimeRtl: true } },
	{ label: 'japanese', locale: 'ja' },
];

describe('design-system locale matrix', () => {
	it.each(LOCALE_MATRIX)(
		'matches the snapshot for $label locale stress',
		({ locale, runtimeOverrides }) => {
			const { toJSON } = render(
				<ThemeProvider
					initialMode="light"
					initialPresetId="baseline"
					persist={false}
					runtimeOverrides={{
						windowWidth: 430,
						windowHeight: 932,
						breakpoint: 'phone',
						deviceType: 'phone',
						orientation: 'portrait',
						columns: 1,
						supportsSplitPane: false,
						layoutScale: 1,
						spacingScale: 1,
						typographyScale: 1,
						...runtimeOverrides,
					}}
				>
					<ThemeSnapshotPreview locale={locale} />
				</ThemeProvider>,
			);

			expect(toJSON()).toMatchSnapshot();
		},
	);
});
