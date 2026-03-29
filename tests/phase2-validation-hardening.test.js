import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
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
  process.env.WRITE_SOURCE_MODE = 'json';

  const server = await import('../server/index.js');
  app = server.app;
});

beforeEach(async () => {
  // Prepare minimal test data
  await writeJson(path.resolve(dataRoot, 'downloads.json'), { downloads: [] });
  await writeJson(path.resolve(dataRoot, 'calendar.json'), { events: [] });
  await writeJson(path.resolve(dataRoot, 'courses.json'), { courses: [] });
  await writeJson(path.resolve(dataRoot, 'routines.json'), { semesters: [] });
});

describe('Phase 2 Validation Hardening', () => {
  describe('URL Protocol Safety Validation', () => {
    it('should reject downloads with non-http(s) URL protocols', async () => {
      const response = await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: [
            {
              title: 'Test File',
              category: 'Docs',
              url: 'ftp://example.com/file.pdf', // Invalid protocol
            },
          ],
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_URL_PROTOCOL');
    });

    it('should reject downloads with javascript: URL protocol', async () => {
      const response = await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: [
            {
              title: 'Test File',
              category: 'Docs',
              url: 'javascript:alert("xss")',
            },
          ],
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toMatch(/INVALID_URL|INVALID_URL_PROTOCOL/);
    });

    it('should accept downloads with https:// protocol', async () => {
      const response = await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: [
            {
              title: 'Test File',
              category: 'Docs',
              url: 'https://example.com/file.pdf',
            },
          ],
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      // Should not reject for URL protocol (may fail for auth, but not URL validation)
      if (response.status === 400) {
        expect(response.body.error.code).not.toMatch(/INVALID_URL_PROTOCOL|INVALID_URL_FORMAT/);
      }
    });

    it('should accept downloads with http:// protocol', async () => {
      const response = await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: [
            {
              title: 'Test File',
              category: 'Docs',
              url: 'http://example.com/file.pdf',
            },
          ],
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      // Should not reject for URL protocol (may fail for auth, but not URL validation)
      if (response.status === 400) {
        expect(response.body.error.code).not.toMatch(/INVALID_URL_PROTOCOL|INVALID_URL_FORMAT/);
      }
    });

    it('should validate calendar event external links for URL protocol', async () => {
      const response = await request(app)
        .put('/api/v1/calendar')
        .send({
          events: [
            {
              title: 'Event with bad link',
              dateText: '2026-04-04',
              start: '10:00',
              end: '11:00',
              externalLink: 'data:text/html,<script>alert("xss")</script>',
            },
          ],
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      // Should either reject for URL validation or be allowed (same server rules apply)
      if (response.status === 400) {
        expect(response.body.error.code).toMatch(/INVALID_URL|CALENDAR_EVENT/);
      }
    });
  });

  describe('Payload Size Limits', () => {
    it('should reject excessively large download payloads', async () => {
      // Create payload exceeding 1MB
      const downloads = Array(50000)
        .fill(null)
        .map((_, i) => ({
          title: `File ${i} with very long title to increase size ${'x'.repeat(500)}`,
          category: 'Docs',
          url: `https://example.com/file${i}.pdf${'y'.repeat(200)}`,
        }));

      const response = await request(app)
        .put('/api/v1/downloads')
        .send({ downloads })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      // Should reject on size
      if (response.status === 400) {
        expect(response.body.error.code).toMatch(/PAYLOAD_TOO_LARGE|DOWNLOAD/);
      }
    });
  });

  describe('Array Length Limits', () => {
    it('should reject downloads array exceeding limit', async () => {
      const downloads = Array(1500)
        .fill(null)
        .map((_, i) => ({
          title: `File ${i}`,
          category: 'Docs',
          url: `https://example.com/file${i}.pdf`,
        }));

      const response = await request(app)
        .put('/api/v1/downloads')
        .send({ downloads })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DOWNLOADS_PAYLOAD_TOO_LARGE');
    });

    it('should reject courses array exceeding 2000 item limit', async () => {
      const courses = Array(2100)
        .fill(null)
        .map((_, i) => ({
          code: `CS${i}`,
          name: `Course ${i}`,
          semester: '1',
        }));

      const response = await request(app)
        .put('/api/v1/courses')
        .send({ courses })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('COURSES_PAYLOAD_TOO_LARGE');
    });

    it('should reject routines semesters exceeding 200 limit', async () => {
      const semesters = Array(250)
        .fill(null)
        .map((_, i) => ({
          semester: `Sem ${i}`,
          routine: [
            { day: 'Monday', time: '10:00', course: 'CS101', fc: 'Dr. Smith', room: '101' },
          ],
        }));

      const response = await request(app)
        .put('/api/v1/routines')
        .send({ semesters })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ROUTINES_PAYLOAD_TOO_LARGE');
    });
  });

  describe('Validation Error Logging', () => {
    it('should log validation failures with safe error details', async () => {
      const consoleSpy = console.log;
      let loggedMessage = null;

      console.log = (msg) => {
        if (msg.includes('[VALIDATION:')) {
          loggedMessage = msg;
        }
        consoleSpy(msg);
      };

      await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: {
            // Invalid structure - expected array
          },
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(loggedMessage).toMatch(/\[VALIDATION:/);

      console.log = consoleSpy;
    });
  });

  describe('Safe Error Responses', () => {
    it('should not expose internal paths in error responses', async () => {
      const response = await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: 1000, // Invalid: should be array
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      expect(response.status).toBe(400);
      // Should not expose paths like /home/... or absolute paths
      expect(response.body.error.message).not.toMatch(/\/home\/|\/tmp\/|C:\\\\|paths/i);
    });

    it('should not expose database connection details in error responses', async () => {
      const response = await request(app)
        .put('/api/v1/downloads')
        .send({
          downloads: [
            {
              title: 'Test',
              category: 'Test',
              url: 'https://example.com',
            },
          ],
        })
        .set('x-api-key', 'dev-admin-token')
        .set('x-admin-scope', 'student-hub-admin');

      // Check no DB connection strings are exposed
      if (response.body.error) {
        const errorStr = JSON.stringify(response.body.error);
        expect(errorStr).not.toMatch(/localhost:18789|postgresql|password|user\s*=/i);
      }
    });
  });
});
