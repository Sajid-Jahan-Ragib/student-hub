# Phase 1 Checklist: Backend Session Authentication

Objective: Move admin authentication authority from frontend-only logic to backend session verification.

Dependencies:

- Phase 0 complete

## Backend Tasks

- [x] Add login endpoint for admin session creation.
- [x] Add logout endpoint for session invalidation.
- [x] Add auth-status endpoint for frontend session verification.
- [x] Implement secure session middleware.
- [x] Ensure session cookie policy is secure for environment.
- [x] Add login rate-limit protections.
- [x] Add safe auth error responses (no sensitive detail leakage).

## Frontend Tasks

- [x] Update auth context to use backend login/logout/status endpoints.
- [x] Remove browser-side real credential checks.
- [x] Remove any real credential material from UI and client logic.
- [x] Keep admin guard in App based on backend-verified auth state.
- [x] Preserve mobile login UX and home-return button behavior.
- [x] Preserve stable route/back-button behavior during auth transitions.

## Security Tasks

- [x] Ensure admin access is blocked when unauthenticated.
- [x] Ensure logout immediately revokes protected access.
- [x] Ensure session cannot be bypassed by simple client state mutation.

## Validation Tasks

- [x] Test valid login path.
- [x] Test invalid login path.
- [x] Test refresh persistence behavior for active session.
- [x] Test logout path and protected route denial after logout.

## Deliverables

- [x] Auth endpoints documented.
- [x] Frontend auth flow updated.
- [x] Phase 1 marked complete in master checklist.

## Exit Criteria

- [x] All tasks checked.
- [x] No open blockers.
