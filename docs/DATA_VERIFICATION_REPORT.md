# Data Verification Report

- Generated at: 2026-03-28T10:27:05.514Z
- Mode: json-only
- Database reachable: no
- Database error:
  Invalid `prisma.userProfile.count()` invocation:

Can't reach database server at `127.0.0.1:18789`

Please make sure your database server is running at `127.0.0.1:18789`.

## Count Comparison

Database counts are not available in this run.

```json
{
  "user": 1,
  "courses": 20,
  "pendingCourses": 1,
  "presentCourses": 4,
  "fees": 4,
  "calendarEvents": 47,
  "downloads": 0,
  "attendance": 0,
  "results": 3,
  "routineSemesters": 1,
  "routineEntries": 8,
  "marksSemesters": 4,
  "markSubjects": 20
}
```

## Result

- Status: Blocked
- Reason: PostgreSQL connection is unavailable.
