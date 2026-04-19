import { I18nManager } from 'react-native';
import { configureI18nRtlSupport, isRtlLanguageTag, syncI18nRtlPreference } from '../rtl';

describe('i18n rtl configuration', () => {
	it('enables RTL layouts and logical left/right swapping', () => {
		const allowRTL = jest.spyOn(I18nManager, 'allowRTL').mockImplementation(jest.fn());
		const swapLeftAndRightInRTL = jest
			.spyOn(I18nManager, 'swapLeftAndRightInRTL')
			.mockImplementation(jest.fn());

		configureI18nRtlSupport();

		expect(allowRTL).toHaveBeenCalledWith(true);
		expect(swapLeftAndRightInRTL).toHaveBeenCalledWith(true);
	});

	it('detects RTL locales by language tag prefix', () => {
		expect(isRtlLanguageTag('ar-SA')).toBe(true);
		expect(isRtlLanguageTag('he-IL')).toBe(true);
		expect(isRtlLanguageTag('en-US')).toBe(false);
	});

	it('forces RTL and requests reload when the locale direction changes', () => {
		const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(jest.fn());
		const reloadApp = jest.fn();

		(I18nManager as typeof I18nManager).isRTL = false;

		expect(syncI18nRtlPreference('ar-SA', { reloadApp })).toEqual({
			didChange: true,
			requiresReload: true,
			shouldUseRtl: true,
		});

		expect(forceRTL).toHaveBeenCalledWith(true);
		expect(reloadApp).toHaveBeenCalledTimes(1);

		forceRTL.mockRestore();
	});

	it('does not request reload when the current locale direction already matches', () => {
		const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(jest.fn());
		const reloadApp = jest.fn();

		(I18nManager as typeof I18nManager).isRTL = false;

		expect(syncI18nRtlPreference('en-US', { reloadApp })).toEqual({
			didChange: false,
			requiresReload: false,
			shouldUseRtl: false,
		});

		expect(forceRTL).not.toHaveBeenCalled();
		expect(reloadApp).not.toHaveBeenCalled();

		forceRTL.mockRestore();
	});
});
