#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'src', 'theme', 'designTokens.ts');
const generatedRoot = path.join(root, 'src', 'theme', 'generated');
const jsonOutputPath = path.join(generatedRoot, 'design-system.tokens.json');
const cssOutputPath = path.join(generatedRoot, 'web', 'design-system.tokens.css');
const scssOutputPath = path.join(generatedRoot, 'web', 'design-system.tokens.scss');
const androidOutputPath = path.join(generatedRoot, 'android', 'values', 'design_system_tokens.xml');
const iosSwiftOutputPath = path.join(generatedRoot, 'ios', 'DesignSystemTokens.swift');
const iosAssetCatalogPath = path.join(generatedRoot, 'ios', 'DesignSystemColors.xcassets');
const changelogPath = path.join(root, 'docs', 'DESIGN_TOKEN_CHANGELOG.md');

function ensureDirectory(targetPath) {
	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function writeFile(targetPath, contents) {
	ensureDirectory(targetPath);
	fs.writeFileSync(targetPath, contents);
}

function loadTsModule(entryPath) {
	const source = fs.readFileSync(entryPath, 'utf8');
	const transpiled = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
		},
	}).outputText;
	const module = { exports: {} };
	const context = vm.createContext({
		module,
		exports: module.exports,
		process,
		console,
	});
	const script = new vm.Script(transpiled, { filename: entryPath });
	script.runInContext(context);
	return module.exports;
}

function kebabCase(value) {
	return value
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();
}

function snakeCase(value) {
	return kebabCase(value).replace(/-/g, '_');
}

function pascalCase(value) {
	return value
		.replace(/(^\w|[-_ ]\w)/g, (match) => match.replace(/[-_ ]/, '').toUpperCase())
		.replace(/[^a-zA-Z0-9]/g, '');
}

function toCssValue(section, value) {
	if (Array.isArray(value)) {
		return `cubic-bezier(${value.join(', ')})`;
	}

	if (typeof value !== 'number') {
		return String(value);
	}

	if (
		section === 'spacing' ||
		section === 'semanticSpacing' ||
		section === 'radius' ||
		section === 'silhouette' ||
		section === 'borderWidth' ||
		section === 'fontSize' ||
		section === 'lineHeight' ||
		section === 'shadow'
	) {
		return `${value}px`;
	}

	if (section === 'duration') {
		return `${value}ms`;
	}

	return String(value);
}

function toW3cTokenTree(value, type, unit) {
	if (Array.isArray(value)) {
		return {
			$type: type,
			$value: value,
		};
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, nestedValue]) => [
				key,
				toW3cTokenTree(nestedValue, type, unit),
			]),
		);
	}

	if (typeof value === 'number' && unit) {
		return {
			$type: type,
			$value: `${value}${unit}`,
		};
	}

	return {
		$type: type,
		$value: value,
	};
}

function flattenObject(object, prefix = []) {
	const entries = [];
	for (const [key, value] of Object.entries(object)) {
		const nextPrefix = [...prefix, key];
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			entries.push(...flattenObject(value, nextPrefix));
			continue;
		}
		entries.push({
			path: nextPrefix,
			value,
		});
	}
	return entries;
}

function hexToRgb(hexColor) {
	const normalized = hexColor.replace('#', '');
	const expanded =
		normalized.length === 3
			? normalized
					.split('')
					.map((part) => `${part}${part}`)
					.join('')
			: normalized;

	return {
		r: parseInt(expanded.slice(0, 2), 16) / 255,
		g: parseInt(expanded.slice(2, 4), 16) / 255,
		b: parseInt(expanded.slice(4, 6), 16) / 255,
		a: 1,
	};
}

function writeIosColorAsset(assetPath, color) {
	const rgba = hexToRgb(color);
	fs.mkdirSync(assetPath, { recursive: true });
	fs.writeFileSync(
		path.join(assetPath, 'Contents.json'),
		JSON.stringify(
			{
				info: {
					author: 'codex',
					version: 1,
				},
				colors: [
					{
						idiom: 'universal',
						color: {
							'color-space': 'srgb',
							components: {
								red: rgba.r.toFixed(6),
								green: rgba.g.toFixed(6),
								blue: rgba.b.toFixed(6),
								alpha: rgba.a.toFixed(6),
							},
						},
					},
				],
			},
			null,
			2,
		),
	);
}

