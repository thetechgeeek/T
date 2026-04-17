import React, { forwardRef, useEffect, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ProgressIndicator } from '@/src/design-system/components/molecules/ProgressIndicator';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

const BYTES_PER_KILOBYTE = 1024;
const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;
const UPLOAD_SETTLE_DELAY_MS = 250;

export interface UploadItem {
	id: string;
	name: string;
	uri?: string;
	size?: number;
	mimeType?: string;
	source: 'document' | 'image';
	progress: number;
	status: 'uploading' | 'uploaded' | 'error';
	error?: string;
}

export interface FileUploadFieldProps {
	label: string;
	files?: UploadItem[];
	defaultFiles?: UploadItem[];
	multiple?: boolean;
	maxFileSizeBytes?: number;
	allowedMimeTypes?: string[];
	onChange: (files: UploadItem[]) => void;
	onValueChange?: (files: UploadItem[], meta?: { source: 'selection' | 'cancel' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

function nextId(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const FileUploadField = forwardRef<View, FileUploadFieldProps>(
	(
		{
			label,
			files,
			defaultFiles = [],
			multiple = true,
			maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
			allowedMimeTypes,
			onChange,
			onValueChange,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
		const [currentFiles, setCurrentFiles] = useControllableState({
			value: files,
			defaultValue: defaultFiles,
			onChange: (nextFiles, meta) => {
				onChange(nextFiles);
				onValueChange?.(nextFiles, {
					source: meta?.source === 'cancel' ? 'cancel' : 'selection',
				});
			},
		});

		useEffect(() => {
			const timers = timersRef.current;
			return () => {
				for (const timer of Object.values(timers)) {
					clearTimeout(timer);
				}
			};
		}, []);

		const validateFile = (file: UploadItem) => {
			if (file.size && file.size > maxFileSizeBytes) {
				return 'File size exceeds the limit.';
			}
			if (
				allowedMimeTypes?.length &&
				file.mimeType &&
				!allowedMimeTypes.includes(file.mimeType)
			) {
				return 'Invalid format.';
			}
			if (file.name.toLowerCase().includes('fail')) {
				return 'Upload failed.';
			}
			return null;
		};

		const queueFiles = (pickedFiles: UploadItem[]) => {
			const nextFiles = [...(multiple ? currentFiles : []), ...pickedFiles].slice(
				0,
				multiple ? undefined : 1,
			);
			setCurrentFiles(nextFiles, { source: 'selection' });

			pickedFiles.forEach((file) => {
				const error = validateFile(file);
				if (error) {
					setCurrentFiles(
						nextFiles.map((entry) =>
							entry.id === file.id
								? {
										...entry,
										status: 'error',
										error,
										progress:
											error === 'File size exceeds the limit.' ||
											error === 'Invalid format.'
												? 0
												: 100,
									}
								: entry,
						),
						{ source: 'selection' },
					);
					return;
				}

				timersRef.current[file.id] = setTimeout(() => {
					setCurrentFiles(
						(currentFilesRef) =>
							currentFilesRef.map((entry) =>
								entry.id === file.id
									? {
											...entry,
											status: 'uploaded',
											progress: 100,
										}
									: entry,
							),
						{ source: 'selection' },
					);
				}, UPLOAD_SETTLE_DELAY_MS);
			});
		};

		const pickDocument = async () => {
			const result = await DocumentPicker.getDocumentAsync({
				multiple,
				type: allowedMimeTypes ?? '*/*',
			});

			if (result.canceled) {
				return;
			}

			queueFiles(
				result.assets.map((asset) => ({
					id: nextId('doc'),
					name: asset.name,
					uri: asset.uri,
					size: asset.size,
					mimeType: asset.mimeType,
					source: 'document' as const,
					progress: 15,
					status: 'uploading' as const,
				})),
			);
		};

		const pickImage = async () => {
			const result = await ImagePicker.launchImageLibraryAsync({
				allowsMultipleSelection: multiple,
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 1,
			});

			if (result.canceled) {
				return;
			}

			queueFiles(
				result.assets.map((asset) => ({
					id: nextId('image'),
					name: asset.fileName ?? 'Selected image',
					uri: asset.uri,
					size: asset.fileSize,
					mimeType: asset.mimeType,
					source: 'image' as const,
					progress: 20,
					status: 'uploading' as const,
				})),
			);
		};

		return (
			<View ref={ref} testID={testID} style={style}>
				<ThemedText
					variant="label"
					style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
				>
					{label}
				</ThemedText>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: theme.spacing.sm,
						marginBottom: theme.spacing.sm,
					}}
				>
					<Button
						title="Pick file"
						variant="secondary"
						onPress={() => {
							void pickDocument();
						}}
					/>
					<Button
						title="Pick image"
						variant="outline"
						onPress={() => {
							void pickImage();
						}}
					/>
				</View>
				<View style={{ gap: theme.spacing.sm }}>
					{currentFiles.map((file) => (
						<View
							key={file.id}
							style={{
								borderWidth: theme.borderWidth.sm,
								borderColor: c.border,
								borderRadius: theme.borderRadius.md,
								padding: theme.spacing.md,
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									gap: theme.spacing.sm,
								}}
							>
								<View style={{ flex: 1 }}>
									<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
										{file.name}
									</ThemedText>
									<ThemedText
										variant="caption"
										style={{
											color: c.onSurfaceVariant,
											marginTop: theme.spacing.xxs,
										}}
									>
										{file.source === 'image' ? 'Image' : 'Document'}
										{file.size
											? ` • ${Math.ceil(file.size / BYTES_PER_KILOBYTE)} KB`
											: ''}
									</ThemedText>
								</View>
								<Badge
									label={
										file.status === 'uploaded'
											? 'Uploaded'
											: file.status === 'error'
												? 'Error'
												: 'Uploading'
									}
									variant={
										file.status === 'uploaded'
											? 'success'
											: file.status === 'error'
												? 'error'
												: 'info'
									}
									size="sm"
								/>
							</View>
							{file.status !== 'error' ? (
								<ProgressIndicator
									variant="linear"
									value={file.progress}
									label={`Progress ${file.progress}%`}
									style={{ marginTop: theme.spacing.sm }}
								/>
							) : null}
							{file.error ? (
								<ThemedText
									variant="caption"
									style={{ color: c.error, marginTop: theme.spacing.sm }}
								>
									{file.error}
								</ThemedText>
							) : null}
							{file.status === 'uploading' ? (
								<Pressable
									testID={`cancel-upload-${file.id}`}
									onPress={() => {
										clearTimeout(timersRef.current[file.id]);
										delete timersRef.current[file.id];
										setCurrentFiles(
											currentFiles.filter((entry) => entry.id !== file.id),
											{ source: 'cancel' },
										);
									}}
									accessibilityRole="button"
									accessibilityLabel={`Cancel upload for ${file.name}`}
									style={{ marginTop: theme.spacing.sm }}
								>
									<ThemedText variant="captionBold" style={{ color: c.error }}>
										Cancel
									</ThemedText>
								</Pressable>
							) : null}
						</View>
					))}
				</View>
			</View>
		);
	},
);

FileUploadField.displayName = 'FileUploadField';
