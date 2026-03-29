export function mapUserToForm(user) {
  return {
    name: user?.name || '',
    id: user?.id || '',
    department: user?.department || '',
    program: user?.program || '',
    intake: user?.intake || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    admissionSemester: user?.admissionSemester || '',
    avatar: user?.avatar || '',
    avatarSmall: user?.avatarSmall || '',
  };
}

export function toRoutineSemesters(allSemesters, fallbackSemester, fallbackRoutine) {
  if (Array.isArray(allSemesters) && allSemesters.length > 0) {
    return allSemesters
      .map((entry) => ({
        semester: String(entry?.semester || '').trim(),
        routine: Array.isArray(entry?.routine) ? entry.routine : [],
      }))
      .filter((entry) => entry.semester);
  }

  if (fallbackSemester) {
    return [
      {
        semester: fallbackSemester,
        routine: Array.isArray(fallbackRoutine) ? fallbackRoutine : [],
      },
    ];
  }

  return [];
}

export function normalizeRoutineSemestersPayload(payload) {
  if (Array.isArray(payload?.semesters)) {
    return payload.semesters;
  }

  if (typeof payload?.semester === 'string' && Array.isArray(payload?.routine)) {
    return [{ semester: payload.semester, routine: payload.routine }];
  }

  return null;
}

export function parseSingleRoutineSemesterPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  if (typeof payload.semester === 'string' && Array.isArray(payload.routine)) {
    return {
      semester: payload.semester,
      routine: payload.routine,
    };
  }

  if (payload.semesterData && typeof payload.semesterData === 'object') {
    const nested = payload.semesterData;
    if (typeof nested.semester === 'string' && Array.isArray(nested.routine)) {
      return {
        semester: nested.semester,
        routine: nested.routine,
      };
    }
  }

  return null;
}

export function normalizeFeeEntry(entry, toNumber) {
  return {
    semester: String(entry?.semester || '').trim(),
    demand: toNumber(entry?.demand),
    waiver: toNumber(entry?.waiver),
    paid: toNumber(entry?.paid),
    status:
      String(entry?.status || '')
        .trim()
        .toLowerCase() === 'due'
        ? 'due'
        : 'ok',
    statusText: String(entry?.statusText || '').trim(),
    statusAmount: toNumber(entry?.statusAmount),
  };
}

export function normalizeFeesPayload(payload) {
  if (Array.isArray(payload?.fees)) {
    return payload.fees;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return null;
}

export function parseSingleFeePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  if (typeof payload.semester === 'string') {
    return payload;
  }
  if (payload.fee && typeof payload.fee === 'object') {
    return payload.fee;
  }
  return null;
}

export function sortCalendarEvents(items) {
  return [...items].sort((a, b) => {
    const aStart = String(a?.start || '');
    const bStart = String(b?.start || '');
    if (aStart !== bStart) {
      return aStart.localeCompare(bStart);
    }

    const aEnd = String(a?.end || '');
    const bEnd = String(b?.end || '');
    if (aEnd !== bEnd) {
      return aEnd.localeCompare(bEnd);
    }

    return String(a?.title || '').localeCompare(String(b?.title || ''));
  });
}

export function normalizeDownloadItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      title: (item?.title || '').trim(),
      category: (item?.category || '').trim(),
      url: (item?.url || '').trim(),
      date: (item?.date || '').trim(),
    }))
    .filter((item) => item.title && item.category && item.url && item.date);
}

export function sortCoursesBySemesterDesc(items) {
  const semesterOrder = {
    WINTER: 0,
    SPRING: 1,
    SUMMER: 2,
    FALL: 3,
    AUTUMN: 3,
  };

  const parseSemester = (semesterText = '') => {
    const match = String(semesterText)
      .trim()
      .match(/^([A-Za-z]+)\s*,?\s*(\d{4})$/);
    if (!match) {
      return { year: -1, rank: -1 };
    }
    return {
      year: Number(match[2]),
      rank: semesterOrder[match[1].toUpperCase()] ?? -1,
    };
  };

  return [...items].sort((a, b) => {
    const aSem = parseSemester(a?.semester);
    const bSem = parseSemester(b?.semester);

    if (aSem.year !== bSem.year) {
      return bSem.year - aSem.year;
    }
    if (aSem.rank !== bSem.rank) {
      return bSem.rank - aSem.rank;
    }
    return String(a?.code || '').localeCompare(String(b?.code || ''));
  });
}

export function normalizePendingCourseItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      code: (item?.code || '').trim(),
      name: (item?.name || '').trim(),
      credits: Number.isFinite(Number(item?.credits)) ? Number(item.credits) : 0,
      reason: (item?.reason || '').trim(),
      status: (item?.status || 'pending').trim() || 'pending',
    }))
    .filter((item) => item.code && item.name);
}
