import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getCalendarPayload,
  getCoursesPayload,
  getDownloadsPayload,
  getFeesPayload,
  getMarksPayload,
  getPendingCoursesPayload,
  getResultsPayload,
  getRoutinesPayload,
  getUserPayload,
} from './repositories/academicReadRepository.js';
import {
  RequestValidationError,
  validateCalendarPayload,
  validateCoursesPayload,
  validateDownloadsPayload,
  validateFeesPayload,
  validateMarksPayload,
  validatePendingCoursesPayload,
  validateResultsPayload,
  validateRoutinesPayload,
  validateUserPayload,
} from './validation/requestValidators.js';

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 3001;
const LEGACY_API_PREFIX = '/api';
const V1_API_PREFIX = '/api/v1';
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 300);
const mirrorDistWrites = String(process.env.MIRROR_DIST_WRITES || 'false').toLowerCase() === 'true';
const writeApiToken = String(process.env.WRITE_API_TOKEN || 'dev-admin-token').trim();
const writeScope = String(process.env.WRITE_SCOPE || 'student-hub-admin').trim();
const readSourceModeRaw = String(process.env.READ_SOURCE_MODE || 'auto')
  .toLowerCase()
  .trim();
const readSourceMode = ['auto', 'json', 'postgres'].includes(readSourceModeRaw)
  ? readSourceModeRaw
  : 'auto';

const allowedOrigins = String(
  process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new RequestValidationError('CORS_ORIGIN_DENIED', 'Origin is not allowed by CORS'));
  },
};

const requestLimiter = rateLimit({
  windowMs: Number.isFinite(rateLimitWindowMs) ? rateLimitWindowMs : 15 * 60 * 1000,
  max: Number.isFinite(rateLimitMax) ? rateLimitMax : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    sendError(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later.');
  },
});

const serverFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(serverFilePath), '..');
const dataRootPath = path.resolve(projectRoot, process.env.DATA_ROOT || 'public/data');
const distDataRootPath = path.resolve(projectRoot, process.env.DIST_DATA_ROOT || 'dist/data');

const userFilePath = path.resolve(dataRootPath, 'user.json');
const distUserFilePath = path.resolve(distDataRootPath, 'user.json');
const routinesFilePath = path.resolve(dataRootPath, 'routines.json');
const distRoutinesFilePath = path.resolve(distDataRootPath, 'routines.json');
const feesFilePath = path.resolve(dataRootPath, 'fees.json');
const distFeesFilePath = path.resolve(distDataRootPath, 'fees.json');
const calendarFilePath = path.resolve(dataRootPath, 'calendar.json');
const distCalendarFilePath = path.resolve(distDataRootPath, 'calendar.json');
const downloadsFilePath = path.resolve(dataRootPath, 'downloads.json');
const distDownloadsFilePath = path.resolve(distDataRootPath, 'downloads.json');
const coursesFilePath = path.resolve(dataRootPath, 'courses.json');
const distCoursesFilePath = path.resolve(distDataRootPath, 'courses.json');
const pendingCoursesFilePath = path.resolve(dataRootPath, 'pending-courses.json');
const distPendingCoursesFilePath = path.resolve(distDataRootPath, 'pending-courses.json');
const resultsFilePath = path.resolve(dataRootPath, 'results.json');
const distResultsFilePath = path.resolve(distDataRootPath, 'results.json');
const marksFilePath = path.resolve(dataRootPath, 'marks.json');
const distMarksFilePath = path.resolve(distDataRootPath, 'marks.json');
const writeLocks = new Map();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(helmet());
app.use(cors(corsOptions));
app.use(requestLimiter);

function registerGet(pathSuffix, handler) {
  app.get(`${V1_API_PREFIX}${pathSuffix}`, handler);
  app.get(`${LEGACY_API_PREFIX}${pathSuffix}`, handler);
}

function registerPut(pathSuffix, ...handlers) {
  app.put(`${V1_API_PREFIX}${pathSuffix}`, requireWriteAuthorization, ...handlers);
  app.put(`${LEGACY_API_PREFIX}${pathSuffix}`, requireWriteAuthorization, ...handlers);
}

class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function createApiError(status, code, message, details = undefined) {
  return new ApiError(status, code, message, details);
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function withRouteError(status, code, message, handler) {
  return asyncRoute(async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw createApiError(status, code, message, error?.message);
    }
  });
}

