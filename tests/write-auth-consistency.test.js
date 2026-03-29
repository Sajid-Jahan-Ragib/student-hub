import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

let app;

beforeAll(async () => {
  const server = await import('../server/index.js');
  app = server.app;
});

describe('write authorization consistency', () => {
  it('denies all mutation routes when unauthenticated', async () => {
    const routes = [
      '/api/v1/user',
      '/api/v1/routines',
      '/api/v1/fees',
      '/api/v1/calendar',
      '/api/v1/downloads',
      '/api/v1/courses',
      '/api/v1/pending-courses',
      '/api/v1/results',
      '/api/v1/marks',
    ];

    const results = await Promise.all(
      routes.map((routePath) =>
        request(app).put(routePath).set('Content-Type', 'application/json').send({})
      )
    );

    for (const response of results) {
      expect(response.status).toBe(401);
      expect(response.body?.error?.code).toBe('WRITE_AUTH_REQUIRED');
    }
  });
});
