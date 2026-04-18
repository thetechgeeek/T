#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const TARGET_DIRS = ['src/design-system', 'app/design-system'];
const SKIP_SEGMENTS = new Set(['generated', '__tests__']);
const SKIP_FILES = new Set(['src/design-system/copy.ts']);
const RUNTIME_SIGNAL_SOURCE = 'src/design-system/runtimeSignals.ts';
const DESIGN_SYSTEM_COMPONENT_PREFIX = 'src/design-system/components/';
const COMPONENT_REGISTRY_PATH = 'src/design-system/componentRegistry.json';
const COMPONENT_CATALOG_PATH = 'src/design-system/generated/componentCatalog.ts';
const README_PATH = 'src/design-system/README.md';
const REQUIRED_SOURCE_FILES = [
	'src/design-system/fixtures.ts',
	'src/design-system/components/ThemeSnapshotPreview.tsx',
];
const REQUIRED_TEST_FILES = [
	'src/design-system/__tests__/boundary.test.ts',
	'src/design-system/__tests__/fixtures.test.ts',
	'src/design-system/__tests__/qualityMatrix.test.tsx',
	'src/design-system/__tests__/themeMatrix.test.tsx',
];
const DESIGN_SYSTEM_ROUTE_PATH = 'app/design-system/index.tsx';
const LEGACY_DESIGN_SYSTEM_ROUTE_DIR = 'app/(app)/design-system';
const PRODUCT_MORE_TAB_PATH = 'app/(app)/(tabs)/more.tsx';
const DESIGN_SYSTEM_ROUTE_RE = /['"`](?:\/design-system|app\/design-system)['"`]/;
const REQUIRED_README_PHRASES = [
	'Relaxed showcase',
	'Operational dense',
	'loading, empty, error, read-only, denied, no-media, and ugly-data',
];

const FILE_TEXT_RULES = [
	{
		name: 'logical-direction',
		pattern: /\b(paddingLeft|paddingRight|marginLeft|marginRight)\s*:/g,
		message: 'Use logical start/end spacing props inside design-system for RTL safety.',
	},
	{
		name: 'absolute-left-right',
		pattern: /\b(left|right)\s*:\s*-?\d/g,
		message: 'Avoid absolute left/right positioning in design-system UI code.',
	},
	{
		name: 'inline-copy-prop',
		pattern:
			/\b(title|label|description|placeholder|message|actionLabel|trendLabel)\s*=\s*(['"])/g,
		message: 'Route all user-facing design-system copy through src/design-system/copy.ts.',
	},
	{
		name: 'inline-themed-text',
		pattern: /<ThemedText\b[^>]*>\s*([A-Za-z0-9][^<{]*)\s*<\/ThemedText>/g,
		message: 'ThemedText content in design-system should come from the copy registry.',
	},
	{
		name: 'react-native-text',
		pattern: /import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*['"]react-native['"]/g,
		message: 'Use ThemedText instead of raw react-native Text in design-system UI code.',
	},
];

const DISALLOWED_IMPORT_RULES = [
	{
		name: 'app-locale-hook',
		pattern: /from\s*['"]@\/src\/hooks\/useLocale['"]/g,
		message:
			'Design-system code must use src/design-system/copy.ts instead of product i18n hooks.',
	},
	{
		name: 'product-store-import',
		pattern: /from\s*['"]@\/src\/stores\//g,
		message: 'Design-system code must not import product stores.',
	},
	{
		name: 'product-service-import',
		pattern: /from\s*['"]@\/src\/services\//g,
		message: 'Design-system code must not import product services.',
	},
	{
		name: 'product-feature-import',
		pattern: /from\s*['"]@\/src\/features\//g,
		message: 'Design-system code must not import product feature modules.',
	},
	{
		name: 'app-component-import',
		pattern: /from\s*['"]@\/app\/components\//g,
		message: 'Design-system code must not import app-only components from app/components/.',
	},
	{
		name: 'legacy-components-import',
		pattern: /from\s*['"]@\/src\/components\//g,
		message:
			'Design-system code must import shared UI from src/design-system/components instead of the retired src/components tree.',
	},
];

function normalize(relPath) {
	return relPath.split(path.sep).join('/');
}

function parseConstStringArray(text, constName) {
	const match = text.match(new RegExp(`const ${constName} = \\[(.*?)\\] as const;`, 's'));
	if (!match) {
		return [];
	}

	return [...match[1].matchAll(/'((?:\\'|[^'])*)'/g)].map((entry) =>
		entry[1].replaceAll("\\'", "'"),
	);
}

function parseGeneratedComponents(text) {
	const components = [];

	for (const match of text.matchAll(
		/[\"']?name[\"']?\s*:\s*['"]([^'"]+)['"][\s\S]*?[\"']?kind[\"']?\s*:\s*['"]([^'"]+)['"][\s\S]*?[\"']?filePath[\"']?\s*:\s*['"]([^'"]+)['"][\s\S]*?[\"']?hasTests[\"']?\s*:\s*(true|false)/g,
	)) {
		components.push({
			name: match[1],
			kind: match[2],
			filePath: match[3],
			hasTests: match[4] === 'true',
		});
	}

	return components;
}

function walk(dirPath, out) {
	if (!fs.existsSync(dirPath)) {
		return out;
	}

	for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const absPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			walk(absPath, out);
			continue;
		}

		const relPath = normalize(path.relative(root, absPath));
		if (!/\.(ts|tsx)$/.test(relPath)) {
			continue;
		}
		if (SKIP_FILES.has(relPath)) {
			continue;
		}
		if ([...SKIP_SEGMENTS].some((segment) => relPath.includes(`/${segment}/`))) {
			continue;
		}

		out.push(relPath);
	}

	return out;
}

function indexToLine(text, index) {
	return text.slice(0, index).split('\n').length;
}

function hasComponentTests(filePath) {
	const absoluteFilePath = path.join(root, filePath);
	const componentDir = path.dirname(absoluteFilePath);
	const name = path.basename(absoluteFilePath, path.extname(absoluteFilePath));
	const candidates = [
		path.join(componentDir, '__tests__', `${name}.test.tsx`),
		path.join(componentDir, '__tests__', `${name}.test.ts`),
	];

	return candidates.some((candidate) => fs.existsSync(candidate));
}

const files = TARGET_DIRS.flatMap((dir) => walk(path.join(root, dir), []));
const violations = [];

for (const relPath of files) {
	const text = fs.readFileSync(path.join(root, relPath), 'utf8');
	const isSharedComponentFile = relPath.startsWith(DESIGN_SYSTEM_COMPONENT_PREFIX);

	if (
		relPath !== RUNTIME_SIGNAL_SOURCE &&
		/import\s*\{[^}]*\b(AccessibilityInfo|PixelRatio|I18nManager|Appearance)\b[^}]*\}\s*from\s*['"]react-native['"]/g.test(
			text,
		)
	) {
		violations.push({
			file: relPath,
			line: 1,
			rule: 'runtime-signal-source',
			message:
				'Read runtime accessibility, font-scale, and RTL signals through src/design-system/runtimeSignals.ts instead of importing platform APIs directly.',
		});
	}

	for (const rule of FILE_TEXT_RULES) {
		if (
			isSharedComponentFile &&
			(rule.name === 'inline-copy-prop' || rule.name === 'inline-themed-text')
		) {
			continue;
		}
		if (
			relPath === 'src/design-system/components/atoms/ThemedText.tsx' &&
			rule.name === 'react-native-text'
		) {
			continue;
		}

		rule.pattern.lastIndex = 0;
		for (const match of text.matchAll(rule.pattern)) {
			if (match.index == null) {
				continue;
			}

			violations.push({
				file: relPath,
				line: indexToLine(text, match.index),
				rule: rule.name,
				message: rule.message,
			});
		}
	}

	for (const rule of DISALLOWED_IMPORT_RULES) {
		rule.pattern.lastIndex = 0;
		for (const match of text.matchAll(rule.pattern)) {
			if (match.index == null) {
				continue;
			}

			violations.push({
				file: relPath,
				line: indexToLine(text, match.index),
				rule: rule.name,
				message: rule.message,
			});
		}
	}
}

for (const requiredTestFile of REQUIRED_TEST_FILES) {
	if (!fs.existsSync(path.join(root, requiredTestFile))) {
		violations.push({
			file: requiredTestFile,
			line: 1,
			rule: 'design-system-proof-matrix',
			message:
				'The design-system folder must keep its route-boundary, quality-matrix, and theme-matrix tests as hard guardrails.',
		});
	}
}

for (const requiredSourceFile of REQUIRED_SOURCE_FILES) {
	if (!fs.existsSync(path.join(root, requiredSourceFile))) {
		violations.push({
			file: requiredSourceFile,
			line: 1,
			rule: 'design-system-proof-fixtures',
			message:
				'The design-system folder must keep its shared proof fixtures so premium-quality and fallback-state demos stay representative.',
		});
	}
}

if (!fs.existsSync(path.join(root, README_PATH))) {
	violations.push({
		file: README_PATH,
		line: 1,
		rule: 'design-system-workbench-docs',
		message:
			'The design-system folder must keep its README documenting the relaxed/operational split and fallback-state proof deck.',
	});
} else {
	const readme = fs.readFileSync(path.join(root, README_PATH), 'utf8');

	for (const phrase of REQUIRED_README_PHRASES) {
		if (!readme.includes(phrase)) {
			violations.push({
				file: README_PATH,
				line: 1,
				rule: 'design-system-workbench-docs',
				message:
					'The design-system README must document the relaxed/operational split and the required fallback-state proof deck.',
			});
			break;
		}
	}
}

if (!fs.existsSync(path.join(root, DESIGN_SYSTEM_ROUTE_PATH))) {
	violations.push({
		file: DESIGN_SYSTEM_ROUTE_PATH,
		line: 1,
		rule: 'design-system-route',
		message: 'The design-system app surface must exist at app/design-system/index.tsx.',
	});
}

if (fs.existsSync(path.join(root, LEGACY_DESIGN_SYSTEM_ROUTE_DIR))) {
	violations.push({
		file: LEGACY_DESIGN_SYSTEM_ROUTE_DIR,
		line: 1,
		rule: 'design-system-route-boundary',
		message: 'The design-system route must not live under app/(app).',
	});
}

if (fs.existsSync(path.join(root, PRODUCT_MORE_TAB_PATH))) {
	const moreTabText = fs.readFileSync(path.join(root, PRODUCT_MORE_TAB_PATH), 'utf8');
	if (DESIGN_SYSTEM_ROUTE_RE.test(moreTabText)) {
		violations.push({
			file: PRODUCT_MORE_TAB_PATH,
			line: 1,
			rule: 'design-system-product-nav-link',
			message:
				'The product More tab must not wire the app-agnostic design-system into product navigation.',
		});
	}
}

const catalogText = fs.readFileSync(path.join(root, 'src/design-system/catalog.ts'), 'utf8');
const previewLabels = parseConstStringArray(catalogText, 'DESIGN_LIBRARY_PREVIEW_LABELS');
const livePreviewComponents = parseConstStringArray(catalogText, 'LIVE_PREVIEW_COMPONENTS');

const registry = JSON.parse(fs.readFileSync(path.join(root, COMPONENT_REGISTRY_PATH), 'utf8'));
const registryByPath = new Map(registry.map((entry) => [entry.filePath, entry]));
const componentCatalogText = fs.readFileSync(path.join(root, COMPONENT_CATALOG_PATH), 'utf8');
const generatedComponents = parseGeneratedComponents(componentCatalogText);

for (const entry of registry) {
	if (!entry.filePath.startsWith('src/design-system/components/')) {
		violations.push({
			file: entry.filePath,
			line: 1,
			rule: 'registry-component-boundary',
			message:
				'Every supported registry entry must live under src/design-system/components/.',
		});
	}

	if (!hasComponentTests(entry.filePath)) {
		violations.push({
			file: entry.filePath,
			line: 1,
			rule: 'registry-component-tests',
			message:
				'Every component registered as part of the supported design-system surface must have automated tests.',
		});
	}
}

if (generatedComponents.length !== registry.length) {
	violations.push({
		file: COMPONENT_CATALOG_PATH,
		line: 1,
		rule: 'component-catalog-stale',
		message:
			'The generated component catalog is stale. Re-run npm run generate:design-system after changing the design-system registry.',
	});
}

for (const generatedComponent of generatedComponents) {
	const registryEntry = registryByPath.get(generatedComponent.filePath);

	if (!registryEntry) {
		violations.push({
			file: COMPONENT_CATALOG_PATH,
			line: 1,
			rule: 'component-catalog-registry-drift',
			message: `Generated component "${generatedComponent.filePath}" is not present in src/design-system/componentRegistry.json.`,
		});
		continue;
	}

	if (registryEntry.kind !== generatedComponent.kind) {
		violations.push({
			file: COMPONENT_CATALOG_PATH,
			line: 1,
			rule: 'component-catalog-kind-drift',
			message: `Generated component "${generatedComponent.filePath}" has kind "${generatedComponent.kind}" but the registry expects "${registryEntry.kind}".`,
		});
	}

	if (!generatedComponent.hasTests) {
		violations.push({
			file: COMPONENT_CATALOG_PATH,
			line: 1,
			rule: 'component-catalog-test-drift',
			message: `Generated component "${generatedComponent.name}" is missing tests. Re-run generation after adding coverage or remove it from the supported registry.`,
		});
	}
}

for (const componentName of livePreviewComponents) {
	const generatedComponent = generatedComponents.find((component) => component.name === componentName);

	if (!generatedComponent) {
		violations.push({
			file: 'src/design-system/catalog.ts',
			line: 1,
			rule: 'live-demo-component-catalog',
			message: `Live preview component "${componentName}" is missing from the supported component catalog.`,
		});
		continue;
	}

	if (!generatedComponent.hasTests) {
		violations.push({
			file: 'src/design-system/catalog.ts',
			line: 1,
			rule: 'live-demo-component-tests',
			message: `Live preview component "${componentName}" must have automated test coverage.`,
		});
	}
}

const uiCatalogText = fs.readFileSync(
	path.join(root, 'src/design-system/generated/uiLibraryCatalog.ts'),
	'utf8',
);
const checklistTitleSet = new Set(
	[
		...uiCatalogText.matchAll(
			/[\"']?title[\"']?\s*:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)")/g,
		),
	].map((match) =>
		(match[1] ?? match[2] ?? '').replaceAll("\\'", "'").replaceAll('\\"', '"'),
	),
);

for (const previewLabel of previewLabels) {
	if (!checklistTitleSet.has(previewLabel)) {
		violations.push({
			file: 'src/design-system/catalog.ts',
			line: 1,
			rule: 'preview-label-checklist-link',
			message: `Preview label "${previewLabel}" must map to a generated checklist title.`,
		});
	}
}

if (violations.length > 0) {
	console.error('Design-system guardrail violations found:\n');
	for (const violation of violations) {
		console.error(
			`  ${violation.file}:${violation.line}  ${violation.rule}  ${violation.message}`,
		);
	}
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			checkedFiles: files.length,
			registeredComponents: registry.length,
			status: 'ok',
		},
		null,
		2,
	),
);
