import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.resolve(projectRoot, 'public/data');
const docsRoot = path.resolve(projectRoot, 'docs');

const args = new Set(process.argv.slice(2));
const jsonOnly = args.has('--json-only');
const dbUrlEnvKey = getArgValue('--env-key', 'DATABASE_URL');

function getArgValue(flag, defaultValue) {
  const values = process.argv.slice(2);
  const index = values.findIndex((v) => v === flag);
  if (index >= 0 && values[index + 1]) {
    return values[index + 1];
  }
  return defaultValue;
}

const outputPath = path.resolve(projectRoot, getArgValue('--output', 'docs/DATA_VERIFICATION_REPORT.md'));

async function loadEnvFile() {
  const envPath = path.resolve(projectRoot, '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore when .env is not present.
  }
}

function toString(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function normalizeFeeStatus(status) {
  return String(status || '').toLowerCase() === 'due' ? 'due' : 'ok';
}

function normalizeSgpaBand(band) {
  const normalized = String(band || '').toLowerCase();
  if (normalized === 'high' || normalized === 'mid' || normalized === 'low') {
    return normalized;
  }
  return 'mid';
}

function normalizeDateOnlyString(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '1970-01-01';
  }
  return date.toISOString().slice(0, 10);
}

async function readJson(fileName) {
  const filePath = path.resolve(dataRoot, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function loadExpected() {
  const [
    userData,
    coursesData,
    routinesData,
    feesData,
    calendarData,
    downloadsData,
    attendanceData,
    pendingCoursesData,
    presentCoursesData,
    resultsData,
    marksData,
  ] = await Promise.all([
    readJson('user.json'),
    readJson('courses.json'),
    readJson('routines.json'),
    readJson('fees.json'),
    readJson('calendar.json'),
    readJson('downloads.json'),
    readJson('attendance.json'),
    readJson('pending-courses.json'),
    readJson('present-courses.json'),
    readJson('results.json'),
    readJson('marks.json'),
  ]);

  const user = userData?.user
    ? {
        name: toString(userData.user.name),
        studentId: toString(userData.user.id),
        email: toString(userData.user.email),
      }
    : null;

  const courses = Array.isArray(coursesData?.courses)
    ? coursesData.courses.map((course) => ({
        code: toString(course.code),
        semester: toString(course.semester),
        section: toString(course.section) || '',
        credits: toNumber(course.credits, 0),
      }))
    : [];

  const pendingCourses = Array.isArray(pendingCoursesData?.pendingCourses)
    ? pendingCoursesData.pendingCourses.map((course) => ({
        code: toString(course.code),
        credits: toNumber(course.credits, 0),
      }))
    : [];

  const presentCourses = Array.isArray(presentCoursesData?.presentCourses)
    ? presentCoursesData.presentCourses.map((course) => ({
        code: toString(course.code),
        credits: toNumber(course.credits, 0),
      }))
    : [];

  const fees = Array.isArray(feesData?.fees)
    ? feesData.fees.map((fee) => ({
        semester: toString(fee.semester),
        demand: Math.round(toNumber(fee.demand, 0)),
        waiver: Math.round(toNumber(fee.waiver, 0)),
        paid: Math.round(toNumber(fee.paid, 0)),
        status: normalizeFeeStatus(fee.status),
      }))
    : [];

  const calendarEvents = Array.isArray(calendarData?.events)
    ? calendarData.events.map((event) => ({
        title: toString(event.title),
        startDate: normalizeDateOnlyString(event.start),
        endDate: normalizeDateOnlyString(event.end),
      }))
    : [];

  const downloads = Array.isArray(downloadsData?.downloads)
    ? downloadsData.downloads.map((item) => ({
        title: toString(item.title),
        date: normalizeDateOnlyString(item.date),
      }))
    : [];

  const attendance = Array.isArray(attendanceData?.attendance)
    ? attendanceData.attendance.map((item) => ({
        courseCode: toString(item.code || item.courseCode || item.course || ''),
        present: Math.round(toNumber(item.present, 0)),
        absent: Math.round(toNumber(item.absent, 0)),
        percentage: toNumber(item.percentage, 0),
      }))
    : [];

  const results = Array.isArray(resultsData?.results)
    ? resultsData.results.map((item) => ({
        semester: toString(item.semester),
        sgpa: toNumber(item.sgpa, 0),
        cgpa: toNumber(item.cgpa, 0),
        sgpaGrade: normalizeSgpaBand(item.sgpaGrade),
      }))
    : [];

  const routines = Array.isArray(routinesData?.semesters)
    ? routinesData.semesters.map((item) => ({
        semester: toString(item.semester),
        routine: Array.isArray(item.routine)
          ? item.routine.map((entry) => ({
              day: toString(entry.day),
              time: toString(entry.time),
              courseCode: toString(entry.course),
              facultyCode: toString(entry.fc),
              room: toString(entry.room),
            }))
          : [],
      }))
    : [];

  const marks = Array.isArray(marksData?.semesters)
    ? marksData.semesters.map((item) => ({
        semester: toString(item.semester),
        subjects: Array.isArray(item.subjects)
          ? item.subjects.map((subject) => ({
              code: toString(subject.code),
              name: toString(subject.name),
              mark: toNullableInt(subject.mark),
            }))
          : [],
      }))
    : [];

  const requiredFieldIssues = [];

  if (user && (!user.studentId || !user.name || !user.email)) {
    requiredFieldIssues.push('user.json missing one or more required fields: id, name, email');
  }

  const missingCourseKeys = courses
    .filter((course) => !course.code || !course.semester)
    .map((course) => `${course.code}|${course.semester}`);
  if (missingCourseKeys.length > 0) {
    requiredFieldIssues.push(`courses.json has ${missingCourseKeys.length} rows missing code/semester`);
  }

  const missingResultKeys = results
    .filter((item) => !item.semester)
    .map((item) => item.semester);
  if (missingResultKeys.length > 0) {
    requiredFieldIssues.push(`results.json has ${missingResultKeys.length} rows missing semester`);
  }

  const routineEntries = routines.reduce((total, item) => total + item.routine.length, 0);
  const markSubjects = marks.reduce((total, item) => total + item.subjects.length, 0);

  return {
    user,
    courses,
    pendingCourses,
    presentCourses,
    fees,
    calendarEvents,
    downloads,
    attendance,
    results,
    routines,
    marks,
    counts: {
      user: user ? 1 : 0,
      courses: courses.length,
      pendingCourses: pendingCourses.length,
      presentCourses: presentCourses.length,
      fees: fees.length,
      calendarEvents: calendarEvents.length,
      downloads: downloads.length,
      attendance: attendance.length,
      results: results.length,
      routineSemesters: routines.length,
      routineEntries,
      marksSemesters: marks.length,
      markSubjects,
    },
    requiredFieldIssues,
  };
}

async function loadActual(prisma) {
  const [
    userCount,
    coursesCount,
    pendingCoursesCount,
    presentCoursesCount,
    feesCount,
    calendarEventsCount,
    downloadsCount,
    attendanceCount,
    resultsCount,
    routineSemestersCount,
    routineEntriesCount,
    marksSemestersCount,
    markSubjectsCount,
    users,
    courseSamples,
    feeSamples,
    resultSamples,
    routineSemesterRows,
    routineEntryRows,
    marksSemesterRows,
    markSubjectRows,
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.course.count(),
    prisma.pendingCourse.count(),
    prisma.presentCourse.count(),
    prisma.feeRecord.count(),
    prisma.calendarEvent.count(),
    prisma.download.count(),
    prisma.attendanceRecord.count(),
    prisma.resultRecord.count(),
    prisma.routineSemester.count(),
    prisma.routineEntry.count(),
    prisma.marksSemester.count(),
    prisma.markSubject.count(),
    prisma.userProfile.findMany({
      select: { name: true, studentId: true, email: true },
      take: 1,
    }),
    prisma.course.findMany({
      select: { code: true, semester: true, section: true, credits: true },
      orderBy: [{ code: 'asc' }, { semester: 'asc' }, { section: 'asc' }],
      take: 5,
    }),
    prisma.feeRecord.findMany({
      select: { semester: true, demand: true, waiver: true, paid: true, status: true },
      orderBy: [{ semester: 'asc' }],
      take: 5,
    }),
    prisma.resultRecord.findMany({
      select: { semester: true, sgpa: true, cgpa: true, sgpaGrade: true },
      orderBy: [{ semester: 'asc' }],
      take: 5,
    }),
    prisma.routineSemester.findMany({
      select: { id: true, semester: true },
    }),
    prisma.routineEntry.findMany({
      select: { id: true, routineSemesterId: true },
      take: 200,
    }),
    prisma.marksSemester.findMany({
      select: { id: true, semester: true },
    }),
    prisma.markSubject.findMany({
      select: { id: true, marksSemesterId: true },
      take: 200,
    }),
  ]);

  return {
    counts: {
      user: userCount,
      courses: coursesCount,
      pendingCourses: pendingCoursesCount,
      presentCourses: presentCoursesCount,
      fees: feesCount,
      calendarEvents: calendarEventsCount,
      downloads: downloadsCount,
      attendance: attendanceCount,
      results: resultsCount,
      routineSemesters: routineSemestersCount,
      routineEntries: routineEntriesCount,
      marksSemesters: marksSemestersCount,
      markSubjects: markSubjectsCount,
    },
    user: users[0] || null,
    courseSamples,
    feeSamples,
    resultSamples,
    routineSemesterRows,
    routineEntryRows,
    marksSemesterRows,
    markSubjectRows,
  };
}

function sortCourseRows(rows) {
  return [...rows]
    .map((row) => ({
      code: toString(row.code),
      semester: toString(row.semester),
      section: toString(row.section) || '',
      credits: toNumber(row.credits, 0),
    }))
    .sort((a, b) =>
      `${a.code}|${a.semester}|${a.section}`.localeCompare(`${b.code}|${b.semester}|${b.section}`),
    );
}

function sortFeeRows(rows) {
  return [...rows]
    .map((row) => ({
      semester: toString(row.semester),
      demand: Math.round(toNumber(row.demand, 0)),
      waiver: Math.round(toNumber(row.waiver, 0)),
      paid: Math.round(toNumber(row.paid, 0)),
      status: normalizeFeeStatus(row.status),
    }))
    .sort((a, b) => a.semester.localeCompare(b.semester));
}

function sortResultRows(rows) {
  return [...rows]
    .map((row) => ({
      semester: toString(row.semester),
      sgpa: toNumber(row.sgpa, 0),
      cgpa: toNumber(row.cgpa, 0),
      sgpaGrade: normalizeSgpaBand(row.sgpaGrade),
    }))
    .sort((a, b) => a.semester.localeCompare(b.semester));
}

function compareSamples(expectedRows, actualRows, labelBuilder) {
  const expectedMap = new Map(expectedRows.map((row) => [labelBuilder(row), JSON.stringify(row)]));
  const actualMap = new Map(actualRows.map((row) => [labelBuilder(row), JSON.stringify(row)]));

  const missingInDb = [];
  const mismatched = [];

  for (const [key, expectedJson] of expectedMap) {
    if (!actualMap.has(key)) {
      missingInDb.push(key);
      continue;
    }

    if (actualMap.get(key) !== expectedJson) {
      mismatched.push(key);
    }
  }

  return { missingInDb, mismatched };
}

function buildCountComparison(expected, actual) {
  return Object.keys(expected).map((key) => ({
    key,
    expected: expected[key],
    actual: actual[key],
    match: expected[key] === actual[key],
  }));
}

function renderTable(rows) {
  if (rows.length === 0) {
    return ['| Field | Value |', '|---|---|', '| none | none |'].join('\n');
  }

  return ['| Field | Value |', '|---|---|', ...rows.map((row) => `| ${row.field} | ${row.value} |`)].join('\n');
}

function formatJsonBlock(value) {
  return `\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;
}

function buildReport({ expected, actual, dbAvailable, dbError }) {
  const now = new Date().toISOString();
  const lines = [];

  lines.push('# Data Verification Report');
  lines.push('');
  lines.push(`- Generated at: ${now}`);
  lines.push(`- Mode: ${dbAvailable ? 'json-vs-postgres' : 'json-only'}`);
  lines.push(`- Database reachable: ${dbAvailable ? 'yes' : 'no'}`);

  if (dbError) {
    lines.push(`- Database error: ${dbError}`);
  }

  lines.push('');
  lines.push('## Count Comparison');

  if (!dbAvailable) {
    lines.push('Database counts are not available in this run.');
    lines.push(formatJsonBlock(expected.counts));
    lines.push('');
    lines.push('## Result');
    lines.push('- Status: Blocked');
    lines.push('- Reason: PostgreSQL connection is unavailable.');
    return lines.join('\n');
  }

  const countComparison = buildCountComparison(expected.counts, actual.counts);
  const countRows = countComparison.map((row) => ({
    field: row.key,
    value: `${row.expected} vs ${row.actual} (${row.match ? 'match' : 'mismatch'})`,
  }));
  lines.push(renderTable(countRows));

  lines.push('');
  lines.push('## Required Fields and Integrity Checks');

  const requiredIssues = [...expected.requiredFieldIssues];

  const routineSemesterIds = new Set(actual.routineSemesterRows.map((row) => row.id));
  const routineOrphans = actual.routineEntryRows.filter((row) => !routineSemesterIds.has(row.routineSemesterId));

  const marksSemesterIds = new Set(actual.marksSemesterRows.map((row) => row.id));
  const marksOrphans = actual.markSubjectRows.filter((row) => !marksSemesterIds.has(row.marksSemesterId));

  const integrityRows = [
    {
      field: 'json required-field issues',
      value: requiredIssues.length === 0 ? 'none' : requiredIssues.join('; '),
    },
    {
      field: 'routine entry orphan refs',
      value: String(routineOrphans.length),
    },
    {
      field: 'mark subject orphan refs',
      value: String(marksOrphans.length),
    },
  ];
  lines.push(renderTable(integrityRows));

  const expectedCourseSamples = sortCourseRows(expected.courses).slice(0, 5);
  const actualCourseSamples = sortCourseRows(actual.courseSamples);
  const courseDiff = compareSamples(
    expectedCourseSamples,
    actualCourseSamples,
    (row) => `${row.code}|${row.semester}|${row.section}`,
  );

  const expectedFeeSamples = sortFeeRows(expected.fees).slice(0, 5);
  const actualFeeSamples = sortFeeRows(actual.feeSamples);
  const feeDiff = compareSamples(expectedFeeSamples, actualFeeSamples, (row) => row.semester);

  const expectedResultSamples = sortResultRows(expected.results).slice(0, 5);
  const actualResultSamples = sortResultRows(actual.resultSamples);
  const resultDiff = compareSamples(expectedResultSamples, actualResultSamples, (row) => row.semester);

  lines.push('');
  lines.push('## Sampled Record Comparisons');

  const sampleRows = [
    {
      field: 'user sample',
      value:
        JSON.stringify(expected.user || {}) === JSON.stringify(actual.user || {}) ? 'match' : 'mismatch',
    },
    {
      field: 'course samples missing in db',
      value: String(courseDiff.missingInDb.length),
    },
    {
      field: 'course sample field mismatches',
      value: String(courseDiff.mismatched.length),
    },
    {
      field: 'fee samples missing in db',
      value: String(feeDiff.missingInDb.length),
    },
    {
      field: 'fee sample field mismatches',
      value: String(feeDiff.mismatched.length),
    },
    {
      field: 'result samples missing in db',
      value: String(resultDiff.missingInDb.length),
    },
    {
      field: 'result sample field mismatches',
      value: String(resultDiff.mismatched.length),
    },
  ];
  lines.push(renderTable(sampleRows));

  const criticalMismatchCount =
    countComparison.filter((row) => !row.match).length +
    requiredIssues.length +
    routineOrphans.length +
    marksOrphans.length +
    courseDiff.missingInDb.length +
    courseDiff.mismatched.length +
    feeDiff.missingInDb.length +
    feeDiff.mismatched.length +
    resultDiff.missingInDb.length +
    resultDiff.mismatched.length +
    (JSON.stringify(expected.user || {}) === JSON.stringify(actual.user || {}) ? 0 : 1);

  lines.push('');
  lines.push('## Result');
  lines.push(`- Status: ${criticalMismatchCount === 0 ? 'Pass' : 'Fail'}`);
  lines.push(`- Critical mismatches: ${criticalMismatchCount}`);

  return lines.join('\n');
}

async function ensureDocsDir() {
  await fs.mkdir(docsRoot, { recursive: true });
}

async function main() {
  await loadEnvFile();
  await ensureDocsDir();

  const expected = await loadExpected();

  if (jsonOnly) {
    const report = buildReport({ expected, dbAvailable: false });
    await fs.writeFile(outputPath, report, 'utf8');
    console.log(`[db-verify] JSON-only report written to ${path.relative(projectRoot, outputPath)}`);
    return;
  }

  const dbUrl = process.env[dbUrlEnvKey];
  const prisma = dbUrl
    ? new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      })
    : new PrismaClient();
  let actual = null;
  let dbError = null;

  try {
    actual = await loadActual(prisma);
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  } finally {
    await prisma.$disconnect();
  }

  if (!actual) {
    const report = buildReport({ expected, dbAvailable: false, dbError });
    await fs.writeFile(outputPath, report, 'utf8');
    console.log(`[db-verify] Report written to ${path.relative(projectRoot, outputPath)} (DB unavailable)`);
    process.exit(1);
  }

  const report = buildReport({ expected, actual, dbAvailable: true });
  await fs.writeFile(outputPath, report, 'utf8');
  console.log(`[db-verify] Report written to ${path.relative(projectRoot, outputPath)}`);

  if (report.includes('- Status: Fail')) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[db-verify] Verification failed:', error);
  process.exit(1);
});