const tokens = loadTsModule(sourcePath);

const {
	TOKEN_CHANGELOG,
	TOKEN_SOURCE_PATH,
	TOKEN_VERSION,
	BASE_THEME_COLOR_RECIPES,
	BORDER_WIDTH_TOKENS,
	COLOR_VARIANTS,
	DATA_EMPHASIS_TOKENS,
	DENSITY_SCALE_TOKENS,
	DURATION_TOKENS,
	EASING_CURVE_TOKENS,
	FONT_FAMILY_TOKENS,
	FONT_SIZE_TOKENS,
	FONT_WEIGHT_TOKENS,
	HERO_TOKENS,
	HIGH_CONTRAST_THEME_COLOR_RECIPES,
	ICON_SIZE_TOKENS,
	LETTER_SPACING_TOKENS,
	LINE_HEIGHT_TOKENS,
	MEDIA_OVERLAY_TOKENS,
	MOTION_PROFILE_TOKENS,
	OPACITY_TOKENS,
	PRIMITIVE_COLOR_PALETTES,
	QUALITATIVE_DATA_PALETTE_TOKENS,
	RADIUS_TOKENS,
	SEMANTIC_SPACING_TOKENS,
	SHADOW_TOKEN_RECIPES,
	SILHOUETTE_RADIUS_TOKENS,
	SPACING_STEP_TOKENS,
	SPACING_TOKENS,
	SURFACE_TIER_TOKENS,
	SPRING_TOKENS,
	Z_INDEX_TOKENS,
} = tokens;

const w3cPayload = {
	$schema: 'https://www.designtokens.org/TR/drafts/format/',
	$metadata: {
		version: TOKEN_VERSION,
		source: TOKEN_SOURCE_PATH,
		generatedAt: new Date().toISOString(),
	},
	color: {
		primitive: toW3cTokenTree(PRIMITIVE_COLOR_PALETTES, 'color'),
		semantic: {
			light: toW3cTokenTree(BASE_THEME_COLOR_RECIPES.light, 'color'),
			dark: toW3cTokenTree(BASE_THEME_COLOR_RECIPES.dark, 'color'),
			highContrastLight: toW3cTokenTree(HIGH_CONTRAST_THEME_COLOR_RECIPES.light, 'color'),
			highContrastDark: toW3cTokenTree(HIGH_CONTRAST_THEME_COLOR_RECIPES.dark, 'color'),
		},
		surface: toW3cTokenTree(SURFACE_TIER_TOKENS, 'color'),
		hero: toW3cTokenTree(HERO_TOKENS, 'color'),
		data: toW3cTokenTree(DATA_EMPHASIS_TOKENS, 'color'),
		dataQualitative: toW3cTokenTree(QUALITATIVE_DATA_PALETTE_TOKENS, 'color'),
		media: toW3cTokenTree(MEDIA_OVERLAY_TOKENS, 'color'),
	},
	space: toW3cTokenTree(SPACING_TOKENS, 'dimension', 'px'),
	spaceScale: toW3cTokenTree(SPACING_STEP_TOKENS, 'dimension', 'px'),
	semanticSpacing: toW3cTokenTree(SEMANTIC_SPACING_TOKENS, 'dimension', 'px'),
	density: toW3cTokenTree(DENSITY_SCALE_TOKENS, 'number'),
	radius: toW3cTokenTree(RADIUS_TOKENS, 'dimension', 'px'),
	silhouette: toW3cTokenTree(SILHOUETTE_RADIUS_TOKENS, 'dimension', 'px'),
	borderWidth: toW3cTokenTree(BORDER_WIDTH_TOKENS, 'dimension', 'px'),
	iconSize: toW3cTokenTree(ICON_SIZE_TOKENS, 'dimension', 'px'),
	fontFamily: toW3cTokenTree(FONT_FAMILY_TOKENS, 'fontFamily'),
	fontSize: toW3cTokenTree(FONT_SIZE_TOKENS, 'dimension', 'px'),
	fontWeight: toW3cTokenTree(FONT_WEIGHT_TOKENS, 'fontWeight'),
	lineHeight: toW3cTokenTree(LINE_HEIGHT_TOKENS, 'number'),
	letterSpacing: toW3cTokenTree(LETTER_SPACING_TOKENS, 'number'),
	opacity: toW3cTokenTree(OPACITY_TOKENS, 'number'),
	duration: toW3cTokenTree(DURATION_TOKENS, 'duration', 'ms'),
	easing: toW3cTokenTree(EASING_CURVE_TOKENS, 'cubicBezier'),
	spring: toW3cTokenTree(SPRING_TOKENS, 'number'),
	motion: toW3cTokenTree(MOTION_PROFILE_TOKENS, 'number'),
	shadow: toW3cTokenTree(SHADOW_TOKEN_RECIPES, 'number'),
	zIndex: toW3cTokenTree(Z_INDEX_TOKENS, 'number'),
	changelog: TOKEN_CHANGELOG,
};

