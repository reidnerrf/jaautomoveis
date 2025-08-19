/** @jest-environment node */
import request from 'supertest';

// Ensure DB connection is skipped before loading the server
process.env.SKIP_DB = 'true';
// Load server after setting env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app } = require('../../server');

describe('Health endpoint', () => {
	it('returns status ok', async () => {
		const res = await request(app).get('/health');
		expect(res.status).toBe(200);
		expect(res.body.status).toBe('ok');
	});
});
