# API Versioning and Contract (P3.1)

## Versioning Strategy

- Primary versioned namespace: /api/v1/\*
- Backward-compatible legacy aliases: /api/\*

Both namespaces currently map to the same handlers so existing clients continue working during migration.

## Current Write Endpoints Used by Frontend

- PUT /api/v1/user
- PUT /api/v1/routines
- PUT /api/v1/fees
- PUT /api/v1/calendar
- PUT /api/v1/downloads
- PUT /api/v1/courses
- PUT /api/v1/pending-courses
- PUT /api/v1/results
- PUT /api/v1/marks

## Health Endpoint

- GET /api/v1/health
- GET /api/health (alias)

## Error Response Contract

Error payload shape:
{
"ok": false,
"error": {
"code": "ERROR_CODE",
"message": "Human readable message",
"details": "Optional details"
}
}

Notes:

- Success responses currently remain payload-compatible with existing frontend logic.
- Error contract is now standardized across handlers.

## Migration Guidance

1. Keep frontend writes on /api/v1/\*.
2. Keep legacy /api/\* aliases until all external consumers are updated.
3. Remove legacy aliases only in a later breaking-change release.