writeFile(jsonOutputPath, `${JSON.stringify(w3cPayload, null, 2)}\n`);

const cssEntries = [
	...flattenObject(PRIMITIVE_COLOR_PALETTES, ['color']),
	...flattenObject(BASE_THEME_COLOR_RECIPES.light, ['color', 'semantic', 'light']),
	...flattenObject(BASE_THEME_COLOR_RECIPES.dark, ['color', 'semantic', 'dark']),
	...flattenObject(HIGH_CONTRAST_THEME_COLOR_RECIPES.light, [
		'color',
		'semantic',
		'high-contrast-light',
	]),
	...flattenObject(HIGH_CONTRAST_THEME_COLOR_RECIPES.dark, [
		'color',
		'semantic',
		'high-contrast-dark',
	]),
	...flattenObject(SURFACE_TIER_TOKENS, ['surface']),
	...flattenObject(HERO_TOKENS, ['hero']),
	...flattenObject(DATA_EMPHASIS_TOKENS, ['data']),
	...flattenObject(QUALITATIVE_DATA_PALETTE_TOKENS, ['data-qualitative']),
	...flattenObject(MEDIA_OVERLAY_TOKENS, ['media']),
	...flattenObject(SPACING_TOKENS, ['space']),
	...flattenObject(SPACING_STEP_TOKENS, ['space-scale']),
	...flattenObject(SEMANTIC_SPACING_TOKENS, ['semantic-space']),
	...flattenObject(DENSITY_SCALE_TOKENS, ['density']),
	...flattenObject(RADIUS_TOKENS, ['radius']),
	...flattenObject(SILHOUETTE_RADIUS_TOKENS, ['silhouette']),
	...flattenObject(BORDER_WIDTH_TOKENS, ['border-width']),
	...flattenObject(ICON_SIZE_TOKENS, ['icon-size']),
	...flattenObject(FONT_FAMILY_TOKENS, ['font-family']),
	...flattenObject(FONT_SIZE_TOKENS, ['font-size']),
	...flattenObject(FONT_WEIGHT_TOKENS, ['font-weight']),
	...flattenObject(LINE_HEIGHT_TOKENS, ['line-height']),
	...flattenObject(LETTER_SPACING_TOKENS, ['letter-spacing']),
	...flattenObject(OPACITY_TOKENS, ['opacity']),
	...flattenObject(DURATION_TOKENS, ['duration']),
	...flattenObject(EASING_CURVE_TOKENS, ['easing']),
	...flattenObject(SPRING_TOKENS, ['spring']),
	...flattenObject(MOTION_PROFILE_TOKENS, ['motion']),
	...flattenObject(SHADOW_TOKEN_RECIPES, ['shadow']),
	...flattenObject(Z_INDEX_TOKENS, ['z-index']),
].map((entry) => ({
	name: `ds-${entry.path.map(kebabCase).join('-')}`,
	section: entry.path[0],
	value:
		entry.path[0] === 'font-size'
			? toCssValue('fontSize', entry.value)
			: entry.path[0] === 'space'
				? toCssValue('spacing', entry.value)
				: entry.path[0] === 'space-scale'
					? toCssValue('spacing', entry.value)
					: entry.path[0] === 'semantic-space'
						? toCssValue('semanticSpacing', entry.value)
						: entry.path[0] === 'radius'
							? toCssValue('radius', entry.value)
							: entry.path[0] === 'silhouette'
								? toCssValue('silhouette', entry.value)
								: entry.path[0] === 'border-width'
									? toCssValue('borderWidth', entry.value)
									: entry.path[0] === 'icon-size'
										? toCssValue('fontSize', entry.value)
										: entry.path[0] === 'line-height'
											? toCssValue('lineHeight', entry.value)
											: entry.path[0] === 'duration'
												? toCssValue('duration', entry.value)
												: entry.path[0] === 'shadow'
													? toCssValue('shadow', entry.value)
													: toCssValue(entry.path[0], entry.value),
}));

