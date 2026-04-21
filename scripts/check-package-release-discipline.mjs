#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_FILES = [
	'docs/UI_PACKAGE_RELEASE_DISCIPLINE.md',
	'src/design-system/CHANGELOG.md',
	'src/design-system/MIGRATIONS.md',
	'src/ui-shell/CHANGELOG.md',
	'src/ui-shell/MIGRATIONS.md',
];
const REQUIRED_RELEASE_DOC_PHRASES = [
	'Semantic Versioning',
	'CHANGELOG.md',
	'MIGRATIONS.md',
	'deprecation',
	'consumer apps',
	'compatibility',
];

function parseCliOptions() {
	const args = process.argv.slice(2);
	const options = {
		root: process.env.CHECK_PACKAGE_RELEASE_DISCIPLINE_ROOT || path.join(__dirname, '..'),
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === '--root') {
			const next = args[index + 1];
			if (!next) {
				throw new Error('Missing value for --root.');
			}
			options.root = path.resolve(next);
			index += 1;
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	return options;
}

const { root } = parseCliOptions();

function readJson(relPath) {
	return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

const violations = [];

for (const relPath of REQUIRED_FILES) {
	if (!fs.existsSync(path.join(root, relPath))) {
		violations.push({
			file: relPath,
			rule: 'required-file',
			message: 'Release discipline artifact is missing.',
		});
	}
}

const releaseDocPath = path.join(root, 'docs/UI_PACKAGE_RELEASE_DISCIPLINE.md');
if (fs.existsSync(releaseDocPath)) {
	const releaseDoc = fs.readFileSync(releaseDocPath, 'utf8');
	for (const phrase of REQUIRED_RELEASE_DOC_PHRASES) {
		if (!releaseDoc.includes(phrase)) {
			violations.push({
				file: 'docs/UI_PACKAGE_RELEASE_DISCIPLINE.md',
				rule: 'release-doc-phrase',
				message: `Release discipline doc must mention "${phrase}".`,
			});
		}
	}
}

for (const relPath of ['src/design-system/package.json', 'src/ui-shell/package.json']) {
	const manifest = readJson(relPath);
	const changelogPath = path.join(root, path.dirname(relPath), 'CHANGELOG.md');
	const migrationsPath = path.join(root, path.dirname(relPath), 'MIGRATIONS.md');
	const readmePath = path.join(root, path.dirname(relPath), 'README.md');

	if (!Array.isArray(manifest.files)) {
		violations.push({
			file: relPath,
			rule: 'package-files',
			message: 'Package manifest must include release docs in files[].',
		});
		continue;
	}

	for (const fileName of ['README.md', 'CHANGELOG.md', 'MIGRATIONS.md']) {
		if (!manifest.files.includes(fileName)) {
			violations.push({
				file: relPath,
				rule: 'package-files-entry',
				message: `${relPath} must include ${fileName} in files[].`,
			});
		}
	}

	const versionHeading = `## ${manifest.version}`;
	if (!fs.readFileSync(changelogPath, 'utf8').includes(versionHeading)) {
		violations.push({
			file: normalize(path.relative(root, changelogPath)),
			rule: 'changelog-version-heading',
			message: `CHANGELOG must contain heading ${versionHeading}.`,
		});
	}

	const migrationsText = fs.readFileSync(migrationsPath, 'utf8');
	if (!/two minor releases/i.test(migrationsText) || !/->/i.test(migrationsText)) {
		violations.push({
			file: normalize(path.relative(root, migrationsPath)),
			rule: 'migration-contract',
			message: 'MIGRATIONS must document import mapping and the default two-minor-release deprecation window.',
		});
	}

	const readme = fs.readFileSync(readmePath, 'utf8');
	if (!readme.includes(manifest.name)) {
		violations.push({
			file: normalize(path.relative(root, readmePath)),
			rule: 'readme-package-name',
			message: 'Package README must mention the published package name.',
		});
	}
}

function normalize(relPath) {
	return relPath.split(path.sep).join('/');
}

if (violations.length > 0) {
	console.error('UI package release discipline violations found:\n');
	for (const violation of violations) {
		console.error(`  ${violation.file}  ${violation.rule}  ${violation.message}`);
	}
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			status: 'ok',
			releaseArtifacts: REQUIRED_FILES.length,
		},
		null,
		2,
	),
);
