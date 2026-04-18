type NativeMockRegistry = {
	textInputs: Map<
		string,
		{
			focus: jest.Mock;
			blur: jest.Mock;
			clear: jest.Mock;
			setNativeProps: jest.Mock;
		}
	>;
	scrollViews: Map<
		string,
		{
			scrollTo: jest.Mock;
		}
	>;
};

function getRegistry() {
	return (
		global as typeof globalThis & {
			__RN_TEST_REGISTRY__?: NativeMockRegistry;
		}
	).__RN_TEST_REGISTRY__;
}

export function getNativeTextInputMocks(testID: string) {
	return getRegistry()?.textInputs.get(testID);
}

export function getNativeScrollViewMocks(testID: string) {
	return getRegistry()?.scrollViews.get(testID);
}
