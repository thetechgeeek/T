import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { HTTP_NO_CONTENT, MS_NETWORK_TIMEOUT } from '@/theme/uiMetrics';

const CHECK_URL = 'https://www.google.com/generate_204';
const CHECK_INTERVAL_MS = 10_000;

async function checkReachability(): Promise<boolean> {
	try {
		const ctrl = new AbortController();
		const timeout = setTimeout(() => ctrl.abort(), MS_NETWORK_TIMEOUT);
		const res = await fetch(CHECK_URL, { method: 'HEAD', signal: ctrl.signal });
		clearTimeout(timeout);
		return res.status === HTTP_NO_CONTENT || res.ok;
	} catch {
		return false;
	}
}

export function useNetworkStatus() {
	const [isConnected, setIsConnected] = useState<boolean>(true);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const runCheck = () => {
		checkReachability().then(setIsConnected);
	};

	useEffect(() => {
		runCheck();
		timerRef.current = setInterval(runCheck, CHECK_INTERVAL_MS);

		const handleAppState = (state: AppStateStatus) => {
			if (state === 'active') runCheck();
		};
		const sub = AppState.addEventListener('change', handleAppState);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
			sub.remove();
		};
	}, []);

	return { isConnected };
}
