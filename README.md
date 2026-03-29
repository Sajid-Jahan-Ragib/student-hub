# BUBT Student Hub

A modern, full-stack student portal for BUBT (Bangladesh University of Business and Technology), built with React + Vite on the frontend and an Express.js API server on the backend.

**Current Status**: Production-ready — All phases complete, 128/128 tests passing.

---

## Project Structure

```
BUBT Annex/
├── README.md                        ← This file
├── index.html                       ← Legacy reference (frozen)
├── script.js                        ← Legacy reference (frozen)
├── styles.css                       ← Legacy reference (frozen)
├── components/                      ← Legacy reference (frozen)
└── student-hub/                     ← Active application
    ├── server/                      ← Express.js API server
    │   ├── index.js                 ← Main server entry point
    │   ├── repositories/            ← Data access layer (JSON + Prisma)
    │   │   ├── academicReadRepository.js
    │   │   ├── academicWriteRepository.js
    │   │   ├── prismaClient.js
    │   │   └── sharedNormalization.js
    │   ├── validation/
    │   │   └── requestValidators.js ← Input validation & payload size checks
    │   └── concurrency/
    │       └── versioningControl.js ← Optimistic concurrency & conflict detection
    ├── src/                         ← React frontend
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── context/AppContext.jsx   ← Global state
    │   ├── hooks/                   ← Custom React hooks
    │   ├── utils/                   ← Date and data utilities
    │   └── components/
    │       ├── Admin/               ← Admin panel (modular subcomponents)
    │       ├── Attendance/
    │       ├── Calendar/
    │       ├── Common/
    │       ├── Courses/
    │       ├── Dashboard/
    │       ├── Downloads/
    │       ├── Fees/
    │       ├── Login/
    │       ├── Modals/
    │       ├── Navigation/
    │       ├── Profile/
    │       ├── Results/
    │       └── Routines/
    ├── public/data/                 ← JSON data files (11 total)
    ├── db/                          ← Prisma schema and migrations
    ├── scripts/                     ← DB import, verify, and health scripts
    ├── tests/                       ← 10 test files, 128 tests
    ├── docs/                        ← Security checklists and runbooks
    ├── docker-compose.yml           ← Local PostgreSQL setup
    ├── .env.example                 ← Required environment variables
    ├── vite.config.js
    ├── vitest.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Tech Stack

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Frontend     | React 18.2, Vite 5, Tailwind CSS 3, React Router 6 |
| Backend      | Express.js 4, Helmet, express-rate-limit, CORS      |
| Database     | PostgreSQL (Prisma ORM) with JSON file fallback     |
| Auth         | Session-based (server-side cookie) + legacy token   |
| Testing      | Vitest, Supertest                                   |
| Code quality | ESLint, Prettier, Husky, lint-staged                |
| Dev tooling  | concurrently (runs frontend + backend together)     |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
cd student-hub
npm install
```

### Configure environment

```bash
cp .env.example .env
# Edit .env and fill in required values (see Environment Variables below)
```

### Run in development mode

```bash
npm run dev
```

This starts both the Vite dev server (frontend) and the Express API server concurrently.

- Frontend: `http://localhost:5173`
- API server: `http://localhost:3000`

### Build for production

