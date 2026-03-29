export class RequestValidationError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.status = 400;
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = undefined) {
  return new RequestValidationError(code, message, details);
}

function isObjectLike(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringWithin(value, minLength = 0, maxLength = 300) {
  return (
    typeof value === 'string' &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength
  );
}

function hasUnsafeMarkup(value) {
  if (typeof value !== 'string') {
    return false;
  }

  return /<\s*\/?\s*script\b|javascript:/i.test(value);
}

function validateNoUnsafeStrings(input, path = 'payload') {
  if (Array.isArray(input)) {
    for (let index = 0; index < input.length; index += 1) {
      validateNoUnsafeStrings(input[index], `${path}[${index}]`);
    }
    return;
  }

  if (!isObjectLike(input)) {
    return;
  }

  Object.entries(input).forEach(([key, value]) => {
    const nextPath = `${path}.${key}`;
    if (typeof value === 'string' && hasUnsafeMarkup(value)) {
      throw fail('PAYLOAD_UNSAFE_CONTENT', 'Payload contains unsafe content.', {
        field: nextPath,
      });
    }

    if (Array.isArray(value) || isObjectLike(value)) {
      validateNoUnsafeStrings(value, nextPath);
    }
  });
}

function assertArrayWithLimit(value, key, maxItems = 1000) {
  if (!Array.isArray(value)) {
    throw fail(`${key.toUpperCase()}_PAYLOAD_INVALID`, `Invalid payload. Expected { ${key}: [] }`);
  }

  if (value.length > maxItems) {
    throw fail(`${key.toUpperCase()}_PAYLOAD_TOO_LARGE`, `${key} exceeds allowed item limit.`, {
      key,
      maxItems,
    });
  }
}

function validateResultsItem(item, index) {
  if (!isObjectLike(item)) {
    throw fail('RESULTS_ITEM_INVALID', 'Each result entry must be an object.', { index });
  }

  if (!isStringWithin(item.semester, 1, 40)) {
    throw fail('RESULTS_SEMESTER_INVALID', 'Result semester is required.', { index });
  }

  if (!isFiniteNumber(item.sgpa) || item.sgpa < 0 || item.sgpa > 4) {
    throw fail('RESULTS_SGPA_INVALID', 'SGPA must be a number between 0 and 4.', { index });
  }

  if (!isFiniteNumber(item.cgpa) || item.cgpa < 0 || item.cgpa > 4) {
    throw fail('RESULTS_CGPA_INVALID', 'CGPA must be a number between 0 and 4.', { index });
  }
}

function validateMarksItem(item, index) {
  if (!isObjectLike(item)) {
    throw fail('MARKS_ITEM_INVALID', 'Each marks semester entry must be an object.', { index });
  }

  if (!isStringWithin(item.semester, 1, 40)) {
    throw fail('MARKS_SEMESTER_INVALID', 'Marks semester is required.', { index });
  }

  if (!Array.isArray(item.subjects)) {
    throw fail('MARKS_SUBJECTS_INVALID', 'Marks semester must contain a subjects array.', {
      index,
    });
  }

  item.subjects.forEach((subject, subjectIndex) => {
    if (!isObjectLike(subject)) {
      throw fail('MARKS_SUBJECT_INVALID', 'Each marks subject must be an object.', {
        index,
        subjectIndex,
      });
    }

    if (!isStringWithin(subject.code, 1, 30) || !isStringWithin(subject.name, 1, 200)) {
      throw fail('MARKS_SUBJECT_FIELDS_INVALID', 'Marks subject code and name are required.', {
        index,
        subjectIndex,
      });
    }

    const markIsValid =
      subject.mark === null || subject.mark === undefined || isFiniteNumber(subject.mark);
    if (!markIsValid) {
      throw fail('MARKS_SUBJECT_MARK_INVALID', 'Marks subject mark must be a number or null.', {
        index,
        subjectIndex,
      });
    }
  });
}

export function validateUserPayload(req, _res, next) {
  try {
    const incomingUser = req.body?.user;
    if (!isObjectLike(incomingUser)) {
      throw fail('USER_PAYLOAD_INVALID', 'Invalid payload. Expected { user: {...} }');
    }

    if (!isStringWithin(incomingUser.name, 1, 120)) {
      throw fail('USER_NAME_INVALID', 'User name is required.');
    }

    if (!isStringWithin(incomingUser.id, 1, 40) && !isStringWithin(incomingUser.studentId, 1, 40)) {
      throw fail('USER_ID_INVALID', 'User id or studentId is required.');
    }

    if (incomingUser.email && !isStringWithin(incomingUser.email, 3, 160)) {
      throw fail('USER_EMAIL_INVALID', 'User email is invalid.');
    }

    validateNoUnsafeStrings(incomingUser, 'user');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateRoutinesPayload(req, _res, next) {
  try {
    const incomingSemesters = req.body?.semesters;
    const incomingSemester = req.body?.semester;
    const incomingRoutine = req.body?.routine;

    const isSemestersShape = Array.isArray(incomingSemesters);
    const isSingleSemesterShape =
      typeof incomingSemester === 'string' && Array.isArray(incomingRoutine);

    if (!isSemestersShape && !isSingleSemesterShape) {
      throw fail(
        'ROUTINES_PAYLOAD_INVALID',
        'Invalid payload. Expected { semesters: [] } or { semester: string, routine: [] }'
      );
    }

    const semesters = isSemestersShape
      ? incomingSemesters
      : [{ semester: incomingSemester, routine: incomingRoutine }];

    if (semesters.length > 200) {
      throw fail('ROUTINES_PAYLOAD_TOO_LARGE', 'Too many routine semesters.');
    }

    semesters.forEach((entry, index) => {
      if (!isObjectLike(entry) || !isStringWithin(entry.semester, 1, 40)) {
        throw fail('ROUTINES_SEMESTER_INVALID', 'Routine semester is invalid.', { index });
      }

      if (!Array.isArray(entry.routine)) {
        throw fail('ROUTINES_ENTRIES_INVALID', 'Routine list must be an array.', { index });
      }

      entry.routine.forEach((row, rowIndex) => {
        if (!isObjectLike(row)) {
          throw fail('ROUTINE_ROW_INVALID', 'Routine row must be an object.', { index, rowIndex });
        }

        ['day', 'time', 'course', 'fc', 'room'].forEach((field) => {
          const value = row[field];
          if (value && !isStringWithin(value, 1, 120)) {
            throw fail('ROUTINE_FIELD_INVALID', `Routine field ${field} is invalid.`, {
              index,
              rowIndex,
              field,
            });
          }
        });
      });
    });

    validateNoUnsafeStrings(semesters, 'routines');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateFeesPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.fees, 'fees', 400);
    req.body.fees.forEach((item, index) => {
      if (!isObjectLike(item) || !isStringWithin(item.semester, 1, 40)) {
        throw fail('FEES_ITEM_INVALID', 'Fee item semester is required.', { index });
      }

      ['demand', 'waiver', 'paid', 'statusAmount'].forEach((field) => {
        const value = item[field];
        if (value !== undefined && value !== null && !isFiniteNumber(value)) {
          throw fail('FEES_NUMBER_INVALID', `Fee field ${field} must be a number.`, {
            index,
            field,
          });
        }
      });

      if (item.status && !['ok', 'due'].includes(String(item.status).toLowerCase())) {
        throw fail('FEES_STATUS_INVALID', 'Fee status must be ok or due.', { index });
      }
    });

    validateNoUnsafeStrings(req.body.fees, 'fees');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateCalendarPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.events, 'events', 1000);
    req.body.events.forEach((event, index) => {
      if (!isObjectLike(event)) {
        throw fail('CALENDAR_EVENT_INVALID', 'Calendar event must be an object.', { index });
      }

      ['title', 'dateText', 'start', 'end'].forEach((field) => {
        if (!isStringWithin(event[field], 1, 200)) {
          throw fail('CALENDAR_EVENT_FIELD_INVALID', `Calendar field ${field} is required.`, {
            index,
            field,
          });
        }
      });
    });

    validateNoUnsafeStrings(req.body.events, 'events');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateDownloadsPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.downloads, 'downloads', 1000);
    req.body.downloads.forEach((item, index) => {
      if (!isObjectLike(item)) {
        throw fail('DOWNLOAD_ITEM_INVALID', 'Download entry must be an object.', { index });
      }

      if (!isStringWithin(item.title, 1, 200) || !isStringWithin(item.category, 1, 80)) {
        throw fail('DOWNLOAD_FIELDS_INVALID', 'Download title and category are required.', {
          index,
        });
      }

      if (!isStringWithin(item.url, 1, 500)) {
        throw fail('DOWNLOAD_URL_INVALID', 'Download url is required.', { index });
      }
    });

    validateNoUnsafeStrings(req.body.downloads, 'downloads');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateCoursesPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.courses, 'courses', 2000);
    req.body.courses.forEach((item, index) => {
      if (!isObjectLike(item)) {
        throw fail('COURSE_ITEM_INVALID', 'Course entry must be an object.', { index });
      }

      if (
        !isStringWithin(item.code, 1, 40) ||
        !isStringWithin(item.name, 1, 200) ||
        !isStringWithin(item.semester, 1, 40)
      ) {
        throw fail('COURSE_FIELDS_INVALID', 'Course code, name and semester are required.', {
          index,
        });
      }

      if (item.credits !== undefined && item.credits !== null) {
        if (!isFiniteNumber(item.credits) || item.credits < 0 || item.credits > 30) {
          throw fail('COURSE_CREDITS_INVALID', 'Course credits must be between 0 and 30.', {
            index,
          });
        }
      }
    });

    validateNoUnsafeStrings(req.body.courses, 'courses');
    next();
  } catch (error) {
    next(error);
  }
}

export function validatePendingCoursesPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.pendingCourses, 'pendingCourses', 1200);
    req.body.pendingCourses.forEach((item, index) => {
      if (!isObjectLike(item)) {
        throw fail('PENDING_COURSE_ITEM_INVALID', 'Pending course entry must be an object.', {
          index,
        });
      }

      if (!isStringWithin(item.code, 1, 40) || !isStringWithin(item.name, 1, 200)) {
        throw fail('PENDING_COURSE_FIELDS_INVALID', 'Pending course code and name are required.', {
          index,
        });
      }
    });

    validateNoUnsafeStrings(req.body.pendingCourses, 'pendingCourses');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateResultsPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.results, 'results', 200);
    req.body.results.forEach(validateResultsItem);
    validateNoUnsafeStrings(req.body.results, 'results');
    next();
  } catch (error) {
    next(error);
  }
}

export function validateMarksPayload(req, _res, next) {
  try {
    assertArrayWithLimit(req.body?.semesters, 'semesters', 200);
    req.body.semesters.forEach(validateMarksItem);
    validateNoUnsafeStrings(req.body.semesters, 'semesters');
    next();
  } catch (error) {
    next(error);
  }
}
