const path = require('path');
const { resolveIntegrationJestEnv } = require('../../scripts/lib/script-config.cjs');

Object.assign(
	process.env,
	resolveIntegrationJestEnv({
		envFilePath: path.join(process.cwd(), '.env.test'),
		env: process.env,
	}),
);
