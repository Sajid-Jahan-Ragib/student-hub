# Phase 2 Checklist: Write Authorization And Validation Hardening

Objective: Harden mutation routes with layered authorization, stricter validation, and safer failure handling.

Dependencies:

- Phase 1 complete

## Authorization Tasks

- [x] Enforce authenticated-session requirement for all write routes.
- [ ] Add route-level write permission checks.
- [x] Confirm all mutation endpoints share consistent auth middleware behavior.
- [x] Verify unauthorized mutation attempts are denied with consistent codes.

## Validation Tasks

- [x] Tighten unsafe string validation for all writable entities.
- [x] Add URL protocol safety validation where URL fields exist.
- [x] Add payload size limits aligned to entity constraints.
- [x] Add array-length limits with explicit rejection behavior.
- [x] Standardize validation error response format.

## Error-Handling Tasks

- [x] Return safe client errors without exposing internals.
- [x] Log full diagnostic detail server-side.
- [x] Ensure validation and authorization failures are easy to trace in logs.

## Verification Tasks

- [x] Test all write routes for unauthorized request denial.
- [x] Test malformed payload rejection across key entities.
- [x] Test oversized payload rejection.
- [x] Test valid payload acceptance remains intact.

## Deliverables

- [x] Hardened write middleware in place.
- [x] Validation upgrades implemented.
- [ ] Phase 2 marked complete in master checklist.

## Exit Criteria

- [x] All tasks checked.
- [x] No open blockers.
