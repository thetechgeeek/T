#!/usr/bin/env node
/**
 * Fails when app/ has both `segment.tsx` and `segment/` — Expo Router registers
 * duplicate screen names and React Navigation throws at runtime.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	createViolation,
	findRepoRoot,
	parseCliArgs,
	printViolationReport,
	walkFiles,
} from './lib/repo-tools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { flags } = parseCliArgs(process.argv.slice(2), {
	boolean: ['json'],
	string: ['root'],
});
const root = flags.root ? path.resolve(String(flags.root)) : findRepoRoot(path.join(__dirname, '..'));
const appDir = path.join(root, 'app');

const collisions = walkFiles(appDir, { extensions: ['.tsx'] }).flatMap((relPath) => {
	const fileName = path.basename(relPath);
	if (fileName === '_layout.tsx') return [];

	const base = path.basename(fileName, '.tsx');
	if (base === 'index' || /^\[/.test(base)) return [];

	const siblingDir = path.join(appDir, path.dirname(relPath), base);
	try {
		if (!fs.statSync(siblingDir).isDirectory()) return [];
	} catch {
		return [];
	}

	const siblingRel = path.relative(root, siblingDir).split(path.sep).join('/');
	return createViolation({
		file: path.join('app', relPath).split(path.sep).join('/'),
		rule: 'expo-route-collision',
		message: `Route file collides with same-named folder: ${siblingRel}/`,
	});
});

printViolationReport('check-expo-route-collisions', collisions, {
	json: Boolean(flags.json),
	stream: collisions.length > 0 ? process.stderr : process.stdout,
});

if (collisions.length > 0) {
	console.error(
		'\nFix: move the screen into folder/index.tsx and delete the sibling *.tsx, or rename one segment.',
	);
	process.exit(1);
}
