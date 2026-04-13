#!/usr/bin/env node
/**
 * Fails when app/ has both `segment.tsx` and `segment/` — Expo Router registers
 * duplicate screen names and React Navigation throws at runtime.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

const SKIP_DIR = new Set(['node_modules', '.expo', 'dist', 'coverage']);

/** @param {string} dir @param {string[]} out */
function walk(dir, out) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const e of entries) {
		if (e.name.startsWith('.')) continue;
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (SKIP_DIR.has(e.name)) continue;
			walk(full, out);
			continue;
		}
		if (!e.name.endsWith('.tsx')) continue;
		if (e.name === '_layout.tsx') continue;
		const base = path.basename(e.name, '.tsx');
		if (base === 'index' || /^\[/.test(base)) continue;
		const siblingDir = path.join(dir, base);
		try {
			if (fs.statSync(siblingDir).isDirectory()) {
				out.push({
					file: path.relative(appDir, full),
					dir: path.relative(appDir, siblingDir) + '/',
				});
			}
		} catch {
			// no sibling dir
		}
	}
}

const collisions = [];
walk(appDir, collisions);

if (collisions.length) {
	console.error('Expo Router: route file collides with same-named folder (duplicate screen name):');
	for (const { file, dir } of collisions) {
		console.error(`  ${file}  ↔  ${dir}`);
	}
	console.error(
		'\nFix: move the screen into folder/index.tsx and delete the sibling *.tsx, or rename one segment.',
	);
	process.exit(1);
}
