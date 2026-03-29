# Phase 0 Checklist: Baseline And Release Gates

Objective: Freeze current behavior, define acceptance criteria, and establish mandatory release gates before code hardening.

Dependencies:

- None

## Task Checklist

- [x] Capture baseline for current auth behavior (login success/failure, admin access rules).
- [x] Capture baseline for current write auth behavior on all PUT routes.
- [x] Capture baseline for fallback behavior (DB failover to JSON paths).
- [x] Capture baseline for routing stability (admin deep link, back button, URL/state sync).
- [x] Define security acceptance criteria (authn, authz, validation, consistency, observability).
- [x] Define bug regression acceptance criteria (navigation, save behavior, race conditions).
- [x] Add release gate checklist steps for security-sensitive merges.
- [x] Confirm mandatory gate commands and pass thresholds.

## Mandatory Gate Commands

- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] Core route tests pass.
- [x] API write-security tests pass.
- [x] Data consistency tests pass.

## Deliverables

- [x] Baseline evidence note added to docs.
- [x] Release gates referenced by team workflow.
- [x] Phase 0 marked complete in master checklist.

## Exit Criteria

- [x] All tasks checked.
- [x] No open blockers.
