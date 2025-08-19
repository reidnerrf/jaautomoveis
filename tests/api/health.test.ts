import request from 'supertest';
import { app } from '../../server';

describe('Health endpoint', () => {
	it('returns status ok', async () => {
		process.env.SKIP_DB = 'true';
		const res = await request(app).get('/health');
		expect(res.status).toBe(200);
		expect(res.body.status).toBe('ok');
	});
});
