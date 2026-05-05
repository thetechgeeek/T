export type ScriptConfigMode = 'dev' | 'test' | 'integration' | 'e2e' | 'ci' | 'production';

export interface ScriptConfigErrorDetails {
	[key: string]: unknown;
}

export class ScriptConfigError extends Error {
	details: ScriptConfigErrorDetails;
}

export interface ResolveScriptEnvOptions {
	mode?: ScriptConfigMode;
	envFilePath?: string;
	env?: Record<string, string | undefined>;
	requiredEnv?: string[];
}

export interface ResolvedScriptEnv {
	mode: ScriptConfigMode;
	env: Record<string, string | undefined>;
}

export const CONFIG_MODES: ScriptConfigMode[];
export function loadEnvFile(
	filePath: string,
	options?: { optional?: boolean },
): Record<string, string>;
export function resolveConfigMode(
	mode?: ScriptConfigMode,
	env?: Record<string, string | undefined>,
): ScriptConfigMode;
export function resolveScriptEnv(options?: ResolveScriptEnvOptions): ResolvedScriptEnv;
export function resolvePublicSupabaseEnv(options?: ResolveScriptEnvOptions): ResolvedScriptEnv;
export function resolveE2EExpoEnv(
	options?: ResolveScriptEnvOptions,
): Record<string, string | undefined>;
export function resolveIntegrationJestEnv(
	options?: ResolveScriptEnvOptions,
): Record<string, string | undefined>;
export function resolveTestSeedEnv(
	options?: ResolveScriptEnvOptions,
): Record<string, string | undefined>;
