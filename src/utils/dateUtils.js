export const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseCalendarDatePart(rawPart) {
  const cleaned = rawPart.replace(/\s*\([^)]*\)/g, '').trim();
  const match = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3}),\s*(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = MONTHS[match[2]];
  const year = Number(match[3]);

  if (month === undefined) {
    return null;
  }

  return new Date(year, month, day);
}

export function parseCalendarDateRange(dateText) {
  const parts = dateText.split(' - ');
  const start = parseCalendarDatePart(parts[0]);
  const end = parts[1] ? parseCalendarDatePart(parts[1]) : start;

  if (!start || !end) {
    return null;
  }

  return {
    start: toDateOnly(start),
    end: toDateOnly(end),
  };
}

export function getTodayCode() {
  const dayCodes = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'];
  return dayCodes[new Date().getDay()];
}

const DAY_ORDER = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THR: 4,
  FRI: 5,
  SAT: 6,
};

function parseStartTimeMinutes(timeRange = '') {
  const match = String(timeRange).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    return Number.POSITIVE_INFINITY;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hour === 12) {
    hour = 0;
  }
  if (meridiem === 'PM') {
    hour += 12;
  }

  return hour * 60 + minute;
}

export function sortRoutineEntries(routine = []) {
  return [...routine].sort((a, b) => {
    const dayA = DAY_ORDER[(a?.day || '').toUpperCase()] ?? 99;
    const dayB = DAY_ORDER[(b?.day || '').toUpperCase()] ?? 99;

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    const timeA = parseStartTimeMinutes(a?.time || '');
    const timeB = parseStartTimeMinutes(b?.time || '');

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return String(a?.course || '').localeCompare(String(b?.course || ''));
  });
}

const SEMESTER_ORDER = {
  WINTER: 0,
  SPRING: 1,
  SUMMER: 2,
  FALL: 3,
  AUTUMN: 3,
};

function parseSemesterForSort(semesterText = '') {
  const raw = String(semesterText).trim();
  const match = raw.match(/^([A-Za-z]+)\s*,?\s*(\d{4})$/);

  if (!match) {
    return { year: -1, termRank: -1, raw };
  }

  const term = match[1].toUpperCase();
  const year = Number(match[2]);
  const termRank = SEMESTER_ORDER[term] ?? -1;

  return { year, termRank, raw };
}

export function sortFeesEntries(fees = []) {
  return [...fees].sort((a, b) => {
    const semesterA = parseSemesterForSort(a?.semester);
    const semesterB = parseSemesterForSort(b?.semester);

    if (semesterA.year !== semesterB.year) {
      return semesterB.year - semesterA.year;
    }

    if (semesterA.termRank !== semesterB.termRank) {
      return semesterB.termRank - semesterA.termRank;
    }

    return semesterA.raw.localeCompare(semesterB.raw);
  });
}

export function getRunningEventsToday(calendarEvents) {
  const today = toDateOnly(new Date());
  return calendarEvents.filter((eventItem) => {
    const startDate = toDateOnly(new Date(eventItem.start));
    const endDate = toDateOnly(new Date(eventItem.end));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return false;
    }

    return today >= startDate && today <= endDate;
  });
}

export function isNoClassDayByAcademicCalendar(calendarEvents) {
  const noClassTypes = new Set(['holiday', 'examination']);
  return getRunningEventsToday(calendarEvents).some((eventItem) =>
    noClassTypes.has(eventItem.tagType)
  );
}

function toDateOnlySafe(value) {
  const raw = new Date(value);
  if (Number.isNaN(raw.getTime())) {
    return null;
  }
  return toDateOnly(raw);
}

function getEventDateByTitle(calendarEvents, titleText) {
  const target = (calendarEvents || []).find(
    (eventItem) =>
      String(eventItem?.title || '')
        .trim()
        .toLowerCase() === String(titleText).trim().toLowerCase()
  );

  if (!target) {
    return null;
  }

  return toDateOnlySafe(target.start || target.end);
}

export function getClassStatusByAcademicCalendar(calendarEvents, date = new Date()) {
  const today = toDateOnly(date);
  const runningEvents = getRunningEventsToday(calendarEvents || []);
  const noClassTypes = new Set(['holiday', 'examination']);

  if (
    runningEvents.some((eventItem) =>
      noClassTypes.has(String(eventItem?.tagType || '').toLowerCase())
    )
  ) {
    return { noClass: true, reason: 'No classes today (holiday/exam)' };
  }

  const midtermLastClassDate = getEventDateByTitle(
    calendarEvents,
    'Last day of classes before Midterm Examination'
  );
  const midtermResumeDate = getEventDateByTitle(
    calendarEvents,
    'Classes resume after Midterm Examination'
  );

  if (midtermLastClassDate && midtermResumeDate && midtermResumeDate > midtermLastClassDate) {
    if (today > midtermLastClassDate && today < midtermResumeDate) {
      return { noClass: true, reason: 'No classes (midterm break)' };
    }
  }

  const finalLastClassDate = getEventDateByTitle(
    calendarEvents,
    'Last day of classes before Final Examination'
  );
  if (finalLastClassDate && today > finalLastClassDate) {
    return { noClass: true, reason: 'No classes after final pre-exam cutoff' };
  }

  return { noClass: false, reason: '' };
}

export function getTodaysClasses(routine) {
  const todayCode = getTodayCode();
  return sortRoutineEntries(routine.filter((item) => item.day === todayCode));
}

export function formatCourseLabel(shortCode, courseNameMap) {
  const longName = courseNameMap[shortCode];
  if (!longName) {
    return shortCode;
  }
  return `${longName} (${shortCode})`;
}

export function formatDate(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Date(date).toLocaleDateString('en-US', options);
}