```bash
npm run build
npm run preview
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                     | Required | Description                                          |
|------------------------------|----------|------------------------------------------------------|
| `ADMIN_LOGIN_EMAIL`          | Yes      | Admin login email                                    |
| `ADMIN_LOGIN_PASSWORD`       | Yes      | Admin login password                                 |
| `WRITE_API_TOKEN`            | Yes      | API token for write operations                       |
| `WRITE_SCOPE`                | Yes      | Required scope value (e.g. `student-hub-admin`)      |
| `DATABASE_URL`               | Yes      | PostgreSQL connection string                         |
| `DIRECT_URL`                 | Yes      | Direct PostgreSQL URL (for Prisma)                   |
| `PORT`                       | No       | Server port (default: `3000`)                        |
| `DATA_ROOT`                  | No       | Path to JSON data directory (default: `public/data`) |
| `READ_SOURCE_MODE`           | No       | `auto`, `json`, or `postgres` (default: `auto`)      |
| `WRITE_SOURCE_MODE`          | No       | `auto`, `json`, or `postgres` (default: `auto`)      |
| `MIRROR_DIST_WRITES`         | No       | Mirror writes to dist directory (`true`/`false`)     |
| `ALLOW_LEGACY_WRITE_TOKEN_AUTH` | No    | Enable token-based auth fallback (default: `false`)  |
| `ADMIN_SESSION_TTL_MS`       | No       | Session TTL in ms (default: `28800000` = 8 hours)    |
| `REQUEST_TIMEOUT_MS`         | No       | Per-request timeout in ms (default: `30000`)         |
| `FALLBACK_ALERT_THRESHOLD`   | No       | Fallback events before alert is emitted (default: 5) |
| `FALLBACK_ALERT_WINDOW_MS`   | No       | Window for fallback alert counting (default: 300000) |

---

## Data Files

Stored in `public/data/` (JSON). Served read-only to the frontend; writable via admin API.

| File                  | Description                       |
|-----------------------|-----------------------------------|
| `user.json`           | Student profile                   |
| `results.json`        | Academic results, SGPA/CGPA       |
| `fees.json`           | Semester fees and payment status  |
| `courses.json`        | All course catalog                |
| `routines.json`       | Class schedule (semester-grouped) |
| `calendar.json`       | Academic calendar events          |
| `attendance.json`     | Per-course attendance records     |
| `downloads.json`      | Downloadable documents/resources  |
| `present-courses.json`| Currently enrolled courses        |
| `pending-courses.json`| Retake/pending courses            |
| `marks.json`          | Semester-wise subject marks       |

---

## API Endpoints

### Read (public)

| Method | Route               | Description                |
|--------|---------------------|----------------------------|
| GET    | `/api/v1/user`      | Student profile            |
| GET    | `/api/v1/results`   | Academic results           |
| GET    | `/api/v1/fees`      | Fees summary               |
| GET    | `/api/v1/courses`   | Course catalog             |
| GET    | `/api/v1/routines`  | Class routines             |
| GET    | `/api/v1/calendar`  | Calendar events            |
| GET    | `/api/v1/attendance`| Attendance records         |
| GET    | `/api/v1/downloads` | Downloads list             |
| GET    | `/api/v1/marks`     | Marks per subject          |

### Write (admin auth required)

| Method | Route               | Description                |
|--------|---------------------|----------------------------|
| PUT    | `/api/v1/user`      | Update profile             |
| PUT    | `/api/v1/results`   | Update results             |
| PUT    | `/api/v1/fees`      | Update fees                |
| PUT    | `/api/v1/courses`   | Update course catalog      |
| PUT    | `/api/v1/routines`  | Update routines            |
| PUT    | `/api/v1/calendar`  | Update calendar            |
| PUT    | `/api/v1/downloads` | Update downloads           |
| PUT    | `/api/v1/marks`     | Update marks               |

### Auth

| Method | Route                   | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/api/v1/auth/login`    | Admin login (sets cookie)|
| POST   | `/api/v1/auth/logout`   | Admin logout             |
| GET    | `/api/v1/auth/session`  | Check session status     |

### Health

| Method | Route             | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/health`         | Legacy health check                      |
| GET    | `/health/live`    | Liveness probe (always 200 if process up)|
| GET    | `/health/ready`   | Readiness probe (checks data + DB access)|

---

## Read Responses

All GET endpoints include version metadata:

```json
{
  "user": { ... },
  "_version": 5,
  "_lastModified": "2026-03-29T10:00:00.000Z"
}
```

---

## Optimistic Concurrency

Write requests can include `_version` to enable conflict detection:

```json
{
  "_version": 5,
  "user": { "name": "Updated Name" }
}
```

If the stored version has moved past `_version`, the server returns:

```json
HTTP 409 Conflict
{ "error": { "code": "ENTITY_VERSION_CONFLICT" } }
```

Omitting `_version` skips conflict checking (backward compatible).

---

## Database Setup (Optional)

The server runs in JSON-only mode by default (`READ_SOURCE_MODE=json`, `WRITE_SOURCE_MODE=json`). To use PostgreSQL:

```bash
# Start local Postgres via Docker
npm run db:up

