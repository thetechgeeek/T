const types = [
	'build',
	'chore',
	'ci',
	'docs',
	'feat',
	'fix',
	'perf',
	'refactor',
	'revert',
	'style',
	'test',
];

module.exports = {
	rules: {
		'type-enum': [2, 'always', types],
		'type-case': [2, 'always', 'lower-case'],
		'subject-empty': [2, 'never'],
		'header-max-length': [2, 'always', 100],
	},
};
