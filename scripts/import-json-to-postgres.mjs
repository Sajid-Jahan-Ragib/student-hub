import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.resolve(projectRoot, 'public/data');

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
    // Ignore when .env is not present; process env can still provide values.
  }
}

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const verbose = args.has('--verbose');

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
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function toDateOnly(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return new Date('1970-01-01');
  }
  return d;
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

async function readJson(fileName) {
  const filePath = path.resolve(dataRoot, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function loadPayload() {
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
        department: toString(userData.user.department),
        program: toString(userData.user.program),
        intake: toString(userData.user.intake),
        email: toString(userData.user.email),
        mobile: toString(userData.user.mobile) || null,
        gender: toString(userData.user.gender) || null,
        bloodGroup: toString(userData.user.bloodGroup) || null,
        admissionSemester: toString(userData.user.admissionSemester) || null,
        avatar: toString(userData.user.avatar) || null,
        avatarSmall: toString(userData.user.avatarSmall) || null,
      }
    : null;

  const courses = Array.isArray(coursesData?.courses)
    ? coursesData.courses.map((course) => ({
        code: toString(course.code),
        name: toString(course.name),
        semester: toString(course.semester),
        type: toString(course.type) || 'Theory',
        credits: toNumber(course.credits, 0),
        intake: toString(course.intake) || null,
        section: toString(course.section) || null,
        result: toString(course.result) || null,
        takeAs: toString(course.takeAs) || null,
      }))
    : [];

  const pendingCourses = Array.isArray(pendingCoursesData?.pendingCourses)
    ? pendingCoursesData.pendingCourses.map((course) => ({
        code: toString(course.code),
        name: toString(course.name),
        credits: toNumber(course.credits, 0),
        reason: toString(course.reason) || null,
        status: toString(course.status) || null,
      }))
    : [];

  const presentCourses = Array.isArray(presentCoursesData?.presentCourses)
    ? presentCoursesData.presentCourses.map((course) => ({
        code: toString(course.code),
        name: toString(course.name),
        credits: toNumber(course.credits, 0),
        instructor: toString(course.instructor) || null,
        status: toString(course.status) || null,
      }))
    : [];

  const fees = Array.isArray(feesData?.fees)
    ? feesData.fees.map((fee) => ({
        semester: toString(fee.semester),
        demand: Math.round(toNumber(fee.demand, 0)),
        waiver: Math.round(toNumber(fee.waiver, 0)),
        paid: Math.round(toNumber(fee.paid, 0)),
        status: normalizeFeeStatus(fee.status),
        statusText: toString(fee.statusText) || null,
        statusAmount: Math.round(toNumber(fee.statusAmount, 0)),
      }))
    : [];

  const calendarEvents = Array.isArray(calendarData?.events)
    ? calendarData.events.map((event) => ({
        title: toString(event.title),
        dateText: toString(event.dateText),
        tagType: toString(event.tagType),
        tagText: toString(event.tagText),
        startDate: toDateOnly(event.start),
        endDate: toDateOnly(event.end),
      }))
    : [];

  const downloads = Array.isArray(downloadsData?.downloads)
    ? downloadsData.downloads.map((item) => ({
        title: toString(item.title),
        category: toString(item.category),
        url: toString(item.url),
        date: toDateOnly(item.date),
      }))
    : [];

  const attendance = Array.isArray(attendanceData?.attendance)
    ? attendanceData.attendance.map((item) => ({
        courseCode: toString(item.code || item.courseCode || item.course || ''),
        courseName: toString(item.courseName || item.course || ''),
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

  const routineSemesters = Array.isArray(routinesData?.semesters)
    ? routinesData.semesters.map((item) => ({
        semester: toString(item.semester),
        routine: Array.isArray(item.routine)
          ? item.routine.map((entry, idx) => ({
              day: toString(entry.day),
              time: toString(entry.time),
              courseCode: toString(entry.course),
              facultyCode: toString(entry.fc),
              room: toString(entry.room),
              sortOrder: idx,
            }))
          : [],
      }))
    : [];

  const marksSemesters = Array.isArray(marksData?.semesters)
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
    routineSemesters,
    marksSemesters,
  };
}

function printSummary(payload, modeLabel) {
  const summary = {
    mode: modeLabel,
    user: payload.user ? 1 : 0,
    courses: payload.courses.length,
    pendingCourses: payload.pendingCourses.length,
    presentCourses: payload.presentCourses.length,
    fees: payload.fees.length,
    calendarEvents: payload.calendarEvents.length,
    downloads: payload.downloads.length,
    attendance: payload.attendance.length,
    results: payload.results.length,
    routineSemesters: payload.routineSemesters.length,
    routineEntries: payload.routineSemesters.reduce((acc, sem) => acc + sem.routine.length, 0),
    marksSemesters: payload.marksSemesters.length,
    markSubjects: payload.marksSemesters.reduce((acc, sem) => acc + sem.subjects.length, 0),
  };

  console.log('[db-import] Summary:', JSON.stringify(summary, null, 2));
}

async function applyImport(prisma, payload) {
  await prisma.$transaction(async (tx) => {
    await tx.markSubject.deleteMany();
    await tx.marksSemester.deleteMany();

    await tx.routineEntry.deleteMany();
    await tx.routineSemester.deleteMany();

    await tx.resultRecord.deleteMany();
    await tx.attendanceRecord.deleteMany();
    await tx.download.deleteMany();
    await tx.calendarEvent.deleteMany();
    await tx.feeRecord.deleteMany();
    await tx.presentCourse.deleteMany();
    await tx.pendingCourse.deleteMany();
    await tx.course.deleteMany();
    await tx.userProfile.deleteMany();

    if (payload.user) {
      await tx.userProfile.create({ data: payload.user });
    }

    if (payload.courses.length > 0) {
      await tx.course.createMany({ data: payload.courses });
    }

    if (payload.pendingCourses.length > 0) {
      await tx.pendingCourse.createMany({ data: payload.pendingCourses });
    }

    if (payload.presentCourses.length > 0) {
      await tx.presentCourse.createMany({ data: payload.presentCourses });
    }

    if (payload.fees.length > 0) {
      await tx.feeRecord.createMany({ data: payload.fees });
    }

    if (payload.calendarEvents.length > 0) {
      await tx.calendarEvent.createMany({ data: payload.calendarEvents });
    }

    if (payload.downloads.length > 0) {
      await tx.download.createMany({ data: payload.downloads });
    }

    if (payload.attendance.length > 0) {
      await tx.attendanceRecord.createMany({ data: payload.attendance });
    }

    if (payload.results.length > 0) {
      await tx.resultRecord.createMany({ data: payload.results });
    }

    const routineSemesterIdMap = new Map();
    for (const semester of payload.routineSemesters) {
      const created = await tx.routineSemester.create({
        data: {
          semester: semester.semester,
        },
      });
      routineSemesterIdMap.set(semester.semester, created.id);
    }

    const routineEntries = payload.routineSemesters.flatMap((semester) => {
      const routineSemesterId = routineSemesterIdMap.get(semester.semester);
      return semester.routine.map((entry) => ({
        routineSemesterId,
        day: entry.day,
        time: entry.time,
        courseCode: entry.courseCode,
        facultyCode: entry.facultyCode,
        room: entry.room,
        sortOrder: entry.sortOrder,
      }));
    });

    if (routineEntries.length > 0) {
      await tx.routineEntry.createMany({ data: routineEntries });
    }

    const marksSemesterIdMap = new Map();
    for (const semester of payload.marksSemesters) {
      const created = await tx.marksSemester.create({
        data: {
          semester: semester.semester,
        },
      });
      marksSemesterIdMap.set(semester.semester, created.id);
    }

    const markSubjects = payload.marksSemesters.flatMap((semester) => {
      const marksSemesterId = marksSemesterIdMap.get(semester.semester);
      return semester.subjects.map((subject) => ({
        marksSemesterId,
        code: subject.code,
        name: subject.name,
        mark: subject.mark,
      }));
    });

    if (markSubjects.length > 0) {
      await tx.markSubject.createMany({ data: markSubjects });
    }
  });
}

async function main() {
  await loadEnvFile();
  const payload = await loadPayload();

  if (dryRun) {
    printSummary(payload, 'dry-run');
    return;
  }

  const prisma = new PrismaClient();
  try {
    if (verbose) {
      console.log('[db-import] Starting import in apply mode...');
    }

    await applyImport(prisma, payload);
    printSummary(payload, 'applied');
    console.log('[db-import] Import completed successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[db-import] Import failed:', error);
  process.exit(1);
});
