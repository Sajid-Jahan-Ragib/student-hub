function asText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toNullableInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return Math.round(numberValue);
}

function toDateOnlyDate(value) {
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return new Date('1970-01-01');
  }
  return dateValue;
}

function toDateOnlyIso(value) {
  return toDateOnlyDate(value).toISOString().slice(0, 10);
}

function toSafeUrl(value) {
  const url = asText(value);
  if (!url) return null;
  // Allow data URIs for avatar images (base64 profile photos), and http/https for regular URLs
  if (url.startsWith('data:image/')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch {
    // not a valid URL
  }
  return null;
}

function normalizeFeeStatus(status) {
  return asText(status).toLowerCase() === 'due' ? 'due' : 'ok';
}

function normalizeSgpaBand(value) {
  const normalized = asText(value).toLowerCase();
  if (normalized === 'high' || normalized === 'mid' || normalized === 'low') {
    return normalized;
  }
  return 'mid';
}

function normalizeUserForStorage(user) {
  return {
    name: asText(user?.name),
    studentId: asText(user?.id || user?.studentId),
    department: asText(user?.department),
    program: asText(user?.program),
    intake: asText(user?.intake),
    email: asText(user?.email),
    mobile: asText(user?.mobile) || null,
    gender: asText(user?.gender) || null,
    bloodGroup: asText(user?.bloodGroup) || null,
    admissionSemester: asText(user?.admissionSemester) || null,
    avatar: toSafeUrl(user?.avatar),
    avatarSmall: toSafeUrl(user?.avatarSmall),
  };
}

function projectUserForApi(profile) {
  return {
    name: asText(profile?.name),
    id: asText(profile?.studentId),
    email: asText(profile?.email),
    department: asText(profile?.department),
    program: asText(profile?.program),
    intake: asText(profile?.intake),
    mobile: asText(profile?.mobile),
    gender: asText(profile?.gender),
    bloodGroup: asText(profile?.bloodGroup),
    admissionSemester: asText(profile?.admissionSemester),
    avatar: asText(profile?.avatar),
    avatarSmall: asText(profile?.avatarSmall),
  };
}

function normalizeUserForApi(user) {
  return projectUserForApi(normalizeUserForStorage(user));
}

function normalizeCourseForStorage(course) {
  return {
    code: asText(course?.code),
    name: asText(course?.name),
    semester: asText(course?.semester),
    type: asText(course?.type),
    credits: toNumber(course?.credits, 0),
    intake: asText(course?.intake) || null,
    section: asText(course?.section) || null,
    result: asText(course?.result) || null,
    takeAs: asText(course?.takeAs) || null,
  };
}

function projectCourseForApi(course) {
  return {
    code: asText(course?.code),
    name: asText(course?.name),
    semester: asText(course?.semester),
    type: asText(course?.type),
    credits: toNumber(course?.credits, 0),
    intake: asText(course?.intake),
    section: asText(course?.section),
    result: asText(course?.result),
    takeAs: asText(course?.takeAs),
  };
}

function buildCourseNameMap(courses = []) {
  return courses.reduce((acc, course) => {
    const code = asText(course?.code).trim();
    const name = asText(course?.name).trim();
    if (code && name) {
      acc[code] = name;
    }
    return acc;
  }, {});
}

function normalizeFeeForStorage(fee) {
  return {
    semester: asText(fee?.semester),
    demand: Math.round(toNumber(fee?.demand, 0)),
    waiver: Math.round(toNumber(fee?.waiver, 0)),
    paid: Math.round(toNumber(fee?.paid, 0)),
    status: normalizeFeeStatus(fee?.status),
    statusText: asText(fee?.statusText) || null,
    statusAmount: Math.round(toNumber(fee?.statusAmount, 0)),
  };
}

function projectFeeForApi(fee) {
  return {
    semester: asText(fee?.semester),
    demand: Number(fee?.demand || 0),
    waiver: Number(fee?.waiver || 0),
    paid: Number(fee?.paid || 0),
    status: normalizeFeeStatus(fee?.status),
    statusText: asText(fee?.statusText),
    statusAmount: Number(fee?.statusAmount || 0),
  };
}

function normalizeCalendarEventForStorage(event) {
  return {
    title: asText(event?.title),
    dateText: asText(event?.dateText),
    tagType: asText(event?.tagType),
    tagText: asText(event?.tagText),
    startDate: toDateOnlyDate(event?.start || event?.startDate),
    endDate: toDateOnlyDate(event?.end || event?.endDate),
  };
}

function projectCalendarEventForApi(event) {
  return {
    title: asText(event?.title),
    dateText: asText(event?.dateText),
    tagType: asText(event?.tagType),
    tagText: asText(event?.tagText),
    start: toDateOnlyIso(event?.startDate || event?.start),
    end: toDateOnlyIso(event?.endDate || event?.end),
  };
}

function normalizeDownloadForStorage(download) {
  return {
    title: asText(download?.title),
    category: asText(download?.category),
    url: toSafeUrl(download?.url),
    date: toDateOnlyDate(download?.date),
  };
}

function projectDownloadForApi(download) {
  return {
    title: asText(download?.title),
    category: asText(download?.category),
    url: asText(download?.url),
    date: toDateOnlyIso(download?.date),
  };
}

function normalizePendingCourseForStorage(course) {
  return {
    code: asText(course?.code),
    name: asText(course?.name),
    credits: toNumber(course?.credits, 0),
    reason: asText(course?.reason) || null,
    status: asText(course?.status) || null,
  };
}

function projectPendingCourseForApi(course) {
  return {
    code: asText(course?.code),
    name: asText(course?.name),
    credits: Number(course?.credits || 0),
    reason: asText(course?.reason),
    status: asText(course?.status),
  };
}

function normalizePresentCourseForStorage(course) {
  return {
    code: asText(course?.code),
    name: asText(course?.name),
    credits: toNumber(course?.credits, 0),
    instructor: asText(course?.instructor) || null,
    status: asText(course?.status) || null,
  };
}

function projectPresentCourseForApi(course) {
  return {
    code: asText(course?.code),
    name: asText(course?.name),
    credits: Number(course?.credits || 0),
    instructor: asText(course?.instructor),
    status: asText(course?.status),
  };
}

function normalizeAttendanceForStorage(attendance) {
  return {
    courseCode: asText(attendance?.code || attendance?.courseCode || attendance?.course || ''),
    courseName: asText(attendance?.courseName || attendance?.course || ''),
    present: Math.round(toNumber(attendance?.present, 0)),
    absent: Math.round(toNumber(attendance?.absent, 0)),
    percentage: toNumber(attendance?.percentage, 0),
  };
}

function projectAttendanceForApi(attendance) {
  return {
    course: asText(attendance?.courseName || attendance?.courseCode),
    code: asText(attendance?.courseCode),
    present: Number(attendance?.present || 0),
    absent: Number(attendance?.absent || 0),
    percentage: Number(attendance?.percentage || 0),
  };
}

function normalizeResultForStorage(result) {
  return {
    semester: asText(result?.semester),
    sgpa: toNumber(result?.sgpa, 0),
    cgpa: toNumber(result?.cgpa, 0),
    sgpaGrade: normalizeSgpaBand(result?.sgpaGrade),
  };
}

function projectResultForApi(result) {
  return {
    semester: asText(result?.semester),
    sgpa: Number(result?.sgpa || 0),
    cgpa: Number(result?.cgpa || 0),
    sgpaGrade: normalizeSgpaBand(result?.sgpaGrade),
  };
}

function normalizeRoutineSemesterForStorage(semester) {
  const normalizedSemester = asText(semester?.semester).trim();
  const routine = Array.isArray(semester?.routine)
    ? semester.routine.map((entry, index) => ({
        day: asText(entry?.day),
        time: asText(entry?.time),
        courseCode: asText(entry?.course || entry?.courseCode),
        facultyCode: asText(entry?.fc || entry?.facultyCode),
        room: asText(entry?.room),
        sortOrder: index,
      }))
    : [];

  return {
    semester: normalizedSemester,
    routine,
  };
}

function normalizeRoutineSemesterForApi(semester) {
  const normalizedSemester = asText(semester?.semester).trim();
  const routine = Array.isArray(semester?.routine)
    ? semester.routine.map((entry) => ({
        day: asText(entry?.day),
        time: asText(entry?.time),
        course: asText(entry?.course || entry?.courseCode),
        fc: asText(entry?.fc || entry?.facultyCode),
        room: asText(entry?.room),
      }))
    : [];

  return {
    semester: normalizedSemester,
    routine,
  };
}

function projectRoutineEntryForApi(entry) {
  return {
    day: asText(entry?.day),
    time: asText(entry?.time),
    course: asText(entry?.courseCode),
    fc: asText(entry?.facultyCode),
    room: asText(entry?.room),
  };
}

function normalizeMarkSemesterForStorage(semester) {
  const normalizedSemester = asText(semester?.semester).trim();
  const subjects = Array.isArray(semester?.subjects)
    ? semester.subjects.map((subject) => ({
        code: asText(subject?.code),
        name: asText(subject?.name),
        mark: toNullableInt(subject?.mark),
      }))
    : [];

  return {
    semester: normalizedSemester,
    subjects,
  };
}

function normalizeMarkSemesterForApi(semester) {
  return {
    semester: asText(semester?.semester).trim(),
    subjects: Array.isArray(semester?.subjects)
      ? semester.subjects.map(projectMarkSubjectForApi)
      : [],
  };
}

function projectMarkSubjectForApi(subject) {
  return {
    code: asText(subject?.code),
    name: asText(subject?.name),
    mark: subject?.mark === null || subject?.mark === undefined ? null : Number(subject.mark),
  };
}

export {
  asText,
  toNumber,
  toNullableInt,
  toDateOnlyDate,
  toDateOnlyIso,
  normalizeFeeStatus,
  normalizeSgpaBand,
  normalizeUserForStorage,
  normalizeUserForApi,
  projectUserForApi,
  normalizeCourseForStorage,
  projectCourseForApi,
  buildCourseNameMap,
  normalizeFeeForStorage,
  projectFeeForApi,
  normalizeCalendarEventForStorage,
  projectCalendarEventForApi,
  normalizeDownloadForStorage,
  projectDownloadForApi,
  normalizePendingCourseForStorage,
  projectPendingCourseForApi,
  normalizePresentCourseForStorage,
  projectPresentCourseForApi,
  normalizeAttendanceForStorage,
  projectAttendanceForApi,
  normalizeResultForStorage,
  projectResultForApi,
  normalizeRoutineSemesterForStorage,
  normalizeRoutineSemesterForApi,
  projectRoutineEntryForApi,
  normalizeMarkSemesterForStorage,
  normalizeMarkSemesterForApi,
  projectMarkSubjectForApi,
};
