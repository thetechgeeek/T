#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function parseArgs(argv) {
	const options = {
		platform: 'ios',
		updateBaseline: false,
		skipVisualRegression: false,
		dryRun: false,
		root: process.cwd(),
		deepLink: 'easydesign://design-system',
	};

	for (let index = 0; index < argv.length; index += 1) {
		const value = argv[index];
		if (value === '--platform') {
			options.platform = argv[index + 1];
			index += 1;
		} else if (value === '--udid' || value === '--device') {
			options.device = argv[index + 1];
			index += 1;
		} else if (value === '--update-baseline') {
			options.updateBaseline = true;
		} else if (value === '--skip-visual-regression') {
			options.skipVisualRegression = true;
		} else if (value === '--dry-run') {
			options.dryRun = true;
		} else if (value === '--deep-link') {
			options.deepLink = argv[index + 1];
			index += 1;
		}
	}

	return options;
}

function ensureCleanDir(dirPath) {
	fs.rmSync(dirPath, { recursive: true, force: true });
	fs.mkdirSync(dirPath, { recursive: true });
}

function runCommand(command, args, options = {}) {
	if (options.dryRun) {
		console.log(
			JSON.stringify(
				{
					dryRun: true,
					command,
					args,
					cwd: options.cwd ?? process.cwd(),
				},
				null,
				2,
			),
		);
		return;
	}

	const result = spawnSync(command, args, {
		stdio: 'inherit',
		cwd: options.cwd ?? process.cwd(),
		env: options.env ?? process.env,
	});

	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
	}
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	const artifactRoot = path.join(
		options.root,
		'artifacts',
		'design-system-proof',
		options.platform,
	);
	const screenshotDir = path.join(artifactRoot, 'screenshots');
	const debugDir = path.join(artifactRoot, 'debug');
	const reportPath = path.join(artifactRoot, 'report.junit.xml');
	const baselineDir = path.join(
		options.root,
		'artifacts',
		'design-system-baselines',
		options.platform,
	);

	if (!options.dryRun) {
		ensureCleanDir(screenshotDir);
		ensureCleanDir(debugDir);
		fs.mkdirSync(path.dirname(reportPath), { recursive: true });
	}

	const maestroArgs = [
		'test',
		'.maestro/design_system_workbench.yaml',
		'--format',
		'junit',
		'--output',
		reportPath,
		'--debug-output',
		debugDir,
		'--flatten-debug-output',
		'--test-output-dir',
		screenshotDir,
		'--platform',
		options.platform,
		'--env',
		`DESIGN_SYSTEM_DEEPLINK=${options.deepLink}`,
	];

	if (options.device) {
		maestroArgs.push('--udid', options.device);
	}

	runCommand('maestro', maestroArgs, { cwd: options.root, dryRun: options.dryRun });

	if (options.skipVisualRegression) {
		return;
	}

	const compareArgs = [
		path.join('scripts', 'check-design-system-visual-regression.mjs'),
		'--platform',
		options.platform,
		'--actual-dir',
		screenshotDir,
		'--baseline-dir',
		baselineDir,
	];

	if (options.updateBaseline) {
		compareArgs.push('--update-baseline');
	}

	runCommand('node', compareArgs, { cwd: options.root, dryRun: options.dryRun });
}

main();
