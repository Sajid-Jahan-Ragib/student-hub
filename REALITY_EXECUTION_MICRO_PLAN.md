# Student Hub Reality Execution Micro Plan

## 1) Purpose

This document is the single execution context for building and improving the Student Hub to production quality.

Goals:

- Consolidate delivery into one React app
- Replace JSON file persistence with PostgreSQL
- Add validation, testing, CI/CD, security, and release safety
- Keep the application working throughout the migration

Success definition:

- Feature parity achieved with legacy reference
- API stable and versioned
- PostgreSQL is the source of truth
- Automated quality gates pass on every pull request
- Release and rollback process is repeatable

## 2) Execution Rules (Non-Negotiable)

1. Never break production behavior while refactoring.
2. Every backend write endpoint must have schema validation.
3. No database switch without migration verification report.
4. Every phase closes only when its exit criteria are met.
5. Keep commits small and single-purpose.
6. Use feature flags when risk is medium or high.
7. Update this file after finishing each step.

## 3) Project Scope and Boundaries

In scope:

- React-only feature delivery in student-hub
- Express API hardening
- Self-hosted PostgreSQL migration
- Testing stack and CI/CD pipeline
- Security baseline and operations readiness

Out of scope for now:

- Full visual redesign
- Microservices split
- Native mobile app

## 4) Working Structure

- Frontend app: student-hub/src
- Backend app: student-hub/server
- Legacy reference only: index.html, script.js, components
- Current data source to migrate: student-hub/public/data

## 5) Step Tracking Template

Use this template for each micro-step implementation note.

- Step ID:
- Owner:
- Start Date:
- End Date:
- Dependency:
- Risk Level: Low or Medium or High
- Files touched:
- Commands used:
- Validation evidence:
- Rollback action:
- Status: Not Started or In Progress or Done or Blocked

## 5.1) Phase 0 Implementation Status (Live)

- P0.1 Create a dedicated migration branch: Done
  - Evidence: initialized git in student-hub and created branch modernization/reality-execution.
- P0.2 Freeze legacy app as reference-only: Done
  - Evidence: root README updated with legacy freeze notice and active path guidance.
- P0.3 Build feature parity checklist: Done
  - Evidence: created student-hub/docs/FEATURE_PARITY_CHECKLIST.md.
- P0.4 Create risk register with ownership: Done
  - Evidence: risk owners added in section 15.

## 5.2) Phase 1 Implementation Status (Live)

- P1.1 Add linting and formatting standards: Done
  - Evidence: added .eslintrc.cjs, .eslintignore, .prettierrc.json, .prettierignore and updated package scripts.
  - Validation: npm run lint completed with warnings only; npm run format:check passed.
- P1.2 Add pre-commit quality checks: Done
  - Evidence: added lint-staged config in package.json and created .husky/pre-commit.
  - Validation: npm run prepare completed successfully after git initialization.
- P1.3 Introduce environment variable contract: Done
  - Evidence: created .env.example and wired env usage in vite.config.js and server/index.js.
  - Validation: npm run build passed with env-aware config.
- P1.4 Add baseline error boundaries in frontend: Done
  - Evidence: created src/components/Common/ErrorBoundary.jsx and wrapped app in src/main.jsx.

## 5.3) Phase 2 Implementation Status (Live)

