import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const root = path.join(__dirname, '..', '..', '..');
const generatedRoot = path.join(root, 'src', 'theme', 'generated');

function readGeneratedFile(...segments: string[]) {
	return fs.readFileSync(path.join(generatedRoot, ...segments), 'utf8');
}

describe('generated design token artifacts', () => {
	beforeAll(() => {
		execFileSync(process.execPath, ['scripts/generate-design-tokens.mjs'], {
			cwd: root,
			stdio: 'pipe',
		});
	});

	it('writes a W3C design tokens JSON payload with version metadata', () => {
		const payload = JSON.parse(readGeneratedFile('design-system.tokens.json')) as {
			$schema: string;
			$metadata: { version: string };
			color: { primitive: { primary: { 500: { $value: string } } } };
		};

		expect(payload.$schema).toContain('designtokens.org');
		expect(payload.$metadata.version).toBe('1.1.0');
		expect(payload.color.primitive.primary[500].$value).toBe('#E8622A');
	});

	it('writes web token transforms for CSS custom properties and SCSS variables', () => {
		const css = readGeneratedFile('web', 'design-system.tokens.css');
		const scss = readGeneratedFile('web', 'design-system.tokens.scss');

		expect(css).toContain('--ds-color-primary-500: #E8622A;');
		expect(css).toContain(
			'--ds-font-family-brand-web: "IBM Plex Sans", Inter, system-ui, sans-serif;',
		);
		expect(scss).toContain('$ds-space-md: 12px;');
		expect(scss).toContain('$ds-icon-size-dense: 16px;');
		expect(scss).toContain('$ds-z-index-modal: 200;');
	});

	it('writes mobile token transforms for Android XML and iOS Swift/assets', () => {
		const android = readGeneratedFile('android', 'values', 'design_system_tokens.xml');
		const iosSwift = readGeneratedFile('ios', 'DesignSystemTokens.swift');
		const iosCatalogRoot = path.join(generatedRoot, 'ios', 'DesignSystemColors.xcassets');

		expect(android).toContain('<color name="ds_color_primary_500">#E8622A</color>');
		expect(android).toContain('<dimen name="ds_font_size_display_2xl">60sp</dimen>');
		expect(android).toContain('<dimen name="ds_icon_size_standalone">24dp</dimen>');
		expect(iosSwift).toContain('public enum DesignSystemTokens');
		expect(iosSwift).toContain('public static let brand = "System"');
		expect(iosSwift).toContain('public enum IconSize');
		expect(fs.existsSync(path.join(iosCatalogRoot, 'Contents.json'))).toBe(true);
		expect(
			fs.existsSync(
				path.join(
					iosCatalogRoot,
					'DSSemanticHighContrastDarkPrimary.colorset',
					'Contents.json',
				),
			),
		).toBe(true);
	});

	it('writes a design token changelog document from the token source metadata', () => {
		const changelog = fs.readFileSync(
			path.join(root, 'docs', 'DESIGN_TOKEN_CHANGELOG.md'),
			'utf8',
		);

		expect(changelog).toContain('# Design Token Changelog');
		expect(changelog).toContain('## 1.1.0 — 2026-04-16');
		expect(changelog).toContain('Full spacing step scale');
		expect(changelog).toContain('Generated W3C/Style Dictionary JSON');
	});
});
