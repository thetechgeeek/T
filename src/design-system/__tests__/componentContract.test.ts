import fs from 'fs';
import path from 'path';

const root = process.cwd();
const registry = JSON.parse(
	fs.readFileSync(path.join(root, 'src', 'design-system', 'componentRegistry.json'), 'utf8'),
) as Array<{ filePath: string }>;
const STYLE_PROP_PATTERN =
	/\bstyle\??:|\bcontainerStyle\??:|\bcontentContainerStyle\??:|\binputStyle\??:|\btextStyle\??:/;
const TEST_ID_PROP_PATTERN = /\btestID\??:/;
const NATIVE_PROP_EXTENSION_PATTERN =
	/extends\s+(?:Omit<)?(?:PressableProps|TextProps|RNTextInputProps|TextInputProps)\b/;
const POLYMORPHIC_AS_PATTERN = /\bas\??:|asChild/;

describe('supported component contract', () => {
	it('keeps supported components aligned to the mobile API surface', () => {
		for (const entry of registry) {
			const source = fs.readFileSync(path.join(root, entry.filePath), 'utf8');
			const hasNativeExtension = NATIVE_PROP_EXTENSION_PATTERN.test(source);
			const hasStyleProp = STYLE_PROP_PATTERN.test(source) || hasNativeExtension;
			const hasTestIdProp = TEST_ID_PROP_PATTERN.test(source) || hasNativeExtension;

			expect(hasStyleProp).toBe(true);
			expect(hasTestIdProp).toBe(true);
			expect(POLYMORPHIC_AS_PATTERN.test(source)).toBe(false);
		}
	});
});
