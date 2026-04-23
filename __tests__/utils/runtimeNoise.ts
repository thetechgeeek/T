type ConsoleMethod = 'error' | 'warn';
type RuntimeErrorType = 'unhandledRejection' | 'uncaughtException';
type ConsoleMatcher = string | RegExp | ((message: string, args: readonly unknown[]) => boolean);

interface ExpectedConsoleCall {
	id: number;
	method: ConsoleMethod;
	matcher: ConsoleMatcher;
	remaining: number;
}

interface UnexpectedConsoleCall {
	method: ConsoleMethod;
	args: readonly unknown[];
	message: string;
}

interface RuntimeErrorRecord {
	type: RuntimeErrorType;
	value: unknown;
}

let expectationId = 0;

const expectedConsoleCalls: ExpectedConsoleCall[] = [];
const unexpectedConsoleCalls: UnexpectedConsoleCall[] = [];
const runtimeErrors: RuntimeErrorRecord[] = [];

function stringifyArg(arg: unknown): string {
	if (arg instanceof Error) {
		return arg.stack ?? `${arg.name}: ${arg.message}`;
	}

	if (typeof arg === 'string') {
		return arg;
	}

	try {
		return JSON.stringify(arg);
	} catch {
		return String(arg);
	}
}

export function formatConsoleMessage(args: readonly unknown[]): string {
	return args.map(stringifyArg).join(' ');
}

function matchesConsoleCall(
	matcher: ConsoleMatcher,
	message: string,
	args: readonly unknown[],
): boolean {
	if (typeof matcher === 'string') {
		return message.includes(matcher);
	}

	if (matcher instanceof RegExp) {
		return matcher.test(message);
	}

	return matcher(message, args);
}

function registerExpectedConsoleCall(
	method: ConsoleMethod,
	matcher: ConsoleMatcher,
	times = 1,
): void {
	expectedConsoleCalls.push({
		id: (expectationId += 1),
		method,
		matcher,
		remaining: Math.max(1, times),
	});
}

export function allowExpectedConsoleError(matcher: ConsoleMatcher, times = 1): void {
	registerExpectedConsoleCall('error', matcher, times);
}

export function allowExpectedConsoleWarn(matcher: ConsoleMatcher, times = 1): void {
	registerExpectedConsoleCall('warn', matcher, times);
}

export function recordConsoleCall(method: ConsoleMethod, args: readonly unknown[]): void {
	const message = formatConsoleMessage(args);
	const match = expectedConsoleCalls.find(
		(expectation) =>
			expectation.method === method &&
			expectation.remaining > 0 &&
			matchesConsoleCall(expectation.matcher, message, args),
	);

	if (match) {
		match.remaining -= 1;
		return;
	}

	unexpectedConsoleCalls.push({ method, args, message });
}

export function recordRuntimeError(type: RuntimeErrorType, value: unknown): void {
	runtimeErrors.push({ type, value });
}

function describeRuntimeValue(value: unknown): string {
	return stringifyArg(value);
}

export function resetRuntimeNoiseState(): void {
	expectedConsoleCalls.length = 0;
	unexpectedConsoleCalls.length = 0;
	runtimeErrors.length = 0;
}

export function assertNoUnexpectedRuntimeNoise(): void {
	if (unexpectedConsoleCalls.length === 0 && runtimeErrors.length === 0) {
		return;
	}

	const lines: string[] = [];

	if (unexpectedConsoleCalls.length > 0) {
		lines.push('Unexpected console output during test:');
		for (const call of unexpectedConsoleCalls) {
			lines.push(`- console.${call.method}: ${call.message}`);
		}
	}

	if (runtimeErrors.length > 0) {
		lines.push('Unhandled runtime failures during test:');
		for (const error of runtimeErrors) {
			lines.push(`- ${error.type}: ${describeRuntimeValue(error.value)}`);
		}
	}

	throw new Error(lines.join('\n'));
}
