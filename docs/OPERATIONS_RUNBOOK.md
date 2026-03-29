# Operations Runbook

**Project**: Student Hub API
**Version**: 1.0
**Date**: 2026-03-29

---

## 1. Local Secret Management

### Required Secrets

The server will not start without these environment variables set:

| Variable               | Purpose               | Rotation Frequency         |
| ---------------------- | --------------------- | -------------------------- |
| `ADMIN_LOGIN_EMAIL`    | Admin login username  | When user leaves           |
| `ADMIN_LOGIN_PASSWORD` | Admin login password  | Every 90 days              |
| `DATABASE_URL`         | Primary DB connection | When DB credentials rotate |

### How to Set Secrets

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in **all** required values — never use example placeholders in `.env`.
3. `.env` is in `.gitignore` and must never be committed.

### Verifying Secrets Are Set

```bash
# Confirm env vars are present before starting
node -e "['ADMIN_LOGIN_EMAIL','ADMIN_LOGIN_PASSWORD'].forEach(k => { if (!process.env[k]) { console.error('Missing: ' + k); process.exit(1); } })"
```

---

## 2. Token and Session Rotation

### Admin Session Rotation

Sessions are in-memory with a configurable TTL (`ADMIN_SESSION_TTL_MS`, default 8 hours). Sessions are invalidated automatically on server restart.

To force all sessions to expire:

```bash
# Restart the server — all in-memory sessions are cleared
npm run start:server
```

### Legacy Token Rotation (`WRITE_API_TOKEN`)

1. Generate a new token:
   ```bash
   node -e "const c = require('crypto'); console.log(c.randomBytes(32).toString('hex'))"
   ```
2. Update `WRITE_API_TOKEN` in `.env` on the server.
3. Update `VITE_WRITE_API_TOKEN` in any client `.env`.
4. Restart the server.
5. Verify writes still work via the admin panel.

> Recommendation: keep `ALLOW_LEGACY_WRITE_TOKEN_AUTH=false` in production. Use session auth only.

### Admin Password Rotation

1. Generate a strong password (20+ characters, mixed case, symbols, digits).
2. Update `ADMIN_LOGIN_PASSWORD` in `.env`.
3. Restart the server.
4. Log in at `/admin` with the new password to verify.

---

## 3. Failure Triage Workflow

### Auth Failures

**Symptom**: `401 WRITE_AUTH_REQUIRED` or `403 WRITE_SCOPE_FORBIDDEN` on write requests.

**Diagnosis**:

```bash
# Look for auth_denied events in structured logs
grep '"event":"auth_denied"' server.log
```

**Common causes**:

- Session expired → log in again at `/admin`
- Token mismatch → verify `WRITE_API_TOKEN` in `.env` matches what the client sends
- Scope mismatch → verify `WRITE_SCOPE` matches `x-admin-scope` header value

---

### Validation Failures

**Symptom**: `400` errors on write requests, error code starting with a resource name (e.g. `DOWNLOADS_PAYLOAD_TOO_LARGE`).

**Diagnosis**:

```bash
# Look for VALIDATION: events in structured logs
grep '\[VALIDATION:' server.log
```

**Common causes**:

- Array exceeds length limit → trim the payload
- Invalid URL protocol → only `http://` and `https://` are accepted
- Payload exceeds 1MB → split the request

---

### Fallback Activations

**Symptom**: `[fallback-event]` or `[fallback-alert]` lines in logs; data is being served from JSON files instead of Postgres.

**Diagnosis**:

```bash
grep 'fallback-event\|fallback-alert' server.log | tail -20
```

**Steps**:

1. Check DB connectivity: `npm run db:check:local`
2. If DB is down, JSON fallback keeps the app running — no immediate action needed.
3. When DB is restored, restart the server in `auto` mode and verify reads come from DB again.
4. If alerts are frequent (threshold exceeded), check the DB host and network.

---

### Readiness / Liveness Check Failures

**Liveness** (`GET /api/v1/health/live`):

- Always returns `200` if the process is running.
- If it fails, the process has crashed — restart the server.

**Readiness** (`GET /api/v1/health/ready`):

- Returns `503` if data root is not accessible or DB is required but unreachable.
- Check `checks` object in the response body for details.

```bash
curl http://localhost:3001/api/v1/health/ready | jq .
```

---

### Request Timeout

**Symptom**: `503 REQUEST_TIMEOUT` error from the API.

**Cause**: A request took longer than `REQUEST_TIMEOUT_MS` (default 30 seconds).

**Steps**:

1. Check server logs for `request_timeout` events.
2. Identify the slow route (field: `path`).
3. Check DB query performance or I/O bottleneck.
4. Temporarily increase `REQUEST_TIMEOUT_MS` if needed during maintenance.

---

## 4. Log Reference

All structured logs are JSON objects on stdout/stderr with these fields:

| Field       | Description                         |
| ----------- | ----------------------------------- |
| `ts`        | ISO 8601 timestamp                  |
| `level`     | `info`, `warn`, `error`             |
| `event`     | Event type (see below)              |
| `requestId` | Correlation ID for the HTTP request |

### Event Types

| Event                  | Level | Description                                                |
| ---------------------- | ----- | ---------------------------------------------------------- |
| `http_request`         | info  | Completed HTTP request with method, path, status, duration |
| `auth_denied`          | warn  | Write request rejected at auth layer                       |
| `request_timeout`      | warn  | Request exceeded `REQUEST_TIMEOUT_MS`                      |
| `server_startup`       | info  | Server config emitted at startup                           |
| `server_ready`         | info  | Server listening and ready                                 |
| `startup_config_error` | error | Missing required env vars — server will exit               |

Fallback events are written in legacy format to stderr:

- `[fallback-event]` — single fallback occurrence
- `[fallback-alert]` — threshold exceeded within alert window

---

## 5. Checklist Before Deployment

- [ ] `.env` has real values for `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD`
- [ ] `ALLOW_LEGACY_WRITE_TOKEN_AUTH` is `false` in production
- [ ] `DATABASE_URL` points to the production database
- [ ] `ALLOWED_ORIGINS` lists only the production frontend origin
- [ ] `NODE_ENV=production` is set (enables Secure cookie flag)
- [ ] Run `npm run build` — confirm zero errors
- [ ] Run `npm run test` — confirm all tests pass
- [ ] Hit `GET /api/v1/health/ready` after deploy — confirm `ok: true`
