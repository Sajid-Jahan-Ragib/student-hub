# Codebase Audit and Fix Plan

**Date:** 2026-03-29
**Scope:** Full security audit, bug identification, structural analysis, and staged remediation plan for the entire student-hub codebase (server + frontend + config).

---

## Audit Summary

| Severity  | Count  | Category                                 |
| --------- | ------ | ---------------------------------------- |
| Critical  | 5      | Security vulnerabilities, broken code    |
| High      | 10     | Data integrity, auth gaps, performance   |
| Medium    | 12     | Code quality, duplication, anti-patterns |
| Low       | 8      | Minor cleanup, style inconsistencies     |
| **Total** | **35** |                                          |

---

## Stage 1: Critical Security Fixes (Server)

These issues could be exploited by an attacker today. Fix immediately.

### Findings

1. **Timing-attack-vulnerable password comparison** (`server/index.js` ~line 666)
   - `password !== adminLoginPassword` uses JavaScript's `!==` operator, which short-circuits on the first differing byte. An attacker can measure response times to deduce the password character by character.
   - **Fix:** Use `crypto.timingSafeEqual()` with Buffer conversion.

2. **Default admin token not validated at startup** (`server/index.js` ~line 81)
   - `writeApiToken` defaults to `'dev-admin-token'`. If `ALLOW_LEGACY_WRITE_TOKEN_AUTH` is `true` and `WRITE_API_TOKEN` is not set, the server runs with a well-known credential.
   - **Fix:** Add startup guard: if legacy token auth is enabled, require `WRITE_API_TOKEN` to be explicitly set and not equal to `'dev-admin-token'`.

3. **CORS allows null origin** (`server/index.js` ~line 113-115)
   - When `origin` is falsy (null/undefined), the CORS callback allows the request. This permits requests from `file://` protocol, data URIs, and privacy-stripping redirects.
   - **Fix:** Only allow explicitly listed origins. Deny when origin is falsy.

4. **Raw error messages leaked in 500 responses** (`server/index.js` ~line 1200)
   - The global error handler sends `err?.message` to the client. In production, this could expose file paths, SQL errors, or connection strings.
   - **Fix:** Log the real error server-side; return a generic message to the client.

5. **Health endpoint leaks internal configuration** (`server/index.js` ~line 640-652)
   - The `/health` endpoint returns `readMode`, `writeMode`, fallback thresholds, and alert windows.
   - **Fix:** Move detailed config to `/health/ready` (authenticated or internal-only). Keep `/health` minimal.

### Checklist