- P2.1 Replace screen-state switching with route-based navigation: Done
  - Evidence: added BrowserRouter in src/main.jsx and added URL<->screen sync in src/App.jsx.
  - Evidence: route migration map created at docs/ROUTE_MIGRATION_MAP.md.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P2.2 Split global context into domain contexts: Done
  - Evidence: created src/context/UIContext.jsx, src/context/UserContext.jsx, src/context/AcademicContext.jsx.
  - Evidence: converted src/context/AppContext.jsx into composed provider and updated src/hooks/useAppContext.js compatibility layer.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P2.3 Refactor admin module into smaller units: Done
  - Evidence: extracted large constants into src/components/Admin/adminConstants.js.
  - Evidence: extracted reusable parsing/sorting helpers into src/components/Admin/adminUtils.js.
  - Evidence: simplified src/components/Admin/Admin.jsx by importing shared modules.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P2.4 Add schema-based form validation: Done
  - Evidence: added validation module at src/components/Admin/adminValidation.js.
  - Evidence: wired validation checks into profile, routines, fees, calendar, downloads, courses, pending courses, and marks save/JSON flows in src/components/Admin/Admin.jsx.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P2.5 Performance quick wins: Done
  - Evidence: App now uses narrower domain contexts (UI and User) instead of merged app context in src/App.jsx.
  - Evidence: memoized navigation components in src/components/Navigation/Hero.jsx and src/components/Navigation/SideMenu.jsx.
  - Evidence: memoized provider values in src/context/UIContext.jsx and src/context/UserContext.jsx.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.

## 5.4) Phase 3 Implementation Status (Live)

- P3.1 Introduce API version namespace and response contract: Done
  - Evidence: backend routes now register both /api/v1/_ and legacy /api/_ aliases in server/index.js.
  - Evidence: standardized error response helper introduced in server/index.js with { ok: false, error: { code, message, details? } } shape.
  - Evidence: frontend write calls switched to /api/v1/\* in src/context/UserContext.jsx and src/context/AcademicContext.jsx.
  - Evidence: API contract note created at docs/API_VERSIONING_AND_CONTRACT.md.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P3.2 Add centralized backend error middleware: Done
  - Evidence: introduced shared ApiError type and createApiError helper in server/index.js.
  - Evidence: added asyncRoute and withRouteError wrappers to remove repetitive route-level try/catch blocks in server/index.js.
  - Evidence: added centralized Express error middleware that emits standardized error envelopes for known and unknown failures.
  - Validation: npm run lint (warnings only), npm run build passed.
- P3.3 Add request validation per write endpoint: Done
  - Evidence: added endpoint-level validators in server/validation/requestValidators.js.
  - Evidence: all PUT routes now run endpoint-specific validation middleware before persistence handlers in server/index.js.
  - Evidence: centralized error middleware now preserves structured 400 validation responses for known validation failures.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P3.4 Add security baseline middleware: Done
  - Evidence: added Helmet, CORS allowlist, and rate limiting middleware in server/index.js.
  - Evidence: added urlencoded request size limit and env-driven security controls for origins and rate-limiter thresholds.
  - Evidence: documented ALLOWED_ORIGINS, RATE_LIMIT_WINDOW_MS, and RATE_LIMIT_MAX in .env.example.
  - Validation: npm run lint (warnings only), npm run format:check passed, npm run build passed.

## 5.5) Phase 4 Implementation Status (Live)

- P4.1 Choose DB access strategy and create schema migration project: Done
  - Evidence: selected Prisma ORM and documented strategy in db/README.md.
  - Evidence: created PostgreSQL schema covering user, courses, marks, results, routines, fees, calendar, downloads, attendance, pending courses, and present courses in db/prisma/schema.prisma.
  - Evidence: created initial SQL migration baseline with tables, constraints, indexes, and enums in db/prisma/migrations/0001_init/migration.sql.
  - Evidence: added Prisma workflow scripts in package.json and DATABASE_URL contract in .env.example.
  - Validation: npm run db:format passed, npm run lint (warnings only), npm run format:check passed, npm run build passed.
