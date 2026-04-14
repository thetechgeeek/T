#!/usr/bin/env node
/**
 * UI token enforcement for runtime UI code.
 *
 * Checks:
 * - `rgba(` outside `src/theme/`
 * - color string concatenation hacks like `color + '22'`
 * - raw numeric `gap` / `padding*` / `margin*` / `fontSize` / `borderRadius`
 * - raw numeric `zIndex`
 * - vertical `ScrollView` usage in `app/` outside the documented allowlist
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.join(__dirname, '..');
const UI_SOURCE_DIRS = ['app', 'src/components', 'src/features'];
const ALLOWLIST_PATH = 'docs/COLLOQUIAL_UI_ALLOWLIST.md';
const DIRECTORY_SKIP = new Set(['node_modules', 'dist', 'coverage', '.expo']);

const RGBA_RE = /rgba\(/g;
const COLOR_CONCAT_RE = /\+\s*(['"])[0-9A-Fa-f]{2}\1/g;
const RAW_UI_NUMBER_RE =
	/\b(gap|padding(?:Top|Bottom|Left|Right|Horizontal|Vertical)?|margin(?:Top|Bottom|Left|Right|Horizontal|Vertical)?|fontSize|borderRadius)\s*:\s*(-?\d+(?:\.\d+)?)\b/g;
const RAW_Z_INDEX_RE = /\bzIndex\s*:\s*(-?\d+(?:\.\d+)?)\b/g;
const VERTICAL_SCROLLVIEW_RE = /<ScrollView(?![^>]*\bhorizontal\b)[^>]*>/g;

/**
 * @typedef {{ root: string; stagedOnly: boolean }} CliOptions
 * @typedef {{ rel: string; line: number; column: number; rule: string; detail: string }} Violation
 */

/**
 * @returns {CliOptions}
 */
function parseCliOptions() {
	const args = process.argv.slice(2);
	/** @type {CliOptions} */
	const options = {
		root: process.env.CHECK_UI_TOKENS_ROOT || DEFAULT_ROOT,
		stagedOnly: false,
	};

	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === '--staged') {
			options.stagedOnly = true;
			continue;
		}
		if (arg === '--root') {
			const next = args[i + 1];
			if (!next) {
				throw new Error('Missing value for --root.');
			}
			options.root = path.resolve(next);
			i += 1;
			continue;
		}
		throw new Error(`Unknown argument: ${arg}`);
	}

	return options;
}

/**
 * @param {string} absRoot
 * @returns {Set<string>}
 */
function getStagedPaths(absRoot) {
	try {
		const output = execFileSync(
			'git',
			['-C', absRoot, 'diff', '--cached', '--name-only', '--diff-filter=ACMR'],
			{ encoding: 'utf8' },
		).trim();
		if (!output) {
			return new Set();
		}
		return new Set(output.split('\n').map(normalizePath));
	} catch {
		return new Set();
	}
}

/**
 * @param {string} relPath
 * @returns {string}
 */
function normalizePath(relPath) {
	return relPath.split(path.sep).join('/');
}

/**
 * @param {string} relPath
 * @returns {boolean}
 */
function isUiSourceFile(relPath) {
	return (
		/\.(ts|tsx)$/.test(relPath) &&
		!/\.(test|spec)\.(ts|tsx)$/.test(relPath) &&
		!relPath.includes('/__tests__/') &&
		!relPath.startsWith('src/mocks/') &&
		!relPath.startsWith('src/__mocks__/') &&
		UI_SOURCE_DIRS.some((dir) => relPath === dir || relPath.startsWith(`${dir}/`))
	);
}

/**
 * @param {string} absRoot
 * @param {string} relPath
 * @param {Set<string> | null} stagedPaths
 * @returns {string}
 */
function readText(absRoot, relPath, stagedPaths) {
	if (stagedPaths?.has(relPath)) {
		try {
			return execFileSync('git', ['-C', absRoot, 'show', `:${relPath}`], {
				encoding: 'utf8',
			});
		} catch {
			// Fall back to working tree if the file is newly created but not yet in the index.
		}
	}

	return fs.readFileSync(path.join(absRoot, relPath), 'utf8');
}

/**
 * @param {string} dirPath
 * @param {string} absRoot
 * @param {string[]} out
 * @returns {string[]}
 */
function walkUiFiles(dirPath, absRoot, out) {
	if (!fs.existsSync(dirPath)) {
		return out;
	}

	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name.startsWith('.')) {
			continue;
		}
		if (DIRECTORY_SKIP.has(entry.name)) {
			continue;
		}

		const abs = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			walkUiFiles(abs, absRoot, out);
			continue;
		}

		const rel = normalizePath(path.relative(absRoot, abs));
		if (isUiSourceFile(rel)) {
			out.push(rel);
		}
	}

	return out;
}

