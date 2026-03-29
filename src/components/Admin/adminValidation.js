function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function validateListHasItems(items, name) {
  if (!Array.isArray(items) || items.length === 0) {
    return `${name} cannot be empty.`;
  }
  return null;
}

export function validateProfilePayload(user) {
  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return 'Profile payload must be an object.';
  }

  const requiredFields = ['name', 'id', 'department', 'program', 'email'];
  for (const field of requiredFields) {
    if (!isNonEmptyString(user[field])) {
      return `Profile field "${field}" is required.`;
    }
  }

  return null;
}

export function validateRoutineSemesters(semesters) {
  const listError = validateListHasItems(semesters, 'Routine semesters');
  if (listError) return listError;

  for (const semesterEntry of semesters) {
    if (!isNonEmptyString(semesterEntry?.semester)) {
      return 'Each routine semester must have a valid semester name.';
    }

    if (!Array.isArray(semesterEntry?.routine) || semesterEntry.routine.length === 0) {
      return `Routine semester "${semesterEntry.semester}" must contain at least one class.`;
    }

    for (const classItem of semesterEntry.routine) {
      if (
        !isNonEmptyString(classItem?.day) ||
        !isNonEmptyString(classItem?.time) ||
        !isNonEmptyString(classItem?.course) ||
        !isNonEmptyString(classItem?.fc) ||
        !isNonEmptyString(classItem?.room)
      ) {
        return `Every routine class in "${semesterEntry.semester}" must include day, time, course, faculty, and room.`;
      }
    }
  }

  return null;
}

export function validateFeesPayload(fees) {
  const listError = validateListHasItems(fees, 'Fees');
  if (listError) return listError;

  for (const fee of fees) {
    if (!isNonEmptyString(fee?.semester)) {
      return 'Each fee entry must include semester.';
    }

    if (
      !isFiniteNumber(fee?.demand) ||
      !isFiniteNumber(fee?.waiver) ||
      !isFiniteNumber(fee?.paid)
    ) {
      return `Fee values for "${fee.semester}" must be valid numbers.`;
    }
  }

  return null;
}

export function validateCalendarPayload(events) {
  const listError = validateListHasItems(events, 'Calendar events');
  if (listError) return listError;

  for (const event of events) {
    if (
      !isNonEmptyString(event?.title) ||
      !isNonEmptyString(event?.dateText) ||
      !isNonEmptyString(event?.start) ||
      !isNonEmptyString(event?.end)
    ) {
      return 'Every calendar event must include title, date text, start, and end.';
    }
  }

  return null;
}

export function validateDownloadsPayload(downloads) {
  const listError = validateListHasItems(downloads, 'Downloads');
  if (listError) return listError;

  for (const item of downloads) {
    if (
      !isNonEmptyString(item?.title) ||
      !isNonEmptyString(item?.category) ||
      !isNonEmptyString(item?.url) ||
      !isNonEmptyString(item?.date)
    ) {
      return 'Every download item must include title, category, url, and date.';
    }
  }

  return null;
}

export function validateCoursesPayload(courses) {
  const listError = validateListHasItems(courses, 'Courses');
  if (listError) return listError;

  for (const course of courses) {
    if (
      !isNonEmptyString(course?.code) ||
      !isNonEmptyString(course?.name) ||
      !isNonEmptyString(course?.semester)
    ) {
      return 'Every course must include code, name, and semester.';
    }

    if (!isFiniteNumber(course?.credits)) {
      return `Credits must be numeric for course "${course.code}".`;
    }
  }

  return null;
}

export function validatePendingCoursesPayload(pendingCourses) {
  if (!Array.isArray(pendingCourses)) {
    return 'Pending courses payload must be an array.';
  }

  for (const course of pendingCourses) {
    if (!isNonEmptyString(course?.code) || !isNonEmptyString(course?.name)) {
      return 'Every pending course must include code and name.';
    }
  }

  return null;
}

export function validateMarksSemestersPayload(semesters) {
  const listError = validateListHasItems(semesters, 'Marks semesters');
  if (listError) return listError;

  for (const semesterEntry of semesters) {
    if (!isNonEmptyString(semesterEntry?.semester)) {
      return 'Each marks semester must have a valid semester name.';
    }

    if (!Array.isArray(semesterEntry?.subjects) || semesterEntry.subjects.length === 0) {
      return `Marks semester "${semesterEntry.semester}" must include at least one subject.`;
    }

    for (const subject of semesterEntry.subjects) {
      if (!isNonEmptyString(subject?.code) || !isNonEmptyString(subject?.name)) {
        return `Each subject in "${semesterEntry.semester}" must include code and name.`;
      }

      if (subject?.mark !== null && subject?.mark !== '' && !isFiniteNumber(subject?.mark)) {
        return `Subject mark for "${subject.code}" in "${semesterEntry.semester}" must be numeric.`;
      }
    }
  }

  return null;
}