- P4.2 Add local and staging PostgreSQL environments: Blocked
  - Evidence: added local PostgreSQL runtime config in docker-compose.yml.
  - Evidence: added staging env template in .env.staging.example and STAGING_DATABASE_URL contract in .env.example.
  - Evidence: added db lifecycle and connectivity scripts in package.json and scripts/check-db-connection.mjs (including local/staging/tunnel targets).
  - Validation: npm run db:generate passed, npm run lint (warnings only), npm run format:check passed, npm run build passed.
  - Validation: npm run db:check:tunnel executed with configured TUNNEL_DATABASE_URL and failed with explicit connection error (`Can't reach database server at 127.0.0.1:18789`).
  - Validation: tested SSH forwarding to remote `127.0.0.1:5432` and confirmed upstream refusal (`channel ... connect failed: Connection refused`); tested forwarding to remote `127.0.0.1:18789` and confirmed local listener is open but Prisma still cannot reach a PostgreSQL server over that endpoint.
  - Validation: remote probe confirmed `127.0.0.1:18789` serves OpenClaw Control HTML (HTTP) via `openclaw-gateway`, and remote host has no running PostgreSQL process/container/service.
  - Blocker: Docker CLI is not installed on this machine (`docker: command not found`) and no confirmed reachable remote PostgreSQL socket is available through current tunnel targets, so runtime connection verification remains blocked.
- P4.3 Build JSON-to-PostgreSQL import scripts: Done
  - Evidence: added scripts/import-json-to-postgres.mjs with --dry-run and apply modes to import data from public/data into PostgreSQL.
  - Evidence: importer applies a replace-in-transaction strategy to support idempotent reruns without duplicate accumulation.
  - Evidence: added db:import:dry and db:import scripts in package.json and documented usage in db/README.md.
  - Evidence: removed dotenv dependency from DB utility scripts by adding native .env loading logic.
  - Validation: npm run db:import:dry passed and produced full dataset summary; npm run lint completed with warnings only.
- P4.4 Data verification report: Blocked
  - Evidence: added verification script at scripts/verify-json-vs-postgres.mjs to compare JSON expected counts/samples against PostgreSQL.
  - Evidence: added npm scripts db:verify:json, db:verify, db:verify:staging, and db:verify:tunnel, and documented report workflow in db/README.md.
  - Evidence: generated verification artifact at docs/DATA_VERIFICATION_REPORT.md.
  - Validation: npm run db:verify:json passed; npm run db:verify and npm run db:verify:tunnel executed and produced blocked reports due DB unavailability; npm run lint completed with warnings only.
  - Blocker: no confirmed reachable PostgreSQL target is currently available at runtime through tested tunnel paths (`127.0.0.1:5432` refused on remote host and `127.0.0.1:18789` is OpenClaw HTTP, not PostgreSQL), and local PostgreSQL runtime remains unavailable until Docker is installed/configured on this machine.
- P4.5 Switch backend reads to PostgreSQL: Done
  - Evidence: added Prisma-backed read repository modules at server/repositories/prismaClient.js and server/repositories/academicReadRepository.js.
  - Evidence: GET routes in server/index.js now read via configurable source mode with PostgreSQL support.
  - Evidence: introduced READ_SOURCE_MODE env contract (`auto|json|postgres`) and documented default in .env.example.
  - Evidence: in auto mode, failed DB reads now fall back to JSON source to preserve runtime behavior when DB is unavailable.
  - Validation: targeted changed-file lint completed with warnings only (`npx eslint server/index.js server/repositories/*.js --ext .js`); npm run build passed.

## 6) Phase 0 - Baseline and Safety Setup

### P0.1 Create a dedicated migration branch

Action:

- Create a long-lived branch for modernization.
  Exit criteria:
- Branch exists and is used for all work.
  Rollback:
- None needed.

### P0.2 Freeze legacy app as reference-only

Action:

- Mark index.html, script.js, components as legacy reference in README.
- Stop adding new features outside student-hub.
  Exit criteria:
- Team agreement documented.
- README updated.
  Rollback:
- Remove reference notes if decision changes.

### P0.3 Build feature parity checklist

Action:

- List all visible features from legacy and map to React feature routes.
- Include admin edit flows and data persistence behavior.
  Exit criteria:
- Checklist reviewed and approved.
  Rollback:
- Rebuild checklist if scope changes.

### P0.4 Create risk register

Action:

- Create a section in this file with top technical risks and mitigation.
  Exit criteria:
- Each critical risk has an owner and mitigation action.
  Rollback:
- None.

## 7) Phase 1 - Quality Foundation

### P1.1 Add linting and formatting standards

Action:

- Add ESLint config and Prettier config.
- Add scripts for lint, lint-fix, format, format-check.
  Files:
- student-hub/package.json
- student-hub/.eslintrc.cjs
- student-hub/.prettierrc.json
  Exit criteria:
- Lint and format checks pass locally.
  Rollback:
- Revert config files and scripts.

### P1.2 Add pre-commit quality checks

Action:

- Add Husky and lint-staged.
- Run lint and format on staged files.
  Files:
- student-hub/.husky/pre-commit
- student-hub/package.json
  Exit criteria:
- Commit fails when staged files violate rules.
  Rollback:
- Disable pre-commit hook.

### P1.3 Introduce environment variable contract

Action:

- Define environment variables for client and server.
- Add .env.example and update docs.
  Files:
- student-hub/.env.example
- student-hub/vite.config.js
- student-hub/server/index.js
  Exit criteria:
- App runs with env-based values only.
  Rollback:
- Restore previous constants while investigating.

### P1.4 Add baseline error boundaries in frontend

Action:

- Add global React error boundary and fallback UI.
  Files:
- student-hub/src/App.jsx
- student-hub/src/components/Common
  Exit criteria:
- Runtime component error shows fallback instead of blank app crash.
  Rollback:
- Remove boundary wrapper.

## 8) Phase 2 - Frontend Architecture Modernization

### P2.1 Replace screen-state switching with route-based navigation

Action:

- Introduce route definitions for all existing screens.
- Migrate navigation to route links.
  Files:
- student-hub/src/App.jsx
- student-hub/src/components/Navigation
  Exit criteria:
- URL reflects current page and supports browser back/forward.
  Rollback:
- Restore previous screen-state switch logic.

### P2.2 Split global context into domain contexts

Action:

- Separate user, academic, and UI/admin state into dedicated modules.
  Files:
- student-hub/src/context/AppContext.jsx
- student-hub/src/context
- student-hub/src/hooks/useAppContext.js
  Exit criteria:
- No behavior regression.
- Reduced unnecessary rerenders verified.
  Rollback:
- Revert to monolithic context.

### P2.3 Refactor admin module into smaller units

Action:

- Extract form sections and editor logic into focused components/hooks.
- Keep feature behavior unchanged.
  Files:
- student-hub/src/components/Admin/Admin.jsx
- student-hub/src/components/Admin/AdminPanels.jsx
- student-hub/src/components/Admin
  Exit criteria:
- Admin features still work end-to-end.
- File complexity reduced and testable.
  Rollback:
- Revert admin refactor commits.

### P2.4 Add schema-based form validation

Action:

- Introduce validation for admin edits before API request.
- Show clear user feedback for invalid input.
  Files:
- student-hub/src/components/Admin
- student-hub/src/utils
  Exit criteria:
- Invalid payload cannot be submitted.
  Rollback:
- Temporarily disable strict client validation while keeping server validation.

### P2.5 Performance quick wins

Action:

- Add route-level lazy loading where safe.
- Add memoization for expensive render paths.
  Files:
- student-hub/src/App.jsx
- student-hub/src/components
  Exit criteria:
- Noticeable reduction in initial load and rerenders.
  Rollback:
- Remove lazy loading from problematic routes.

## 9) Phase 3 - Backend API Hardening

### P3.1 Introduce API versioning and response contract

Action:

- Move endpoints to /api/v1 namespace.
- Standardize success and error response shape.
  Files:
- student-hub/server/index.js
  Exit criteria:
- All active frontend calls work with versioned endpoints.
  Rollback:
- Keep compatibility aliases during transition.

### P3.2 Add centralized error middleware

Action:

- Consolidate try/catch handling and map errors to stable response codes.
  Files:
- student-hub/server/index.js
- student-hub/server/middleware
  Exit criteria:
- No raw stack traces or internal details in API responses.
  Rollback:
- Revert middleware and route bindings.

### P3.3 Add request validation per write endpoint

Action:

- Validate payload shape and data constraints before persistence.
  Files:
- student-hub/server/index.js
- student-hub/server/validation
  Exit criteria:
- Invalid payloads return structured 400 responses.
  Rollback:
- Temporarily relax only non-critical validations.

### P3.4 Add security baseline middleware

Action:

- Add CORS allowlist.
- Add Helmet headers.
- Add request size limits.
- Add basic rate limiting.
  Files:
- student-hub/server/index.js
- student-hub/server/middleware
  Exit criteria:
- Security middleware active without blocking allowed frontend origin.
  Rollback:
- Rollback latest middleware block and re-enable one by one.

## 10) Phase 4 - PostgreSQL Migration

### P4.1 Choose DB access strategy and create schema migration project

Action:

- Select ORM and create migrations folder.
- Define schema for user, courses, marks, results, routines, fees, calendar, downloads, attendance.
  Files:
- student-hub/server
- student-hub/db
  Exit criteria:
- Initial migration creates all required tables and constraints.
  Rollback:
- Drop migration state and regenerate clean baseline.

### P4.2 Add local and staging PostgreSQL environments

Action:

- Add local DB setup using container or service.
- Add staging DB with credential management.
  Files:
- student-hub/docker-compose.yml
- student-hub/.env.example
  Exit criteria:
- Server connects to PostgreSQL in local and staging.
  Rollback:
- Point server back to JSON mode fallback.

### P4.3 Build JSON-to-PostgreSQL import scripts

Action:

- Read all data files from student-hub/public/data and import into tables.
- Add idempotency for repeatable dry-runs.
  Files:
- student-hub/scripts
- student-hub/public/data
  Exit criteria:
- Import can run repeatedly without duplicate corruption.
  Rollback:
- Truncate target tables and rerun clean import.

### P4.4 Data verification report

Action:

- Compare counts and sampled records between JSON and DB.
- Validate required fields, references, and numeric conversions.
  Files:
- student-hub/scripts
- student-hub/docs
  Exit criteria:
- Signed verification report with zero critical mismatch.
  Rollback:
- Fix mapper and rerun import/verification.

### P4.5 Switch backend reads to PostgreSQL

Action:

- Replace file reads with repository layer queries.
- Keep same API response shape.
  Files:
- student-hub/server/index.js
- student-hub/server/repositories
  Exit criteria:
- All GET endpoints served from DB.
  Rollback:
- Toggle read source back to JSON through feature flag.

### P4.6 Switch backend writes to PostgreSQL with transactions

Action:

- Replace file writes with DB writes.
- Use transactions for multi-row updates.
  Files:
- student-hub/server/index.js
- student-hub/server/repositories
  Exit criteria:
- All PUT endpoints write to DB and return correct response.
  Rollback:
- Toggle write source back to JSON while preserving DB logs.

### P4.7 Disable JSON as source of truth

Action:

- Keep JSON only as archived backup snapshot.
- Update docs and operational runbook.
  Files:
- student-hub/public/data
- student-hub/README.md
  Exit criteria:
- No runtime endpoint reads/writes from JSON.
  Rollback:
- Re-enable source adapter if critical outage occurs.

## 11) Phase 5 - Testing and Quality Gates

### P5.1 Unit test utility modules

Action:

- Add tests for academic and date logic and data parsers.
  Files:
- student-hub/src/utils/academicUtils.js
- student-hub/src/utils/dateUtils.js
- student-hub/src/utils/dataParser.js
- student-hub/src
  Exit criteria:
- Core utility coverage reaches agreed threshold.
  Rollback:
- Keep partial tests and continue incrementally.

### P5.2 Integration tests for API routes

Action:

- Add route tests for valid and invalid payload scenarios.
  Files:
- student-hub/server
  Exit criteria:
- Critical routes pass happy path and validation path tests.
  Rollback:
- Mark flaky tests and isolate root causes.

### P5.3 End-to-end smoke tests

Action:

- Add tests for core user flows: profile, results, fees, admin edit.
  Files:
- student-hub/tests
  Exit criteria:
- Smoke suite passes in CI on every merge.
  Rollback:
- Keep minimum critical path test while fixing failures.

### P5.4 Coverage gates in CI

Action:

- Enforce baseline test thresholds and build checks.
  Files:
- student-hub/.github/workflows
- student-hub/package.json
  Exit criteria:
- Pull request blocked when checks fail.
  Rollback:
- Temporary threshold reduction with explicit issue tracking.

## 12) Phase 6 - CI/CD and Release Operations

### P6.1 Build CI pipeline

Action:

- On pull request run lint, test, build.
- On main branch run deploy pipeline.
  Files:
- student-hub/.github/workflows
  Exit criteria:
- CI passes with deterministic pipeline results.
  Rollback:
- Disable failing workflow and restore previous manual release process.

### P6.2 Add deployment configuration

Action:

- Create container build and runtime config.
- Add staging and production environment separation.
  Files:
- student-hub/Dockerfile
- student-hub/docker-compose.yml
- student-hub/.env.example
  Exit criteria:
- One command deploy path documented and validated.
  Rollback:
- Revert to previous deployment method.

### P6.3 Add operational runbook

Action:

- Document restart, health checks, migrations, rollback, and incident checklist.
  Files:
- student-hub/RUNBOOK.md
  Exit criteria:
- Runbook tested once in staging simulation.
  Rollback:
- None.

## 13) Phase 7 - Legacy Decommission

### P7.1 Verify complete parity

Action:

- Execute parity checklist and sign off each feature.
  Files:
- student-hub/docs
- index.html
- script.js
- components
  Exit criteria:
- All legacy features are present in React app.
  Rollback:
- Keep legacy app available until parity closes.

### P7.2 Archive legacy delivery path

Action:

- Move legacy files to archive folder and update root README.
  Exit criteria:
- Development focus is fully in student-hub.
  Rollback:
- Restore archived files if emergency rollback needed.

## 14) Definition of Done by Phase

- Phase 0 Done: baseline, parity checklist, and risk register approved.
- Phase 1 Done: lint, format, hooks, and env contracts active.
- Phase 2 Done: route-based navigation and refactored state/admin modules stable.
- Phase 3 Done: validated, secured, versioned API contracts live.
- Phase 4 Done: PostgreSQL is source of truth with verified migration.
- Phase 5 Done: unit, integration, and smoke tests in CI with thresholds.
- Phase 6 Done: release pipeline and runbook validated.
- Phase 7 Done: legacy path archived after parity confirmation.

## 15) Risk Register (Initial)

1. Data mismatch during migration
   Owner:

- AI + Ragib
  Mitigation:
- Idempotent import scripts
- Verification report before cutover

2. Frontend breakage from API contract changes
   Owner:

- AI + Ragib
  Mitigation:
- Contract tests and response schema snapshots
- Compatibility aliases during transition

3. Security middleware blocking legitimate requests
   Owner:

- AI + Ragib
  Mitigation:
- Start with staging allowlist
- Enable middleware progressively

4. CI instability due to flaky tests
   Owner:

- AI + Ragib
  Mitigation:
- Separate smoke and full suites
- Quarantine unstable tests with issue tracking

5. Solo development overload
   Owner:

- Ragib
  Mitigation:
- Strict micro-step execution
- Limit in-progress tasks to one high-risk item at a time

## 16) Daily Execution Routine

1. Pick exactly one micro-step from this file.
2. Confirm dependencies are complete.
3. Implement with small commits.
4. Run local validation.
5. Record evidence under the step template.
6. Mark step status.
7. Proceed to next step only after exit criteria pass.

## 17) Immediate Next 10 Micro-Steps

1. P4.2 Add local and staging PostgreSQL environments.
2. P4.4 Build data verification report.
3. P4.5 Switch backend reads to PostgreSQL.
4. P4.6 Switch backend writes to PostgreSQL with transactions.
5. P4.7 Disable JSON as source of truth.
6. P5.1 Unit test utility modules.
7. P5.2 Integration tests for API routes.
8. P5.3 End-to-end smoke tests.
9. P5.4 Coverage gates in CI.
10. P6.1 Build CI pipeline.