const cssLines = [
	'/* Auto-generated by scripts/generate-design-tokens.mjs */',
	':root {',
	...cssEntries.map((entry) => `  --${entry.name}: ${entry.value};`),
	'}',
	'',
];
writeFile(cssOutputPath, `${cssLines.join('\n')}\n`);

const scssLines = [
	'// Auto-generated by scripts/generate-design-tokens.mjs',
	...cssEntries.map((entry) => `$${entry.name}: ${entry.value};`),
	'',
];
writeFile(scssOutputPath, `${scssLines.join('\n')}\n`);

const androidColorEntries = flattenObject(PRIMITIVE_COLOR_PALETTES, ['color']).filter(
	(entry) => typeof entry.value === 'string' && String(entry.value).startsWith('#'),
);
const androidSemanticColorEntries = [
	...flattenObject(BASE_THEME_COLOR_RECIPES.light, ['semantic_light']),
	...flattenObject(BASE_THEME_COLOR_RECIPES.dark, ['semantic_dark']),
	...flattenObject(HIGH_CONTRAST_THEME_COLOR_RECIPES.light, ['semantic_high_contrast_light']),
	...flattenObject(HIGH_CONTRAST_THEME_COLOR_RECIPES.dark, ['semantic_high_contrast_dark']),
].filter((entry) => typeof entry.value === 'string' && String(entry.value).startsWith('#'));

const androidDimenEntries = [
	...flattenObject(SPACING_TOKENS, ['space']).map((entry) => ({ ...entry, unit: 'dp' })),
	...flattenObject(SPACING_STEP_TOKENS, ['space_scale']).map((entry) => ({
		...entry,
		unit: 'dp',
	})),
	...flattenObject(RADIUS_TOKENS, ['radius']).map((entry) => ({ ...entry, unit: 'dp' })),
	...flattenObject(BORDER_WIDTH_TOKENS, ['border_width']).map((entry) => ({
		...entry,
		unit: 'dp',
	})),
	...flattenObject(ICON_SIZE_TOKENS, ['icon_size']).map((entry) => ({ ...entry, unit: 'dp' })),
	...flattenObject(FONT_SIZE_TOKENS, ['font_size']).map((entry) => ({ ...entry, unit: 'sp' })),
].filter((entry) => typeof entry.value === 'number');

const androidIntegerEntries = [
	...flattenObject(DURATION_TOKENS, ['duration']),
	...flattenObject(Z_INDEX_TOKENS, ['z_index']),
].filter((entry) => typeof entry.value === 'number');

const androidXml = [
	'<?xml version="1.0" encoding="utf-8"?>',
	'<!-- Auto-generated by scripts/generate-design-tokens.mjs -->',
	'<resources>',
	...androidColorEntries.map(
		(entry) =>
			`  <color name="ds_${entry.path.map(snakeCase).join('_')}">${entry.value}</color>`,
	),
	...androidSemanticColorEntries.map(
		(entry) =>
			`  <color name="ds_${entry.path.map(snakeCase).join('_')}">${entry.value}</color>`,
	),
	...androidDimenEntries.map(
		(entry) =>
			`  <dimen name="ds_${entry.path.map(snakeCase).join('_')}">${entry.value}${entry.unit}</dimen>`,
	),
	...androidIntegerEntries.map(
		(entry) =>
			`  <integer name="ds_${entry.path.map(snakeCase).join('_')}">${entry.value}</integer>`,
	),
	'</resources>',
	'',
];
writeFile(androidOutputPath, androidXml.join('\n'));

