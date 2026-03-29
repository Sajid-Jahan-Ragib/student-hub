# Phase 0 Baseline Evidence

Date: 2026-04-04
Scope: Baseline capture for auth behavior, write security behavior, fallback behavior, routing stability, and release gates.

## 1) Auth Behavior Baseline

Current observed baseline:

- Admin rendering is protected in app flow by auth state and route condition.
- Login form is the gate for admin route access when unauthenticated.
- Credentials are currently validated by existing auth logic before full backend-session migration.

Baseline evidence references:

- src/context/AuthContext.jsx
- src/components/Login/LoginForm.jsx
- src/App.jsx

## 2) Write Authorization Baseline

Current observed baseline:

- Mutation routes require write authorization checks.
- API write-security tests pass and confirm unauthorized requests are blocked.

Automated evidence:

- Test file: tests/api-write-security.test.js
- Result: passed (4/4)

## 3) Fallback Behavior Baseline

Current observed baseline:

- In auto mode, write paths fall back from PostgreSQL to JSON when DB is unreachable.
- During tests, fallback logs were emitted repeatedly for fees writes due to DB at 127.0.0.1:18789 not reachable.

Observed runtime signal:

- [write-fallback:fees] PostgreSQL write failed in auto mode. Falling back to JSON source.

Risk note:

- Fallback works, but repeated fallback should be treated as an operational alert condition.

## 4) Routing Stability Baseline

Current observed baseline:

- Core route and admin route tests pass.
- Existing bug matrix already tracks browser back/navigation jitter scenarios for regression closure.

Automated evidence:

- tests/navigation-routes.test.js: passed
- tests/admin-routes.test.js: passed
- tests/phase1-router-verification.test.js: passed (30/30)

Related tracking:

- docs/BUG_REPRO_MATRIX.md

## 5) Release Gate Baseline

Gate command execution results:

- npm run lint: pass (warnings present, no errors)
- npm run build: pass
- Core route tests: pass
- API write-security tests: pass
- Data consistency tests: pass

Warnings captured during lint:

- server/index.js: no-console warning
- src/components/Admin/Admin.jsx: react-hooks/exhaustive-deps warnings (3)

Consolidated test result:

- 5 test files passed, 57 tests passed.

## 6) Acceptance Criteria Locked For Next Phases

Security acceptance criteria:

- Backend auth becomes authoritative for admin access.
- Unauthorized writes are denied consistently across mutation routes.
- Payload validation rejects unsafe/malformed inputs with safe error responses.
- Fallback events are visible and auditable.

Regression acceptance criteria:

- Back-button and deep-link behavior remain stable.
- Save/update behavior remains consistent under normal and concurrent usage.
- Mobile login flow and home-return behavior remain functional.

## 7) Phase 0 Conclusion

Phase 0 baseline and gate setup are complete.

Next phase:

- Phase 1: backend session authentication execution.
