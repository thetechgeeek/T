import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { FileUploadField } from '../FileUploadField';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('FileUploadField', () => {
	it('queues document uploads', async () => {
		jest.useFakeTimers();
		(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
			canceled: false,
			assets: [
				{
					name: 'invoice.pdf',
					uri: 'file://invoice.pdf',
					size: 1000,
					mimeType: 'application/pdf',
				},
			],
		});
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<FileUploadField label="Attachments" onChange={onChange} />,
		);
		fireEvent.press(getByText('Pick file'));
		await waitFor(() => expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled());
		await act(async () => {
			jest.advanceTimersByTime(300);
		});
		expect(onChange).toHaveBeenCalled();
		jest.useRealTimers();
	});

	it('queues image uploads', async () => {
		(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
			canceled: false,
			assets: [
				{
					fileName: 'proof.png',
					uri: 'file://proof.png',
					fileSize: 500,
					mimeType: 'image/png',
				},
			],
		});
		const { getByText } = renderWithTheme(
			<FileUploadField label="Attachments" onChange={jest.fn()} />,
		);
		fireEvent.press(getByText('Pick image'));
		await waitFor(() => expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled());
	});
});
