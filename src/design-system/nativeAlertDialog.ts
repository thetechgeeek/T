import { Alert } from 'react-native';

export type NativeAlertDialogActionStyle = 'default' | 'cancel' | 'destructive';

export interface NativeAlertDialogAction {
	label: string;
	style?: NativeAlertDialogActionStyle;
	onPress?: () => void;
}

export interface NativeAlertDialogOptions {
	title: string;
	message?: string;
	actions?: NativeAlertDialogAction[];
	cancelable?: boolean;
}

export interface NativeAlertConfirmationOptions {
	title: string;
	message?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	onConfirm?: () => void;
	onCancel?: () => void;
}

export function showNativeAlertDialog({
	title,
	message,
	actions = [{ label: 'OK' }],
	cancelable = true,
}: NativeAlertDialogOptions) {
	Alert.alert(
		title,
		message,
		actions.map((action) => ({
			text: action.label,
			style: action.style,
			onPress: action.onPress,
		})),
		{ cancelable },
	);
}

export function showNativeConfirmationAlert({
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	destructive = false,
	onConfirm,
	onCancel,
}: NativeAlertConfirmationOptions) {
	showNativeAlertDialog({
		title,
		message,
		actions: [
			{
				label: cancelLabel,
				style: 'cancel',
				onPress: onCancel,
			},
			{
				label: confirmLabel,
				style: destructive ? 'destructive' : 'default',
				onPress: onConfirm,
			},
		],
	});
}
