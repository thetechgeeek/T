import { Alert } from 'react-native';
import { showNativeAlertDialog, showNativeConfirmationAlert } from '../nativeAlertDialog';

describe('nativeAlertDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('proxies simple alert dialogs through Alert.alert', () => {
		showNativeAlertDialog({
			title: 'Alert title',
			message: 'Alert message',
			actions: [{ label: 'Continue' }],
		});

		expect(Alert.alert).toHaveBeenCalledWith(
			'Alert title',
			'Alert message',
			[
				expect.objectContaining({
					text: 'Continue',
				}),
			],
			{ cancelable: true },
		);
	});

	it('builds native confirmation dialogs with cancel and destructive confirm actions', () => {
		const onConfirm = jest.fn();
		const onCancel = jest.fn();

		showNativeConfirmationAlert({
			title: 'Confirm action',
			message: 'Proceed?',
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			destructive: true,
			onConfirm,
			onCancel,
		});

		expect(Alert.alert).toHaveBeenCalledWith(
			'Confirm action',
			'Proceed?',
			[
				expect.objectContaining({
					text: 'Cancel',
					style: 'cancel',
					onPress: onCancel,
				}),
				expect.objectContaining({
					text: 'Delete',
					style: 'destructive',
					onPress: onConfirm,
				}),
			],
			{ cancelable: true },
		);
	});
});
