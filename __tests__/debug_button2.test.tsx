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
	function printTree(el: any, depth = 0): void {
		const onPress = el.props?.onPress;
		const type =
			typeof el.type === 'string'
				? el.type
				: el.type?.name || el.type?.displayName || 'Unknown';
		const hasOnPress = onPress !== undefined;
		console.log(
			`${'  '.repeat(depth)}${type}${hasOnPress ? ` [onPress=${typeof onPress}]` : ''}`,
		);
		el.children?.forEach((c: any) => printTree(c, depth + 1));
	}
	printTree(UNSAFE_root);

	fireEvent.press(getByText('Disabled'));
	console.log('onPressMock called:', onPressMock.mock.calls.length);
});
