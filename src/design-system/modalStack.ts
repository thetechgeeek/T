const DEFAULT_MAX_MODAL_STACK_DEPTH = 2;

let modalStack: string[] = [];
let modalIdSequence = 0;
const listeners = new Set<() => void>();

function notifyListeners() {
	for (const listener of listeners) {
		listener();
	}
}

export function createModalStackId(prefix = 'modal') {
	modalIdSequence += 1;
	return `${prefix}-${modalIdSequence}`;
}

export function claimModalStackSlot(
	id: string,
	maxDepth = DEFAULT_MAX_MODAL_STACK_DEPTH,
): { accepted: boolean; depth: number } {
	const existingDepth = modalStack.indexOf(id);
	if (existingDepth >= 0) {
		return {
			accepted: existingDepth + 1 <= maxDepth,
			depth: existingDepth + 1,
		};
	}

	const nextDepth = modalStack.length + 1;
	if (nextDepth > maxDepth) {
		return {
			accepted: false,
			depth: nextDepth,
		};
	}

	modalStack = [...modalStack, id];
	notifyListeners();
	return {
		accepted: true,
		depth: nextDepth,
	};
}

export function releaseModalStackSlot(id: string) {
	const nextStack = modalStack.filter((entry) => entry !== id);
	if (nextStack.length === modalStack.length) {
		return;
	}

	modalStack = nextStack;
	notifyListeners();
}

export function subscribeModalStack(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function getModalStackSnapshot() {
	return modalStack;
}

export function resetModalStackForTests() {
	modalStack = [];
	modalIdSequence = 0;
	notifyListeners();
}
