import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

const fixturesRoot = path.resolve(process.cwd(), 'tests/fixtures');
const dataRoot = path.resolve(fixturesRoot, 'data');
const distDataRoot = path.resolve(fixturesRoot, 'dist-data');

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
  process.env.ALLOW_LEGACY_WRITE_TOKEN_AUTH = 'true';
  process.env.READ_SOURCE_MODE = 'auto';
  process.env.WRITE_SOURCE_MODE = 'auto';
  process.env.DATABASE_URL = 'postgresql://invalid:invalid@127.0.0.1:1/student_hub_test';
  process.env.DIRECT_URL = process.env.DATABASE_URL;

  const server = await import('../server/index.js');
  app = server.app;
});

beforeEach(async () => {
  await writeJson(path.resolve(dataRoot, 'user.json'), {
    user: {
      name: 'John Doe',
      id: '12345',
      email: 'john@example.com',
    },
  });
  await writeJson(path.resolve(dataRoot, 'fees.json'), {
    fees: [
      {
        semester: 'Spring 2026',
        demand: 50000,
        waiver: 0,
        paid: 25000,
        status: 'due',
      },
    ],
  });
});

const authHeaders = {
  'X-API-Key': 'dev-admin-token',
  'X-Admin-Scope': 'student-hub-admin',
};

