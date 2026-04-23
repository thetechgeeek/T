import { createTestClient, verifySeedData } from './test-seed.shared.mjs';

const testClient = createTestClient();
const summary = await verifySeedData(testClient);

console.log(
	JSON.stringify(
		{
			ok: true,
			action: 'test:seed:verify',
			summary,
		},
		null,
		2,
	),
);
