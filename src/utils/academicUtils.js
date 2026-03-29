const GRADE_POINTS = {
  'A+': 4.0,
  A: 3.75,
  'A-': 3.5,
  'B+': 3.25,
  B: 3.0,
  'B-': 2.75,
  'C+': 2.5,
  C: 2.25,
  D: 2.0,
  F: 0.0,
};

const GRADE_MARK_GUESS = {
  'A+': 85,
  A: 78,
  'A-': 72,
  'B+': 67,
  B: 62,
  'B-': 57,
  'C+': 52,
  C: 47,
  D: 42,
  F: 30,
};

const SEMESTER_ORDER = {
  WINTER: 0,
  SPRING: 1,
  SUMMER: 2,
  FALL: 3,
  AUTUMN: 3,
};

export function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseSemesterKey(semesterText = '') {
  const match = String(semesterText)
    .trim()
    .match(/^([A-Za-z]+)\s*,?\s*(\d{4})$/);
  if (!match) {
    return { year: -1, rank: -1, raw: String(semesterText || '') };
  }

  return {
    year: Number(match[2]),
    rank: SEMESTER_ORDER[match[1].toUpperCase()] ?? -1,
    raw: String(semesterText || ''),
  };
}

export function sortSemestersAsc(items = [], keySelector = (x) => x) {
  return [...items].sort((a, b) => {
    const left = parseSemesterKey(keySelector(a));
    const right = parseSemesterKey(keySelector(b));

    if (left.year !== right.year) {
      return left.year - right.year;
    }
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    return String(left.raw).localeCompare(String(right.raw));
  });
}

export function sortSemestersDesc(items = [], keySelector = (x) => x) {
  return sortSemestersAsc(items, keySelector).reverse();
}

export function markToGrade(mark) {
  const m = toNumber(mark, NaN);
  if (!Number.isFinite(m)) return '--';
  if (m >= 80) return 'A+';
  if (m >= 75) return 'A';
  if (m >= 70) return 'A-';
  if (m >= 65) return 'B+';
  if (m >= 60) return 'B';
  if (m >= 55) return 'B-';
  if (m >= 50) return 'C+';
  if (m >= 45) return 'C';
  if (m >= 40) return 'D';
  return 'F';
}

export function gradeToPoint(grade) {
  return (
    GRADE_POINTS[
      String(grade || '')
        .trim()
        .toUpperCase()
    ] ?? null
  );
}

export function guessMarkFromGrade(grade) {
  return (
    GRADE_MARK_GUESS[
      String(grade || '')
        .trim()
        .toUpperCase()
    ] ?? null
  );
}

function sgpaBand(sgpa) {
  if (sgpa >= 3) return 'high';
  if (sgpa >= 2) return 'mid';
  return 'low';
}

export function normalizeMarksPayload(payload) {
  const semesters = Array.isArray(payload?.semesters) ? payload.semesters : [];
  return sortSemestersDesc(
    semesters
      .map((sem) => ({
        semester: String(sem?.semester || '').trim(),
        subjects: Array.isArray(sem?.subjects)
          ? sem.subjects.map((sub) => ({
              code: String(sub?.code || '').trim(),
              name: String(sub?.name || '').trim(),
              mark:
                sub?.mark === '' || sub?.mark === null || sub?.mark === undefined
                  ? null
                  : toNumber(sub.mark, null),
            }))
          : [],
      }))
      .filter((sem) => sem.semester),
    (x) => x.semester
  );
}

export function buildInitialMarksFromCourses(coursesData, exactFall2025Marks = {}) {
  const courses = Array.isArray(coursesData?.courses) ? coursesData.courses : [];
  const grouped = {};

  courses.forEach((course) => {
    const semester = String(course.semester || '').trim();
    if (!semester) return;
    if (!grouped[semester]) grouped[semester] = [];

    const exactKey = String(course.code || '').trim();
    const exact = semester === 'Fall, 2025' ? exactFall2025Marks[exactKey] : undefined;
    const guessed = guessMarkFromGrade(course.result);

    grouped[semester].push({
      code: String(course.code || '').trim(),
      name: String(course.name || '').trim(),
      mark: exact ?? guessed,
    });
  });

  const semesters = Object.entries(grouped).map(([semester, subjects]) => ({
    semester,
    subjects,
  }));

  return normalizeMarksPayload({ semesters });
}

export function calculateAcademicSummary(coursesData, marksPayload) {
  const courses = Array.isArray(coursesData?.courses) ? coursesData.courses : [];
  const marksSemesters = normalizeMarksPayload({ semesters: marksPayload });

  const markMap = new Map();
  marksSemesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      markMap.set(`${sem.semester}__${sub.code}`, sub.mark);
    });
  });

  const updatedCourses = courses.map((course) => {
    const semester = String(course.semester || '').trim();
    const code = String(course.code || '').trim();
    const mark = markMap.get(`${semester}__${code}`);

    if (mark === null || mark === undefined || !Number.isFinite(toNumber(mark, NaN))) {
      // Empty/removed marks should clear any previously computed grade.
      return {
        ...course,
        result: '--',
      };
    }

    return {
      ...course,
      result: markToGrade(mark),
    };
  });

  const coursesBySemester = {};
  updatedCourses.forEach((course) => {
    const semester = String(course.semester || '').trim();
    if (!semester) return;
    if (!coursesBySemester[semester]) coursesBySemester[semester] = [];
    coursesBySemester[semester].push(course);
  });

  const semesterRows = sortSemestersAsc(Object.keys(coursesBySemester))
    .map((semester) => {
      const semesterCourses = coursesBySemester[semester];

      let totalCredits = 0;
      let totalPoints = 0;

      semesterCourses.forEach((course) => {
        const credit = toNumber(course.credits, 0);
        const point = gradeToPoint(course.result);
        if (credit <= 0 || point === null) {
          return;
        }
        totalCredits += credit;
        totalPoints += credit * point;
      });

      const sgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

      return {
        semester,
        sgpa,
        sgpaGrade: sgpaBand(sgpa),
        totalCredits,
        totalPoints,
      };
    })
    .filter((row) => row.totalCredits > 0);

  let runningCredits = 0;
  let runningPoints = 0;

  const resultsAsc = semesterRows.map((row) => {
    runningCredits += row.totalCredits;
    runningPoints += row.totalPoints;
    const cgpa = runningCredits > 0 ? Number((runningPoints / runningCredits).toFixed(2)) : 0;

    return {
      semester: row.semester,
      sgpa: row.sgpa,
      cgpa,
      sgpaGrade: row.sgpaGrade,
    };
  });

  const resultsDesc = [...resultsAsc].reverse();

  return {
    updatedCourses,
    updatedResults: resultsDesc,
  };
}
