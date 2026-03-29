import { getPrismaClient } from './prismaClient.js';
import {
  normalizeCalendarEventForStorage,
  normalizeCourseForStorage,
  normalizeDownloadForStorage,
  normalizeFeeForStorage,
  normalizeMarkSemesterForStorage,
  normalizePendingCourseForStorage,
  normalizeResultForStorage,
  normalizeRoutineSemesterForStorage,
  normalizeUserForStorage,
} from './sharedNormalization.js';

export async function saveUserPayload(payload) {
  const prisma = getPrismaClient();
  const incomingUser = payload?.user || {};

  await prisma.$transaction(async (tx) => {
    await tx.userProfile.deleteMany();
    await tx.userProfile.create({
      data: normalizeUserForStorage(incomingUser),
    });
  });
}

export async function saveRoutinesPayload(payload) {
  const prisma = getPrismaClient();
  const semesters = Array.isArray(payload?.semesters)
    ? payload.semesters.map(normalizeRoutineSemesterForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.routineEntry.deleteMany();
    await tx.routineSemester.deleteMany();

    for (const semester of semesters) {
      const createdSemester = await tx.routineSemester.create({
        data: {
          semester: semester.semester,
        },
      });

      const entries = Array.isArray(semester.routine)
        ? semester.routine.map((entry) => ({
            routineSemesterId: createdSemester.id,
            day: entry.day,
            time: entry.time,
            courseCode: entry.courseCode,
            facultyCode: entry.facultyCode,
            room: entry.room,
            sortOrder: entry.sortOrder,
          }))
        : [];

      if (entries.length > 0) {
        await tx.routineEntry.createMany({ data: entries });
      }
    }
  });
}

export async function saveFeesPayload(payload) {
  const prisma = getPrismaClient();
  const fees = Array.isArray(payload?.fees) ? payload.fees.map(normalizeFeeForStorage) : [];

  await prisma.$transaction(async (tx) => {
    await tx.feeRecord.deleteMany();

    if (fees.length > 0) {
      await tx.feeRecord.createMany({
        data: fees,
      });
    }
  });
}

export async function saveCalendarPayload(payload) {
  const prisma = getPrismaClient();
  const events = Array.isArray(payload?.events)
    ? payload.events.map(normalizeCalendarEventForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.calendarEvent.deleteMany();

    if (events.length > 0) {
      await tx.calendarEvent.createMany({
        data: events,
      });
    }
  });
}

export async function saveDownloadsPayload(payload) {
  const prisma = getPrismaClient();
  const downloads = Array.isArray(payload?.downloads)
    ? payload.downloads.map(normalizeDownloadForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.download.deleteMany();

    if (downloads.length > 0) {
      await tx.download.createMany({
        data: downloads,
      });
    }
  });
}

export async function saveCoursesPayload(payload) {
  const prisma = getPrismaClient();
  const courses = Array.isArray(payload?.courses)
    ? payload.courses.map(normalizeCourseForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.course.deleteMany();

    if (courses.length > 0) {
      await tx.course.createMany({
        data: courses,
      });
    }
  });
}

export async function savePendingCoursesPayload(payload) {
  const prisma = getPrismaClient();
  const pendingCourses = Array.isArray(payload?.pendingCourses)
    ? payload.pendingCourses.map(normalizePendingCourseForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.pendingCourse.deleteMany();

    if (pendingCourses.length > 0) {
      await tx.pendingCourse.createMany({
        data: pendingCourses,
      });
    }
  });
}

export async function saveResultsPayload(payload) {
  const prisma = getPrismaClient();
  const results = Array.isArray(payload?.results)
    ? payload.results.map(normalizeResultForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.resultRecord.deleteMany();

    if (results.length > 0) {
      await tx.resultRecord.createMany({
        data: results,
      });
    }
  });
}

export async function saveMarksPayload(payload) {
  const prisma = getPrismaClient();
  const semesters = Array.isArray(payload?.semesters)
    ? payload.semesters.map(normalizeMarkSemesterForStorage)
    : [];

  await prisma.$transaction(async (tx) => {
    await tx.markSubject.deleteMany();
    await tx.marksSemester.deleteMany();

    for (const semester of semesters) {
      const createdSemester = await tx.marksSemester.create({
        data: {
          semester: semester.semester,
        },
      });

      const subjects = Array.isArray(semester.subjects)
        ? semester.subjects.map((subject) => ({
            marksSemesterId: createdSemester.id,
            code: subject.code,
            name: subject.name,
            mark: subject.mark,
          }))
        : [];

      if (subjects.length > 0) {
        await tx.markSubject.createMany({ data: subjects });
      }
    }
  });
}