function sendError(res, status, code, message, details = undefined) {
  return res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

function extractBearerToken(headerValue) {
  if (typeof headerValue !== 'string') {
    return '';
  }

  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  return match ? String(match[1] || '').trim() : '';
}

function requireWriteAuthorization(req, res, next) {
  const apiKeyHeader = String(req.get('x-api-key') || '').trim();
  const bearerToken = extractBearerToken(req.get('authorization'));
  const providedToken = apiKeyHeader || bearerToken;

  if (!providedToken || providedToken !== writeApiToken) {
    sendError(res, 401, 'WRITE_AUTH_REQUIRED', 'Valid write authentication is required.');
    return;
  }

  const providedScope = String(req.get('x-admin-scope') || '').trim();
  if (!providedScope || providedScope !== writeScope) {
    sendError(res, 403, 'WRITE_SCOPE_FORBIDDEN', 'Write scope is not authorized.');
    return;
  }

  next();
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  const tempFilePath = `${filePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await fs.writeFile(tempFilePath, payload, 'utf8');
  await fs.rename(tempFilePath, filePath);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function persistJson(primaryPath, distPath, data) {
  const lockKey = distPath ? `${primaryPath}|${distPath}` : primaryPath;
  const previous = writeLocks.get(lockKey) || Promise.resolve();
  const run = previous
    .catch(() => undefined)
    .then(async () => {
      await writeJson(primaryPath, data);
      if (!mirrorDistWrites || !distPath) {
        return;
      }

      if (await fileExists(distPath)) {
        await writeJson(distPath, data);
      }
    });

  writeLocks.set(lockKey, run);
  try {
    await run;
  } finally {
    if (writeLocks.get(lockKey) === run) {
      writeLocks.delete(lockKey);
    }
  }
}

async function readFromConfiguredSource(routeName, readFromDb, readFromJson) {
  if (readSourceMode === 'json') {
    return readFromJson();
  }

  if (readSourceMode === 'postgres') {
    return readFromDb();
  }

  try {
    return await readFromDb();
  } catch (error) {
    const fallbackMessage = `[read-fallback:${routeName}] PostgreSQL read failed in auto mode. Falling back to JSON source. ${String(error?.message || error)}\n`;
    process.stderr.write(fallbackMessage);
    return readFromJson();
  }
}

registerGet('/health', (_req, res) => {
  res.json({ ok: true, service: 'student-hub-api' });
});

registerGet(
  '/user',
  withRouteError(500, 'USER_READ_FAILED', 'Failed to read user profile data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'user',
      () => getUserPayload(),
      async () => {
        const sourcePath = (await fileExists(userFilePath)) ? userFilePath : distUserFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/user',
  validateUserPayload,
  withRouteError(500, 'USER_SAVE_FAILED', 'Failed to save user profile data', async (req, res) => {
    const incomingUser = req.body?.user;

    const nextData = { user: incomingUser };

    await persistJson(userFilePath, distUserFilePath, nextData);

    res.json(nextData);
  })
);

registerGet(
  '/routines',
  withRouteError(500, 'ROUTINES_READ_FAILED', 'Failed to read routines data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'routines',
      () => getRoutinesPayload(),
      async () => {
        const sourcePath = (await fileExists(routinesFilePath))
          ? routinesFilePath
          : distRoutinesFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/routines',
  validateRoutinesPayload,
  withRouteError(500, 'ROUTINES_SAVE_FAILED', 'Failed to save routines data', async (req, res) => {
    const incomingSemesters = req.body?.semesters;
    const incomingSemester = req.body?.semester;
    const incomingRoutine = req.body?.routine;

    let nextData;
    if (Array.isArray(incomingSemesters)) {
      const cleanedSemesters = incomingSemesters
        .map((entry) => ({
          semester: String(entry?.semester || '').trim(),
          routine: Array.isArray(entry?.routine) ? entry.routine : [],
        }))
        .filter((entry) => entry.semester);

      nextData = {
        semesters: cleanedSemesters,
      };
    } else if (typeof incomingSemester === 'string' && Array.isArray(incomingRoutine)) {
      nextData = {
        semester: incomingSemester,
        routine: incomingRoutine,
        semesters: [
          {
            semester: incomingSemester,
            routine: incomingRoutine,
          },
        ],
      };
    } else {
      throw createApiError(
        400,
        'ROUTINES_PAYLOAD_INVALID',
        'Invalid payload. Expected { semesters: [] } or { semester: string, routine: [] }'
      );
    }

    await persistJson(routinesFilePath, distRoutinesFilePath, nextData);

    res.json(nextData);
  })
);

registerGet(
  '/fees',
  withRouteError(500, 'FEES_READ_FAILED', 'Failed to read fees data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'fees',
      () => getFeesPayload(),
      async () => {
        const sourcePath = (await fileExists(feesFilePath)) ? feesFilePath : distFeesFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/fees',
  validateFeesPayload,
  withRouteError(500, 'FEES_SAVE_FAILED', 'Failed to save fees data', async (req, res) => {
    const incomingFees = req.body?.fees;

    const nextData = {
      fees: incomingFees,
    };

    await persistJson(feesFilePath, distFeesFilePath, nextData);

    res.json(nextData);
  })
);

registerGet(
  '/calendar',
  withRouteError(500, 'CALENDAR_READ_FAILED', 'Failed to read calendar data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'calendar',
      () => getCalendarPayload(),
      async () => {
        const sourcePath = (await fileExists(calendarFilePath))
          ? calendarFilePath
          : distCalendarFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/calendar',
  validateCalendarPayload,
  withRouteError(500, 'CALENDAR_SAVE_FAILED', 'Failed to save calendar data', async (req, res) => {
    const incomingEvents = req.body?.events;

    const nextData = {
      events: incomingEvents,
    };

    await persistJson(calendarFilePath, distCalendarFilePath, nextData);

    res.json(nextData);
  })
);

registerGet(
  '/downloads',
  withRouteError(
    500,
    'DOWNLOADS_READ_FAILED',
    'Failed to read downloads data',
    async (_req, res) => {
      const payload = await readFromConfiguredSource(
        'downloads',
        () => getDownloadsPayload(),
        async () => {
          const sourcePath = (await fileExists(downloadsFilePath))
            ? downloadsFilePath
            : distDownloadsFilePath;
          return readJson(sourcePath);
        }
      );
      res.json(payload);
    }
  )
);

registerPut(
  '/downloads',
  validateDownloadsPayload,
  withRouteError(
    500,
    'DOWNLOADS_SAVE_FAILED',
    'Failed to save downloads data',
    async (req, res) => {
      const incomingDownloads = req.body?.downloads;

      const nextData = {
        downloads: incomingDownloads,
      };

      await persistJson(downloadsFilePath, distDownloadsFilePath, nextData);

      res.json(nextData);
    }
  )
);

registerGet(
  '/courses',
  withRouteError(500, 'COURSES_READ_FAILED', 'Failed to read courses data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'courses',
      () => getCoursesPayload(),
      async () => {
        const sourcePath = (await fileExists(coursesFilePath))
          ? coursesFilePath
          : distCoursesFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/courses',
  validateCoursesPayload,
  withRouteError(500, 'COURSES_SAVE_FAILED', 'Failed to save courses data', async (req, res) => {
    const incomingCourses = req.body?.courses;

    const courseNameMap = incomingCourses.reduce((acc, course) => {
      const code = String(course?.code || '').trim();
      const name = String(course?.name || '').trim();
      if (code && name) {
        acc[code] = name;
      }
      return acc;
    }, {});

    const nextData = {
      courseNameMap,
      courses: incomingCourses,
    };

    await persistJson(coursesFilePath, distCoursesFilePath, nextData);

    res.json(nextData);
  })
);

registerGet(
  '/pending-courses',
  withRouteError(
    500,
    'PENDING_COURSES_READ_FAILED',
    'Failed to read pending courses data',
    async (_req, res) => {
      const payload = await readFromConfiguredSource(
        'pending-courses',
        () => getPendingCoursesPayload(),
        async () => {
          const sourcePath = (await fileExists(pendingCoursesFilePath))
            ? pendingCoursesFilePath
            : distPendingCoursesFilePath;
          return readJson(sourcePath);
        }
      );
      res.json(payload);
    }
  )
);

registerPut(
  '/pending-courses',
  validatePendingCoursesPayload,
  withRouteError(
    500,
    'PENDING_COURSES_SAVE_FAILED',
    'Failed to save pending courses data',
    async (req, res) => {
      const incomingPendingCourses = req.body?.pendingCourses;

      const nextData = {
        pendingCourses: incomingPendingCourses,
      };

      await persistJson(pendingCoursesFilePath, distPendingCoursesFilePath, nextData);

      res.json(nextData);
    }
  )
);

registerGet(
  '/results',
  withRouteError(500, 'RESULTS_READ_FAILED', 'Failed to read results data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'results',
      () => getResultsPayload(),
      async () => {
        const sourcePath = (await fileExists(resultsFilePath))
          ? resultsFilePath
          : distResultsFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/results',
  validateResultsPayload,
  withRouteError(500, 'RESULTS_SAVE_FAILED', 'Failed to save results data', async (req, res) => {
    const incomingResults = req.body?.results;

    const nextData = {
      results: incomingResults,
    };

    await persistJson(resultsFilePath, distResultsFilePath, nextData);

    res.json(nextData);
  })
);

registerGet(
  '/marks',
  withRouteError(500, 'MARKS_READ_FAILED', 'Failed to read marks data', async (_req, res) => {
    const payload = await readFromConfiguredSource(
      'marks',
      () => getMarksPayload(),
      async () => {
        const sourcePath = (await fileExists(marksFilePath)) ? marksFilePath : distMarksFilePath;
        return readJson(sourcePath);
      }
    );
    res.json(payload);
  })
);

registerPut(
  '/marks',
  validateMarksPayload,
  withRouteError(500, 'MARKS_SAVE_FAILED', 'Failed to save marks data', async (req, res) => {
    const incomingSemesters = req.body?.semesters;

    const nextData = {
      semesters: incomingSemesters,
    };

    await persistJson(marksFilePath, distMarksFilePath, nextData);

    res.json(nextData);
  })
);

app.use((err, _req, res, next) => {
  void next;
  if (res.headersSent) {
    return;
  }

  if (err instanceof ApiError || err instanceof RequestValidationError) {
    sendError(res, err.status, err.code, err.message, err.details);
    return;
  }

  if (Number.isInteger(err?.status) && typeof err?.code === 'string') {
    sendError(res, err.status, err.code, err.message, err.details);
    return;
  }

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error', err?.message);
});

export { app };

export function startServer() {
  return app.listen(port, () => {
    console.log(`Student Hub API running on http://localhost:${port}`);
  });
}

if (process.argv[1] === serverFilePath) {
  startServer();
}
