import { getPrismaClient } from './prismaClient.js';

function asText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function toDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '1970-01-01';
  }
  return date.toISOString().slice(0, 10);
}

function buildCourseNameMap(courses) {
  return courses.reduce((acc, course) => {
    const code = asText(course.code).trim();
    const name = asText(course.name).trim();
    if (code && name) {
      acc[code] = name;
    }
    return acc;
  }, {});
}

export async function getUserPayload() {
  const prisma = getPrismaClient();
  const profile = await prisma.userProfile.findFirst({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  });

  if (!profile) {
    return { user: null };
  }

  return {
    user: {
      name: asText(profile.name),
      id: asText(profile.studentId),
      email: asText(profile.email),
      department: asText(profile.department),
      program: asText(profile.program),
      intake: asText(profile.intake),
      mobile: asText(profile.mobile),
      gender: asText(profile.gender),
      bloodGroup: asText(profile.bloodGroup),
      admissionSemester: asText(profile.admissionSemester),
      avatar: asText(profile.avatar),
      avatarSmall: asText(profile.avatarSmall),
    },
  };
}

export async function getRoutinesPayload() {
  const prisma = getPrismaClient();
  const routineSemesters = await prisma.routineSemester.findMany({
    include: {
      entries: {
        orderBy: [{ sortOrder: 'asc' }, { day: 'asc' }, { time: 'asc' }],
      },
    },
    orderBy: [{ semester: 'desc' }],
  });

  return {
    semesters: routineSemesters.map((semester) => ({
      semester: asText(semester.semester),
      routine: semester.entries.map((entry) => ({
        day: asText(entry.day),
        time: asText(entry.time),
        course: asText(entry.courseCode),
        fc: asText(entry.facultyCode),
        room: asText(entry.room),
      })),
    })),
  };
}

export async function getFeesPayload() {
  const prisma = getPrismaClient();
  const fees = await prisma.feeRecord.findMany({
    orderBy: [{ semester: 'desc' }],
  });

  return {
    fees: fees.map((fee) => ({
      semester: asText(fee.semester),
      demand: Number(fee.demand || 0),
      waiver: Number(fee.waiver || 0),
      paid: Number(fee.paid || 0),
      status: asText(fee.status).toLowerCase() === 'due' ? 'due' : 'ok',
      statusText: asText(fee.statusText),
      statusAmount: Number(fee.statusAmount || 0),
    })),
  };
}

export async function getCalendarPayload() {
  const prisma = getPrismaClient();
  const events = await prisma.calendarEvent.findMany({
    orderBy: [{ startDate: 'asc' }, { endDate: 'asc' }],
  });

  return {
    events: events.map((event) => ({
      title: asText(event.title),
      dateText: asText(event.dateText),
      tagType: asText(event.tagType),
      tagText: asText(event.tagText),
      start: toDateOnly(event.startDate),
      end: toDateOnly(event.endDate),
    })),
  };
}

export async function getDownloadsPayload() {
  const prisma = getPrismaClient();
  const downloads = await prisma.download.findMany({
    orderBy: [{ date: 'desc' }, { title: 'asc' }],
  });

  return {
    downloads: downloads.map((download) => ({
      title: asText(download.title),
      category: asText(download.category),
      url: asText(download.url),
      date: toDateOnly(download.date),
    })),
  };
}

export async function getCoursesPayload() {
  const prisma = getPrismaClient();
  const courses = await prisma.course.findMany({
    orderBy: [{ semester: 'desc' }, { code: 'asc' }, { section: 'asc' }],
  });

  return {
    courseNameMap: buildCourseNameMap(courses),
    courses: courses.map((course) => ({
      code: asText(course.code),
      name: asText(course.name),
      semester: asText(course.semester),
      type: asText(course.type),
      credits: Number(course.credits || 0),
      intake: asText(course.intake),
      section: asText(course.section),
      result: asText(course.result),
      takeAs: asText(course.takeAs),
    })),
  };
}

export async function getPendingCoursesPayload() {
  const prisma = getPrismaClient();
  const pendingCourses = await prisma.pendingCourse.findMany({
    orderBy: [{ code: 'asc' }],
  });

  return {
    pendingCourses: pendingCourses.map((course) => ({
      code: asText(course.code),
      name: asText(course.name),
      credits: Number(course.credits || 0),
      reason: asText(course.reason),
      status: asText(course.status),
    })),
  };
}

export async function getResultsPayload() {
  const prisma = getPrismaClient();
  const results = await prisma.resultRecord.findMany({
    orderBy: [{ semester: 'desc' }],
  });

  return {
    results: results.map((result) => ({
      semester: asText(result.semester),
      sgpa: Number(result.sgpa || 0),
      cgpa: Number(result.cgpa || 0),
      sgpaGrade: asText(result.sgpaGrade).toLowerCase() || 'mid',
    })),
  };
}

export async function getMarksPayload() {
  const prisma = getPrismaClient();
  const marksSemesters = await prisma.marksSemester.findMany({
    include: {
      subjects: {
        orderBy: [{ code: 'asc' }, { name: 'asc' }],
      },
    },
    orderBy: [{ semester: 'desc' }],
  });

  return {
    semesters: marksSemesters.map((semester) => ({
      semester: asText(semester.semester),
      subjects: semester.subjects.map((subject) => ({
        code: asText(subject.code),
        name: asText(subject.name),
        mark: subject.mark,
      })),
    })),
  };
}
