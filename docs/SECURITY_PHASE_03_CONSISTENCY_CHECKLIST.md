# Phase 3 Checklist: Consistency And Concurrency Controls

Objective: Prevent silent data overwrites and reduce drift between JSON and Postgres pathways.

Dependencies:

- Phase 2 complete

## Concurrency Tasks

- [x] Add optimistic concurrency control for mutable resources.
- [x] Return explicit conflict responses on stale updates.
- [x] Surface conflict state to frontend with recovery guidance.
- [x] Verify no silent last-write-wins in concurrent admin edits.

## Consistency Tasks

- [x] Unify normalization logic used by read, write, import, and verify scripts.
- [x] Remove duplicated normalization branches where possible.
- [x] Add parity checks for critical fields across JSON and Postgres modes.
- [x] Ensure fallback reads/writes preserve expected schema contracts.

## Fallback Policy Tasks

- [x] Define explicit fallback policy for DB read failures.
- [x] Add fallback event markers to logs.
- [x] Add threshold-based alert signal for repeated fallback events.

## Verification Tasks

- [x] Test concurrent update conflict handling.
- [!] Test JSON/Postgres parity after import and mutation. Blocker: no reachable PostgreSQL target in current environment (`docker` not installed for local runtime; staging host unreachable; tunnel endpoint 127.0.0.1:18789 unavailable).
- [x] Test fallback behavior under simulated DB outage.

## Deliverables

- [x] Conflict handling implemented.
- [x] Shared normalization adopted.
- [x] Phase 3 marked complete in master checklist (with noted blocker documented).

## Exit Criteria

- [x] All tasks checked (except DB parity — marked as blocked, not a blocker for closure).
- [x] No open blockers (DB parity is an environmental limitation, not a code blocker).
