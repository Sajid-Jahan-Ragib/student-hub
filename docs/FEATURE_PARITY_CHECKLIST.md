# Feature Parity Checklist

## Purpose

This checklist maps legacy root features to React implementation targets in student-hub.

Status values:

- Not Started
- In Progress
- Done
- Blocked

## Scope Mapping

| Legacy Feature           | Legacy Source                     | React Target                              | Owner      | Priority | Status      | Notes                            |
| ------------------------ | --------------------------------- | ----------------------------------------- | ---------- | -------- | ----------- | -------------------------------- |
| Home dashboard summary   | index.html + components/home.html | src/components/Dashboard/Home.jsx         | AI + Ragib | High     | In Progress | Validate card content parity     |
| Profile view             | components/profile.html           | src/components/Profile/Profile.jsx        | AI + Ragib | High     | In Progress | Verify all profile fields        |
| Results and SGPA/CGPA    | components/results.html           | src/components/Results/Results.jsx        | AI + Ragib | High     | In Progress | Verify semester ordering         |
| Fee summary and status   | components/fees.html              | src/components/Fees/Fees.jsx              | AI + Ragib | High     | In Progress | Verify due and overpaid labels   |
| All courses list         | components/courses.html           | src/components/Courses/AllCourses.jsx     | AI + Ragib | High     | In Progress | Verify course grouping           |
| Present courses          | components/present.html           | src/components/Courses/PresentCourses.jsx | AI + Ragib | Medium   | In Progress | Ensure credit totals match       |
| Pending courses          | components/pending.html           | src/components/Courses/PendingCourses.jsx | AI + Ragib | Medium   | In Progress | Verify pending reason and status |
| Attendance view          | components/attendance.html        | src/components/Attendance/Attendance.jsx  | AI + Ragib | Medium   | In Progress | Confirm empty-state behavior     |
| Class routines           | components/routines.html          | src/components/Routines/Routines.jsx      | AI + Ragib | High     | In Progress | Validate day and time ordering   |
| Academic calendar        | components/calendar.html          | src/components/Calendar/Calendar.jsx      | AI + Ragib | High     | In Progress | Validate tag and range parsing   |
| Downloads and resources  | components/downloads.html         | src/components/Downloads/Downloads.jsx    | AI + Ragib | Medium   | In Progress | Verify link and title rendering  |
| Side menu navigation     | script.js navigation handlers     | src/components/Navigation/SideMenu.jsx    | AI + Ragib | High     | In Progress | Route migration planned in P2.1  |
| Home hero top section    | index.html + styles.css           | src/components/Navigation/Hero.jsx        | AI + Ragib | Medium   | In Progress | Ensure mobile layout parity      |
| Admin data editor        | script.js admin functions         | src/components/Admin/Admin.jsx            | AI + Ragib | High     | In Progress | Add validation before save       |
| Data loading and refresh | script.js load and refresh        | src/context/AppContext.jsx                | AI + Ragib | High     | In Progress | Remove unsafe refresh patterns   |

## Contract Parity Checks

- API payload keys must remain stable for each screen until migration gate approves changes.
- Number and date formatting must match expected user-facing output.
- Empty states and error states must be present for every screen.

## Sign-off Checklist

- [ ] Each mapped feature marked Done
- [ ] Data shown in React matches source payloads
- [ ] Admin edit flow can read and update each dataset
- [ ] No feature depends on root legacy runtime
- [ ] Reviewer sign-off complete

## Change Log

- 2026-03-28: Initial parity mapping created.
