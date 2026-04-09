import { lightTheme, darkTheme } from '../colors';

describe('Theme Colors (P0.3)', () => {
	it('has correct primary brand color', () => {
		expect(lightTheme.colors.primary).toBe('#C1440E');
		expect(darkTheme.colors.primary).toBe('#E8622A');
	});

	it('has correct status colors', () => {
		// Specific status colors from roadmap
		expect(lightTheme.colors.paid).toBe('#065F46'); // Derived from text color in roadmap
		// The roadmap says: Paid status: success green background tint #D1FAE5, text #065F46
		// I will map 'paid' to the text color as it's the primary indicator

		expect(lightTheme.colors.unpaid).toBe('#991B1B');
		expect(lightTheme.colors.partial).toBe('#92400E');
		expect(lightTheme.colors.overdue).toBe('#7F1D1D');
	});

	it('has correct success green colors', () => {
		expect(lightTheme.colors.success).toBe('#1A8754');
		expect(darkTheme.colors.success).toBe('#2DB87A');
	});

	it('has correct error red colors', () => {
		expect(lightTheme.colors.error).toBe('#B91C1C');
		expect(darkTheme.colors.error).toBe('#EF4444');
	});
});
