import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const root = path.join(__dirname, '..', '..', '..');
const generatedRoot = path.join(root, 'src', 'theme', 'generated');
const changelogPath = path.join(root, 'docs', 'DESIGN_TOKEN_CHANGELOG.md');

function readGeneratedFile(...segments: string[]) {
	return fs.readFileSync(path.join(generatedRoot, ...segments), 'utf8');
}

describe('generated design token artifacts', () => {
	let backupRoot: string | null = null;

	beforeAll(() => {
		backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'design-token-artifacts-'));
		fs.cpSync(generatedRoot, path.join(backupRoot, 'generated'), { recursive: true });
		fs.copyFileSync(changelogPath, path.join(backupRoot, 'DESIGN_TOKEN_CHANGELOG.md'));

		execFileSync(process.execPath, ['scripts/generate-design-tokens.mjs'], {
			cwd: root,
			stdio: 'pipe',
		});
	});

	afterAll(() => {
		if (backupRoot == null) {
			return;
		}

		fs.rmSync(generatedRoot, { recursive: true, force: true });
		fs.cpSync(path.join(backupRoot, 'generated'), generatedRoot, { recursive: true });
		fs.copyFileSync(path.join(backupRoot, 'DESIGN_TOKEN_CHANGELOG.md'), changelogPath);
		fs.rmSync(backupRoot, { recursive: true, force: true });
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
		const changelog = fs.readFileSync(changelogPath, 'utf8');

		expect(changelog).toContain('# Design Token Changelog');
		expect(changelog).toContain('## 1.1.0 — 2026-04-16');
		expect(changelog).toContain('Full spacing step scale');
		expect(changelog).toContain('Generated W3C/Style Dictionary JSON');
	});
});
