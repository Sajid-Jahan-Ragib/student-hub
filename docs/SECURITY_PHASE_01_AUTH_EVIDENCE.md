# Phase 1 Authentication Evidence

Date: 2026-04-04
Scope: Backend session authentication rollout and frontend integration.

## Implemented Changes

Backend:

- Added login endpoint: POST /api/v1/admin/login (+ /api/admin/login alias)
- Added logout endpoint: POST /api/v1/admin/logout (+ /api/admin/logout alias)
- Added auth status endpoint: GET /api/v1/admin/auth-status (+ /api/admin/auth-status alias)
- Added in-memory admin session store with HttpOnly cookie handling.
- Added auth login rate limiter for login endpoint.
- Updated write authorization middleware to allow authenticated session-based writes while preserving token/scope compatibility.

Frontend:

- AuthContext now uses backend auth endpoints for login/logout/status checks.
- Removed browser-side credential validation and sessionStorage auth persistence.
- Login form submit flow updated to async backend auth.
- App loading now includes auth loading state to avoid guard flicker.
- Write request helper updated to send credentialed requests.
- UserContext and AcademicContext write calls updated to use credentialed write init.

## Validation Results

Build:

- npm run build: passed

Targeted regression tests:

- tests/api-write-security.test.js: passed
- tests/navigation-routes.test.js: passed
- tests/admin-routes.test.js: passed

Auth flow verification (runtime):

- Invalid login returns 401 AUTH_INVALID_CREDENTIALS.
- Valid login returns authenticated true and user payload.
- auth-status after login returns authenticated true.
- logout returns authenticated false.
- auth-status after logout returns authenticated false.
- write after logout returns 401 WRITE_AUTH_REQUIRED.

## Notes

- PostgreSQL was unreachable during tests at 127.0.0.1:18789, and write fallback to JSON was observed as expected in auto mode.
- Route/back behavior and mobile login UI were preserved during this phase.
