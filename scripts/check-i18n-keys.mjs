import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const LOCALE_DIR = path.join(process.cwd(), 'src/i18n/locales');
const BASE_LOCALE = 'en';
const TARGET_LOCALES = ['hi'];

function readLocale(locale) {
	const filePath = path.join(LOCALE_DIR, `${locale}.json`);
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function flattenKeys(value, prefix = '') {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return prefix ? [prefix] : [];
	}

	return Object.entries(value).flatMap(([key, nestedValue]) =>
		flattenKeys(nestedValue, prefix ? `${prefix}.${key}` : key),
	);
}

const baseKeys = new Set(flattenKeys(readLocale(BASE_LOCALE)));
let hasFailure = false;

for (const locale of TARGET_LOCALES) {
	const targetKeys = new Set(flattenKeys(readLocale(locale)));
	const missing = [...baseKeys].filter((key) => !targetKeys.has(key)).sort();
	const extra = [...targetKeys].filter((key) => !baseKeys.has(key)).sort();

	if (missing.length || extra.length) {
		hasFailure = true;
		console.error(`i18n key mismatch for ${locale}:`);
		if (missing.length) {
			console.error(`  Missing keys from ${locale}:`);
			for (const key of missing) console.error(`    - ${key}`);
		}
		if (extra.length) {
			console.error(`  Extra keys in ${locale}:`);
			for (const key of extra) console.error(`    - ${key}`);
		}
	}
}

if (hasFailure) {
	process.exit(1);
}

console.log('i18n locale keys are aligned.');
