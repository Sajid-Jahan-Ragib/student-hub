# Bug Reproduction Matrix

This matrix tracks reproducible instability issues (shake, route bounce, back-flow mismatch) and expected behavior after fixes.

## Environment

- App: student-hub (Vite + React)
- Frontend URL: http://127.0.0.1:5173
- Backend URL: http://127.0.0.1:3001
- Browser: Chrome/Firefox latest
- Build mode: dev and production preview

## Route and Navigation Cases

| ID      | Scenario                               | Steps to Reproduce                                              | Current Behavior (Before Fix)                     | Expected Behavior                                               | Status |
| ------- | -------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- | ------ |
| NAV-001 | Direct deep admin URL opens wrong page | Paste `/admin/profile/json` into address bar and press enter    | Route may jump to `/` or `/admin`                 | Must stay on `/admin/profile/json` and open profile JSON editor | Open   |
| NAV-002 | Admin root back causes shake           | Home -> Admin -> click top back                                 | Occasional shake/flicker before landing on home   | Smooth transition directly to home                              | Open   |
| NAV-003 | Browser back loses history             | Home -> Results -> Fees -> browser back                         | Back may skip expected page if route used replace | Back should return Fees -> Results -> Home sequence correctly   | Open   |
| NAV-004 | Unknown path mismatch                  | Open `/abc/invalid/route`                                       | UI may show home while URL stays invalid          | URL should normalize to `/` and render home                     | Open   |
| NAV-005 | Repeated back/forward jitter           | Navigate across 4 pages, press back/forward repeatedly 10 times | Possible UI route/state mismatch                  | No visible shake and no route mismatch                          | Open   |
| NAV-006 | Admin editor hierarchy back flow       | `/admin/marks/json` -> top back repeatedly                      | May jump unexpectedly                             | Must follow json -> options -> admin -> home                    | Open   |

## Data Sync and Save Race Cases

| ID       | Scenario                              | Steps to Reproduce                           | Current Behavior (Before Fix)                   | Expected Behavior                                       | Status |
| -------- | ------------------------------------- | -------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- | ------ |
| DATA-001 | Save while navigating away            | Edit admin JSON and quickly leave page       | Pending timer save may run late                 | Save should be deterministic and not stale-overwrite    | Open   |
| DATA-002 | Refresh vs active edit                | Start edit, trigger background refresh/focus | Refresh may override draft state                | Draft and latest saved state should remain coherent     | Open   |
| DATA-003 | Multi-step marks save partial success | Save marks while one endpoint fails          | Partial update can desync marks/results/courses | Must rollback or show explicit partial-failure recovery | Open   |

## Verification Run Log

| Date       | Run By  | Scope                   | Result            | Notes                            |
| ---------- | ------- | ----------------------- | ----------------- | -------------------------------- |
| 2026-04-03 | Copilot | Initial matrix creation | Baseline captured | Used for phased closure evidence |

## Closure Rule

- A case can be marked Closed only when:
  1. Reproduced before fix.
  2. Fixed in code.
  3. Verified in dev.
  4. Verified in build/preview where relevant.