# Run migrations
npm run db:migrate:dev

# Generate Prisma client
npm run db:generate

# Import existing JSON data into Postgres
npm run db:import

# Verify parity between JSON and Postgres
npm run db:verify
```

Set `READ_SOURCE_MODE=auto` or `WRITE_SOURCE_MODE=auto` to enable automatic fallback (tries Postgres, falls back to JSON on failure).

---

## Testing

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch
```

**Test suite**: 128 tests across 10 files, all passing.

| Test file                              | Coverage area                              |
|----------------------------------------|--------------------------------------------|
| `navigation-routes.test.js`            | Route normalization utilities              |
| `phase1-router-verification.test.js`   | Frontend routing stability                 |
| `write-auth-consistency.test.js`       | Write authorization middleware             |
| `api-write-security.test.js`           | Security and concurrent write safety       |
| `admin-routes.test.js`                 | Admin panel routing                        |
| `admin-navigation.test.js`             | Admin deep-link navigation                 |
| `data-integrity-verification.test.js`  | Data shape and field integrity             |
| `phase2-validation-hardening.test.js`  | Input validation and payload limits        |
| `phase3-concurrency.test.js`           | Version tracking and conflict detection    |
| `phase5-security-qa.test.js`           | End-to-end security regression (38 tests)  |

---

## Security Features

- Session-based admin authentication with configurable TTL
- All write routes require valid session or scoped API token
- Helmet HTTP security headers
- express-rate-limit on authentication routes
- Input validation: URL protocol checks (http/https only), payload size limit (1 MB), array length limits
- Optimistic concurrency control (409 conflict on stale writes)
- Structured audit logging for all auth denials and validation failures
- Safe error responses (no internal paths or DB connection strings leaked)
- No hardcoded credentials in server code

---

## Logging

The server emits structured JSON logs to stdout/stderr. Each line is a JSON object:

```json
{ "ts": "2026-03-29T10:00:00.000Z", "level": "info", "event": "http_request", "requestId": "abc123", "method": "GET", "path": "/api/v1/user", "status": 200, "durationMs": 12 }
```

Key event types: `server_startup`, `server_ready`, `http_request`, `auth_denied`, `request_timeout`, `fallback_event`, `fallback_alert`.

See `docs/OPERATIONS_RUNBOOK.md` for the full log reference and failure triage guide.

---

## Code Quality

```bash
npm run lint          # Lint check
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting only
```

Pre-commit hooks (Husky + lint-staged) run lint and format automatically on staged files.

---

## Documentation

| File                                              | Description                              |
|---------------------------------------------------|------------------------------------------|
| `docs/OPERATIONS_RUNBOOK.md`                      | Failure triage, log reference, deployment checklist |
| `docs/SECURITY_EXECUTION_MASTER_CHECKLIST.md`     | Security phase progress (Phases 0–5)     |
| `docs/FEATURE_PARITY_CHECKLIST.md`                | Legacy-to-React feature mapping          |
| `docs/API_VERSIONING_AND_CONTRACT.md`             | API contract and versioning rules        |
| `docs/RELEASE_CHECKLIST.md`                       | Pre-release sign-off checklist           |
| `UI_UX_MODERNIZATION_MASTER_PLAN.md`              | 10-phase UI modernization plan (complete)|

---

## Legacy Reference

Files at the workspace root (`index.html`, `script.js`, `styles.css`, `components/`) are the original static implementation. They are **frozen** — kept for feature parity reference and rollback only. All new development happens inside `student-hub/`.

---

**Last updated**: 2026-03-29
# student-hub
