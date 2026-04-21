import { lightTheme, darkTheme } from '../colors';

describe('Theme Colors (P0.3)', () => {
	it('has correct primary brand color', () => {
		expect(lightTheme.colors.primary).toBe('#5E6AD2');
		expect(darkTheme.colors.primary).toBe('#7B8CE5');
	});

	it('has correct status colors', () => {
		expect(lightTheme.colors.paid).toBe('#1A7B53');
		expect(lightTheme.colors.unpaid).toBe('#BF3337');
		expect(lightTheme.colors.partial).toBe('#B86304');
		expect(lightTheme.colors.overdue).toBe('#3F0C0E');
	});

	it('has correct success green colors', () => {
		expect(lightTheme.colors.success).toBe('#22A06B');
		expect(darkTheme.colors.success).toBe('#30A46C');
	});

	it('has correct error red colors', () => {
		expect(lightTheme.colors.error).toBe('#E5484D');
		expect(darkTheme.colors.error).toBe('#F16870');
	});
});