const iosSwift = [
	'// Auto-generated by scripts/generate-design-tokens.mjs',
	'import Foundation',
	'',
	'public enum DesignSystemTokens {',
	`    public static let version = "${TOKEN_VERSION}"`,
	'',
	'    public enum FontFamily {',
	`        public static let ui = "${FONT_FAMILY_TOKENS.ui.ios}"`,
	`        public static let display = "${FONT_FAMILY_TOKENS.display.ios}"`,
	`        public static let brand = "${FONT_FAMILY_TOKENS.brand.ios}"`,
	`        public static let mono = "${FONT_FAMILY_TOKENS.mono.ios}"`,
	'    }',
	'',
	'    public enum Spacing {',
	...Object.entries(SPACING_TOKENS).map(
		([key, value]) => `        public static let ${snakeCase(key)}: Double = ${value}`,
	),
	'    }',
	'',
	'    public enum SpacingScale {',
	...Object.entries(SPACING_STEP_TOKENS).map(
		([key, value]) => `        public static let step_${snakeCase(key)}: Double = ${value}`,
	),
	'    }',
	'',
	'    public enum Radius {',
	...Object.entries(RADIUS_TOKENS).map(
		([key, value]) => `        public static let ${snakeCase(key)}: Double = ${value}`,
	),
	'    }',
	'',
	'    public enum IconSize {',
	...Object.entries(ICON_SIZE_TOKENS).map(
		([key, value]) => `        public static let ${snakeCase(key)}: Double = ${value}`,
	),
	'    }',
	'',
	'    public enum FontSize {',
	...Object.entries(FONT_SIZE_TOKENS).map(
		([key, value]) => `        public static let ${snakeCase(key)}: Double = ${value}`,
	),
	'    }',
	'',
	'    public enum Duration {',
	...Object.entries(DURATION_TOKENS).map(
		([key, value]) => `        public static let ${snakeCase(key)}: Double = ${value}`,
	),
	'    }',
	'',
	'    public enum ZIndex {',
	...Object.entries(Z_INDEX_TOKENS).map(
		([key, value]) => `        public static let ${snakeCase(key)}: Int = ${value}`,
	),
	'    }',
	'}',
	'',
];
writeFile(iosSwiftOutputPath, iosSwift.join('\n'));

fs.rmSync(iosAssetCatalogPath, { recursive: true, force: true });
fs.mkdirSync(iosAssetCatalogPath, { recursive: true });
fs.writeFileSync(
	path.join(iosAssetCatalogPath, 'Contents.json'),
	JSON.stringify(
		{
			info: {
				author: 'codex',
				version: 1,
			},
		},
		null,
		2,
	),
);

for (const entry of androidColorEntries) {
	const assetName = `DS${entry.path.map(pascalCase).join('')}.colorset`;
	writeIosColorAsset(path.join(iosAssetCatalogPath, assetName), entry.value);
}

for (const entry of androidSemanticColorEntries) {
	const assetName = `DS${entry.path.map(pascalCase).join('')}.colorset`;
	writeIosColorAsset(path.join(iosAssetCatalogPath, assetName), entry.value);
}

const changelogLines = [
	'# Design Token Changelog',
	'',
	`Source: \`${TOKEN_SOURCE_PATH}\``,
	`Current version: \`${TOKEN_VERSION}\``,
	'',
	...TOKEN_CHANGELOG.flatMap((entry) => [
		`## ${entry.version} — ${entry.date}`,
		'',
		'Added',
		...(entry.added.length > 0 ? entry.added.map((item) => `- ${item}`) : ['- None']),
		'',
		'Renamed',
		...(entry.renamed.length > 0 ? entry.renamed.map((item) => `- ${item}`) : ['- None']),
		'',
		'Deprecated',
		...(entry.deprecated.length > 0 ? entry.deprecated.map((item) => `- ${item}`) : ['- None']),
		'',
	]),
];
writeFile(changelogPath, `${changelogLines.join('\n')}\n`);

console.log(
	JSON.stringify(
		{
			version: TOKEN_VERSION,
			outputs: {
				json: path.relative(root, jsonOutputPath),
				css: path.relative(root, cssOutputPath),
				scss: path.relative(root, scssOutputPath),
				android: path.relative(root, androidOutputPath),
				iosSwift: path.relative(root, iosSwiftOutputPath),
				iosCatalog: path.relative(root, iosAssetCatalogPath),
				changelog: path.relative(root, changelogPath),
			},
			variants: COLOR_VARIANTS.length,
			primitivePalettes: Object.keys(PRIMITIVE_COLOR_PALETTES).length,
		},
		null,
		2,
	),
);
