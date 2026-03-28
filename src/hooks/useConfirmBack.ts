import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from 'expo-router';

/**
 * Intercepts back navigation when there are unsaved form changes.
 * Shows an Alert confirmation dialog before allowing the user to leave.
 */
export function useConfirmBack(isDirty: boolean, message?: string) {
	const navigation = useNavigation();

	useEffect(() => {
		if (!isDirty) return;

		const unsubscribe = navigation.addListener('beforeRemove', (e) => {
			e.preventDefault();
			Alert.alert(
				'Discard changes?',
				message ?? 'You have unsaved changes. Are you sure you want to go back?',
				[
					{ text: 'Stay', style: 'cancel' },
					{
						text: 'Discard',
						style: 'destructive',
						onPress: () => navigation.dispatch(e.data.action),
					},
				],
			);
		});

		return unsubscribe;
	}, [isDirty, message, navigation]);
}
