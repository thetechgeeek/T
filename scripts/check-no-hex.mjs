#!/usr/bin/env node
/**
 * Fails if any #hex color literal appears outside the token source-of-truth files.
 * Run in CI / validate to block scattered hard-coded colors.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const HEX_RE = /#[0-9A-Fa-f]{3,8}\b/g;
const ALLOWED_FILES = new Set([
	'src/theme/palette.ts',
	'src/theme/designTokens.ts',
	// escapeHtml uses &#039; which matches #039 as a false hex hit
	'src/utils/html.ts',
]);
const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', 'coverage', '.expo', '__tests__']);

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walk(dir, out) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (SKIP_DIR_NAMES.has(e.name)) continue;
			walk(full, out);
		} else if (/\.(ts|tsx)$/.test(e.name)) {
			if (
				e.name.endsWith('.test.ts') ||
				e.name.endsWith('.test.tsx') ||
				e.name.endsWith('.spec.ts') ||
				e.name.endsWith('.spec.tsx')
			) {
				continue;
			}
			out.push(full);
		}
	}
	return out;
}

const dirs = [path.join(root, 'src'), path.join(root, 'app'), path.join(root, 'scripts')].filter(
	(d) => fs.existsSync(d),
);
const files = [];
for (const d of dirs) {
	walk(d, files);
}

const violations = [];
for (const abs of files) {
	const rel = path.relative(root, abs).split(path.sep).join('/');
	if (ALLOWED_FILES.has(rel)) continue;
	const text = fs.readFileSync(abs, 'utf8');
	const matches = text.match(HEX_RE);
	if (matches?.length) {
		violations.push({ rel, count: matches.length });
	}
}

if (violations.length) {
	console.error('Hex color literals found outside src/theme/palette.ts or src/theme/designTokens.ts:\n');
	for (const v of violations) {
		console.error(`  ${v.rel} (${v.count} occurrence(s))`);
	}
	console.error(
		'\nUse theme colors, `palette.*` from @/src/theme/palette, or add tokens to src/theme/designTokens.ts.',
	);
	process.exit(1);
}

console.log('check-no-hex: OK (no stray #hex literals).');
