const {
	ScriptConfigError,
	loadEnvFile,
	resolveE2EExpoEnv,
	resolveIntegrationJestEnv,
	resolveScriptEnv,
} = require('../../scripts/lib/script-config.cjs');

import fs from 'fs';
import os from 'os';
import path from 'path';

function writeEnv(contents: string) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'script-config-'));
	const filePath = path.join(dir, '.env.test');
	fs.writeFileSync(filePath, contents);
	return { dir, filePath };
}

describe('script-config', () => {
	const tempDirs: string[] = [];

	afterEach(() => {
		while (tempDirs.length > 0) {
			fs.rmSync(tempDirs.pop() as string, { recursive: true, force: true });
		}
	});

	it('loads dotenv-style files without mutating process.env', () => {
		const { dir, filePath } = writeEnv('SUPABASE_TEST_URL=https://example.supabase.co\n');
		tempDirs.push(dir);

		expect(loadEnvFile(filePath)).toEqual({
			SUPABASE_TEST_URL: 'https://example.supabase.co',
		});
		expect(process.env.SUPABASE_TEST_URL).toBeUndefined();
	});

	it('rejects unknown config modes', () => {
		expect(() => resolveScriptEnv({ mode: 'banana', env: {}, envFilePath: undefined })).toThrow(
			ScriptConfigError,
		);
	});

	it('rejects mixed config modes at command entry points', () => {
		expect(() =>
			resolveScriptEnv({
				mode: 'e2e',
				env: {
					EXPO_PUBLIC_APP_ENV: 'dev',
				},
			}),
		).toThrow(ScriptConfigError);
	});

	it('maps SUPABASE_TEST_* to EXPO_PUBLIC_* only for e2e launch env', () => {
		const env = resolveE2EExpoEnv({
			env: {
				SUPABASE_TEST_URL: 'https://test-project.supabase.co',
				SUPABASE_TEST_ANON_KEY: 'test-anon',
			},
		});

		expect(env.EXPO_PUBLIC_APP_ENV).toBe('e2e');
		expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test-project.supabase.co');
		expect(env.EXPO_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon');
	});

	it('fails clearly when e2e bundle config is missing', () => {
		expect(() => resolveE2EExpoEnv({ env: {} })).toThrow(ScriptConfigError);
	});

	it('rejects conflicting e2e public and test Supabase values', () => {
		expect(() =>
			resolveE2EExpoEnv({
				env: {
					EXPO_PUBLIC_SUPABASE_URL: 'https://prod.supabase.co',
					EXPO_PUBLIC_SUPABASE_ANON_KEY: 'prod-anon',
					SUPABASE_TEST_URL: 'https://test.supabase.co',
					SUPABASE_TEST_ANON_KEY: 'test-anon',
				},
			}),
		).toThrow(ScriptConfigError);
	});

	it('builds integration Jest env before tests import app runtime modules', () => {
		const env = resolveIntegrationJestEnv({
			env: {
				SUPABASE_TEST_URL: 'https://test-project.supabase.co',
				SUPABASE_TEST_ANON_KEY: 'test-anon',
			},
		});

		expect(env.EXPO_PUBLIC_APP_ENV).toBe('integration');
		expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test-project.supabase.co');
		expect(env.EXPO_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon');
	});

	it('fails clearly when integration credentials are missing', () => {
		expect(() => resolveIntegrationJestEnv({ env: {} })).toThrow(ScriptConfigError);
	});
});
