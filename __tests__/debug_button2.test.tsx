import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/src/components/atoms/Button';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

test('debug disabled - print full RNTL instance tree', () => {
	const onPressMock = jest.fn();
	const { getByText, UNSAFE_root } = render(
		<ThemeProvider>
			<Button title="Disabled" disabled onPress={onPressMock} />
		</ThemeProvider>,
	);

	// Print RNTL instance tree to understand traversal
	function printTree(el: unknown, depth = 0): void {
		const node = el as any;
		const onPress = node.props?.onPress;
		const type =
			typeof node.type === 'string'
				? node.type
				: node.type?.name || node.type?.displayName || 'Unknown';
		const hasOnPress = onPress !== undefined;
		console.log(
			`${'  '.repeat(depth)}${type}${hasOnPress ? ` [onPress=${typeof onPress}]` : ''}`,
		);
		node.children?.forEach((c: unknown) => printTree(c, depth + 1));
	}
	printTree(UNSAFE_root);

	fireEvent.press(getByText('Disabled'));
	console.log('onPressMock called:', onPressMock.mock.calls.length);
});
