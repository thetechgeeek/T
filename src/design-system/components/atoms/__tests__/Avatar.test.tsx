import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { buildTheme } from '@/src/theme/colors';
import { Avatar } from '../Avatar';

const lightTheme = buildTheme(false);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

describe('Avatar', () => {
	it('renders initials fallback with a stable accessible label', () => {
		const { getByLabelText, getByText } = renderWithTheme(<Avatar name="Asha Patel" />);

		expect(getByLabelText('Asha Patel avatar')).toBeTruthy();
		expect(getByText('AP')).toBeTruthy();
	});

	it('falls back to initials when the remote image errors', () => {
		const { UNSAFE_getByType, getByText } = renderWithTheme(
			<Avatar name="Sam Rivera" source="https://example.com/avatar.png" />,
		);

		fireEvent(UNSAFE_getByType('Image' as any), 'error');

		expect(getByText('SR')).toBeTruthy();
	});

	it('uses expo-image caching and high-priority loading for remote avatars', () => {
		const { UNSAFE_getByType } = renderWithTheme(
			<Avatar name="Sam Rivera" source="https://example.com/avatar.png" />,
		);

		const image = UNSAFE_getByType('Image' as any);

		expect(image.props.cachePolicy).toBe('memory-disk');
		expect(image.props.priority).toBe('high');
		expect(image.props.recyclingKey).toBe('https://example.com/avatar.png');
	});

	it('supports tokenized sizes and renders a status indicator', () => {
		const { getByLabelText, toJSON } = renderWithTheme(
			<>
				<Avatar name="Nia Cole" size="sm" />
				<Avatar name="Marcus Lane" size="xl" status="online" />
			</>,
		);

		const smallStyle = flattenStyle(getByLabelText('Nia Cole avatar').props.style) as {
			width: number;
		};
		const largeStyle = flattenStyle(getByLabelText('Marcus Lane avatar').props.style) as {
			width: number;
		};

		expect(smallStyle.width).toBeLessThan(largeStyle.width);
		expect(JSON.stringify(toJSON())).toContain(lightTheme.colors.success);
	});
});