/**
 * @param {string} text
 * @returns {{ line: number; column: number }}
 */
function indexToLocation(text, index) {
	const before = text.slice(0, index);
	const line = before.split('\n').length;
	const lastNewline = before.lastIndexOf('\n');
	return {
		line,
		column: index - lastNewline,
	};
}

/**
 * @param {Violation[]} violations
 * @param {string} rel
 * @param {string} text
 * @param {RegExp} pattern
 * @param {(match: RegExpExecArray) => string | null} buildDetail
 * @param {string} rule
 */
function collectMatches(violations, rel, text, pattern, buildDetail, rule) {
	pattern.lastIndex = 0;
	for (const match of text.matchAll(pattern)) {
		if (match.index == null) {
			continue;
		}

		const detail = buildDetail(match);
		if (!detail) {
			continue;
		}

		const loc = indexToLocation(text, match.index);
		violations.push({
			rel,
			line: loc.line,
			column: loc.column,
			rule,
			detail,
		});
	}
}

/**
 * @param {string} absRoot
 * @param {Set<string> | null} stagedPaths
 * @returns {Set<string>}
 */
function parseAllowlist(absRoot, stagedPaths) {
	const rel = ALLOWLIST_PATH;
	const abs = path.join(absRoot, rel);
	if (!fs.existsSync(abs) && !stagedPaths?.has(rel)) {
		return new Set();
	}

	const text = readText(absRoot, rel, stagedPaths);
	const currentSection = text.split('## Current exceptions')[1] ?? '';
	return new Set(
		[...currentSection.matchAll(/`(app\/[^`]+?\.tsx)(?::\d+)?`/g)].map((match) =>
			normalizePath(match[1]),
		),
	);
}

/**
 * @param {string} absRoot
 * @param {boolean} stagedOnly
 * @returns {string[]}
 */
function collectCandidateFiles(absRoot, stagedOnly) {
	if (stagedOnly) {
		return [...getStagedPaths(absRoot)].filter(isUiSourceFile);
	}

	/** @type {string[]} */
	const files = [];
	for (const dir of UI_SOURCE_DIRS) {
		walkUiFiles(path.join(absRoot, dir), absRoot, files);
	}
	return files.sort();
}

/**
 * @param {Violation[]} violations
 */
function printViolations(violations) {
	console.error('UI token violations found:\n');
	for (const violation of violations) {
		console.error(
			`  ${violation.rel}:${violation.line}:${violation.column}  ${violation.rule}  ${violation.detail}`,
		);
	}
}

function main() {
	const { root, stagedOnly } = parseCliOptions();
	const absRoot = path.resolve(root);
	const stagedPaths = stagedOnly ? getStagedPaths(absRoot) : null;
	const allowlistedVerticalScrollViews = parseAllowlist(absRoot, stagedPaths);
	const candidateFiles = collectCandidateFiles(absRoot, stagedOnly);

	if (stagedOnly && candidateFiles.length === 0) {
		console.log('check-ui-tokens: OK (no relevant staged UI files).');
		return;
	}

	/** @type {Violation[]} */
	const violations = [];

	for (const rel of candidateFiles) {
		const text = readText(absRoot, rel, stagedPaths);

		collectMatches(
			violations,
			rel,
			text,
			RGBA_RE,
			() => '`rgba(` is only allowed inside `src/theme/`.',
			'rgba-string',
		);
		collectMatches(
			violations,
			rel,
			text,
			COLOR_CONCAT_RE,
			() => 'Use `withOpacity()` or a token instead of hex-string concatenation.',
			'color-concat',
		);
		collectMatches(
			violations,
			rel,
			text,
			RAW_UI_NUMBER_RE,
			(match) => {
				const value = Number(match[2]);
				if (value === 0) {
					return null;
				}
				return `\`${match[1]}\` uses raw numeric value \`${match[2]}\`. Use a theme token.`;
			},
			'raw-ui-number',
		);
		collectMatches(
			violations,
			rel,
			text,
			RAW_Z_INDEX_RE,
			(match) =>
				`Raw numeric \`zIndex\` value \`${match[1]}\` is forbidden. Use \`Z_INDEX.*\`.`,
			'raw-zindex',
		);

		if (rel.startsWith('app/') && !allowlistedVerticalScrollViews.has(rel)) {
			collectMatches(
				violations,
				rel,
				text,
				VERTICAL_SCROLLVIEW_RE,
				() =>
					'Vertical `ScrollView` usage in `app/` must be migrated or documented in `docs/COLLOQUIAL_UI_ALLOWLIST.md`.',
				'vertical-scrollview',
			);
		}
	}

	if (violations.length > 0) {
		printViolations(violations);
		process.exit(1);
	}

	console.log(
		`check-ui-tokens: OK (${candidateFiles.length} file${candidateFiles.length === 1 ? '' : 's'} checked).`,
	);
}

main();
