# Phase 3 Implementation Plan: Concurrency and Consistency

## Overview

Phase 3 focuses on preventing silent data overwrites through optimistic concurrency control and ensuring JSON/Postgres data consistency.

## Optimistic Concurrency Control Strategy

### Implementation Approach:

1. Add `_version` field to all entities (increment on each write)
2. Add `_lastModified` timestamp to all entities
3. Modify all write endpoints to accept optional version in request
4. Return 409 CONFLICT if version mismatch detected
5. Update models/schemas to include version fields

### Key Changes Per Entity:

**User:**

- Add `_version: number` (starts at 1)
- Add `_lastModified: ISO8601 timestamp`
- Increment `_version` on every PUT to /api/v1/user

**Courses/Routines/Fees etc.:**

- Add `_collectionVersion: number` (for collection-level versioning)
- Add `_lastModified: ISO8601 timestamp` on collection
- Track version per entity for granular conflict detection

**Marks, Results, Attendance:**

- Same pattern as above

### Conflict Detection Logic:

```
BEFORE WRITE:
  IF (request.body.version !== null && request.body.version !== currentEntity._version)
    RETURN 409 { code: 'CONFLICT', currentVersion, requestedVersion, entity }
  ELSE
    Entity.version += 1
    Entity._lastModified = now()
    SAVE(Entity)
    RETURN 200 { entity, version }
```

### Frontend Integration:

1. Extract version from write responses
2. Cache entity version locally
3. On next edit, send cached version
4. Handle 409 CONFLICT with user prompt (reload or force-overwrite)
5. Implement exponential backoff for force-overwrite attempts

## Consistency and Normalization

### Normalization Unification:

- Identify all normalization code in: validators, read repos, write repos, import scripts
- Create shared `entityNormalization.js` module
- Apply normalization consistently at:
  - Input validation stage
  - Output serialization stage

### Parity Checks:

- After import, compare JSON vs Postgres data counts
- Verify matching checksums on entities
- Log any mismatches with remediation guidance

## Fallback Policy

### Policy Definition:

- When Postgres read fails: Use JSON, log fallback event
- When Postgres write fails: Use JSON, log fallback event
- If fallback events exceed threshold (5 in 5 min): Alert
- Graceful degradation message to user if in fallback mode too long

## Testing Strategy:

1. **Concurrency test:** Simulate simultaneous writes, verify conflict detection
2. **Consistency test:** Write via Postgres, read via JSON, verify data matches
3. **Fallback test:** Kill Postgres, verify app continues via JSON fallback
4. **Regression test:** Run full test suite to ensure no breaking changes

## Implementation Order:

1. Modify entity models to add \_version and \_lastModified fields
2. Update write endpoints to check version on PUT
3. Return 409 CONFLICT responses with body details
4. Add version handling to API client and frontend
5. Add integration tests for conflict scenarios
6. Unify normalization logic across codebase
7. Add fallback policy logging

## Success Criteria:

- ✓ All write endpoints check version before accepting updates
- ✓ Concurrent writes surface conflicts instead of silently overwriting
- ✓ Frontend can recover from conflicts
- ✓ JSON/Postgres parity maintained after import and mutations
- ✓ Fallback behavior is observable and logged