describe('Phase 3: Concurrency and Conflict Detection', () => {
  describe('Version Tracking Infrastructure', () => {
    it('should accept write requests without version field (backward compatibility)', async () => {
      const response = await request(app)
        .put('/api/v1/user')
        .send({
          user: {
            name: 'Jane Doe',
            id: '12345',
            email: 'jane@example.com',
          },
        })
        .set(authHeaders);

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('Jane Doe');
    });

    it('should provide version information in read responses (infrastructure ready)', async () => {
      const response = await request(app).get('/api/v1/user');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(typeof response.body._version).toBe('number');
      expect(typeof response.body._lastModified).toBe('string');
    });

    it('should accept a write when provided version matches current version', async () => {
      const current = await request(app).get('/api/v1/user');
      const currentVersion = current.body._version;

      const response = await request(app)
        .put('/api/v1/user')
        .send({
          _version: currentVersion,
          user: {
            name: 'Version Match User',
            id: '12345',
            email: 'version-match@example.com',
          },
        })
        .set(authHeaders);

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('Version Match User');
      expect(response.body._version).toBeGreaterThan(currentVersion);
    });

    it('should reject stale writes with explicit 409 conflict', async () => {
      const current = await request(app).get('/api/v1/user');
      const staleVersion = current.body._version;

      const firstWrite = await request(app)
        .put('/api/v1/user')
        .send({
          _version: staleVersion,
          user: {
            name: 'First Writer',
            id: '12345',
            email: 'first-writer@example.com',
          },
        })
        .set(authHeaders);
      expect(firstWrite.status).toBe(200);

      const staleWrite = await request(app)
        .put('/api/v1/user')
        .send({
          _version: staleVersion,
          user: {
            name: 'Stale Writer',
            id: '12345',
            email: 'stale-writer@example.com',
          },
        })
        .set(authHeaders);

      expect(staleWrite.status).toBe(409);
      expect(staleWrite.body.error.code).toBe('ENTITY_VERSION_CONFLICT');
    });
  });

  describe('Entity Normalization and Consistency', () => {
    it('should maintain user data integrity across write/read cycle', async () => {
      const originalData = {
        user: {
          name: 'Test User',
          id: 'TEST123',
          email: 'test@example.com',
          department: 'Engineering',
        },
      };

      // Write
      const writeResponse = await request(app)
        .put('/api/v1/user')
        .send(originalData)
        .set(authHeaders);

      expect(writeResponse.status).toBe(200);

      // Read back
      const readResponse = await request(app).get('/api/v1/user');

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.user.name).toBe(originalData.user.name);
      expect(readResponse.body.user.id).toBe(originalData.user.id);
      expect(readResponse.body.user.email).toBe(originalData.user.email);
    });

    it('should consistently handle fees data across writes', async () => {
      const feesData = {
        fees: [
          {
            semester: 'Spring 2026',
            demand: 100000,
            waiver: 0,
            paid: 50000,
            status: 'due',
          },
          {
            semester: 'Fall 2025',
            demand: 75000,
            waiver: 0,
            paid: 75000,
            status: 'ok',
          },
        ],
      };

      const writeResponse = await request(app).put('/api/v1/fees').send(feesData).set(authHeaders);

      expect(writeResponse.status).toBe(200);
      expect(writeResponse.body.fees.length).toBe(2);
      expect(writeResponse.body.fees[0].semester).toBe('Spring 2026');
      expect(writeResponse.body.fees[1].semester).toBe('Fall 2025');
      expect(writeResponse.body.fees[0].demand).toBe(100000);
    });
  });

  describe('Concurrent Write Simulation', () => {
    it('should handle sequential writes without data loss', async () => {
      // First user update
      const update1 = await request(app)
        .put('/api/v1/user')
        .send({
          user: {
            name: 'User V1',
            id: '123',
            email: 'v1@example.com',
          },
        })
        .set(authHeaders);

      expect(update1.status).toBe(200);

      // Second user update
      const update2 = await request(app)
        .put('/api/v1/user')
        .send({
          user: {
            name: 'User V2',
            id: '123',
            email: 'v2@example.com',
          },
        })
        .set(authHeaders);

      expect(update2.status).toBe(200);

      // Verify final state
      const final = await request(app).get('/api/v1/user');

      // Should have the latest update
      expect(final.body.user.name).toBe('User V2');
      expect(final.body.user.email).toBe('v2@example.com');
    });

    it('should handle multiple fee updates without data loss', async () => {
      const fees1 = {
        fees: [{ semester: 'S1', demand: 100, waiver: 0, paid: 50, status: 'due' }],
      };

      const fees2 = {
        fees: [
          { semester: 'S1', demand: 100, waiver: 0, paid: 100, status: 'ok' },
          { semester: 'S2', demand: 200, waiver: 0, paid: 0, status: 'due' },
        ],
      };

      const update1 = await request(app).put('/api/v1/fees').send(fees1).set(authHeaders);
      expect(update1.status).toBe(200);

      const update2 = await request(app).put('/api/v1/fees').send(fees2).set(authHeaders);
      expect(update2.status).toBe(200);

      const final = await request(app).get('/api/v1/fees');

      expect(final.body.fees.length).toBe(2);
      expect(final.body.fees[1].semester).toBe('S2');
    });
  });

  describe('Fallback Behavior Verification', () => {
    it('should gracefully handle write operations in fallback mode', async () => {
      const response = await request(app)
        .put('/api/v1/user')
        .send({
          user: {
            name: 'Fallback Test',
            id: '999',
            email: 'fallback@example.com',
          },
        })
        .set(authHeaders);

      // Should succeed regardless of DB connection status
      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('Fallback Test');
    });

    it('should verify data persists after fallback write', async () => {
      await request(app)
        .put('/api/v1/user')
        .send({
          user: {
            name: 'Persistent Test',
            id: '888',
            email: 'persist@example.com',
          },
        })
        .set(authHeaders);

      const readResponse = await request(app).get('/api/v1/user');

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.user.name).toBe('Persistent Test');
    });

    it('should emit fallback event markers when database access fails in auto mode', async () => {
      const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

      try {
        const readResponse = await request(app).get('/api/v1/user');
        expect(readResponse.status).toBe(200);

        const logs = writeSpy.mock.calls.map(([chunk]) => String(chunk)).join('\n');
        expect(logs).toContain('[fallback-event]');
        expect(logs).toContain('type=read');
        expect(logs).toContain('route=user');
      } finally {
        writeSpy.mockRestore();
      }
    });

    it('should preserve schema contracts for fallback reads and writes', async () => {
      const updateResponse = await request(app)
        .put('/api/v1/fees')
        .send({
          fees: [
            {
              semester: 'Spring 2027',
              demand: 120000,
              waiver: 10000,
              paid: 50000,
              status: 'due',
            },
          ],
        })
        .set(authHeaders);

      expect(updateResponse.status).toBe(200);
      expect(Array.isArray(updateResponse.body.fees)).toBe(true);
      expect(updateResponse.body.fees[0]).toMatchObject({
        semester: 'Spring 2027',
        status: 'due',
      });
      expect(typeof updateResponse.body.fees[0].demand).toBe('number');
      expect(typeof updateResponse.body._version).toBe('number');
      expect(typeof updateResponse.body._lastModified).toBe('string');

      const readBack = await request(app).get('/api/v1/fees');
      expect(readBack.status).toBe(200);
      expect(Array.isArray(readBack.body.fees)).toBe(true);
      expect(typeof readBack.body.fees[0].demand).toBe('number');
      expect(typeof readBack.body.fees[0].waiver).toBe('number');
      expect(typeof readBack.body.fees[0].paid).toBe('number');
      expect(typeof readBack.body._version).toBe('number');
      expect(typeof readBack.body._lastModified).toBe('string');
    });

    it('should normalize critical fields consistently during fallback write-read cycles', async () => {
      const feeWrite = await request(app)
        .put('/api/v1/fees')
        .send({
          fees: [
            {
              semester: 'Summer 2027',
              demand: 90500,
              waiver: 2500,
              paid: 12000,
              status: 'DUE',
              statusText: 'Remaining',
              statusAmount: 76000,
            },
          ],
        })
        .set(authHeaders);

      expect(feeWrite.status).toBe(200);
      expect(feeWrite.body.fees[0]).toMatchObject({
        semester: 'Summer 2027',
        status: 'due',
      });
      expect(typeof feeWrite.body.fees[0].demand).toBe('number');
      expect(typeof feeWrite.body.fees[0].statusAmount).toBe('number');

      const resultWrite = await request(app)
        .put('/api/v1/results')
        .send({
          results: [
            {
              semester: 'Summer 2027',
              sgpa: 3.41,
              cgpa: 3.22,
              sgpaGrade: 'UNEXPECTED_BAND',
            },
          ],
        })
        .set(authHeaders);

      expect(resultWrite.status).toBe(200);
      expect(resultWrite.body.results[0].sgpaGrade).toBe('mid');
      expect(typeof resultWrite.body.results[0].sgpa).toBe('number');
      expect(typeof resultWrite.body.results[0].cgpa).toBe('number');
    });
  });

  describe('Collection Versioning Foundation', () => {
    it('should track courses collection state', async () => {
      const courses1 = {
        courses: [
          { code: 'CS101', name: 'Intro to CS', semester: '1' },
          { code: 'CS102', name: 'Data Structures', semester: '1' },
        ],
      };

      const response = await request(app).put('/api/v1/courses').send(courses1).set(authHeaders);

      expect(response.status).toBe(200);
      expect(response.body.courses.length).toBe(2);
    });

    it('should handle routines collection updates', async () => {
      const routines = {
        semesters: [
          {
            semester: '1',
            routine: [
              {
                day: 'Monday',
                time: '10:00',
                course: 'CS101',
                fc: 'Dr. Smith',
                room: '101',
              },
            ],
          },
        ],
      };

      const response = await request(app).put('/api/v1/routines').send(routines).set(authHeaders);

      expect(response.status).toBe(200);
      expect(response.body.semesters.length).toBe(1);
    });
  });

  describe('Data Consistency Verification', () => {
    it('should verify field consistency in user profile', async () => {
      const userData = {
        user: {
          name: 'Consistency Test',
          id: 'CONS123',
          email: 'cons@test.com',
          department: 'Engineering',
          program: 'BS',
        },
      };

      await request(app).put('/api/v1/user').send(userData).set(authHeaders);

      const readResponse = await request(app).get('/api/v1/user');

      const readUser = readResponse.body.user;
      expect(readUser.name).toBe(userData.user.name);
      expect(readUser.id).toBe(userData.user.id);
      expect(readUser.email).toBe(userData.user.email);
      expect(readUser.department).toBe(userData.user.department);
      expect(readUser.program).toBe(userData.user.program);
    });

    it('should verify numeric field integrity in fees', async () => {
      const feesData = {
        fees: [
          {
            semester: 'Consistency Test',
            demand: 123456,
            waiver: 54321,
            paid: 69135,
            status: 'due',
          },
        ],
      };

      await request(app).put('/api/v1/fees').send(feesData).set(authHeaders);

      const readResponse = await request(app).get('/api/v1/fees');

      const fee = readResponse.body.fees[0];
      expect(fee.demand).toBe(123456);
      expect(fee.waiver).toBe(54321);
      expect(fee.paid).toBe(69135);
    });
  });
});