## 18) File Update Log

- 2026-03-28: Initial creation of reality execution micro plan.
- 2026-03-28: Phase 0 status evidence added (P0.1 blocked, P0.2 done, P0.3 done, P0.4 done).
- 2026-03-28: Phase 1 status evidence added (P1.1 done, P1.2 blocked by missing git metadata, P1.3 done, P1.4 done).
- 2026-03-28: Git initialized, modernization branch created, and Husky prepare validated. P0.1 and P1.2 moved to done.
- 2026-03-28: P2.1 completed with BrowserRouter integration, URL-screen synchronization, and route migration map.
- 2026-03-28: P2.2 completed with UI, User, and Academic domain contexts and compatibility hook merge.
- 2026-03-28: P2.3 completed by extracting Admin constants and shared utilities into dedicated modules.
- 2026-03-28: P2.4 completed with schema-based validation layer for Admin save and JSON submission flows.
- 2026-03-28: P2.5 completed with render optimization in App and memoization for key navigation/context paths.
- 2026-03-28: P3.1 completed with /api/v1 route namespace, legacy aliases, and standardized API error contract.
- 2026-03-28: P3.2 completed with centralized route error wrapping and global backend error middleware.
- 2026-03-28: P3.3 completed with endpoint-specific request validation middleware for all write APIs.
- 2026-03-28: P3.4 completed with CORS allowlist, Helmet, rate limiting, and request-size hardening.
- 2026-03-28: P4.1 completed with Prisma-based PostgreSQL schema and initial migration project scaffolding.
- 2026-03-28: P4.2 environment scaffolding added (docker-compose, staging env template, DB check scripts), but runtime verification is blocked until Docker is installed.
- 2026-03-28: P4.3 completed with idempotent JSON-to-PostgreSQL import tooling, dry-run validation, and dotenv-free DB script runtime handling.
- 2026-03-28: P4.4 verification tooling added with generated report artifact; full JSON-vs-PostgreSQL verification is blocked pending DATABASE_URL and local PostgreSQL runtime availability.
- 2026-03-28: Added tunnel-aware DB contracts and commands (db:check:tunnel, db:verify:tunnel, db:verify:staging); runtime verification remains blocked until a reachable DB URL is configured.
- 2026-03-28: Added local .env DB targets and executed tunnel checks; connectivity now fails at network layer (`Can't reach database server at 127.0.0.1:18789`), confirming external DB availability/tunnel uptime blocker.
- 2026-03-28: Performed tunnel target diagnostics: remote `127.0.0.1:5432` is refused, and remote `127.0.0.1:18789` accepts forwarding but still does not provide reachable PostgreSQL for Prisma checks.
- 2026-03-28: Verified remote `127.0.0.1:18789` is OpenClaw Control HTTP service (`openclaw-gateway`) and remote host currently has no PostgreSQL process/service/container.

## 19) Actual Incomplete Checklist (Current Reality)

Blocked items:

- [ ] P4.2 Add local and staging PostgreSQL environments.
  - Current blocker: Docker CLI is unavailable on this machine and no reachable PostgreSQL endpoint has been verified through tunnel targets.
- [ ] P4.4 Data verification report (full DB-backed verification).
  - Current blocker: PostgreSQL runtime is not reachable, so JSON-to-DB verification cannot complete against a live database.

Pending items (not completed yet):

- [ ] P4.6 Switch backend writes to PostgreSQL with transactions.
- [ ] P4.7 Disable JSON as source of truth.
- [ ] P5.1 Unit test utility modules.
- [ ] P5.2 Integration tests for API routes.
- [ ] P5.3 End-to-end smoke tests.
- [ ] P5.4 Coverage gates in CI.
- [ ] P6.1 Build CI pipeline.
- [ ] P6.2 Add deployment configuration.
- [ ] P6.3 Add operational runbook.
- [ ] P7.1 Verify complete parity.
- [ ] P7.2 Archive legacy delivery path.