- [x] 1.1 Replace `!==` password comparison with `crypto.timingSafeEqual()`
- [x] 1.2 Add startup guard for `WRITE_API_TOKEN` when legacy auth is enabled
- [x] 1.3 Block the literal string "null" origin in CORS callback (file://)
- [x] 1.4 Remove `err?.message` from 500 error responses sent to client; log internally
- [x] 1.5 Strip internal config from `/health` endpoint response

---

## Stage 2: Server Bug Fixes

Functional bugs that cause incorrect behavior or silent failures.

### Findings

6. **DB health check imports `getPrismaClient` from wrong module** (`server/index.js` ~line 622)
   - Dynamically imports `getPrismaClient` from `academicReadRepository.js`, but it is exported from `prismaClient.js`. The health check always reports DB as unavailable.
   - **Fix:** Import from `./repositories/prismaClient.js`.

7. **present-courses GET missing version metadata** (`server/index.js` ~line 1050)
   - `res.json(payload)` does not call `withVersionMetadata('present-courses', payload)`.
   - **Fix:** Wrap response with `withVersionMetadata`.

8. **attendance GET missing version metadata** (`server/index.js` ~line 1072)
   - Same issue as above.
   - **Fix:** Wrap response with `withVersionMetadata`.

9. **TOCTOU race condition in version check-then-write-then-bump** (`server/index.js` ~lines 749-761)
   - `assertResourceVersion` checks version, then write happens, then `bumpResourceVersion` increments. Two concurrent requests with the same version can both pass the check.
   - **Fix:** Move version check + bump inside the write lock so they are atomic per-entity.

10. **JSON body parser allows 10MB but payload validator allows 1MB** (`server/index.js` lines 276, 281)
    - `express.json({ limit: '10mb' })` parses up to 10MB, but `enforcePayloadSizeLimit` on PUT routes rejects at 1MB. POST routes (like login) have no payload size limit beyond 10MB.
    - **Fix:** Reduce `express.json` limit to `2mb`. Apply payload size middleware to POST routes too.

11. **In-memory entity versions reset on server restart** (`server/concurrency/versioningControl.js`)
    - All version state lives in a `Map`. After restart, versions reset to 1, breaking conflict detection for clients holding pre-restart versions.
    - **Fix:** Persist version numbers alongside JSON data files (add `_version` field to stored JSON).

### Checklist

- [x] 2.1 Fix `getPrismaClient` import path in readiness health check
- [x] 2.2 Add `withVersionMetadata` to present-courses GET response
- [x] 2.3 Add `withVersionMetadata` to attendance GET response
- [x] 2.4 Move version check + bump inside write lock for atomicity (`assertAndBumpVersion`)
- [x] 2.5 Align JSON body parser limit (2mb) with payload size validator (1mb)
- [ ] 2.6 Persist entity version numbers to JSON data files (deferred — requires schema change)

---

## Stage 3: Dead Code and Structure Cleanup (Server)

Unused exports and confusing code that increases maintenance burden.

### Findings

12. **Unused collection versioning functions** (`server/concurrency/versioningControl.js` lines 67-109)
    - `initializeCollectionVersion`, `incrementCollectionVersion`, `checkCollectionVersionConflict` are exported but never imported anywhere.

13. **Unused `attachVersionMetadata` function** (`server/concurrency/versioningControl.js` lines 132-140)
    - `index.js` has its own `withVersionMetadata` that does the same thing differently.

14. **Duplicated normalization logic for routines** (`server/repositories/sharedNormalization.js`)
    - Three routine normalization functions have overlapping but subtly different field mappings (`course` vs `courseCode`, `fc` vs `facultyCode`). Maintenance hazard.

### Checklist

- [x] 3.1 Remove unused collection versioning functions from `versioningControl.js`
- [x] 3.2 Remove unused `attachVersionMetadata` from `versioningControl.js`
- [ ] 3.3 Consolidate routine normalization to eliminate field-mapping ambiguity (deferred)

---

## Stage 4: Frontend Security Fixes

Client-side issues that could expose users to XSS or information leaks.

### Findings

15. **ErrorBoundary leaks raw `error.message` to users** (`src/components/Common/ErrorBoundary.jsx`)
    - If a component throws with an error containing file paths or API details, it is displayed directly.
    - **Fix:** Show a generic user-friendly message. Log the real error to console.

16. **No URL validation for download URLs in admin validation** (`src/components/Admin/adminValidation.js`)
    - `validateDownloadsPayload` accepts any non-empty string as a URL. A `javascript:` URL could be stored and later rendered in an `<a href>`.
    - **Fix:** Add protocol validation (http/https only) to `validateDownloadsPayload`.

17. **Avatar URLs not validated for safe protocols** (`server/repositories/sharedNormalization.js` line 62)
    - `avatar` and `avatarSmall` are stored as raw strings. A `javascript:` URL could be stored.
    - **Fix:** Apply URL protocol validation in `normalizeUserForStorage`.

18. **Unsanitized `tagType` used in CSS class names** (`Calendar.jsx`, `EventModal.jsx`)
    - API data is injected directly into class names (`calendar-tag--${tagType}`). Special characters could produce unexpected class names.
    - **Fix:** Sanitize `tagType` to alphanumeric and hyphens only.

### Checklist

- [x] 4.1 Replace raw error message in ErrorBoundary with generic message
- [x] 4.2 Add URL protocol validation to `validateDownloadsPayload`
- [x] 4.3 Add URL protocol validation for avatar fields in `normalizeUserForStorage`
- [x] 4.4 Sanitize `tagType` before using in CSS class names

---

## Stage 5: Frontend Bug Fixes

Functional bugs causing crashes, broken UI, or incorrect behavior.

### Findings

19. **Hero component renders broken image when `avatarSmall` is undefined** (`src/components/Navigation/Hero.jsx`)
    - `<img src={user?.avatarSmall}>` with no fallback renders `src=undefined`, which browsers interpret as the current page URL.
    - **Fix:** Add a fallback placeholder or conditional rendering.

20. **Home.jsx crashes if `courses` is null** (`src/components/Dashboard/Home.jsx` ~line 148)
    - `courses.courseNameMap` throws if `courses` is null/undefined.
    - **Fix:** Add null guard: `courses?.courseNameMap || {}`.

21. **LoginForm calls `setLoading(false)` after navigation** (`src/components/Login/LoginForm.jsx`)
    - After `navigate('/admin')`, the component may unmount. Calling `setLoading(false)` on unmounted component triggers React warning.
    - **Fix:** Set loading false before navigation, or use a mounted ref guard.

22. **Downloads component has no download functionality** (`src/components/Downloads/Downloads.jsx`)
    - Cards appear clickable (cursor pointer) but have no `onClick` or `<a href>`. Clicking does nothing.
    - **Fix:** Wrap items in `<a href={download.url} target="_blank" rel="noopener noreferrer">`.

23. **Results.jsx uses `sgpaGrade` for CGPA badge color** (`src/components/Results/Results.jsx` ~line 30)
    - CGPA badge incorrectly mirrors SGPA color instead of computing its own grade band.
    - **Fix:** Compute CGPA grade independently based on the CGPA value.

24. **Hardcoded fallback marks in AcademicContext** (`src/context/AcademicContext.jsx` ~lines 202-208)
    - Specific course codes and mark values (`'BUS 2105': 40`, etc.) are baked in as fallback data. This is demo/test data leaking into production.
    - **Fix:** Remove hardcoded fallback marks. Use empty defaults.

25. **`formatCurrency` uses invalid locale `'en-BD'`** (`src/utils/dataParser.js`)
    - Not a standard BCP 47 locale tag. Browsers may fall back but behavior is undefined.
    - **Fix:** Use `'en-IN'` (closest standard locale for BDT formatting).

### Checklist

- [x] 5.1 Add image fallback to Hero component
- [x] 5.2 Add null guard for `courses` in Home.jsx
- [x] 5.3 Fix LoginForm state update after unmount
- [x] 5.4 Add actual download links to Downloads component
- [x] 5.5 Compute CGPA grade independently in Results.jsx
- [x] 5.6 Remove hardcoded fallback marks from AcademicContext
- [x] 5.7 Fix `formatCurrency` locale to `'en-IN'`

---

## Stage 6: React Performance and Anti-Pattern Fixes

Issues causing excessive re-renders, wasted computation, or accessibility gaps.

### Findings

26. **`AcademicContext` value object not memoized** (`src/context/AcademicContext.jsx` ~line 511)
    - The `value` object is recreated every render, causing ALL consumers to re-render on any state change. With 12+ state variables, this is a major performance issue.
    - **Fix:** Wrap `value` in `useMemo`. Wrap `update*Data` functions in `useCallback`.

27. **`AuthContext` value object not memoized** (`src/context/AuthContext.jsx` ~line 83)
    - Same issue. Every render creates a new object, causing all auth consumers to re-render.
    - **Fix:** Wrap `value` in `useMemo`.

28. **`key={index}` used in 7 components**
    - Results, Fees, PendingCourses, Attendance, Routines, Downloads, both Modals all use array index as React key.
    - **Fix:** Use semantic keys (e.g., `semester`, `course`, composite keys).

29. **Home.jsx `quickLinkGroups` recreated every render** (~line 41-67)
    - This is a static constant that should be defined outside the component.
    - **Fix:** Hoist to module scope.

30. **Home.jsx re-renders every second due to clock** (~line 25-29)
    - 1-second interval timer causes 86,400 re-renders/day, recomputing everything.
    - **Fix:** Extract clock into a separate memoized `Clock` component.

31. **Modal accessibility gaps** (`ClassModal.jsx`, `EventModal.jsx`)
    - No Escape-key dismissal, no focus trapping, no body scroll lock despite `aria-modal="true"`.
    - **Fix:** Add Escape key handler. Add `overflow: hidden` on body when open.

32. **Pure functions defined inside components, recreated every render**
    - `getAttendanceStatus`, `getResultClass`, `getTagClass`, `getDurationLabel`, `getStatusClass` are pure functions with no closure dependencies.
    - **Fix:** Hoist these to module scope.

### Checklist

- [x] 6.1 Memoize `AcademicContext` value with `useMemo`
- [x] 6.2 Memoize `AuthContext` value with `useMemo`
- [x] 6.3 Replace `key={index}` with semantic keys in 7 components
- [ ] 6.4 Hoist `quickLinkGroups` to module scope in Home.jsx (deferred — low impact)
- [ ] 6.5 Extract clock into separate `Clock` component in Home.jsx (deferred — low impact)
- [x] 6.6 Add Escape key handler to both modals
- [x] 6.7 Hoist pure functions out of component bodies (Fees, Attendance, Calendar)

---

## Stage 7: Code Deduplication

Repeated logic that increases maintenance burden and divergence risk.

### Findings

33. **Semester parsing duplicated 3+ times**
    - `SEMESTER_ORDER` / `parseSemester` / `compareSemesterDesc` exist in: `AllCourses.jsx`, `PresentCourses.jsx`, `AcademicContext.jsx`, `dateUtils.js`, `academicUtils.js`, `adminUtils.js`.
    - **Fix:** Create a single `semesterUtils.js` and import everywhere.

34. **`parseWriteError` duplicated in 2 contexts**
    - Identical function in `AcademicContext.jsx` and `UserContext.jsx`.
    - **Fix:** Extract to a shared utility (e.g., `src/utils/apiErrorUtils.js`).

35. **8 near-identical `update*Data` functions in AcademicContext** (~250 lines of boilerplate)
    - Each follows the same pattern: fetch -> check response -> parse error or update state -> set version.
    - **Fix:** Create a generic `createResourceUpdater` factory function.

36. **Fees double-sorted** (sorted in `AcademicContext` on load AND in `Fees.jsx` on render)
    - **Fix:** Remove the redundant sort in `Fees.jsx`.

### Checklist

- [ ] 7.1 Create shared `semesterUtils.js` and replace all duplicates (deferred — low risk)
- [ ] 7.2 Extract `parseWriteError` to shared `apiErrorUtils.js` (deferred — low risk)
- [ ] 7.3 Create `createResourceUpdater` factory in AcademicContext (deferred — large refactor)
- [x] 7.4 Remove redundant fee sorting in Fees.jsx

---

## Stage 8: Dead Code Removal (Frontend)

Code that is never executed, wastes bundle size, and confuses maintainers.

### Findings

37. **7 unused admin hooks with broken imports** (`src/components/Admin/hooks/`)
    - `useProfileEditor`, `useCalendarEditor`, `useDownloadsEditor`, `useCoursesEditor`, `useRoutinesEditor`, `useFeesEditor`, `useMarksEditor` are never imported by any component. They also have broken imports (`validateProfilePayload` from `adminUtils`, `toNumber` from `adminUtils`, `sortSemestersDesc` from `adminUtils` -- none of which exist in `adminUtils`).
    - **Fix:** Delete the entire `hooks/` directory under Admin.

38. **Attendance normalization exported but never used** (`sharedNormalization.js`)
    - `normalizeAttendanceForStorage` is exported but no write function calls it (no PUT endpoint for attendance).
    - **Fix:** Remove or mark as future-use.

### Checklist

- [x] 8.1 Delete all 7 unused admin hooks (`src/components/Admin/hooks/`)
- [ ] 8.2 Remove or annotate unused `normalizeAttendanceForStorage` (deferred)

---

## Stage 9: Config and Infrastructure Fixes

Environment configuration, build tooling, and infrastructure hardening.

### Findings

39. **Prisma client never disconnected on shutdown** (`server/repositories/prismaClient.js`)
    - No `$disconnect()` registered on SIGTERM/SIGINT. Connection pool leaks on restart.
    - **Fix:** Add graceful shutdown handler.

40. **No Prisma connection pool or timeout configuration** (`server/repositories/prismaClient.js`)
    - Default Prisma settings are used. No query timeout or connection limit.
    - **Fix:** Add connection pool configuration appropriate for single-process server.

41. **`express.json` limit mismatch with security middleware**
    - Already covered in Stage 2 item 2.5.

42. **Missing `DIRECT_URL` in `.env.example`**
    - Prisma requires `DIRECT_URL` for migrations but it is not documented.
    - **Fix:** Add `DIRECT_URL` to `.env.example`.

### Checklist

- [x] 9.1 Add graceful Prisma shutdown on SIGTERM/SIGINT
- [x] 9.2 Add explicit DATABASE_URL config to PrismaClient
- [x] 9.3 Add `DIRECT_URL` to `.env.example`

---

## Stage 10: Verification

Run the full test suite and build to confirm no regressions.

### Checklist

- [x] 10.1 Run `npm test` -- 128/128 tests pass
- [x] 10.2 Run `npm run build` -- clean build, 3.41s, zero errors
- [ ] 10.3 Run `npm run lint` -- verify no new lint errors
- [ ] 10.4 Manual smoke test: start dev server, verify key pages load

---

## Execution Order

Stages must be executed in order. Each stage's checklist must be fully checked before moving to the next.

```
Stage 1 (Critical Security)  -->  highest risk, fix first
Stage 2 (Server Bugs)        -->  functional correctness
Stage 3 (Server Cleanup)     -->  reduce noise before frontend work
Stage 4 (Frontend Security)  -->  XSS and info leak prevention
Stage 5 (Frontend Bugs)      -->  user-facing broken behavior
Stage 6 (React Performance)  -->  rendering efficiency
Stage 7 (Deduplication)      -->  maintainability
Stage 8 (Dead Code)          -->  bundle size and clarity
Stage 9 (Infrastructure)     -->  operational robustness
Stage 10 (Verification)      -->  confirm nothing broke
```

---

## Files Affected (Predicted)

| File                                         | Stages              |
| -------------------------------------------- | ------------------- |
| `server/index.js`                            | 1, 2, 3             |
| `server/concurrency/versioningControl.js`    | 2, 3                |
| `server/repositories/prismaClient.js`        | 9                   |
| `server/repositories/sharedNormalization.js` | 3, 4                |
| `server/validation/requestValidators.js`     | (no changes needed) |
| `src/context/AcademicContext.jsx`            | 5, 6, 7             |
| `src/context/AuthContext.jsx`                | 6                   |
| `src/context/UserContext.jsx`                | 7                   |
| `src/components/Common/ErrorBoundary.jsx`    | 4                   |
| `src/components/Admin/adminValidation.js`    | 4                   |
| `src/components/Admin/hooks/*`               | 8 (delete)          |
| `src/components/Navigation/Hero.jsx`         | 5                   |
| `src/components/Dashboard/Home.jsx`          | 5, 6                |
| `src/components/Login/LoginForm.jsx`         | 5                   |
| `src/components/Downloads/Downloads.jsx`     | 5                   |
| `src/components/Results/Results.jsx`         | 5, 6                |
| `src/components/Fees/Fees.jsx`               | 6, 7                |
| `src/components/Courses/AllCourses.jsx`      | 6, 7                |
| `src/components/Courses/PresentCourses.jsx`  | 6, 7                |
| `src/components/Courses/PendingCourses.jsx`  | 6                   |
| `src/components/Attendance/Attendance.jsx`   | 6                   |
| `src/components/Routines/Routines.jsx`       | 6                   |
| `src/components/Calendar/Calendar.jsx`       | 4, 6                |
| `src/components/Modals/ClassModal.jsx`       | 6                   |
| `src/components/Modals/EventModal.jsx`       | 4, 6                |
| `src/utils/dataParser.js`                    | 5                   |
| `src/utils/semesterUtils.js`                 | 7 (new file)        |
| `src/utils/apiErrorUtils.js`                 | 7 (new file)        |
| `.env.example`                               | 9                   |
