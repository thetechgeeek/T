#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const TARGET_DIRS = ['src/design-system', 'app/(app)/design-system'];
const SKIP_SEGMENTS = new Set(['generated', '__tests__']);
const SKIP_FILES = new Set(['src/design-system/copy.ts']);
const RUNTIME_SIGNAL_SOURCE = 'src/design-system/runtimeSignals.ts';
const REQUIRED_TEST_FILES = [
	'src/design-system/__tests__/qualityMatrix.test.tsx',
	'src/design-system/__tests__/themeMatrix.test.tsx',
];

const RULES = [
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

function parseConstStringArray(text, constName) {
	const match = text.match(new RegExp(`const ${constName} = \\[(.*?)\\] as const;`, 's'));
	if (!match) {
		return [];
	}

	return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1]);
}

function parseComponentHasTestsMap(text) {
	const componentHasTests = new Map();

	for (const match of text.matchAll(
		/[\"']?name[\"']?\s*:\s*['"]([^'"]+)['"][\s\S]*?[\"']?hasTests[\"']?\s*:\s*(true|false)/g,
	)) {
		componentHasTests.set(match[1], match[2] === 'true');
	}

	return componentHasTests;
}

function normalize(relPath) {
	return relPath.split(path.sep).join('/');
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

const files = TARGET_DIRS.flatMap((dir) => walk(path.join(root, dir), []));
const violations = [];

for (const relPath of files) {
	const text = fs.readFileSync(path.join(root, relPath), 'utf8');

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

	for (const rule of RULES) {
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
				'The design-system folder must keep both qualityMatrix and themeMatrix tests as hard guardrails.',
		});
	}
}

const catalogText = fs.readFileSync(path.join(root, 'src/design-system/catalog.ts'), 'utf8');
const componentCatalogText = fs.readFileSync(
	path.join(root, 'src/design-system/generated/componentCatalog.ts'),
	'utf8',
);
const previewLabels = parseConstStringArray(catalogText, 'DESIGN_LIBRARY_PREVIEW_LABELS');
const livePreviewComponents = parseConstStringArray(catalogText, 'LIVE_PREVIEW_COMPONENTS');
const componentHasTests = parseComponentHasTestsMap(componentCatalogText);

for (const componentName of livePreviewComponents) {
	const hasTests = componentHasTests.get(componentName);

	if (hasTests == null) {
		violations.push({
			file: 'src/design-system/catalog.ts',
			line: 1,
			rule: 'live-demo-component-catalog',
			message: `Live preview component "${componentName}" is missing from the generated component catalog.`,
		});
		continue;
	}

	if (!hasTests) {
		violations.push({
			file: 'src/design-system/catalog.ts',
			line: 1,
			rule: 'live-demo-component-tests',
			message: `Live preview component "${componentName}" must have a colocated test before it can stay in the internal dashboard.`,
		});
	}
}

const uiCatalogText = fs.readFileSync(
	path.join(root, 'src/design-system/generated/uiLibraryCatalog.ts'),
	'utf8',
);
const checklistTitleSet = new Set(
	[...uiCatalogText.matchAll(/[\"']?title[\"']?\s*:\s*['"]([^'"]+)['"]/g)].map(
		(match) => match[1],
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
			status: 'ok',
		},
		null,
		2,
	),
);
