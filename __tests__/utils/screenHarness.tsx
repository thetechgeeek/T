import React from 'react';
import { act, type RenderOptions } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { renderWithTheme } from './renderWithTheme';
import { setMockSearchParams, resetMockSearchParams } from './mockSearchParams';
import { resetAllStores } from './testUtils';

type RouterMock = {
	push: jest.Mock;
	replace: jest.Mock;
	back: jest.Mock;
	setParams: jest.Mock;
};

interface RenderScreenOptions {
	router?: Partial<RouterMock>;
	searchParams?: Record<string, string>;
	renderOptions?: Omit<RenderOptions, 'wrapper'>;
}

export function createRouterMock(overrides?: Partial<RouterMock>): RouterMock {
	return {
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
		setParams: jest.fn(),
		...overrides,
	};
}

export async function flushMicrotasks(): Promise<void> {
	await act(async () => {
		await Promise.resolve();
	});
}

export async function waitForSettledUpdates(): Promise<void> {
	await flushMicrotasks();
	await flushMicrotasks();
}

export async function advanceDebounce(ms = 400): Promise<void> {
	act(() => {
		jest.advanceTimersByTime(ms);
	});
	await waitForSettledUpdates();
}

export async function renderScreen(ui: React.ReactElement, options?: RenderScreenOptions) {
	const router = createRouterMock(options?.router);
	(useRouter as jest.Mock).mockReturnValue(router);

	if (options?.searchParams) {
		setMockSearchParams(options.searchParams);
	} else {
		resetMockSearchParams();
	}

	await act(async () => {
		await resetAllStores();
	});

	const rendered = renderWithTheme(ui, options?.renderOptions);
	await waitForSettledUpdates();

	return {
		...rendered,
		router,
	};
}
