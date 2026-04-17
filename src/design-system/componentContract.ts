export type ComponentDensity = 'compact' | 'default' | 'relaxed';
export type ComponentEmphasis = 'high' | 'medium' | 'low';

export interface ValueChangeMeta {
	source:
		| 'input'
		| 'clear'
		| 'shortcut'
		| 'selection'
		| 'dismiss'
		| 'toggle'
		| 'confirm'
		| 'cancel';
}

export interface ComponentDocPropDefinition {
	name: string;
	type: string;
	defaultValue?: string;
	description: string;
}

export interface ComponentUsageGuidance {
	relaxed: string;
	operational: string;
	noMedia: string;
}

export interface ComponentDocsEntry {
	name: string;
	filePath: string;
	summary: string;
	exampleStories: string[];
	variants: string[];
	sizes: string[];
	states: string[];
	compositionExample: string;
	usage: ComponentUsageGuidance;
	propTable: ComponentDocPropDefinition[];
	doList: string[];
	dontList: string[];
	accessibilityNotes: string[];
	platformNotes: string[];
}
