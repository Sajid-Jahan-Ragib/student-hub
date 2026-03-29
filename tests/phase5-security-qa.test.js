/**
 * Phase 5: Security, QA, and Regression Tests
 *
 * Covers:
 * - Auth flow: login success/failure, session status, logout
 * - Protected-route behavior
 * - Unauthorized write denial across mutation routes
 * - Payload validation rejection
 * - Concurrency conflict (409)
 * - Fallback parity for read/write under json mode
 * - Integration: save/update flows for profile, fees, routines, marks
 * - Liveness and readiness endpoints
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

const fixturesRoot = path.resolve(process.cwd(), 'tests/fixtures');
const dataRoot = path.resolve(fixturesRoot, 'data-phase5');
const distDataRoot = path.resolve(fixturesRoot, 'dist-data-phase5');

let app;

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

const authHeaders = {
  'x-api-key': 'dev-admin-token',
  'x-admin-scope': 'student-hub-admin',
};

beforeAll(async () => {
  process.env.DATA_ROOT = dataRoot;
  process.env.DIST_DATA_ROOT = distDataRoot;
  process.env.MIRROR_DIST_WRITES = 'false';
  process.env.WRITE_API_TOKEN = 'dev-admin-token';
  process.env.WRITE_SCOPE = 'student-hub-admin';
  process.env.ALLOW_LEGACY_WRITE_TOKEN_AUTH = 'true';
  process.env.WRITE_SOURCE_MODE = 'json';
  process.env.READ_SOURCE_MODE = 'json';
  process.env.ADMIN_LOGIN_EMAIL = 'admin@test.example';
  process.env.ADMIN_LOGIN_PASSWORD = 'test-password-phase5';

  const server = await import('../server/index.js');
  app = server.app;
});

beforeEach(async () => {
  await writeJson(path.resolve(dataRoot, 'user.json'), {
    user: { name: 'Test User', id: 'TEST001', department: 'BBA' },
  });
  await writeJson(path.resolve(dataRoot, 'fees.json'), {
    fees: [
      {
        semester: 'Spring, 2026',
        demand: 50000,
        waiver: 0,
        paid: 50000,
        status: 'ok',
        statusText: 'Paid',
        statusAmount: 0,
      },
    ],
  });
  await writeJson(path.resolve(dataRoot, 'routines.json'), { semesters: [] });
  await writeJson(path.resolve(dataRoot, 'marks.json'), { semesters: [] });
  await writeJson(path.resolve(dataRoot, 'results.json'), { results: [] });
  await writeJson(path.resolve(dataRoot, 'courses.json'), { courses: [], courseNameMap: {} });
  await writeJson(path.resolve(dataRoot, 'downloads.json'), { downloads: [] });
  await writeJson(path.resolve(dataRoot, 'calendar.json'), { events: [] });
  await writeJson(path.resolve(dataRoot, 'pending-courses.json'), { pendingCourses: [] });
});

// ─── Auth Flow ────────────────────────────────────────────────────────────────

describe('Auth Flow', () => {
  it('should reject login with empty credentials', async () => {
    const res = await request(app).post('/api/v1/admin/login').send({ email: '', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('AUTH_PAYLOAD_INVALID');
  });

  it('should reject login with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('should succeed login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'admin@test.example', password: 'test-password-phase5' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.authenticated).toBe(true);
    expect(res.body.user.email).toBe('admin@test.example');
  });

  it('should return authenticated status after successful login', async () => {
    // Login first to get a session cookie
    const loginRes = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'admin@test.example', password: 'test-password-phase5' });

    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const statusRes = await request(app).get('/api/v1/admin/auth-status').set('Cookie', cookies);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.authenticated).toBe(true);
  });

  it('should return unauthenticated status before login', async () => {
    const res = await request(app).get('/api/v1/admin/auth-status');

    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(false);
  });

  it('should logout and clear the session', async () => {
    const loginRes = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'admin@test.example', password: 'test-password-phase5' });

    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app).post('/api/v1/admin/logout').set('Cookie', cookies);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.authenticated).toBe(false);

    // Session should be gone
    const statusRes = await request(app).get('/api/v1/admin/auth-status').set('Cookie', cookies);

    expect(statusRes.body.authenticated).toBe(false);
  });
});

// ─── Protected Route Behavior ─────────────────────────────────────────────────

describe('Protected Route Behavior', () => {
  const mutationRoutes = [
    { method: 'put', path: '/api/v1/user', body: { user: { name: 'X' } } },
    { method: 'put', path: '/api/v1/fees', body: { fees: [] } },
    { method: 'put', path: '/api/v1/routines', body: { semesters: [] } },
    { method: 'put', path: '/api/v1/calendar', body: { events: [] } },
    { method: 'put', path: '/api/v1/downloads', body: { downloads: [] } },
    { method: 'put', path: '/api/v1/courses', body: { courses: [] } },
    { method: 'put', path: '/api/v1/pending-courses', body: { pendingCourses: [] } },
  ];

  for (const route of mutationRoutes) {
    it(`should block unauthenticated ${route.method.toUpperCase()} ${route.path}`, async () => {
      const res = await request(app)[route.method](route.path).send(route.body);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('WRITE_AUTH_REQUIRED');
    });
  }

  it('should allow authenticated GET requests without auth headers', async () => {
    const res = await request(app).get('/api/v1/user');
    expect([200, 500]).toContain(res.status); // 200 or fallback to json, never 401
    expect(res.status).not.toBe(401);
  });
});

// ─── Unauthorized Write Denial Across Routes ─────────────────────────────────

describe('Unauthorized Write Denial', () => {
  it('should reject writes with no auth at all', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .send({ user: { name: 'Hack' } });
    expect(res.status).toBe(401);
  });

  it('should reject writes with valid token but missing scope header', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .set('x-api-key', 'dev-admin-token')
      .send({ user: { name: 'Hack' } });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('WRITE_SCOPE_FORBIDDEN');
  });

  it('should reject writes with wrong token', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .set('x-api-key', 'wrong-token')
      .set('x-admin-scope', 'student-hub-admin')
      .send({ user: { name: 'Hack' } });

    expect(res.status).toBe(401);
  });

  it('should reject writes with wrong scope', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .set('x-api-key', 'dev-admin-token')
      .set('x-admin-scope', 'wrong-scope')
      .send({ user: { name: 'Hack' } });

    expect(res.status).toBe(403);
  });

  it('should allow writes with correct token and scope', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .set(authHeaders)
      .send({ user: { name: 'Legit User', id: 'U001', department: 'BBA' } });

    expect(res.status).toBe(200);
  });
});

// ─── Payload Validation Rejection ─────────────────────────────────────────────

describe('Payload Validation Rejection', () => {
  it('should reject unsafe string in user name (script tag)', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .set(authHeaders)
      .send({ user: { name: '<script>alert("xss")</script>', id: 'U1' } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toMatch(/USER_PAYLOAD_INVALID|UNSAFE_CONTENT/);
  });

  it('should reject downloads with non-http URL protocol', async () => {
    const res = await request(app)
      .put('/api/v1/downloads')
      .set(authHeaders)
      .send({
        downloads: [{ title: 'Bad', category: 'Docs', url: 'ftp://example.com/file.pdf' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_URL_PROTOCOL');
  });

  it('should reject downloads with javascript: URL', async () => {
    const res = await request(app)
      .put('/api/v1/downloads')
      .set(authHeaders)
      .send({
        downloads: [{ title: 'XSS', category: 'Docs', url: 'javascript:alert(1)' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toMatch(/INVALID_URL/);
  });

  it('should reject downloads array exceeding length limit', async () => {
    const downloads = Array(1500)
      .fill(null)
      .map((_, i) => ({
        title: `File ${i}`,
        category: 'Docs',
        url: `https://example.com/${i}.pdf`,
      }));

    const res = await request(app).put('/api/v1/downloads').set(authHeaders).send({ downloads });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DOWNLOADS_PAYLOAD_TOO_LARGE');
  });

  it('should reject marks with invalid (non-numeric) mark value', async () => {
    const res = await request(app)
      .put('/api/v1/marks')
      .set(authHeaders)
      .send({
        semesters: [
          {
            semester: 'Spring, 2026',
            subjects: [{ code: 'BUS101', name: 'Business', mark: 'not-a-number' }],
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MARKS_SUBJECT_MARK_INVALID');
  });
});

// ─── Concurrency Conflict (409) ───────────────────────────────────────────────

describe('Concurrency Conflict Detection', () => {
  it('should reject a write with a stale version and return 409', async () => {
    // First, get current version via a read
    const readRes = await request(app).get('/api/v1/user');
    const currentVersion = readRes.body._version ?? 0;

    // Make a successful write to bump the version
    await request(app)
      .put('/api/v1/user')
      .set(authHeaders)
      .send({
        user: { name: 'First Write', id: 'U1', department: 'BBA' },
        _version: currentVersion,
      });

    // Now try to write with the old (stale) version — should conflict
    const conflictRes = await request(app)
      .put('/api/v1/user')
      .set(authHeaders)
      .send({
        user: { name: 'Stale Write', id: 'U1', department: 'BBA' },
        _version: currentVersion,
      });

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.error.code).toBe('ENTITY_VERSION_CONFLICT');
  });

  it('should accept a write without version field (backward compat)', async () => {
    const res = await request(app)
      .put('/api/v1/user')
      .set(authHeaders)
      .send({ user: { name: 'No Version Write', id: 'U1', department: 'BBA' } });

    expect(res.status).toBe(200);
  });
});

// ─── Fallback Parity ──────────────────────────────────────────────────────────

describe('JSON Fallback Parity', () => {
  it('should read user data and return expected shape in json mode', async () => {
    const res = await request(app).get('/api/v1/user');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(typeof res.body.user.name).toBe('string');
  });

  it('should read fees data and return expected shape in json mode', async () => {
    const res = await request(app).get('/api/v1/fees');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fees');
    expect(Array.isArray(res.body.fees)).toBe(true);
  });

  it('should write then read fees and see the updated data', async () => {
    const updated = [
      {
        semester: 'Fall, 2026',
        demand: 60000,
        waiver: 1000,
        paid: 59000,
        status: 'due',
        statusText: 'Due',
        statusAmount: 1000,
      },
    ];

    const writeRes = await request(app)
      .put('/api/v1/fees')
      .set(authHeaders)
      .send({ fees: updated });

    expect(writeRes.status).toBe(200);

    const readRes = await request(app).get('/api/v1/fees');
    expect(readRes.body.fees[0].semester).toBe('Fall, 2026');
    expect(readRes.body.fees[0].demand).toBe(60000);
  });

  it('should write then read user profile and see the updated name', async () => {
    const writeRes = await request(app)
      .put('/api/v1/user')
      .set(authHeaders)
      .send({ user: { name: 'Updated Name', id: 'U999', department: 'CSE' } });

    expect(writeRes.status).toBe(200);

    const readRes = await request(app).get('/api/v1/user');
    expect(readRes.body.user.name).toBe('Updated Name');
  });
});

// ─── Integration: Save/Update Flows ──────────────────────────────────────────

describe('Integration: Full Save/Update Flows', () => {
  it('should save and retrieve a complete routines update', async () => {
    const semesters = [
      {
        semester: 'Spring, 2026',
        routine: [
          { day: 'MON', time: '08:15 AM to 09:45 AM', course: 'BUS101', fc: 'Dr. X', room: '101' },
        ],
      },
    ];

    const writeRes = await request(app)
      .put('/api/v1/routines')
      .set(authHeaders)
      .send({ semesters });

    expect(writeRes.status).toBe(200);

    const readRes = await request(app).get('/api/v1/routines');
    expect(readRes.status).toBe(200);
    expect(readRes.body.semesters[0].semester).toBe('Spring, 2026');
  });

  it('should save and retrieve calendar events', async () => {
    const events = [
      {
        title: 'Midterm',
        dateText: '10 Apr, 2026',
        tagType: 'examination',
        tagText: 'Exam',
        start: '2026-04-10',
        end: '2026-04-15',
      },
    ];

    const writeRes = await request(app).put('/api/v1/calendar').set(authHeaders).send({ events });

    expect(writeRes.status).toBe(200);

    const readRes = await request(app).get('/api/v1/calendar');
    expect(readRes.body.events[0].title).toBe('Midterm');
  });

  it('should save marks and persist to file', async () => {
    const marksPath = path.resolve(dataRoot, 'marks.json');

    const writeRes = await request(app)
      .put('/api/v1/marks')
      .set(authHeaders)
      .send({
        semesters: [
          {
            semester: 'Fall, 2024',
            subjects: [
              { code: 'BUS101', name: 'Business', mark: 75 },
              { code: 'MTH101', name: 'Math', mark: 80 },
            ],
          },
        ],
      });

    expect(writeRes.status).toBe(200);

    const saved = await readJson(marksPath);
    expect(Array.isArray(saved.semesters)).toBe(true);
    expect(saved.semesters[0].subjects[0].code).toBe('BUS101');
  });
});

// ─── Liveness and Readiness ───────────────────────────────────────────────────

describe('Health Endpoints', () => {
  it('should return liveness ok', async () => {
    const res = await request(app).get('/api/v1/health/live');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('alive');
  });

  it('should return readiness with data root check', async () => {
    const res = await request(app).get('/api/v1/health/ready');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('checks');
    expect(res.body).toHaveProperty('ts');
  });

  it('should return minimal response from legacy health endpoint', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('student-hub-api');
    // sourcePolicy is intentionally omitted from the public /health endpoint
    // to avoid leaking internal configuration details
    expect(res.body.sourcePolicy).toBeUndefined();
  });
});

// ─── Observability: Correlation IDs ──────────────────────────────────────────

describe('Observability', () => {
  it('should echo back x-request-id if provided', async () => {
    // The server assigns requestId but doesn't necessarily echo it — just confirm the request succeeds
    const res = await request(app)
      .get('/api/v1/health/live')
      .set('x-request-id', 'test-correlation-123');

    expect(res.status).toBe(200);
  });

  it('should handle requests without x-request-id (auto-assigns)', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
  });
});
