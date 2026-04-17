#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

function parseArgs(argv) {
	const options = {
		platform: 'ios',
		threshold: 0.1,
		maxDiffRatio: 0.001,
		updateBaseline: false,
		root: process.cwd(),
	};

	for (let index = 0; index < argv.length; index += 1) {
		const value = argv[index];
		if (value === '--platform') {
			options.platform = argv[index + 1];
			index += 1;
		} else if (value === '--actual-dir') {
			options.actualDir = argv[index + 1];
			index += 1;
		} else if (value === '--baseline-dir') {
			options.baselineDir = argv[index + 1];
			index += 1;
		} else if (value === '--diff-dir') {
			options.diffDir = argv[index + 1];
			index += 1;
		} else if (value === '--threshold') {
			options.threshold = Number(argv[index + 1]);
			index += 1;
		} else if (value === '--max-diff-ratio') {
			options.maxDiffRatio = Number(argv[index + 1]);
			index += 1;
		} else if (value === '--update-baseline') {
			options.updateBaseline = true;
		}
	}

	if (!options.actualDir) {
		throw new Error('Missing required --actual-dir');
	}
	if (!options.baselineDir) {
		throw new Error('Missing required --baseline-dir');
	}

	options.actualDir = path.resolve(options.root, options.actualDir);
	options.baselineDir = path.resolve(options.root, options.baselineDir);
	options.diffDir = path.resolve(
		options.root,
		options.diffDir ?? path.join('artifacts', 'design-system-proof', options.platform, 'diff'),
	);

	return options;
}

function walkPngs(dirPath, rootDir = dirPath, out = []) {
	if (!fs.existsSync(dirPath)) {
		return out;
	}

	for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
		const absolutePath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			walkPngs(absolutePath, rootDir, out);
			continue;
		}
		if (!entry.name.endsWith('.png')) {
			continue;
		}
		out.push({
			name: path.relative(rootDir, absolutePath),
			path: absolutePath,
		});
	}

	return out;
}

function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(sourcePath, targetPath) {
	ensureDir(path.dirname(targetPath));
	fs.copyFileSync(sourcePath, targetPath);
}

function loadPng(filePath) {
	return PNG.sync.read(fs.readFileSync(filePath));
}

function writePng(filePath, png) {
	ensureDir(path.dirname(filePath));
	fs.writeFileSync(filePath, PNG.sync.write(png));
}

function clearDirectory(dirPath) {
	fs.rmSync(dirPath, { recursive: true, force: true });
	ensureDir(dirPath);
}

function formatPercent(value) {
	return `${(value * 100).toFixed(2)}%`;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	const actualFiles = walkPngs(options.actualDir);

	if (actualFiles.length === 0) {
		throw new Error(`No PNG screenshots found in ${options.actualDir}`);
	}

	if (options.updateBaseline) {
		clearDirectory(options.baselineDir);
		for (const file of actualFiles) {
			copyFile(file.path, path.join(options.baselineDir, file.name));
		}
		console.log(
			`Updated ${actualFiles.length} ${options.platform} design-system baselines in ${options.baselineDir}`,
		);
		return;
	}

	clearDirectory(options.diffDir);

	const failures = [];

	for (const actualFile of actualFiles) {
		const baselinePath = path.join(options.baselineDir, actualFile.name);
		if (!fs.existsSync(baselinePath)) {
			failures.push(`${actualFile.name}: missing baseline`);
			continue;
		}

		const actualPng = loadPng(actualFile.path);
		const baselinePng = loadPng(baselinePath);

		if (
			actualPng.width !== baselinePng.width ||
			actualPng.height !== baselinePng.height
		) {
			failures.push(
				`${actualFile.name}: dimension mismatch actual=${actualPng.width}x${actualPng.height} baseline=${baselinePng.width}x${baselinePng.height}`,
			);
			continue;
		}

		const diffPng = new PNG({ width: actualPng.width, height: actualPng.height });
		const diffPixels = pixelmatch(
			baselinePng.data,
			actualPng.data,
			diffPng.data,
			actualPng.width,
			actualPng.height,
			{ threshold: options.threshold },
		);

		if (diffPixels > 0) {
			const totalPixels = actualPng.width * actualPng.height;
			const ratio = diffPixels / totalPixels;
			if (ratio > options.maxDiffRatio) {
				writePng(path.join(options.diffDir, actualFile.name), diffPng);
				failures.push(
					`${actualFile.name}: ${diffPixels} pixels changed (${formatPercent(ratio)})`,
				);
			}
		}
	}

	if (failures.length > 0) {
		throw new Error(
			[
				`${options.platform} design-system visual regression failed:`,
				...failures.map((failure) => `- ${failure}`),
				`Diff images written to ${options.diffDir}`,
			].join('\n'),
		);
	}

	console.log(
		`Visual regression passed for ${actualFiles.length} ${options.platform} design-system screenshots.`,
	);
}

main();
