import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ShellOverlayProvider, useShellOverlay } from '../ShellOverlay';

function OverlayHarness() {
	const { present, dismiss } = useShellOverlay();
	const [overlayId, setOverlayId] = React.useState<string | null>(null);

	return (
		<>
			<Pressable
				onPress={() => {
					const id = present(<Text>Shell overlay content</Text>);
					setOverlayId(id);
				}}
			>
				<Text>Open overlay</Text>
			</Pressable>
			<Pressable
				onPress={() => {
					if (overlayId) {
						dismiss(overlayId);
					}
				}}
			>
				<Text>Close overlay</Text>
			</Pressable>
		</>
	);
}

describe('ShellOverlayProvider', () => {
	it('presents and dismisses overlay content from shell consumers', () => {
		const { getByText, queryByText } = render(
			<ShellOverlayProvider>
				<OverlayHarness />
			</ShellOverlayProvider>,
		);

		fireEvent.press(getByText('Open overlay'));
		expect(getByText('Shell overlay content')).toBeTruthy();

		fireEvent.press(getByText('Close overlay'));
		expect(queryByText('Shell overlay content')).toBeNull();
	});
});
