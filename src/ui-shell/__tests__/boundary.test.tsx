import fs from 'fs';
import path from 'path';

const DISALLOWED_PRODUCT_IMPORT_RE =
	/from\s*['"](?:@\/app\/|@\/src\/stores\/|@\/src\/services\/|@\/src\/features\/|@\/src\/hooks\/useLocale|@\/src\/hooks\/useNetworkStatus)/;

function collectShellSourceFiles(rootDir: string, currentDir = rootDir, out: string[] = []) {
	for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const absolutePath = path.join(currentDir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === '__tests__') {
				continue;
			}

			collectShellSourceFiles(rootDir, absolutePath, out);
			continue;
		}

		if (!/\.(ts|tsx)$/.test(entry.name)) {
			continue;
		}

		out.push(absolutePath);
	}

	return out;
}

describe('ui-shell boundary', () => {
	it('keeps the shell extractable and product-agnostic', () => {
		const root = process.cwd();
		const shellRoot = path.join(root, 'src/ui-shell');
		const sourceFiles = collectShellSourceFiles(shellRoot);

		expect(fs.existsSync(path.join(shellRoot, 'index.ts'))).toBe(true);
		expect(fs.existsSync(path.join(shellRoot, 'package.json'))).toBe(true);

		for (const absolutePath of sourceFiles) {
			const text = fs.readFileSync(absolutePath, 'utf8');
			expect(text).not.toMatch(DISALLOWED_PRODUCT_IMPORT_RE);
		}
	});
});
