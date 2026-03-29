import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchData } from '../utils/dataParser';
import { sortFeesEntries } from '../utils/dateUtils';
import { buildInitialMarksFromCourses, normalizeMarksPayload } from '../utils/academicUtils';
import { getWriteRequestHeaders } from '../utils/apiClient';
import { useUIContext } from './UIContext';
import { useUserContext } from './UserContext';

const AcademicContext = createContext(null);

export function AcademicProvider({ children }) {
  const { currentScreen, setLoading, setError } = useUIContext();
  const { setUser } = useUserContext();

  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [routinesSemester, setRoutinesSemester] = useState('');
  const [routines, setRoutines] = useState([]);
  const [routinesSemesters, setRoutinesSemesters] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [presentCourses, setPresentCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [marksSemesters, setMarksSemesters] = useState([]);
  const activeSaveCountRef = useRef(0);

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return undefined;
    }

    if (currentScreen !== 'home') {
      return undefined;
    }

    const intervalId = setInterval(() => {
      loadAllData({ silent: true });
    }, 3000);

    const onWindowFocus = () => {
      loadAllData({ silent: true });
    };

    window.addEventListener('focus', onWindowFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen]);

  const fetchWithRetry = async (path, maxAttempts = 3) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await fetchData(path);
      } catch (error) {
        attempt += 1;
        if (attempt >= maxAttempts) {
          throw error;
        }

        const delayMs = 250 * attempt;
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
      }
    }

    return null;
  };

  const loadAllData = async ({ silent = false } = {}) => {
    if (silent && activeSaveCountRef.current > 0) {
      return;
    }

    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const datasets = [
        { key: 'userData', path: '/data/user.json' },
        { key: 'resultsData', path: '/data/results.json' },
        { key: 'feesData', path: '/data/fees.json' },
        { key: 'coursesData', path: '/data/courses.json' },
        { key: 'routinesData', path: '/data/routines.json' },
        { key: 'calendarData', path: '/data/calendar.json' },
        { key: 'attendanceData', path: '/data/attendance.json' },
        { key: 'downloadsData', path: '/data/downloads.json' },
        { key: 'presentCoursesData', path: '/data/present-courses.json' },
        { key: 'pendingCoursesData', path: '/data/pending-courses.json' },
        { key: 'marksData', path: '/data/marks.json' },
      ];

      const settled = await Promise.allSettled(
        datasets.map((item) => fetchWithRetry(item.path, 3))
      );
      const loaded = {};
      const failedDatasets = [];

      settled.forEach((result, index) => {
        const datasetKey = datasets[index].key;
        if (result.status === 'fulfilled') {
          loaded[datasetKey] = result.value;
          return;
        }

        failedDatasets.push(datasets[index].path);
        loaded[datasetKey] = null;
      });

      const userData = loaded.userData;
      const resultsData = loaded.resultsData;
      const feesData = loaded.feesData;
      const coursesData = loaded.coursesData;
      const routinesData = loaded.routinesData;
      const calendarData = loaded.calendarData;
      const attendanceData = loaded.attendanceData;
      const downloadsData = loaded.downloadsData;
      const presentCoursesData = loaded.presentCoursesData;
      const pendingCoursesData = loaded.pendingCoursesData;
      const marksData = loaded.marksData;

      if (userData?.user) setUser(userData.user);
      if (resultsData?.results) setResults(resultsData.results);
      if (feesData?.fees) setFees(sortFeesEntries(feesData.fees));
      if (coursesData) setCourses(coursesData);

      const normalizedRoutines = normalizeRoutinesData(routinesData);
      setRoutinesSemesters(normalizedRoutines.semesters);
      setRoutinesSemester(normalizedRoutines.currentSemester);
      setRoutines(normalizedRoutines.currentRoutine);

      if (calendarData?.events) setCalendarEvents(calendarData.events);
      if (attendanceData?.attendance) setAttendance(attendanceData.attendance);
      if (downloadsData?.downloads) setDownloads(downloadsData.downloads);
      if (presentCoursesData?.presentCourses) setPresentCourses(presentCoursesData.presentCourses);
      if (pendingCoursesData?.pendingCourses) setPendingCourses(pendingCoursesData.pendingCourses);

      const fallbackMarks = buildInitialMarksFromCourses(coursesData, {
        'BUS 2105': 40,
        'ECO 2102': 46,
        'FIN 2101': 18,
        'QUA 2102': 33,
        'QUA 2103': 17,
      });

      const loadedMarks = Array.isArray(marksData?.semesters)
        ? normalizeMarksPayload(marksData).map((entry) => ({
            semester: entry.semester,
            subjects: entry.subjects,
          }))
        : fallbackMarks;

      setMarksSemesters(loadedMarks);
      if (!silent && failedDatasets.length > 0) {
        setError(`Some datasets failed to load: ${failedDatasets.join(', ')}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const runWithSaveLock = async (saveAction) => {
    activeSaveCountRef.current += 1;
    try {
      return await saveAction();
    } finally {
      activeSaveCountRef.current = Math.max(0, activeSaveCountRef.current - 1);
    }
  };

  const updateRoutinesData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/routines', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Routine save failed (${response.status})`);
        }

        const savedData = await response.json();
        const normalizedRoutines = normalizeRoutinesData(savedData);
        setRoutinesSemesters(normalizedRoutines.semesters);
        setRoutinesSemester(normalizedRoutines.currentSemester);
        setRoutines(normalizedRoutines.currentRoutine);

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving routines:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updateFeesData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/fees', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Fees save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (savedData?.fees) {
          setFees(sortFeesEntries(savedData.fees));
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving fees:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updateCalendarData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/calendar', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Calendar save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (savedData?.events) {
          setCalendarEvents(savedData.events);
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving calendar:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updateDownloadsData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/downloads', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Downloads save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (Array.isArray(savedData?.downloads)) {
          setDownloads(savedData.downloads);
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving downloads:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updateCoursesData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/courses', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Courses save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (savedData) {
          setCourses(savedData);
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving courses:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updatePendingCoursesData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/pending-courses', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Pending courses save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (Array.isArray(savedData?.pendingCourses)) {
          setPendingCourses(savedData.pendingCourses);
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving pending courses:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updateResultsData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/results', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Results save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (Array.isArray(savedData?.results)) {
          setResults(savedData.results);
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving results:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const updateMarksData = async (updates) => {
    return runWithSaveLock(async () => {
      try {
        const response = await fetch('/api/v1/marks', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Marks save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (Array.isArray(savedData?.semesters)) {
          setMarksSemesters(
            normalizeMarksPayload(savedData).map((entry) => ({
              semester: entry.semester,
              subjects: entry.subjects,
            }))
          );
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving marks:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    });
  };

  const value = {
    results,
    fees,
    courses,
    routinesSemester,
    routines,
    routinesSemesters,
    calendarEvents,
    attendance,
    downloads,
    presentCourses,
    pendingCourses,
    marksSemesters,
    updateRoutinesData,
    updateFeesData,
    updateCalendarData,
    updateDownloadsData,
    updateCoursesData,
    updatePendingCoursesData,
    updateResultsData,
    updateMarksData,
    reloadData: loadAllData,
  };

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademicContext() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademicContext must be used within AcademicProvider');
  }
  return context;
}

function parseSemesterForSort(semesterText = '') {
  const order = {
    WINTER: 0,
    SPRING: 1,
    SUMMER: 2,
    FALL: 3,
    AUTUMN: 3,
  };

  const match = String(semesterText)
    .trim()
    .match(/^([A-Za-z]+)\s*,?\s*(\d{4})$/);
  if (!match) {
    return { year: -1, rank: -1 };
  }

  return {
    year: Number(match[2]),
    rank: order[match[1].toUpperCase()] ?? -1,
  };
}

function sortSemestersDesc(semesters = []) {
  return [...semesters].sort((a, b) => {
    const left = parseSemesterForSort(a?.semester);
    const right = parseSemesterForSort(b?.semester);

    if (left.year !== right.year) {
      return right.year - left.year;
    }
    if (left.rank !== right.rank) {
      return right.rank - left.rank;
    }

    return String(a?.semester || '').localeCompare(String(b?.semester || ''));
  });
}

function normalizeRoutinesData(rawData) {
  const semesters = Array.isArray(rawData?.semesters)
    ? rawData.semesters
    : [
        {
          semester: rawData?.semester || '',
          routine: Array.isArray(rawData?.routine) ? rawData.routine : [],
        },
      ];

  const cleanedSemesters = sortSemestersDesc(
    semesters
      .map((entry) => ({
        semester: String(entry?.semester || '').trim(),
        routine: Array.isArray(entry?.routine) ? entry.routine : [],
      }))
      .filter((entry) => entry.semester)
  );

  const current = cleanedSemesters[0] || { semester: '', routine: [] };

  return {
    semesters: cleanedSemesters,
    currentSemester: current.semester,
    currentRoutine: current.routine,
  };
}
