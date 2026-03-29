import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

const fixturesRoot = path.resolve(process.cwd(), 'tests/fixtures');
const dataRoot = path.resolve(fixturesRoot, 'data');
const distDataRoot = path.resolve(fixturesRoot, 'dist-data');
const feesPath = path.resolve(dataRoot, 'fees.json');

let app;

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

beforeAll(async () => {
  process.env.DATA_ROOT = dataRoot;
  process.env.DIST_DATA_ROOT = distDataRoot;
  process.env.MIRROR_DIST_WRITES = 'false';
  process.env.WRITE_API_TOKEN = 'dev-admin-token';
  process.env.WRITE_SCOPE = 'student-hub-admin';

  const server = await import('../server/index.js');
  app = server.app;
});

beforeEach(async () => {
  await writeJson(feesPath, {
    fees: [
      {
        semester: 'Spring, 2026',
        demand: 50000,
        waiver: 0,
        paid: 25000,
        status: 'due',
        statusText: 'Due',
        statusAmount: 25000,
      },
    ],
  });
});

describe('api write security and validation', () => {
  it('blocks unauthorized writes', async () => {
    const response = await request(app)
      .put('/api/v1/user')
      .send({ user: { name: 'No Auth', id: 'X-1' } })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body?.error?.code).toBe('WRITE_AUTH_REQUIRED');
  });

  it('blocks wrong scope even with valid token', async () => {
    const response = await request(app)
      .put('/api/v1/user')
      .set('Content-Type', 'application/json')
      .set('X-API-Key', 'dev-admin-token')
      .set('X-Admin-Scope', 'wrong-scope')
      .send({ user: { name: 'Wrong Scope', id: 'X-2' } });

    expect(response.status).toBe(403);
    expect(response.body?.error?.code).toBe('WRITE_SCOPE_FORBIDDEN');
  });

  it('rejects malformed nested marks payload with structured 400 error', async () => {
    const response = await request(app)
      .put('/api/v1/marks')
      .set('Content-Type', 'application/json')
      .set('X-API-Key', 'dev-admin-token')
      .set('X-Admin-Scope', 'student-hub-admin')
      .send({
        semesters: [
          {
            semester: 'Spring, 2026',
            subjects: [{ code: 'BUS101', name: 'Intro', mark: 'A+' }],
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body?.ok).toBe(false);
    expect(response.body?.error?.code).toBe('MARKS_SUBJECT_MARK_INVALID');
  });

  it('keeps valid JSON shape under concurrent write load', async () => {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': 'dev-admin-token',
      'X-Admin-Scope': 'student-hub-admin',
    };

    const writes = [];
    for (let index = 0; index < 20; index += 1) {
      writes.push(
        request(app)
          .put('/api/v1/fees')
          .set(headers)
          .send({
            fees: [
              {
                semester: 'Spring, 2026',
                demand: 50000 + index,
                waiver: 0,
                paid: 25000,
                status: 'due',
                statusText: 'Due',
                statusAmount: 25000,
              },
            ],
          })
      );
    }

    const responses = await Promise.all(writes);
    expect(responses.every((response) => response.status === 200)).toBe(true);

    const finalRaw = await fs.readFile(feesPath, 'utf8');
    const parsed = JSON.parse(finalRaw);
    expect(Array.isArray(parsed.fees)).toBe(true);
    expect(parsed.fees.length).toBe(1);
    expect(typeof parsed.fees[0].demand).toBe('number');
  });
});
