# SGPA/CGPA Marks Automation Plan

## Why This Is Needed

- Keep SGPA/CGPA mathematically consistent with subject-level marks.
- Let admin input exact marks semester-wise instead of manually editing multiple files.
- Ensure one save updates both results summary and course grades together.
- Preserve your exact Fall, 2025 marks and generate reasonable guesses for missing semesters.

## Who Does What

- Admin user: enters/updates marks in Admin section.
- Frontend app: validates marks, calculates grades, SGPA, CGPA, updates UI state.
- Backend API: persists marks/results/courses JSON files.
- Data model: stores semester-wise marks in dedicated marks JSON.

## Where Changes Are Needed

- Backend routes: server/index.js
- Frontend state: src/context/AppContext.jsx
- Calculation logic: src/utils/academicUtils.js
- Admin UI: src/components/Admin/Admin.jsx
- Data files: public/data/marks.json, dist/data/marks.json

## How It Works

1. Admin enters semester subject marks.
2. System maps marks to letter grades.
3. System computes SGPA per semester using weighted grade points.
4. System computes cumulative CGPA semester by semester.
5. System updates:

- results.json summary rows
- courses.json grade fields
- marks.json semester subject marks

6. UI immediately reflects updated Results and All Courses.

## Checklist

- [x] Add backend API support for marks and results read/write.
- [x] Add academic utility functions for grade mapping and SGPA/CGPA calculations.
- [x] Create marks data JSON with exact Fall, 2025 marks and guessed marks for other semesters.
- [x] Load marks data into app context and expose update methods.
- [x] Add Admin tile and editor for Results & Marks management.
- [x] Implement semester selector + per-subject marks form in admin editor.
- [x] Implement save workflow that recalculates and persists marks/results/courses.
- [x] Verify Results section shows recalculated SGPA/CGPA.
- [x] Verify All Courses section grade fields update from marks.
- [x] Build/test and finalize checklist.
