import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopBar, SectionTitle } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';
import { formatDate, sortFeesEntries, sortRoutineEntries } from '../../utils/dateUtils';
import {
  calculateAcademicSummary,
  normalizeMarksPayload,
  sortSemestersDesc,
  toNumber,
} from '../../utils/academicUtils';
import { AdminPanels } from './AdminPanels';
import {
  CALENDAR_JSON_PLACEHOLDER,
  COURSES_JSON_PLACEHOLDER,
  DOWNLOADS_JSON_PLACEHOLDER,
  FEES_JSON_PLACEHOLDER,
  FEE_SEMESTER_JSON_PLACEHOLDER,
  MARKS_JSON_PLACEHOLDER,
  PENDING_COURSES_JSON_PLACEHOLDER,
  PROFILE_JSON_PLACEHOLDER,
  ROUTINES_JSON_PLACEHOLDER,
  ROUTINE_SEMESTER_JSON_PLACEHOLDER,
} from './adminConstants';
import {
  mapUserToForm,
  normalizeDownloadItems,
  normalizeFeeEntry,
  normalizeFeesPayload,
  normalizePendingCourseItems,
  normalizeRoutineSemestersPayload,
  parseSingleFeePayload,
  parseSingleRoutineSemesterPayload,
  sortCalendarEvents,
  sortCoursesBySemesterDesc,
  toRoutineSemesters,
} from './adminUtils';
import {
  validateCalendarPayload,
  validateCoursesPayload,
  validateDownloadsPayload,
  validateFeesPayload,
  validateMarksSemestersPayload,
  validatePendingCoursesPayload,
  validateProfilePayload,
  validateRoutineSemesters,
} from './adminValidation';
import { resolveAdminBackTool } from './adminNavigation';
import { clearAutoSaveTimer, isStaleAutoSave, scheduleJsonAutoSave } from './adminAutoSave';
import {
  getAdminPathFromTool,
  getAdminToolFromPath,
  isKnownAdminToolPath,
  normalizeAdminPath,
} from './adminRoutes';

export function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    fees,
    calendarEvents,
    downloads,
    courses,
    results,
    pendingCourses,
    routines,
    routinesSemester,
    routinesSemesters,
    marksSemesters,
    setCurrentScreen,
    updateUserProfile,
    updateRoutinesData,
    updateFeesData,
    updateCalendarData,
    updateDownloadsData,
    updateCoursesData,
    updatePendingCoursesData,
    updateResultsData,
    updateMarksData,
  } = useAppContext();
  const [formData, setFormData] = useState(mapUserToForm(null));
  const [profileDirty, setProfileDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [profileJsonText, setProfileJsonText] = useState('');
  const [profileJsonDirty, setProfileJsonDirty] = useState(false);
  const [profileJsonSaving, setProfileJsonSaving] = useState(false);
  const [profileJsonSaveMessage, setProfileJsonSaveMessage] = useState('');
  const [profileJsonSaveError, setProfileJsonSaveError] = useState('');
  const [routineSemester, setRoutineSemester] = useState('');
  const [routineItems, setRoutineItems] = useState([]);
  const [routineSemesterItems, setRoutineSemesterItems] = useState([]);
  const [selectedRoutineSemesterKey, setSelectedRoutineSemesterKey] = useState('');
  const [routineDirty, setRoutineDirty] = useState(false);
  const [routineSaveMessage, setRoutineSaveMessage] = useState('');
  const [routineSaveError, setRoutineSaveError] = useState('');
  const [routineJsonText, setRoutineJsonText] = useState('');
  const [routineSemesterJsonText, setRoutineSemesterJsonText] = useState('');
  const [routineJsonDirty, setRoutineJsonDirty] = useState(false);
  const [routineJsonSaving, setRoutineJsonSaving] = useState(false);
  const [routineJsonSaveMessage, setRoutineJsonSaveMessage] = useState('');
  const [routineJsonSaveError, setRoutineJsonSaveError] = useState('');
  const [routineSemesterJsonAdding, setRoutineSemesterJsonAdding] = useState(false);
  const [routineSemesterJsonAddMessage, setRoutineSemesterJsonAddMessage] = useState('');
  const [routineSemesterJsonAddError, setRoutineSemesterJsonAddError] = useState('');
  const [feeItems, setFeeItems] = useState([]);
  const [selectedFeeSemesterKey, setSelectedFeeSemesterKey] = useState('');
  const [feeForm, setFeeForm] = useState({
    semester: '',
    demand: '',
    waiver: '',
    paid: '',
    status: 'ok',
    statusText: '',
    statusAmount: '',
  });
  const [feeDirty, setFeeDirty] = useState(false);
  const [feeSaveMessage, setFeeSaveMessage] = useState('');
  const [feeSaveError, setFeeSaveError] = useState('');
  const [feeJsonText, setFeeJsonText] = useState('');
  const [feeSemesterJsonText, setFeeSemesterJsonText] = useState('');
  const [feeJsonDirty, setFeeJsonDirty] = useState(false);
  const [feeJsonSaving, setFeeJsonSaving] = useState(false);
  const [feeJsonSaveMessage, setFeeJsonSaveMessage] = useState('');
  const [feeJsonSaveError, setFeeJsonSaveError] = useState('');
  const [feeSemesterJsonAdding, setFeeSemesterJsonAdding] = useState(false);
  const [feeSemesterJsonAddMessage, setFeeSemesterJsonAddMessage] = useState('');
  const [feeSemesterJsonAddError, setFeeSemesterJsonAddError] = useState('');
  const [calendarItems, setCalendarItems] = useState([]);
  const [calendarDirty, setCalendarDirty] = useState(false);
  const [calendarSaveMessage, setCalendarSaveMessage] = useState('');
  const [calendarSaveError, setCalendarSaveError] = useState('');
  const [calendarJsonText, setCalendarJsonText] = useState('');
  const [calendarJsonDirty, setCalendarJsonDirty] = useState(false);
  const [calendarJsonSaving, setCalendarJsonSaving] = useState(false);
  const [calendarJsonSaveMessage, setCalendarJsonSaveMessage] = useState('');
  const [calendarJsonSaveError, setCalendarJsonSaveError] = useState('');
  const [downloadItems, setDownloadItems] = useState([]);
  const [downloadDirty, setDownloadDirty] = useState(false);
  const [downloadSaveMessage, setDownloadSaveMessage] = useState('');
  const [downloadSaveError, setDownloadSaveError] = useState('');
  const [downloadJsonText, setDownloadJsonText] = useState('');
  const [downloadJsonDirty, setDownloadJsonDirty] = useState(false);
  const [downloadJsonSaving, setDownloadJsonSaving] = useState(false);
  const [downloadJsonSaveMessage, setDownloadJsonSaveMessage] = useState('');
  const [downloadJsonSaveError, setDownloadJsonSaveError] = useState('');
  const [courseItems, setCourseItems] = useState([]);
  const [courseSemesterItems, setCourseSemesterItems] = useState([]);
  const [selectedCourseSemesterKey, setSelectedCourseSemesterKey] = useState('');
  const [courseSemester, setCourseSemester] = useState('');
  const [courseDirty, setCourseDirty] = useState(false);
  const [courseSaveMessage, setCourseSaveMessage] = useState('');
  const [courseSaveError, setCourseSaveError] = useState('');
  const [courseJsonText, setCourseJsonText] = useState('');
  const [courseJsonDirty, setCourseJsonDirty] = useState(false);
  const [courseJsonSaving, setCourseJsonSaving] = useState(false);
  const [courseJsonSaveMessage, setCourseJsonSaveMessage] = useState('');
  const [courseJsonSaveError, setCourseJsonSaveError] = useState('');
  const [pendingCourseItems, setPendingCourseItems] = useState([]);
  const [pendingCourseDirty, setPendingCourseDirty] = useState(false);
  const [pendingCourseSaveMessage, setPendingCourseSaveMessage] = useState('');
  const [pendingCourseSaveError, setPendingCourseSaveError] = useState('');
  const [pendingCourseJsonText, setPendingCourseJsonText] = useState('');
  const [pendingCourseJsonDirty, setPendingCourseJsonDirty] = useState(false);
  const [pendingCourseJsonSaving, setPendingCourseJsonSaving] = useState(false);
  const [pendingCourseJsonSaveMessage, setPendingCourseJsonSaveMessage] = useState('');
  const [pendingCourseJsonSaveError, setPendingCourseJsonSaveError] = useState('');
  const [marksEditorSemesters, setMarksEditorSemesters] = useState([]);
  const [selectedMarksSemester, setSelectedMarksSemester] = useState('');
  const [marksSubjectRows, setMarksSubjectRows] = useState([]);
  const [marksDirty, setMarksDirty] = useState(false);
  const [marksSaveMessage, setMarksSaveMessage] = useState('');
  const [marksSaveError, setMarksSaveError] = useState('');
  const [marksJsonText, setMarksJsonText] = useState('');
  const [marksJsonDirty, setMarksJsonDirty] = useState(false);
  const [marksJsonSaving, setMarksJsonSaving] = useState(false);
  const [marksJsonSaveMessage, setMarksJsonSaveMessage] = useState('');
  const [marksJsonSaveError, setMarksJsonSaveError] = useState('');
  const [currentTime, setCurrentTime] = useState(formatDate(new Date()));
  const [activeTool, setActiveTool] = useState(null);
  const routineItemKeyCounter = useRef(0);
  const routineSemesterKeyCounter = useRef(0);
  const feeItemKeyCounter = useRef(0);
  const calendarItemKeyCounter = useRef(0);
  const downloadItemKeyCounter = useRef(0);
  const courseItemKeyCounter = useRef(0);
  const pendingCourseItemKeyCounter = useRef(0);
  const profileJsonTimerRef = useRef(null);
  const profileJsonLastSavedRef = useRef('');
  const profileJsonSaveSeqRef = useRef(0);
  const routineJsonTimerRef = useRef(null);
  const routineJsonLastSavedRef = useRef('');
  const routineJsonSaveSeqRef = useRef(0);
  const feeJsonTimerRef = useRef(null);
  const feeJsonLastSavedRef = useRef('');
  const feeJsonSaveSeqRef = useRef(0);
  const calendarJsonTimerRef = useRef(null);
  const calendarJsonLastSavedRef = useRef('');
  const calendarJsonSaveSeqRef = useRef(0);
  const downloadJsonTimerRef = useRef(null);
  const downloadJsonLastSavedRef = useRef('');
  const downloadJsonSaveSeqRef = useRef(0);
  const courseJsonTimerRef = useRef(null);
  const courseJsonLastSavedRef = useRef('');
  const courseJsonSaveSeqRef = useRef(0);
  const pendingCourseJsonTimerRef = useRef(null);
  const pendingCourseJsonLastSavedRef = useRef('');
  const pendingCourseJsonSaveSeqRef = useRef(0);
  const marksJsonTimerRef = useRef(null);
  const marksJsonLastSavedRef = useRef('');
  const marksJsonSaveSeqRef = useRef(0);
  const adminRouteHydratedRef = useRef(false);

  useEffect(() => {
    const currentPath = normalizeAdminPath(location.pathname);
    if (currentPath !== '/admin' && !currentPath.startsWith('/admin/')) {
      return;
    }

    if (currentPath.startsWith('/admin/') && !isKnownAdminToolPath(currentPath)) {
      setActiveTool(null);
      navigate('/admin', { replace: true });
      return;
    }

    const nextTool = getAdminToolFromPath(currentPath);
    setActiveTool((prev) => (prev === nextTool ? prev : nextTool));
    adminRouteHydratedRef.current = true;
  }, [location.pathname, navigate]);

  useEffect(() => {
    const currentPath = normalizeAdminPath(location.pathname);
    if (currentPath !== '/admin' && !currentPath.startsWith('/admin/')) {
      return;
    }

    if (!adminRouteHydratedRef.current) {
      return;
    }

    // When pathname already maps to a valid tool, wait for activeTool to sync first.
    const toolFromPath = getAdminToolFromPath(currentPath);
    if (toolFromPath && activeTool !== toolFromPath) {
      return;
    }

    const targetPath = activeTool ? getAdminPathFromTool(activeTool) : '/admin';
    if (currentPath !== targetPath) {
      navigate(targetPath);
    }
  }, [activeTool, location.pathname, navigate]);

  const isCriticalSaveInProgress =
    profileJsonSaving ||
    routineJsonSaving ||
    routineSemesterJsonAdding ||
    feeJsonSaving ||
    feeSemesterJsonAdding ||
    calendarJsonSaving ||
    downloadJsonSaving ||
    courseJsonSaving ||
    pendingCourseJsonSaving ||
    marksJsonSaving;

  const withRoutineItemKeys = (items) =>
    (Array.isArray(items) ? items : []).map((item, index) => ({
      ...item,
      _uiKey:
        item?._uiKey ||
        `routine-item-${item?.day || 'X'}-${item?.time || 'X'}-${item?.course || 'X'}-${index}`,
    }));

  const withRoutineSemesterKeys = (semesters) =>
    (Array.isArray(semesters) ? semesters : []).map((entry, index) => ({
      _uiKey: entry?._uiKey || `routine-semester-${String(entry?.semester || '').trim() || index}`,
      semester: String(entry?.semester || '').trim(),
      routine: withRoutineItemKeys(Array.isArray(entry?.routine) ? entry.routine : []),
    }));

  const withFeeItemKeys = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _uiKey: item?._uiKey || `fee-item-${feeItemKeyCounter.current++}`,
    }));

  const withCalendarItemKeys = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _uiKey: item?._uiKey || `calendar-item-${calendarItemKeyCounter.current++}`,
    }));

  const withDownloadItemKeys = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _uiKey: item?._uiKey || `download-item-${downloadItemKeyCounter.current++}`,
    }));

  const withCourseItemKeys = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _uiKey: item?._uiKey || `course-item-${courseItemKeyCounter.current++}`,
    }));

  const withPendingCourseItemKeys = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      ...item,
      _uiKey: item?._uiKey || `pending-course-item-${pendingCourseItemKeyCounter.current++}`,
    }));

  const withCourseSemesterKeys = (semesters) =>
    (Array.isArray(semesters) ? semesters : []).map((entry, index) => ({
      _uiKey: entry?._uiKey || `course-semester-${String(entry?.semester || '').trim() || index}`,
      semester: String(entry?.semester || '').trim(),
      courses: withCourseItemKeys(Array.isArray(entry?.courses) ? entry.courses : []),
    }));

  const buildMarksEditorSemesters = () => {
    const courseList = Array.isArray(courses?.courses) ? courses.courses : [];
    const groupedCourses = {};

    courseList.forEach((course) => {
      const semester = String(course.semester || '').trim();
      if (!semester) {
        return;
      }

      if (!groupedCourses[semester]) {
        groupedCourses[semester] = [];
      }

      groupedCourses[semester].push({
        code: String(course.code || '').trim(),
        name: String(course.name || '').trim(),
      });
    });

    const normalizedMarks = normalizeMarksPayload({ semesters: marksSemesters });
    const marksMap = new Map();
    normalizedMarks.forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        marksMap.set(`${sem.semester}__${sub.code}`, sub.mark);
      });
    });

    const semesters = Object.entries(groupedCourses).map(([semester, subjects]) => ({
      semester,
      subjects: subjects.map((sub) => ({
        code: sub.code,
        name: sub.name,
        mark: marksMap.has(`${semester}__${sub.code}`)
          ? marksMap.get(`${semester}__${sub.code}`)
          : null,
      })),
    }));

    return sortSemestersDesc(semesters, (x) => x.semester);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDate(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Prevent background data refresh from overriding active admin edits.
    if (!user || profileDirty) {
      return;
    }
    setFormData(mapUserToForm(user));
  }, [user, profileDirty]);

  useEffect(() => {
    if (!user || profileJsonDirty) {
      return;
    }

    const normalizedPayload = { user: mapUserToForm(user) };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setProfileJsonText(normalizedText);
    profileJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [user, profileJsonDirty]);

  useEffect(
    () => () => {
      clearAutoSaveTimer(profileJsonTimerRef);
      clearAutoSaveTimer(routineJsonTimerRef);
      clearAutoSaveTimer(feeJsonTimerRef);
      clearAutoSaveTimer(calendarJsonTimerRef);
      clearAutoSaveTimer(downloadJsonTimerRef);
      clearAutoSaveTimer(courseJsonTimerRef);
      clearAutoSaveTimer(pendingCourseJsonTimerRef);
      clearAutoSaveTimer(marksJsonTimerRef);
    },
    []
  );

  useEffect(() => {
    if (routineDirty) {
      return;
    }
    const baseSemesters = toRoutineSemesters(routinesSemesters, routinesSemester, routines);
    const keyedSemesters = withRoutineSemesterKeys(
      baseSemesters.map((entry) => ({
        ...entry,
        routine: sortRoutineEntries(entry.routine || []),
      }))
    );

    setRoutineSemesterItems(keyedSemesters);
    if (keyedSemesters.length > 0) {
      const selected =
        keyedSemesters.find((entry) => entry.semester === routineSemester) ||
        keyedSemesters.find((entry) => entry._uiKey === selectedRoutineSemesterKey) ||
        keyedSemesters[0];
      setSelectedRoutineSemesterKey(selected._uiKey);
      setRoutineSemester(selected.semester);
      setRoutineItems(selected.routine);
    } else {
      setSelectedRoutineSemesterKey('');
      setRoutineSemester('');
      setRoutineItems([]);
    }
  }, [routinesSemesters, routines, routinesSemester, routineDirty]);

  useEffect(() => {
    if (routineJsonDirty) {
      return;
    }

    const normalized = {
      semesters: toRoutineSemesters(routinesSemesters, routinesSemester, routines),
    };
    const normalizedText = JSON.stringify(normalized, null, 2);
    setRoutineJsonText(normalizedText);
    routineJsonLastSavedRef.current = JSON.stringify(normalized);
  }, [routinesSemesters, routines, routinesSemester, routineJsonDirty]);

  useEffect(() => {
    if (feeDirty) {
      return;
    }
    const keyedFees = withFeeItemKeys(sortFeesEntries(Array.isArray(fees) ? fees : []));
    setFeeItems(keyedFees);

    const selected =
      keyedFees.find((entry) => entry._uiKey === selectedFeeSemesterKey) || keyedFees[0];
    if (selected) {
      setSelectedFeeSemesterKey(selected._uiKey);
      setFeeForm({
        semester: selected.semester || '',
        demand: selected.demand ?? '',
        waiver: selected.waiver ?? '',
        paid: selected.paid ?? '',
        status: selected.status || 'ok',
        statusText: selected.statusText || '',
        statusAmount: selected.statusAmount ?? '',
      });
    } else {
      setSelectedFeeSemesterKey('');
      setFeeForm({
        semester: '',
        demand: '',
        waiver: '',
        paid: '',
        status: 'ok',
        statusText: '',
        statusAmount: '',
      });
    }
  }, [fees, feeDirty, selectedFeeSemesterKey]);

  useEffect(() => {
    if (feeJsonDirty) {
      return;
    }
    const normalizedPayload = { fees: sortFeesEntries(Array.isArray(fees) ? fees : []) };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setFeeJsonText(normalizedText);
    feeJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [fees, feeJsonDirty]);

  useEffect(() => {
    if (calendarDirty) {
      return;
    }
    setCalendarItems(withCalendarItemKeys(Array.isArray(calendarEvents) ? calendarEvents : []));
  }, [calendarEvents, calendarDirty]);

  useEffect(() => {
    if (calendarJsonDirty) {
      return;
    }
    const normalizedPayload = {
      events: sortCalendarEvents(Array.isArray(calendarEvents) ? calendarEvents : []),
    };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setCalendarJsonText(normalizedText);
    calendarJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [calendarEvents, calendarJsonDirty]);

  useEffect(() => {
    if (downloadDirty) {
      return;
    }
    setDownloadItems(withDownloadItemKeys(Array.isArray(downloads) ? downloads : []));
  }, [downloads, downloadDirty]);

  useEffect(() => {
    if (downloadJsonDirty) {
      return;
    }
    const normalizedPayload = { downloads: Array.isArray(downloads) ? downloads : [] };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setDownloadJsonText(normalizedText);
    downloadJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [downloads, downloadJsonDirty]);

  useEffect(() => {
    if (courseDirty) {
      return;
    }
    const grouped = {};
    const rawCourses = Array.isArray(courses?.courses) ? courses.courses : [];
    sortCoursesBySemesterDesc(rawCourses).forEach((course) => {
      const semester = String(course?.semester || '').trim();
      if (!semester) {
        return;
      }
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(course);
    });

    const keyedSemesters = withCourseSemesterKeys(
      Object.entries(grouped).map(([semester, semesterCourses]) => ({
        semester,
        courses: semesterCourses,
      }))
    );

    setCourseSemesterItems(keyedSemesters);
    if (keyedSemesters.length > 0) {
      const selected =
        keyedSemesters.find((entry) => entry.semester === courseSemester) ||
        keyedSemesters.find((entry) => entry._uiKey === selectedCourseSemesterKey) ||
        keyedSemesters[0];
      setSelectedCourseSemesterKey(selected._uiKey);
      setCourseSemester(selected.semester);
      setCourseItems(selected.courses);
    } else {
      setSelectedCourseSemesterKey('');
      setCourseSemester('');
      setCourseItems([]);
    }
  }, [courses, courseDirty, courseSemester, selectedCourseSemesterKey]);

  useEffect(() => {
    if (courseJsonDirty) {
      return;
    }
    const normalizedPayload = {
      courses: sortCoursesBySemesterDesc(Array.isArray(courses?.courses) ? courses.courses : []),
    };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setCourseJsonText(normalizedText);
    courseJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [courses, courseJsonDirty]);

  useEffect(() => {
    if (pendingCourseDirty) {
      return;
    }

    setPendingCourseItems(
      withPendingCourseItemKeys(Array.isArray(pendingCourses) ? pendingCourses : [])
    );
  }, [pendingCourses, pendingCourseDirty]);

  useEffect(() => {
    if (pendingCourseJsonDirty) {
      return;
    }

    const normalizedPayload = {
      pendingCourses: Array.isArray(pendingCourses) ? pendingCourses : [],
    };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setPendingCourseJsonText(normalizedText);
    pendingCourseJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [pendingCourses, pendingCourseJsonDirty]);

  useEffect(() => {
    if (marksDirty) {
      return;
    }

    const normalizedSemesters = buildMarksEditorSemesters();
    setMarksEditorSemesters(normalizedSemesters);

    const selected =
      normalizedSemesters.find((item) => item.semester === selectedMarksSemester) ||
      normalizedSemesters[0];
    if (selected) {
      setSelectedMarksSemester(selected.semester);
      setMarksSubjectRows(selected.subjects || []);
    } else {
      setSelectedMarksSemester('');
      setMarksSubjectRows([]);
    }
  }, [marksSemesters, marksDirty, selectedMarksSemester, courses]);

  useEffect(() => {
    if (marksJsonDirty) {
      return;
    }

    const normalizedPayload = {
      semesters: sortSemestersDesc(
        normalizeMarksPayload({ semesters: marksSemesters }),
        (x) => x.semester
      ),
    };
    const normalizedText = JSON.stringify(normalizedPayload, null, 2);
    setMarksJsonText(normalizedText);
    marksJsonLastSavedRef.current = JSON.stringify(normalizedPayload);
  }, [marksSemesters, marksJsonDirty]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileDirty(true);
    setSaveMessage('');
    setSaveError('');
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && reader.result) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

  const loadImageFromDataUrl = (dataUrl) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load selected image.'));
      img.src = dataUrl;
    });

  const compressProfileImage = async (file) => {
    const sourceDataUrl = await readFileAsDataUrl(file);
    const img = await loadImageFromDataUrl(sourceDataUrl);

    const maxSide = 720;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas is not available for image processing.');
    }

    context.drawImage(img, 0, 0, width, height);

    // Use JPEG to keep JSON payload small and prevent 413 from large base64 strings.
    let quality = 0.86;
    let output = canvas.toDataURL('image/jpeg', quality);
    const maxDataUrlLength = 900000;

    while (output.length > maxDataUrlLength && quality > 0.5) {
      quality -= 0.08;
      output = canvas.toDataURL('image/jpeg', quality);
    }

    return output;
  };

  const handleProfileImageUpload = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setSaveError('Please select a valid image file.');
      return;
    }

    setSaveMessage('');
    setSaveError('');

    try {
      const processedImageDataUrl = await compressProfileImage(selectedFile);
      setProfileDirty(true);
      setFormData((prev) => ({
        ...prev,
        avatar: processedImageDataUrl,
        avatarSmall: processedImageDataUrl,
      }));
    } catch {
      setSaveError('Failed to process selected image. Try a different image file.');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveError('');

    const profileValidationError = validateProfilePayload(formData);
    if (profileValidationError) {
      setSaveError(profileValidationError);
      return;
    }

    const result = await updateUserProfile(formData);
    if (!result?.ok) {
      setSaveError(result?.error || 'Failed to save profile changes.');
      return;
    }

    setProfileDirty(false);
    setSaveMessage('Profile updated successfully. JSON file and dashboard profile are synced.');

    setTimeout(() => {
      setSaveMessage('');
    }, 2400);
  };

  const handleReset = () => {
    setFormData(mapUserToForm(user));
    setProfileDirty(false);
    setSaveError('');
    setSaveMessage('Unsaved changes were discarded.');

    setTimeout(() => {
      setSaveMessage('');
    }, 1800);
  };

  const openProfileEditor = () => {
    setSaveError('');
    setSaveMessage('');
    setProfileJsonSaveError('');
    setProfileJsonSaveMessage('');
    setActiveTool('profile-options');
  };

  const openProfileNormalEditor = () => {
    setSaveError('');
    setSaveMessage('');
    setActiveTool('profile-normal');
  };

  const openProfileJsonEditor = () => {
    setProfileJsonSaveError('');
    setProfileJsonSaveMessage('');
    setActiveTool('profile-json');
  };

  const backToProfileOptions = () => {
    setActiveTool('profile-options');
  };

  const closeProfileEditor = () => {
    clearAutoSaveTimer(profileJsonTimerRef);
    setFormData(mapUserToForm(user));
    setProfileDirty(false);
    setSaveError('');
    setSaveMessage('');
    setProfileJsonDirty(false);
    setProfileJsonSaving(false);
    setProfileJsonSaveError('');
    setProfileJsonSaveMessage('');
    setActiveTool(null);
  };

  const applyProfileJson = async (rawText, sequence = profileJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(profileJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setProfileJsonSaveError('Invalid JSON. Please paste valid JSON format.');
      return;
    }

    const parsedUser =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      parsed.user &&
      typeof parsed.user === 'object'
        ? parsed.user
        : parsed;

    if (!parsedUser || typeof parsedUser !== 'object' || Array.isArray(parsedUser)) {
      setProfileJsonSaveError('Invalid JSON shape. Expected object or {"user": {...}}.');
      return;
    }

    const normalizedPayload = { user: mapUserToForm(parsedUser) };
    const profileValidationError = validateProfilePayload(normalizedPayload.user);
    if (profileValidationError) {
      setProfileJsonSaveError(profileValidationError);
      return;
    }

    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === profileJsonLastSavedRef.current) {
      setProfileJsonSaveError('');
      return;
    }

    setProfileJsonSaving(true);
    setProfileJsonSaveError('');

    const result = await updateUserProfile(normalizedPayload.user);
    if (isStaleAutoSave(profileJsonSaveSeqRef, sequence)) {
      return;
    }

    setProfileJsonSaving(false);

    if (!result?.ok) {
      setProfileJsonSaveError(result?.error || 'Failed to auto-save profile JSON.');
      return;
    }

    profileJsonLastSavedRef.current = normalizedRaw;
    setProfileJsonDirty(false);
    setProfileJsonSaveMessage('JSON updated automatically and synced to file.');

    setTimeout(() => {
      setProfileJsonSaveMessage('');
    }, 2200);
  };

  const handleProfileJsonChange = (event) => {
    const nextText = event.target.value;
    setProfileJsonText(nextText);
    setProfileJsonDirty(true);
    setProfileJsonSaveMessage('');
    setProfileJsonSaveError('');

    scheduleJsonAutoSave(profileJsonTimerRef, profileJsonSaveSeqRef, nextText, applyProfileJson);
  };

  const openRoutinesEditor = () => {
    setRoutineSaveError('');
    setRoutineSaveMessage('');
    setRoutineJsonSaveError('');
    setRoutineJsonSaveMessage('');
    setRoutineSemesterJsonAddError('');
    setRoutineSemesterJsonAddMessage('');
    setActiveTool('routines-options');
  };

  const openRoutinesNormalEditor = () => {
    setRoutineSaveError('');
    setRoutineSaveMessage('');
    setActiveTool('routines-normal');
  };

  const openRoutinesJsonEditor = () => {
    setRoutineJsonSaveError('');
    setRoutineJsonSaveMessage('');
    setRoutineSemesterJsonAddError('');
    setRoutineSemesterJsonAddMessage('');
    setActiveTool('routines-json');
  };

  const backToRoutineOptions = () => {
    setActiveTool('routines-options');
  };

  const openFeesEditor = () => {
    setFeeSaveError('');
    setFeeSaveMessage('');
    setFeeJsonSaveError('');
    setFeeJsonSaveMessage('');
    setFeeSemesterJsonAddError('');
    setFeeSemesterJsonAddMessage('');
    setActiveTool('fees-options');
  };

  const openFeesNormalEditor = () => {
    setFeeSaveError('');
    setFeeSaveMessage('');
    setActiveTool('fees-normal');
  };

  const openFeesJsonEditor = () => {
    setFeeJsonSaveError('');
    setFeeJsonSaveMessage('');
    setFeeSemesterJsonAddError('');
    setFeeSemesterJsonAddMessage('');
    setActiveTool('fees-json');
  };

  const backToFeeOptions = () => {
    setActiveTool('fees-options');
  };

  const openCalendarEditor = () => {
    setCalendarSaveError('');
    setCalendarSaveMessage('');
    setCalendarJsonSaveError('');
    setCalendarJsonSaveMessage('');
    setActiveTool('calendar-options');
  };

  const openCalendarNormalEditor = () => {
    setCalendarSaveError('');
    setCalendarSaveMessage('');
    setActiveTool('calendar-normal');
  };

  const openCalendarJsonEditor = () => {
    setCalendarJsonSaveError('');
    setCalendarJsonSaveMessage('');
    setActiveTool('calendar-json');
  };

  const backToCalendarOptions = () => {
    setActiveTool('calendar-options');
  };

  const openDownloadsEditor = () => {
    setDownloadSaveError('');
    setDownloadSaveMessage('');
    setDownloadJsonSaveError('');
    setDownloadJsonSaveMessage('');
    setActiveTool('downloads-options');
  };

  const openDownloadsNormalEditor = () => {
    setDownloadSaveError('');
    setDownloadSaveMessage('');
    setActiveTool('downloads-normal');
  };

  const openDownloadsJsonEditor = () => {
    setDownloadJsonSaveError('');
    setDownloadJsonSaveMessage('');
    setActiveTool('downloads-json');
  };

  const backToDownloadsOptions = () => {
    setActiveTool('downloads-options');
  };

  const openCoursesEditor = () => {
    setCourseSaveError('');
    setCourseSaveMessage('');
    setCourseJsonSaveError('');
    setCourseJsonSaveMessage('');
    setActiveTool('courses-options');
  };

  const openCoursesNormalEditor = () => {
    setCourseSaveError('');
    setCourseSaveMessage('');
    setActiveTool('courses-normal');
  };

  const openCoursesJsonEditor = () => {
    setCourseJsonSaveError('');
    setCourseJsonSaveMessage('');
    setActiveTool('courses-json');
  };

  const backToCourseOptions = () => {
    setActiveTool('courses-options');
  };

  const openPendingCoursesEditor = () => {
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('');
    setPendingCourseJsonSaveError('');
    setPendingCourseJsonSaveMessage('');
    setActiveTool('pending-courses-options');
  };

  const openPendingCoursesNormalEditor = () => {
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('');
    setActiveTool('pending-courses-normal');
  };

  const openPendingCoursesJsonEditor = () => {
    setPendingCourseJsonSaveError('');
    setPendingCourseJsonSaveMessage('');
    setActiveTool('pending-courses-json');
  };

  const backToPendingCourseOptions = () => {
    setActiveTool('pending-courses-options');
  };

  const openMarksEditor = () => {
    setMarksSaveError('');
    setMarksSaveMessage('');
    setMarksJsonSaveError('');
    setMarksJsonSaveMessage('');
    setActiveTool('marks-options');
  };

  const openMarksNormalEditor = () => {
    setMarksSaveError('');
    setMarksSaveMessage('');
    setActiveTool('marks-normal');
  };

  const openMarksJsonEditor = () => {
    setMarksJsonSaveError('');
    setMarksJsonSaveMessage('');
    setActiveTool('marks-json');
  };

  const backToMarksOptions = () => {
    setActiveTool('marks-options');
  };

  const closeRoutinesEditor = () => {
    clearAutoSaveTimer(routineJsonTimerRef);
    const baseSemesters = toRoutineSemesters(routinesSemesters, routinesSemester, routines);
    const keyedSemesters = withRoutineSemesterKeys(
      baseSemesters.map((entry) => ({
        ...entry,
        routine: sortRoutineEntries(entry.routine || []),
      }))
    );

    setRoutineSemesterItems(keyedSemesters);
    if (keyedSemesters.length > 0) {
      setSelectedRoutineSemesterKey(keyedSemesters[0]._uiKey);
      setRoutineSemester(keyedSemesters[0].semester);
      setRoutineItems(keyedSemesters[0].routine);
    } else {
      setSelectedRoutineSemesterKey('');
      setRoutineSemester('');
      setRoutineItems([]);
    }
    setRoutineDirty(false);
    setRoutineSaveError('');
    setRoutineSaveMessage('');
    setRoutineJsonDirty(false);
    setRoutineJsonSaving(false);
    setRoutineJsonSaveError('');
    setRoutineJsonSaveMessage('');
    setRoutineSemesterJsonText('');
    setRoutineSemesterJsonAdding(false);
    setRoutineSemesterJsonAddError('');
    setRoutineSemesterJsonAddMessage('');
    setActiveTool(null);
  };

  const closeFeesEditor = () => {
    clearAutoSaveTimer(feeJsonTimerRef);
    const keyedFees = withFeeItemKeys(sortFeesEntries(Array.isArray(fees) ? fees : []));
    setFeeItems(keyedFees);
    if (keyedFees.length > 0) {
      setSelectedFeeSemesterKey(keyedFees[0]._uiKey);
      setFeeForm({
        semester: keyedFees[0].semester || '',
        demand: keyedFees[0].demand ?? '',
        waiver: keyedFees[0].waiver ?? '',
        paid: keyedFees[0].paid ?? '',
        status: keyedFees[0].status || 'ok',
        statusText: keyedFees[0].statusText || '',
        statusAmount: keyedFees[0].statusAmount ?? '',
      });
    } else {
      setSelectedFeeSemesterKey('');
      setFeeForm({
        semester: '',
        demand: '',
        waiver: '',
        paid: '',
        status: 'ok',
        statusText: '',
        statusAmount: '',
      });
    }
    setFeeDirty(false);
    setFeeSaveError('');
    setFeeSaveMessage('');
    setFeeJsonText('');
    setFeeSemesterJsonText('');
    setFeeJsonDirty(false);
    setFeeJsonSaving(false);
    setFeeJsonSaveError('');
    setFeeJsonSaveMessage('');
    setFeeSemesterJsonAdding(false);
    setFeeSemesterJsonAddError('');
    setFeeSemesterJsonAddMessage('');
    setActiveTool(null);
  };

  const closeCalendarEditor = () => {
    clearAutoSaveTimer(calendarJsonTimerRef);
    setCalendarItems(withCalendarItemKeys(Array.isArray(calendarEvents) ? calendarEvents : []));
    setCalendarDirty(false);
    setCalendarSaveError('');
    setCalendarSaveMessage('');
    setCalendarJsonDirty(false);
    setCalendarJsonSaving(false);
    setCalendarJsonSaveError('');
    setCalendarJsonSaveMessage('');
    setActiveTool(null);
  };

  const closeDownloadsEditor = () => {
    clearAutoSaveTimer(downloadJsonTimerRef);
    setDownloadItems(withDownloadItemKeys(Array.isArray(downloads) ? downloads : []));
    setDownloadDirty(false);
    setDownloadSaveError('');
    setDownloadSaveMessage('');
    setDownloadJsonDirty(false);
    setDownloadJsonSaving(false);
    setDownloadJsonSaveError('');
    setDownloadJsonSaveMessage('');
    setActiveTool(null);
  };

  const closeCoursesEditor = () => {
    clearAutoSaveTimer(courseJsonTimerRef);
    const grouped = {};
    const rawCourses = Array.isArray(courses?.courses) ? courses.courses : [];
    sortCoursesBySemesterDesc(rawCourses).forEach((course) => {
      const semester = String(course?.semester || '').trim();
      if (!semester) {
        return;
      }
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(course);
    });

    const keyedSemesters = withCourseSemesterKeys(
      Object.entries(grouped).map(([semester, semesterCourses]) => ({
        semester,
        courses: semesterCourses,
      }))
    );

    setCourseSemesterItems(keyedSemesters);
    if (keyedSemesters.length > 0) {
      setSelectedCourseSemesterKey(keyedSemesters[0]._uiKey);
      setCourseSemester(keyedSemesters[0].semester);
      setCourseItems(keyedSemesters[0].courses);
    } else {
      setSelectedCourseSemesterKey('');
      setCourseSemester('');
      setCourseItems([]);
    }
    setCourseDirty(false);
    setCourseSaveError('');
    setCourseSaveMessage('');
    setCourseJsonDirty(false);
    setCourseJsonSaving(false);
    setCourseJsonSaveError('');
    setCourseJsonSaveMessage('');
    setActiveTool(null);
  };

  const closePendingCoursesEditor = () => {
    clearAutoSaveTimer(pendingCourseJsonTimerRef);

    setPendingCourseItems(
      withPendingCourseItemKeys(Array.isArray(pendingCourses) ? pendingCourses : [])
    );
    setPendingCourseDirty(false);
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('');
    setPendingCourseJsonDirty(false);
    setPendingCourseJsonSaving(false);
    setPendingCourseJsonSaveError('');
    setPendingCourseJsonSaveMessage('');
    setActiveTool(null);
  };

  const closeMarksEditor = () => {
    clearAutoSaveTimer(marksJsonTimerRef);

    const normalizedSemesters = buildMarksEditorSemesters();
    setMarksEditorSemesters(normalizedSemesters);
    const selected = normalizedSemesters[0];
    setSelectedMarksSemester(selected?.semester || '');
    setMarksSubjectRows(selected?.subjects || []);

    setMarksDirty(false);
    setMarksSaveError('');
    setMarksSaveMessage('');
    setMarksJsonDirty(false);
    setMarksJsonSaving(false);
    setMarksJsonSaveError('');
    setMarksJsonSaveMessage('');
    setActiveTool(null);
  };

  const handleRoutineFieldChange = (index, field, value) => {
    setRoutineDirty(true);
    setRoutineSaveError('');
    setRoutineSaveMessage('');

    const nextRoutineItems = routineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    setRoutineItems(nextRoutineItems);
    setRoutineSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedRoutineSemesterKey
          ? { ...entry, routine: nextRoutineItems }
          : entry
      )
    );
  };

  const handleRoutineSemesterNameChange = (value) => {
    setRoutineDirty(true);
    setRoutineSaveError('');
    setRoutineSaveMessage('');
    setRoutineSemester(value);
    setRoutineSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedRoutineSemesterKey ? { ...entry, semester: value } : entry
      )
    );
  };

  const handleSelectRoutineSemester = (uiKey) => {
    setSelectedRoutineSemesterKey(uiKey);
    const selected = routineSemesterItems.find((entry) => entry._uiKey === uiKey);
    if (!selected) {
      return;
    }
    setRoutineSemester(selected.semester);
    setRoutineItems(selected.routine);
  };

  const handleAddRoutineSemester = () => {
    setRoutineDirty(true);
    setRoutineSaveError('');
    setRoutineSaveMessage('');

    const newEntry = {
      _uiKey: `routine-semester-${routineSemesterKeyCounter.current++}`,
      semester: '',
      routine: [],
    };

    const next = [...routineSemesterItems, newEntry];
    setRoutineSemesterItems(next);
    setSelectedRoutineSemesterKey(newEntry._uiKey);
    setRoutineSemester('');
    setRoutineItems([]);
  };

  const handleRemoveRoutineSemester = () => {
    if (!selectedRoutineSemesterKey) {
      return;
    }

    setRoutineDirty(true);
    setRoutineSaveError('');
    setRoutineSaveMessage('');

    const next = routineSemesterItems.filter(
      (entry) => entry._uiKey !== selectedRoutineSemesterKey
    );
    setRoutineSemesterItems(next);

    const fallback = next[0];
    if (fallback) {
      setSelectedRoutineSemesterKey(fallback._uiKey);
      setRoutineSemester(fallback.semester);
      setRoutineItems(fallback.routine);
    } else {
      setSelectedRoutineSemesterKey('');
      setRoutineSemester('');
      setRoutineItems([]);
    }
  };

  const handleAddRoutineItem = () => {
    setRoutineDirty(true);
    setRoutineSaveError('');
    setRoutineSaveMessage('');
    const nextRoutineItems = [
      ...routineItems,
      {
        _uiKey: `routine-item-${routineItemKeyCounter.current++}`,
        day: '',
        time: '',
        course: '',
        fc: '',
        room: '',
      },
    ];

    setRoutineItems(nextRoutineItems);
    setRoutineSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedRoutineSemesterKey
          ? { ...entry, routine: nextRoutineItems }
          : entry
      )
    );
  };

  const handleRemoveRoutineItem = (index) => {
    setRoutineDirty(true);
    setRoutineSaveError('');
    setRoutineSaveMessage('');
    const nextRoutineItems = routineItems.filter((_, i) => i !== index);
    setRoutineItems(nextRoutineItems);
    setRoutineSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedRoutineSemesterKey
          ? { ...entry, routine: nextRoutineItems }
          : entry
      )
    );
  };

  const handleRoutineReset = () => {
    const baseSemesters = toRoutineSemesters(routinesSemesters, routinesSemester, routines);
    const keyedSemesters = withRoutineSemesterKeys(
      baseSemesters.map((entry) => ({
        ...entry,
        routine: sortRoutineEntries(entry.routine || []),
      }))
    );

    setRoutineSemesterItems(keyedSemesters);
    if (keyedSemesters.length > 0) {
      setSelectedRoutineSemesterKey(keyedSemesters[0]._uiKey);
      setRoutineSemester(keyedSemesters[0].semester);
      setRoutineItems(keyedSemesters[0].routine);
    } else {
      setSelectedRoutineSemesterKey('');
      setRoutineSemester('');
      setRoutineItems([]);
    }

    setRoutineDirty(false);
    setRoutineSaveError('');
    setRoutineSaveMessage('Unsaved routine changes were discarded.');

    setTimeout(() => {
      setRoutineSaveMessage('');
    }, 1800);
  };

  const handleRoutineSave = async (event) => {
    event.preventDefault();

    setRoutineSaveError('');
    const cleanedSemesters = routineSemesterItems
      .map((entry) => ({
        semester: String(entry.semester || '').trim(),
        routine: sortRoutineEntries(
          (entry.routine || [])
            .map((item) => ({
              day: (item.day || '').trim().toUpperCase(),
              time: (item.time || '').trim(),
              course: (item.course || '').trim(),
              fc: (item.fc || '').trim(),
              room: (item.room || '').trim(),
            }))
            .filter((item) => item.day && item.time && item.course && item.fc && item.room)
        ),
      }))
      .filter((entry) => entry.semester);

    const routineValidationError = validateRoutineSemesters(cleanedSemesters);
    if (routineValidationError) {
      setRoutineSaveError(routineValidationError);
      return;
    }

    const result = await updateRoutinesData({
      semesters: cleanedSemesters,
    });

    if (!result?.ok) {
      setRoutineSaveError(result?.error || 'Failed to save routine changes.');
      return;
    }

    setRoutineDirty(false);
    setRoutineSaveMessage('Routine updated successfully. JSON file and routines page are synced.');

    setTimeout(() => {
      setRoutineSaveMessage('');
    }, 2400);
  };

  const applyRoutineJson = async (rawText, sequence = routineJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(routineJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setRoutineJsonSaveError('Invalid JSON. Please paste valid JSON format.');
      return;
    }

    const parsedSemesters = normalizeRoutineSemestersPayload(parsed);
    if (!Array.isArray(parsedSemesters)) {
      setRoutineJsonSaveError(
        'Invalid JSON shape. Expected {"semesters": [...]} or {"semester": "...", "routine": []}.'
      );
      return;
    }

    const cleanedSemesters = parsedSemesters
      .map((entry) => ({
        semester: String(entry?.semester || '').trim(),
        routine: sortRoutineEntries(
          (Array.isArray(entry?.routine) ? entry.routine : [])
            .map((item) => ({
              day: (item?.day || '').trim().toUpperCase(),
              time: (item?.time || '').trim(),
              course: (item?.course || '').trim(),
              fc: (item?.fc || '').trim(),
              room: (item?.room || '').trim(),
            }))
            .filter((item) => item.day && item.time && item.course && item.fc && item.room)
        ),
      }))
      .filter((entry) => entry.semester);

    if (cleanedSemesters.length === 0) {
      setRoutineJsonSaveError('Please provide at least one valid semester entry.');
      return;
    }

    const routineValidationError = validateRoutineSemesters(cleanedSemesters);
    if (routineValidationError) {
      setRoutineJsonSaveError(routineValidationError);
      return;
    }

    const normalizedPayload = { semesters: cleanedSemesters };
    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === routineJsonLastSavedRef.current) {
      setRoutineJsonSaveError('');
      return;
    }

    setRoutineJsonSaving(true);
    setRoutineJsonSaveError('');

    const result = await updateRoutinesData(normalizedPayload);
    if (isStaleAutoSave(routineJsonSaveSeqRef, sequence)) {
      return;
    }

    setRoutineJsonSaving(false);

    if (!result?.ok) {
      setRoutineJsonSaveError(result?.error || 'Failed to auto-save routine JSON.');
      return;
    }

    routineJsonLastSavedRef.current = normalizedRaw;
    setRoutineJsonDirty(false);
    setRoutineJsonSaveMessage('Routines JSON updated automatically and synced to file.');

    setTimeout(() => {
      setRoutineJsonSaveMessage('');
    }, 2200);
  };

  const handleRoutineJsonChange = (event) => {
    const nextText = event.target.value;
    setRoutineJsonText(nextText);
    setRoutineJsonDirty(true);
    setRoutineJsonSaveMessage('');
    setRoutineJsonSaveError('');

    scheduleJsonAutoSave(routineJsonTimerRef, routineJsonSaveSeqRef, nextText, applyRoutineJson);
  };

  const handleRoutineSemesterJsonAdd = async (event) => {
    event.preventDefault();

    const trimmed = String(routineSemesterJsonText || '').trim();
    if (!trimmed) {
      setRoutineSemesterJsonAddError('Please paste semester JSON first.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setRoutineSemesterJsonAddError('Invalid JSON. Please paste valid semester JSON.');
      return;
    }

    const singleSemester = parseSingleRoutineSemesterPayload(parsed);
    if (!singleSemester) {
      setRoutineSemesterJsonAddError(
        'Invalid JSON shape. Expected {"semester": "...", "routine": []}.'
      );
      return;
    }

    const cleanedEntry = {
      semester: String(singleSemester.semester || '').trim(),
      routine: sortRoutineEntries(
        (Array.isArray(singleSemester.routine) ? singleSemester.routine : [])
          .map((item) => ({
            day: (item?.day || '').trim().toUpperCase(),
            time: (item?.time || '').trim(),
            course: (item?.course || '').trim(),
            fc: (item?.fc || '').trim(),
            room: (item?.room || '').trim(),
          }))
          .filter((item) => item.day && item.time && item.course && item.fc && item.room)
      ),
    };

    if (!cleanedEntry.semester) {
      setRoutineSemesterJsonAddError('Semester name is required in pasted JSON.');
      return;
    }

    const existing = toRoutineSemesters(routinesSemesters, routinesSemester, routines)
      .map((entry) => ({
        semester: String(entry.semester || '').trim(),
        routine: Array.isArray(entry.routine) ? entry.routine : [],
      }))
      .filter((entry) => entry.semester);

    const nextSemesters = [...existing, cleanedEntry];
    const routineValidationError = validateRoutineSemesters(nextSemesters);
    if (routineValidationError) {
      setRoutineSemesterJsonAddError(routineValidationError);
      return;
    }

    setRoutineSemesterJsonAdding(true);
    setRoutineSemesterJsonAddError('');
    setRoutineSemesterJsonAddMessage('');

    const result = await updateRoutinesData({ semesters: nextSemesters });

    setRoutineSemesterJsonAdding(false);
    if (!result?.ok) {
      setRoutineSemesterJsonAddError(result?.error || 'Failed to add semester JSON.');
      return;
    }

    setRoutineSemesterJsonText('');
    setRoutineJsonDirty(false);
    setRoutineSemesterJsonAddMessage('Semester JSON added successfully.');

    setTimeout(() => {
      setRoutineSemesterJsonAddMessage('');
    }, 2200);
  };

  const handleFeeFieldChange = (index, field, value) => {
    if (!selectedFeeSemesterKey) {
      return;
    }

    setFeeDirty(true);
    setFeeSaveError('');
    setFeeSaveMessage('');
    setFeeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFeeItems((prev) =>
      prev.map((item) =>
        item._uiKey === selectedFeeSemesterKey ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSelectFeeSemester = (uiKey) => {
    setSelectedFeeSemesterKey(uiKey);
    const selected = feeItems.find((entry) => entry._uiKey === uiKey);
    if (!selected) {
      return;
    }

    setFeeForm({
      semester: selected.semester || '',
      demand: selected.demand ?? '',
      waiver: selected.waiver ?? '',
      paid: selected.paid ?? '',
      status: selected.status || 'ok',
      statusText: selected.statusText || '',
      statusAmount: selected.statusAmount ?? '',
    });
  };

  const handleAddFeeItem = () => {
    setFeeDirty(true);
    setFeeSaveError('');
    setFeeSaveMessage('');
    const nextEntry = {
      _uiKey: `fee-item-${feeItemKeyCounter.current++}`,
      semester: '',
      demand: '',
      waiver: '',
      paid: '',
      status: 'ok',
      statusText: '',
      statusAmount: '',
    };
    setFeeItems((prev) => [...prev, nextEntry]);
    setSelectedFeeSemesterKey(nextEntry._uiKey);
    setFeeForm({
      semester: '',
      demand: '',
      waiver: '',
      paid: '',
      status: 'ok',
      statusText: '',
      statusAmount: '',
    });
  };

  const handleRemoveFeeItem = () => {
    if (!selectedFeeSemesterKey) {
      return;
    }

    setFeeDirty(true);
    setFeeSaveError('');
    setFeeSaveMessage('');
    const nextItems = feeItems.filter((item) => item._uiKey !== selectedFeeSemesterKey);
    setFeeItems(nextItems);

    const fallback = nextItems[0];
    if (fallback) {
      setSelectedFeeSemesterKey(fallback._uiKey);
      setFeeForm({
        semester: fallback.semester || '',
        demand: fallback.demand ?? '',
        waiver: fallback.waiver ?? '',
        paid: fallback.paid ?? '',
        status: fallback.status || 'ok',
        statusText: fallback.statusText || '',
        statusAmount: fallback.statusAmount ?? '',
      });
    } else {
      setSelectedFeeSemesterKey('');
      setFeeForm({
        semester: '',
        demand: '',
        waiver: '',
        paid: '',
        status: 'ok',
        statusText: '',
        statusAmount: '',
      });
    }
  };

  const handleFeeReset = () => {
    const keyedFees = withFeeItemKeys(sortFeesEntries(Array.isArray(fees) ? fees : []));
    setFeeItems(keyedFees);
    if (keyedFees.length > 0) {
      setSelectedFeeSemesterKey(keyedFees[0]._uiKey);
      setFeeForm({
        semester: keyedFees[0].semester || '',
        demand: keyedFees[0].demand ?? '',
        waiver: keyedFees[0].waiver ?? '',
        paid: keyedFees[0].paid ?? '',
        status: keyedFees[0].status || 'ok',
        statusText: keyedFees[0].statusText || '',
        statusAmount: keyedFees[0].statusAmount ?? '',
      });
    } else {
      setSelectedFeeSemesterKey('');
      setFeeForm({
        semester: '',
        demand: '',
        waiver: '',
        paid: '',
        status: 'ok',
        statusText: '',
        statusAmount: '',
      });
    }
    setFeeDirty(false);
    setFeeSaveError('');
    setFeeSaveMessage('Unsaved fees changes were discarded.');

    setTimeout(() => {
      setFeeSaveMessage('');
    }, 1800);
  };

  const handleFeeSave = async (event) => {
    event.preventDefault();

    setFeeSaveError('');
    const cleanedFees = sortFeesEntries(
      feeItems
        .map((item) => ({
          semester: (item.semester || '').trim(),
          demand: toNumber(item.demand),
          waiver: toNumber(item.waiver),
          paid: toNumber(item.paid),
          status: (item.status || '').trim().toLowerCase() === 'due' ? 'due' : 'ok',
          statusText: (item.statusText || '').trim(),
          statusAmount: toNumber(item.statusAmount),
        }))
        .filter((item) => item.semester)
    );

    const feeValidationError = validateFeesPayload(cleanedFees);
    if (feeValidationError) {
      setFeeSaveError(feeValidationError);
      return;
    }

    const result = await updateFeesData({ fees: cleanedFees });

    if (!result?.ok) {
      setFeeSaveError(result?.error || 'Failed to save fees changes.');
      return;
    }

    setFeeDirty(false);
    setFeeSaveMessage('Fees and waives updated successfully. JSON file and fees page are synced.');

    setTimeout(() => {
      setFeeSaveMessage('');
    }, 2400);
  };

  const applyFeeJson = async (rawText, sequence = feeJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(feeJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setFeeJsonSaveError('Invalid JSON. Please paste valid fees JSON format.');
      return;
    }

    const parsedFees = normalizeFeesPayload(parsed);
    if (!Array.isArray(parsedFees)) {
      setFeeJsonSaveError('Invalid JSON shape. Expected {"fees": [...]} or [...].');
      return;
    }

    const cleanedFees = sortFeesEntries(
      parsedFees.map((item) => normalizeFeeEntry(item, toNumber)).filter((item) => item.semester)
    );

    const feeValidationError = validateFeesPayload(cleanedFees);
    if (feeValidationError) {
      setFeeJsonSaveError(feeValidationError);
      return;
    }

    const normalizedPayload = { fees: cleanedFees };
    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === feeJsonLastSavedRef.current) {
      setFeeJsonSaveError('');
      return;
    }

    setFeeJsonSaving(true);
    setFeeJsonSaveError('');

    const result = await updateFeesData(normalizedPayload);
    if (isStaleAutoSave(feeJsonSaveSeqRef, sequence)) {
      return;
    }

    setFeeJsonSaving(false);

    if (!result?.ok) {
      setFeeJsonSaveError(result?.error || 'Failed to auto-save fees JSON.');
      return;
    }

    feeJsonLastSavedRef.current = normalizedRaw;
    setFeeJsonDirty(false);
    setFeeJsonSaveMessage('Fees JSON updated automatically and synced to file.');

    setTimeout(() => {
      setFeeJsonSaveMessage('');
    }, 2200);
  };

  const handleFeeJsonChange = (event) => {
    const nextText = event.target.value;
    setFeeJsonText(nextText);
    setFeeJsonDirty(true);
    setFeeJsonSaveMessage('');
    setFeeJsonSaveError('');

    scheduleJsonAutoSave(feeJsonTimerRef, feeJsonSaveSeqRef, nextText, applyFeeJson);
  };

  const handleFeeSemesterJsonAdd = async (event) => {
    event.preventDefault();

    const trimmed = String(feeSemesterJsonText || '').trim();
    if (!trimmed) {
      setFeeSemesterJsonAddError('Please paste semester fee JSON first.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setFeeSemesterJsonAddError('Invalid JSON. Please paste valid semester fee JSON.');
      return;
    }

    const single = parseSingleFeePayload(parsed);
    if (!single) {
      setFeeSemesterJsonAddError(
        'Invalid JSON shape. Expected one semester fee object with "semester" field.'
      );
      return;
    }

    const cleanedEntry = normalizeFeeEntry(single, toNumber);
    if (!cleanedEntry.semester) {
      setFeeSemesterJsonAddError('Semester name is required in pasted JSON.');
      return;
    }

    const existing = sortFeesEntries(Array.isArray(fees) ? fees : []).map((item) =>
      normalizeFeeEntry(item, toNumber)
    );
    const nextFees = sortFeesEntries([...existing, cleanedEntry]);
    const feeValidationError = validateFeesPayload(nextFees);
    if (feeValidationError) {
      setFeeSemesterJsonAddError(feeValidationError);
      return;
    }

    setFeeSemesterJsonAdding(true);
    setFeeSemesterJsonAddError('');
    setFeeSemesterJsonAddMessage('');

    const result = await updateFeesData({ fees: nextFees });
    setFeeSemesterJsonAdding(false);

    if (!result?.ok) {
      setFeeSemesterJsonAddError(result?.error || 'Failed to add semester fee JSON.');
      return;
    }

    setFeeSemesterJsonText('');
    setFeeJsonDirty(false);
    setFeeSemesterJsonAddMessage('Semester fee JSON added successfully.');

    setTimeout(() => {
      setFeeSemesterJsonAddMessage('');
    }, 2200);
  };

  const handleCalendarFieldChange = (index, field, value) => {
    setCalendarDirty(true);
    setCalendarSaveError('');
    setCalendarSaveMessage('');
    setCalendarItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddCalendarItem = () => {
    setCalendarDirty(true);
    setCalendarSaveError('');
    setCalendarSaveMessage('');
    setCalendarItems((prev) => [
      ...prev,
      {
        _uiKey: `calendar-item-${calendarItemKeyCounter.current++}`,
        title: '',
        dateText: '',
        tagType: 'academic',
        tagText: '',
        start: '',
        end: '',
      },
    ]);
  };

  const handleRemoveCalendarItem = (index) => {
    setCalendarDirty(true);
    setCalendarSaveError('');
    setCalendarSaveMessage('');
    setCalendarItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCalendarReset = () => {
    setCalendarItems(withCalendarItemKeys(Array.isArray(calendarEvents) ? calendarEvents : []));
    setCalendarDirty(false);
    setCalendarSaveError('');
    setCalendarSaveMessage('Unsaved calendar changes were discarded.');

    setTimeout(() => {
      setCalendarSaveMessage('');
    }, 1800);
  };

  const handleCalendarSave = async (event) => {
    event.preventDefault();

    setCalendarSaveError('');
    const cleanedEvents = sortCalendarEvents(
      calendarItems
        .map((item) => ({
          title: (item.title || '').trim(),
          dateText: (item.dateText || '').trim(),
          tagType: (item.tagType || '').trim().toLowerCase(),
          tagText: (item.tagText || '').trim(),
          start: (item.start || '').trim(),
          end: (item.end || '').trim(),
        }))
        .filter((item) => item.title && item.dateText && item.start && item.end)
    );

    const calendarValidationError = validateCalendarPayload(cleanedEvents);
    if (calendarValidationError) {
      setCalendarSaveError(calendarValidationError);
      return;
    }

    const result = await updateCalendarData({ events: cleanedEvents });

    if (!result?.ok) {
      setCalendarSaveError(result?.error || 'Failed to save calendar changes.');
      return;
    }

    setCalendarDirty(false);
    setCalendarSaveMessage(
      'Academic calendar updated successfully. JSON file and calendar page are synced.'
    );

    setTimeout(() => {
      setCalendarSaveMessage('');
    }, 2400);
  };

  const applyCalendarJson = async (rawText, sequence = calendarJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(calendarJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setCalendarJsonSaveError('Invalid JSON. Please paste valid calendar JSON format.');
      return;
    }

    const parsedEvents = Array.isArray(parsed?.events)
      ? parsed.events
      : Array.isArray(parsed)
        ? parsed
        : null;
    if (!parsedEvents) {
      setCalendarJsonSaveError(
        'Invalid JSON shape. Expected object with "events" array or raw array.'
      );
      return;
    }

    const cleanedEvents = sortCalendarEvents(
      parsedEvents
        .map((item) => ({
          title: (item?.title || '').trim(),
          dateText: (item?.dateText || '').trim(),
          tagType: (item?.tagType || '').trim().toLowerCase(),
          tagText: (item?.tagText || '').trim(),
          start: (item?.start || '').trim(),
          end: (item?.end || '').trim(),
        }))
        .filter((item) => item.title && item.dateText && item.start && item.end)
    );

    const calendarValidationError = validateCalendarPayload(cleanedEvents);
    if (calendarValidationError) {
      setCalendarJsonSaveError(calendarValidationError);
      return;
    }

    const normalizedPayload = { events: cleanedEvents };
    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === calendarJsonLastSavedRef.current) {
      setCalendarJsonSaveError('');
      return;
    }

    setCalendarJsonSaving(true);
    setCalendarJsonSaveError('');

    const result = await updateCalendarData(normalizedPayload);
    if (isStaleAutoSave(calendarJsonSaveSeqRef, sequence)) {
      return;
    }

    setCalendarJsonSaving(false);

    if (!result?.ok) {
      setCalendarJsonSaveError(result?.error || 'Failed to auto-save calendar JSON.');
      return;
    }

    calendarJsonLastSavedRef.current = normalizedRaw;
    setCalendarJsonDirty(false);
    setCalendarJsonSaveMessage('Calendar JSON updated automatically and synced to file.');

    setTimeout(() => {
      setCalendarJsonSaveMessage('');
    }, 2200);
  };

  const handleCalendarJsonChange = (event) => {
    const nextText = event.target.value;
    setCalendarJsonText(nextText);
    setCalendarJsonDirty(true);
    setCalendarJsonSaveMessage('');
    setCalendarJsonSaveError('');

    scheduleJsonAutoSave(calendarJsonTimerRef, calendarJsonSaveSeqRef, nextText, applyCalendarJson);
  };

  const handleDownloadFieldChange = (index, field, value) => {
    setDownloadDirty(true);
    setDownloadSaveError('');
    setDownloadSaveMessage('');
    setDownloadItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddDownloadItem = () => {
    setDownloadDirty(true);
    setDownloadSaveError('');
    setDownloadSaveMessage('');
    setDownloadItems((prev) => [
      ...prev,
      {
        _uiKey: `download-item-${downloadItemKeyCounter.current++}`,
        title: '',
        category: '',
        url: '',
        date: '',
      },
    ]);
  };

  const handleRemoveDownloadItem = (index) => {
    setDownloadDirty(true);
    setDownloadSaveError('');
    setDownloadSaveMessage('');
    setDownloadItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadReset = () => {
    setDownloadItems(withDownloadItemKeys(Array.isArray(downloads) ? downloads : []));
    setDownloadDirty(false);
    setDownloadSaveError('');
    setDownloadSaveMessage('Unsaved downloads changes were discarded.');

    setTimeout(() => {
      setDownloadSaveMessage('');
    }, 1800);
  };

  const handleDownloadSave = async (event) => {
    event.preventDefault();

    setDownloadSaveError('');
    const cleanedItems = normalizeDownloadItems(downloadItems);
    const downloadsValidationError = validateDownloadsPayload(cleanedItems);
    if (downloadsValidationError) {
      setDownloadSaveError(downloadsValidationError);
      return;
    }

    const result = await updateDownloadsData({ downloads: cleanedItems });

    if (!result?.ok) {
      setDownloadSaveError(result?.error || 'Failed to save downloads changes.');
      return;
    }

    setDownloadDirty(false);
    setDownloadSaveMessage('Downloads updated successfully.');

    setTimeout(() => {
      setDownloadSaveMessage('');
    }, 2200);
  };

  const applyDownloadJson = async (rawText, sequence = downloadJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(downloadJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setDownloadJsonSaveError('Invalid JSON. Please paste valid downloads JSON format.');
      return;
    }

    const parsedItems = Array.isArray(parsed?.downloads)
      ? parsed.downloads
      : Array.isArray(parsed)
        ? parsed
        : null;
    if (!parsedItems) {
      setDownloadJsonSaveError(
        'Invalid JSON shape. Expected object with "downloads" array or raw array.'
      );
      return;
    }

    const cleanedItems = normalizeDownloadItems(parsedItems);
    const downloadsValidationError = validateDownloadsPayload(cleanedItems);
    if (downloadsValidationError) {
      setDownloadJsonSaveError(downloadsValidationError);
      return;
    }

    const normalizedPayload = { downloads: cleanedItems };
    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === downloadJsonLastSavedRef.current) {
      setDownloadJsonSaveError('');
      return;
    }

    setDownloadJsonSaving(true);
    setDownloadJsonSaveError('');

    const result = await updateDownloadsData(normalizedPayload);
    if (isStaleAutoSave(downloadJsonSaveSeqRef, sequence)) {
      return;
    }

    setDownloadJsonSaving(false);

    if (!result?.ok) {
      setDownloadJsonSaveError(result?.error || 'Failed to auto-save downloads JSON.');
      return;
    }

    downloadJsonLastSavedRef.current = normalizedRaw;
    setDownloadJsonDirty(false);
    setDownloadJsonSaveMessage('Downloads JSON updated automatically and synced to file.');

    setTimeout(() => {
      setDownloadJsonSaveMessage('');
    }, 2200);
  };

  const handleDownloadJsonChange = (event) => {
    const nextText = event.target.value;
    setDownloadJsonText(nextText);
    setDownloadJsonDirty(true);
    setDownloadJsonSaveMessage('');
    setDownloadJsonSaveError('');

    scheduleJsonAutoSave(downloadJsonTimerRef, downloadJsonSaveSeqRef, nextText, applyDownloadJson);
  };

  const handleCourseFieldChange = (index, field, value) => {
    setCourseDirty(true);
    setCourseSaveError('');
    setCourseSaveMessage('');
    const nextCourseItems = courseItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    setCourseItems(nextCourseItems);
    setCourseSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedCourseSemesterKey ? { ...entry, courses: nextCourseItems } : entry
      )
    );
  };

  const handleSelectCourseSemester = (uiKey) => {
    setSelectedCourseSemesterKey(uiKey);
    const selected = courseSemesterItems.find((entry) => entry._uiKey === uiKey);
    if (!selected) {
      return;
    }
    setCourseSemester(selected.semester);
    setCourseItems(selected.courses);
  };

  const handleCourseSemesterNameChange = (value) => {
    setCourseDirty(true);
    setCourseSaveError('');
    setCourseSaveMessage('');
    setCourseSemester(value);
    setCourseSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedCourseSemesterKey ? { ...entry, semester: value } : entry
      )
    );
  };

  const handleAddCourseSemester = () => {
    setCourseDirty(true);
    setCourseSaveError('');
    setCourseSaveMessage('');

    const newEntry = {
      _uiKey: `course-semester-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      semester: '',
      courses: [],
    };

    const next = [...courseSemesterItems, newEntry];
    setCourseSemesterItems(next);
    setSelectedCourseSemesterKey(newEntry._uiKey);
    setCourseSemester('');
    setCourseItems([]);
  };

  const handleRemoveCourseSemester = () => {
    if (!selectedCourseSemesterKey) {
      return;
    }

    setCourseDirty(true);
    setCourseSaveError('');
    setCourseSaveMessage('');

    const next = courseSemesterItems.filter((entry) => entry._uiKey !== selectedCourseSemesterKey);
    setCourseSemesterItems(next);

    const fallback = next[0];
    if (fallback) {
      setSelectedCourseSemesterKey(fallback._uiKey);
      setCourseSemester(fallback.semester);
      setCourseItems(fallback.courses);
    } else {
      setSelectedCourseSemesterKey('');
      setCourseSemester('');
      setCourseItems([]);
    }
  };

  const handleAddCourseItem = () => {
    setCourseDirty(true);
    setCourseSaveError('');
    setCourseSaveMessage('');
    const nextCourseItems = [
      ...courseItems,
      {
        _uiKey: `course-item-${courseItemKeyCounter.current++}`,
        code: '',
        name: '',
        type: 'Theory',
        credits: '',
        intake: '',
        section: '',
        result: '--',
        takeAs: 'Regular',
      },
    ];

    setCourseItems(nextCourseItems);
    setCourseSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedCourseSemesterKey ? { ...entry, courses: nextCourseItems } : entry
      )
    );
  };

  const handleRemoveCourseItem = (index) => {
    setCourseDirty(true);
    setCourseSaveError('');
    setCourseSaveMessage('');
    const nextCourseItems = courseItems.filter((_, i) => i !== index);
    setCourseItems(nextCourseItems);
    setCourseSemesterItems((prev) =>
      prev.map((entry) =>
        entry._uiKey === selectedCourseSemesterKey ? { ...entry, courses: nextCourseItems } : entry
      )
    );
  };

  const handleCourseReset = () => {
    const grouped = {};
    const rawCourses = Array.isArray(courses?.courses) ? courses.courses : [];
    sortCoursesBySemesterDesc(rawCourses).forEach((course) => {
      const semester = String(course?.semester || '').trim();
      if (!semester) {
        return;
      }
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(course);
    });

    const keyedSemesters = withCourseSemesterKeys(
      Object.entries(grouped).map(([semester, semesterCourses]) => ({
        semester,
        courses: semesterCourses,
      }))
    );

    setCourseSemesterItems(keyedSemesters);
    if (keyedSemesters.length > 0) {
      setSelectedCourseSemesterKey(keyedSemesters[0]._uiKey);
      setCourseSemester(keyedSemesters[0].semester);
      setCourseItems(keyedSemesters[0].courses);
    } else {
      setSelectedCourseSemesterKey('');
      setCourseSemester('');
      setCourseItems([]);
    }
    setCourseDirty(false);
    setCourseSaveError('');
    setCourseSaveMessage('Unsaved course changes were discarded.');

    setTimeout(() => {
      setCourseSaveMessage('');
    }, 1800);
  };

  const handleCourseSave = async (event) => {
    event.preventDefault();

    setCourseSaveError('');
    const cleanedCourses = sortCoursesBySemesterDesc(
      courseSemesterItems
        .flatMap((entry) =>
          (entry.courses || []).map((item) => ({
            code: (item.code || '').trim(),
            name: (item.name || '').trim(),
            semester: (entry.semester || '').trim(),
            type: (item.type || '').trim() || 'Theory',
            credits: Number.isFinite(Number(item.credits)) ? Number(item.credits) : 0,
            intake: (item.intake || '').trim(),
            section: (item.section || '').trim(),
            result: (item.result || '').trim() || '--',
            takeAs: (item.takeAs || '').trim() || 'Regular',
          }))
        )
        .filter((item) => item.code && item.name && item.semester)
    );

    const coursesValidationError = validateCoursesPayload(cleanedCourses);
    if (coursesValidationError) {
      setCourseSaveError(coursesValidationError);
      return;
    }

    const result = await updateCoursesData({ courses: cleanedCourses });

    if (!result?.ok) {
      setCourseSaveError(result?.error || 'Failed to save all courses changes.');
      return;
    }

    setCourseDirty(false);
    setCourseSaveMessage(
      'All courses updated successfully. JSON file and courses sections are synced.'
    );

    setTimeout(() => {
      setCourseSaveMessage('');
    }, 2400);
  };

  const applyCourseJson = async (rawText, sequence = courseJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(courseJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setCourseJsonSaveError('Invalid JSON. Please paste valid courses JSON format.');
      return;
    }

    const parsedCourses = Array.isArray(parsed?.courses)
      ? parsed.courses
      : Array.isArray(parsed)
        ? parsed
        : null;
    if (!parsedCourses) {
      setCourseJsonSaveError(
        'Invalid JSON shape. Expected object with "courses" array or raw array.'
      );
      return;
    }

    const cleanedCourses = sortCoursesBySemesterDesc(
      parsedCourses
        .map((item) => ({
          code: (item?.code || '').trim(),
          name: (item?.name || '').trim(),
          semester: (item?.semester || '').trim(),
          type: (item?.type || '').trim() || 'Theory',
          credits: Number.isFinite(Number(item?.credits)) ? Number(item.credits) : 0,
          intake: (item?.intake || '').trim(),
          section: (item?.section || '').trim(),
          result: (item?.result || '').trim() || '--',
          takeAs: (item?.takeAs || '').trim() || 'Regular',
        }))
        .filter((item) => item.code && item.name && item.semester)
    );

    const coursesValidationError = validateCoursesPayload(cleanedCourses);
    if (coursesValidationError) {
      setCourseJsonSaveError(coursesValidationError);
      return;
    }

    const normalizedPayload = { courses: cleanedCourses };
    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === courseJsonLastSavedRef.current) {
      setCourseJsonSaveError('');
      return;
    }

    setCourseJsonSaving(true);
    setCourseJsonSaveError('');

    const result = await updateCoursesData(normalizedPayload);
    if (isStaleAutoSave(courseJsonSaveSeqRef, sequence)) {
      return;
    }

    setCourseJsonSaving(false);

    if (!result?.ok) {
      setCourseJsonSaveError(result?.error || 'Failed to auto-save courses JSON.');
      return;
    }

    courseJsonLastSavedRef.current = normalizedRaw;
    setCourseJsonDirty(false);
    setCourseJsonSaveMessage('Courses JSON updated automatically and synced to file.');

    setTimeout(() => {
      setCourseJsonSaveMessage('');
    }, 2200);
  };

  const handleCourseJsonChange = (event) => {
    const nextText = event.target.value;
    setCourseJsonText(nextText);
    setCourseJsonDirty(true);
    setCourseJsonSaveMessage('');
    setCourseJsonSaveError('');

    scheduleJsonAutoSave(courseJsonTimerRef, courseJsonSaveSeqRef, nextText, applyCourseJson);
  };

  const handlePendingCourseFieldChange = (index, field, value) => {
    setPendingCourseDirty(true);
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('');

    setPendingCourseItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddPendingCourseItem = () => {
    setPendingCourseDirty(true);
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('');

    setPendingCourseItems((prev) => [
      ...prev,
      {
        _uiKey: `pending-course-item-${pendingCourseItemKeyCounter.current++}`,
        code: '',
        name: '',
        credits: '',
        reason: '',
        status: 'pending',
      },
    ]);
  };

  const handleRemovePendingCourseItem = (index) => {
    setPendingCourseDirty(true);
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('');

    setPendingCourseItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePendingCourseReset = () => {
    setPendingCourseItems(
      withPendingCourseItemKeys(Array.isArray(pendingCourses) ? pendingCourses : [])
    );
    setPendingCourseDirty(false);
    setPendingCourseSaveError('');
    setPendingCourseSaveMessage('Unsaved pending course changes were discarded.');

    setTimeout(() => {
      setPendingCourseSaveMessage('');
    }, 1800);
  };

  const handlePendingCourseSave = async (event) => {
    event.preventDefault();

    setPendingCourseSaveError('');
    const cleanedItems = normalizePendingCourseItems(pendingCourseItems);
    const pendingCoursesValidationError = validatePendingCoursesPayload(cleanedItems);
    if (pendingCoursesValidationError) {
      setPendingCourseSaveError(pendingCoursesValidationError);
      return;
    }

    const result = await updatePendingCoursesData({ pendingCourses: cleanedItems });

    if (!result?.ok) {
      setPendingCourseSaveError(result?.error || 'Failed to save pending courses changes.');
      return;
    }

    setPendingCourseDirty(false);
    setPendingCourseSaveMessage('Pending courses updated successfully.');

    setTimeout(() => {
      setPendingCourseSaveMessage('');
    }, 2200);
  };

  const applyPendingCourseJson = async (
    rawText,
    sequence = pendingCourseJsonSaveSeqRef.current
  ) => {
    if (isStaleAutoSave(pendingCourseJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setPendingCourseJsonSaveError(
        'Invalid JSON. Please paste valid pending courses JSON format.'
      );
      return;
    }

    const parsedItems = Array.isArray(parsed?.pendingCourses)
      ? parsed.pendingCourses
      : Array.isArray(parsed)
        ? parsed
        : null;
    if (!parsedItems) {
      setPendingCourseJsonSaveError(
        'Invalid JSON shape. Expected object with "pendingCourses" array or raw array.'
      );
      return;
    }

    const cleanedItems = normalizePendingCourseItems(parsedItems);
    const pendingCoursesValidationError = validatePendingCoursesPayload(cleanedItems);
    if (pendingCoursesValidationError) {
      setPendingCourseJsonSaveError(pendingCoursesValidationError);
      return;
    }

    const normalizedPayload = { pendingCourses: cleanedItems };
    const normalizedRaw = JSON.stringify(normalizedPayload);
    if (normalizedRaw === pendingCourseJsonLastSavedRef.current) {
      setPendingCourseJsonSaveError('');
      return;
    }

    setPendingCourseJsonSaving(true);
    setPendingCourseJsonSaveError('');

    const result = await updatePendingCoursesData(normalizedPayload);
    if (isStaleAutoSave(pendingCourseJsonSaveSeqRef, sequence)) {
      return;
    }

    setPendingCourseJsonSaving(false);

    if (!result?.ok) {
      setPendingCourseJsonSaveError(result?.error || 'Failed to auto-save pending courses JSON.');
      return;
    }

    pendingCourseJsonLastSavedRef.current = normalizedRaw;
    setPendingCourseJsonDirty(false);
    setPendingCourseJsonSaveMessage(
      'Pending courses JSON updated automatically and synced to file.'
    );

    setTimeout(() => {
      setPendingCourseJsonSaveMessage('');
    }, 2200);
  };

  const handlePendingCourseJsonChange = (event) => {
    const nextText = event.target.value;
    setPendingCourseJsonText(nextText);
    setPendingCourseJsonDirty(true);
    setPendingCourseJsonSaveMessage('');
    setPendingCourseJsonSaveError('');

    scheduleJsonAutoSave(
      pendingCourseJsonTimerRef,
      pendingCourseJsonSaveSeqRef,
      nextText,
      applyPendingCourseJson
    );
  };

  const handleSelectMarksSemester = (semester) => {
    setSelectedMarksSemester(semester);
    const selected = marksEditorSemesters.find((entry) => entry.semester === semester);
    setMarksSubjectRows(selected?.subjects || []);
  };

  const handleMarkChange = (code, value) => {
    setMarksDirty(true);
    setMarksSaveError('');
    setMarksSaveMessage('');

    const normalizedValue = String(value).trim();
    const nextMark = normalizedValue === '' ? null : toNumber(normalizedValue, null);

    const nextRows = marksSubjectRows.map((row) =>
      row.code === code ? { ...row, mark: nextMark } : row
    );

    setMarksSubjectRows(nextRows);
    setMarksEditorSemesters((prev) =>
      prev.map((entry) =>
        entry.semester === selectedMarksSemester ? { ...entry, subjects: nextRows } : entry
      )
    );
  };

  const handleMarksReset = () => {
    const semesters = buildMarksEditorSemesters();
    setMarksEditorSemesters(semesters);
    const selected =
      semesters.find((entry) => entry.semester === selectedMarksSemester) || semesters[0];
    setSelectedMarksSemester(selected?.semester || '');
    setMarksSubjectRows(selected?.subjects || []);
    setMarksDirty(false);
    setMarksSaveError('');
    setMarksSaveMessage('Unsaved marks changes were discarded.');

    setTimeout(() => {
      setMarksSaveMessage('');
    }, 1800);
  };

  const persistAcademicComputation = async (semestersPayload) => {
    const normalizedSemesters = sortSemestersDesc(
      normalizeMarksPayload({ semesters: semestersPayload }),
      (x) => x.semester
    );
    const marksValidationError = validateMarksSemestersPayload(normalizedSemesters);
    if (marksValidationError) {
      return { ok: false, error: marksValidationError };
    }

    const { updatedCourses, updatedResults } = calculateAcademicSummary(
      { courses: Array.isArray(courses?.courses) ? courses.courses : [] },
      normalizedSemesters
    );

    const previousMarks = sortSemestersDesc(
      normalizeMarksPayload({ semesters: marksSemesters }),
      (x) => x.semester
    );
    const previousResults = Array.isArray(results) ? results : [];
    const previousCourses = Array.isArray(courses?.courses) ? courses.courses : [];

    const rollbackAcademicState = async ({ revertMarks, revertResults, revertCourses }) => {
      const rollbackErrors = [];

      if (revertMarks) {
        const marksRollback = await updateMarksData({ semesters: previousMarks });
        if (!marksRollback?.ok) {
          rollbackErrors.push('marks');
        }
      }

      if (revertResults) {
        const resultsRollback = await updateResultsData({ results: previousResults });
        if (!resultsRollback?.ok) {
          rollbackErrors.push('results');
        }
      }

      if (revertCourses) {
        const coursesRollback = await updateCoursesData({ courses: previousCourses });
        if (!coursesRollback?.ok) {
          rollbackErrors.push('courses');
        }
      }

      return rollbackErrors;
    };

    const marksResult = await updateMarksData({ semesters: normalizedSemesters });
    if (!marksResult?.ok) {
      return { ok: false, error: marksResult?.error || 'Failed to save marks data.' };
    }

    const resultsResult = await updateResultsData({ results: updatedResults });
    if (!resultsResult?.ok) {
      const rollbackErrors = await rollbackAcademicState({
        revertMarks: true,
        revertResults: false,
        revertCourses: false,
      });

      const rollbackSuffix =
        rollbackErrors.length > 0
          ? ` Rollback incomplete for: ${rollbackErrors.join(', ')}.`
          : ' Previous marks were restored.';

      return {
        ok: false,
        error: `${resultsResult?.error || 'Failed to save results data.'}${rollbackSuffix}`,
      };
    }

    const coursesResult = await updateCoursesData({ courses: updatedCourses });
    if (!coursesResult?.ok) {
      const rollbackErrors = await rollbackAcademicState({
        revertMarks: true,
        revertResults: true,
        revertCourses: false,
      });

      const rollbackSuffix =
        rollbackErrors.length > 0
          ? ` Rollback incomplete for: ${rollbackErrors.join(', ')}.`
          : ' Previous marks and results were restored.';

      return {
        ok: false,
        error: `${coursesResult?.error || 'Failed to save courses grade data.'}${rollbackSuffix}`,
      };
    }

    return { ok: true };
  };

  const handleMarksSave = async (event) => {
    event.preventDefault();

    setMarksSaveError('');
    const result = await persistAcademicComputation(marksEditorSemesters);
    if (!result?.ok) {
      setMarksSaveError(result?.error || 'Failed to recalculate academic summary.');
      return;
    }

    setMarksDirty(false);
    setMarksSaveMessage('Marks saved. SGPA/CGPA and course grades are updated.');
    setTimeout(() => {
      setMarksSaveMessage('');
    }, 2400);
  };

  const applyMarksJson = async (rawText, sequence = marksJsonSaveSeqRef.current) => {
    if (isStaleAutoSave(marksJsonSaveSeqRef, sequence)) {
      return;
    }

    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setMarksJsonSaveError('Invalid JSON. Please paste valid marks JSON format.');
      return;
    }

    const parsedSemesters = normalizeMarksPayload(parsed);
    const normalizedPayload = { semesters: sortSemestersDesc(parsedSemesters, (x) => x.semester) };
    const normalizedRaw = JSON.stringify(normalizedPayload);

    if (normalizedRaw === marksJsonLastSavedRef.current) {
      setMarksJsonSaveError('');
      return;
    }

    setMarksJsonSaving(true);
    setMarksJsonSaveError('');

    const result = await persistAcademicComputation(normalizedPayload.semesters);
    if (isStaleAutoSave(marksJsonSaveSeqRef, sequence)) {
      return;
    }

    setMarksJsonSaving(false);

    if (!result?.ok) {
      setMarksJsonSaveError(result?.error || 'Failed to auto-save marks JSON.');
      return;
    }

    marksJsonLastSavedRef.current = normalizedRaw;
    setMarksJsonDirty(false);
    setMarksJsonSaveMessage('Marks JSON saved. Results and grades recalculated.');

    setTimeout(() => {
      setMarksJsonSaveMessage('');
    }, 2200);
  };

  const handleMarksJsonChange = (event) => {
    const nextText = event.target.value;
    setMarksJsonText(nextText);
    setMarksJsonDirty(true);
    setMarksJsonSaveMessage('');
    setMarksJsonSaveError('');

    scheduleJsonAutoSave(marksJsonTimerRef, marksJsonSaveSeqRef, nextText, applyMarksJson);
  };

  const handleAdminBack = () => {
    if (isCriticalSaveInProgress) {
      return;
    }

    const next = resolveAdminBackTool(activeTool);
    if (next.action === 'home') {
      setCurrentScreen('home');
      return;
    }

    setActiveTool(next.tool);
  };

  if (!user) {
    return (
      <div className="page-container">
        <TopBar title="Admin" onBack={handleAdminBack} />
        <div className="page-content">
          <p className="pending-alert">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopBar title="Admin" onBack={handleAdminBack} />

      <div className="page-content">
        <SectionTitle eyebrow="Administration" title="Admin Section" />

        <AdminPanels
          activeTool={activeTool}
          currentTime={currentTime}
          openProfileEditor={openProfileEditor}
          openRoutinesEditor={openRoutinesEditor}
          openFeesEditor={openFeesEditor}
          openCalendarEditor={openCalendarEditor}
          openDownloadsEditor={openDownloadsEditor}
          openCoursesEditor={openCoursesEditor}
          openPendingCoursesEditor={openPendingCoursesEditor}
          openMarksEditor={openMarksEditor}
          closeProfileEditor={closeProfileEditor}
          openProfileNormalEditor={openProfileNormalEditor}
          openProfileJsonEditor={openProfileJsonEditor}
          backToProfileOptions={backToProfileOptions}
          handleSave={handleSave}
          formData={formData}
          handleInputChange={handleInputChange}
          handleProfileImageUpload={handleProfileImageUpload}
          handleReset={handleReset}
          profileDirty={profileDirty}
          saveError={saveError}
          saveMessage={saveMessage}
          profileJsonText={profileJsonText}
          handleProfileJsonChange={handleProfileJsonChange}
          PROFILE_JSON_PLACEHOLDER={PROFILE_JSON_PLACEHOLDER}
          profileJsonSaving={profileJsonSaving}
          profileJsonSaveError={profileJsonSaveError}
          profileJsonSaveMessage={profileJsonSaveMessage}
          closeRoutinesEditor={closeRoutinesEditor}
          openRoutinesNormalEditor={openRoutinesNormalEditor}
          openRoutinesJsonEditor={openRoutinesJsonEditor}
          backToRoutineOptions={backToRoutineOptions}
          handleRoutineSave={handleRoutineSave}
          selectedRoutineSemesterKey={selectedRoutineSemesterKey}
          handleSelectRoutineSemester={handleSelectRoutineSemester}
          routineSemesterItems={routineSemesterItems}
          handleAddRoutineSemester={handleAddRoutineSemester}
          handleRemoveRoutineSemester={handleRemoveRoutineSemester}
          routineSemester={routineSemester}
          handleRoutineSemesterNameChange={handleRoutineSemesterNameChange}
          routineItems={routineItems}
          handleRemoveRoutineItem={handleRemoveRoutineItem}
          handleRoutineFieldChange={handleRoutineFieldChange}
          handleAddRoutineItem={handleAddRoutineItem}
          handleRoutineReset={handleRoutineReset}
          routineDirty={routineDirty}
          routineSaveError={routineSaveError}
          routineSaveMessage={routineSaveMessage}
          handleRoutineSemesterJsonAdd={handleRoutineSemesterJsonAdd}
          routineSemesterJsonText={routineSemesterJsonText}
          setRoutineSemesterJsonText={setRoutineSemesterJsonText}
          setRoutineSemesterJsonAddError={setRoutineSemesterJsonAddError}
          setRoutineSemesterJsonAddMessage={setRoutineSemesterJsonAddMessage}
          ROUTINE_SEMESTER_JSON_PLACEHOLDER={ROUTINE_SEMESTER_JSON_PLACEHOLDER}
          routineSemesterJsonAdding={routineSemesterJsonAdding}
          routineSemesterJsonAddError={routineSemesterJsonAddError}
          routineSemesterJsonAddMessage={routineSemesterJsonAddMessage}
          routineJsonText={routineJsonText}
          handleRoutineJsonChange={handleRoutineJsonChange}
          ROUTINES_JSON_PLACEHOLDER={ROUTINES_JSON_PLACEHOLDER}
          routineJsonSaving={routineJsonSaving}
          routineJsonSaveError={routineJsonSaveError}
          routineJsonSaveMessage={routineJsonSaveMessage}
          closeFeesEditor={closeFeesEditor}
          openFeesNormalEditor={openFeesNormalEditor}
          openFeesJsonEditor={openFeesJsonEditor}
          backToFeeOptions={backToFeeOptions}
          handleFeeSave={handleFeeSave}
          selectedFeeSemesterKey={selectedFeeSemesterKey}
          handleSelectFeeSemester={handleSelectFeeSemester}
          feeItems={feeItems}
          handleAddFeeItem={handleAddFeeItem}
          handleRemoveFeeItem={handleRemoveFeeItem}
          feeForm={feeForm}
          handleFeeFieldChange={handleFeeFieldChange}
          handleFeeReset={handleFeeReset}
          feeDirty={feeDirty}
          feeSaveError={feeSaveError}
          feeSaveMessage={feeSaveMessage}
          handleFeeSemesterJsonAdd={handleFeeSemesterJsonAdd}
          feeSemesterJsonText={feeSemesterJsonText}
          setFeeSemesterJsonText={setFeeSemesterJsonText}
          setFeeSemesterJsonAddError={setFeeSemesterJsonAddError}
          setFeeSemesterJsonAddMessage={setFeeSemesterJsonAddMessage}
          FEE_SEMESTER_JSON_PLACEHOLDER={FEE_SEMESTER_JSON_PLACEHOLDER}
          feeSemesterJsonAdding={feeSemesterJsonAdding}
          feeSemesterJsonAddError={feeSemesterJsonAddError}
          feeSemesterJsonAddMessage={feeSemesterJsonAddMessage}
          feeJsonText={feeJsonText}
          handleFeeJsonChange={handleFeeJsonChange}
          FEES_JSON_PLACEHOLDER={FEES_JSON_PLACEHOLDER}
          feeJsonSaving={feeJsonSaving}
          feeJsonSaveError={feeJsonSaveError}
          feeJsonSaveMessage={feeJsonSaveMessage}
          closeMarksEditor={closeMarksEditor}
          openMarksNormalEditor={openMarksNormalEditor}
          openMarksJsonEditor={openMarksJsonEditor}
          backToMarksOptions={backToMarksOptions}
          handleMarksSave={handleMarksSave}
          selectedMarksSemester={selectedMarksSemester}
          handleSelectMarksSemester={handleSelectMarksSemester}
          marksEditorSemesters={marksEditorSemesters}
          marksSubjectRows={marksSubjectRows}
          handleMarkChange={handleMarkChange}
          handleMarksReset={handleMarksReset}
          marksDirty={marksDirty}
          marksSaveError={marksSaveError}
          marksSaveMessage={marksSaveMessage}
          marksJsonText={marksJsonText}
          handleMarksJsonChange={handleMarksJsonChange}
          MARKS_JSON_PLACEHOLDER={MARKS_JSON_PLACEHOLDER}
          marksJsonSaving={marksJsonSaving}
          marksJsonSaveError={marksJsonSaveError}
          marksJsonSaveMessage={marksJsonSaveMessage}
          closeCalendarEditor={closeCalendarEditor}
          openCalendarNormalEditor={openCalendarNormalEditor}
          openCalendarJsonEditor={openCalendarJsonEditor}
          backToCalendarOptions={backToCalendarOptions}
          handleCalendarSave={handleCalendarSave}
          calendarItems={calendarItems}
          handleRemoveCalendarItem={handleRemoveCalendarItem}
          handleCalendarFieldChange={handleCalendarFieldChange}
          handleAddCalendarItem={handleAddCalendarItem}
          handleCalendarReset={handleCalendarReset}
          calendarDirty={calendarDirty}
          calendarSaveError={calendarSaveError}
          calendarSaveMessage={calendarSaveMessage}
          calendarJsonText={calendarJsonText}
          handleCalendarJsonChange={handleCalendarJsonChange}
          CALENDAR_JSON_PLACEHOLDER={CALENDAR_JSON_PLACEHOLDER}
          calendarJsonSaving={calendarJsonSaving}
          calendarJsonSaveError={calendarJsonSaveError}
          calendarJsonSaveMessage={calendarJsonSaveMessage}
          closeDownloadsEditor={closeDownloadsEditor}
          openDownloadsNormalEditor={openDownloadsNormalEditor}
          openDownloadsJsonEditor={openDownloadsJsonEditor}
          backToDownloadsOptions={backToDownloadsOptions}
          handleDownloadSave={handleDownloadSave}
          downloadItems={downloadItems}
          handleRemoveDownloadItem={handleRemoveDownloadItem}
          handleDownloadFieldChange={handleDownloadFieldChange}
          handleAddDownloadItem={handleAddDownloadItem}
          handleDownloadReset={handleDownloadReset}
          downloadDirty={downloadDirty}
          downloadSaveError={downloadSaveError}
          downloadSaveMessage={downloadSaveMessage}
          downloadJsonText={downloadJsonText}
          handleDownloadJsonChange={handleDownloadJsonChange}
          DOWNLOADS_JSON_PLACEHOLDER={DOWNLOADS_JSON_PLACEHOLDER}
          downloadJsonSaving={downloadJsonSaving}
          downloadJsonSaveError={downloadJsonSaveError}
          downloadJsonSaveMessage={downloadJsonSaveMessage}
          closeCoursesEditor={closeCoursesEditor}
          openCoursesNormalEditor={openCoursesNormalEditor}
          openCoursesJsonEditor={openCoursesJsonEditor}
          backToCourseOptions={backToCourseOptions}
          handleCourseSave={handleCourseSave}
          selectedCourseSemesterKey={selectedCourseSemesterKey}
          handleSelectCourseSemester={handleSelectCourseSemester}
          courseSemesterItems={courseSemesterItems}
          handleAddCourseSemester={handleAddCourseSemester}
          handleRemoveCourseSemester={handleRemoveCourseSemester}
          courseSemester={courseSemester}
          handleCourseSemesterNameChange={handleCourseSemesterNameChange}
          courseItems={courseItems}
          handleRemoveCourseItem={handleRemoveCourseItem}
          handleCourseFieldChange={handleCourseFieldChange}
          handleAddCourseItem={handleAddCourseItem}
          handleCourseReset={handleCourseReset}
          courseDirty={courseDirty}
          courseSaveError={courseSaveError}
          courseSaveMessage={courseSaveMessage}
          courseJsonText={courseJsonText}
          handleCourseJsonChange={handleCourseJsonChange}
          COURSES_JSON_PLACEHOLDER={COURSES_JSON_PLACEHOLDER}
          courseJsonSaving={courseJsonSaving}
          courseJsonSaveError={courseJsonSaveError}
          courseJsonSaveMessage={courseJsonSaveMessage}
          closePendingCoursesEditor={closePendingCoursesEditor}
          openPendingCoursesNormalEditor={openPendingCoursesNormalEditor}
          openPendingCoursesJsonEditor={openPendingCoursesJsonEditor}
          backToPendingCourseOptions={backToPendingCourseOptions}
          handlePendingCourseSave={handlePendingCourseSave}
          pendingCourseItems={pendingCourseItems}
          handleRemovePendingCourseItem={handleRemovePendingCourseItem}
          handlePendingCourseFieldChange={handlePendingCourseFieldChange}
          handleAddPendingCourseItem={handleAddPendingCourseItem}
          handlePendingCourseReset={handlePendingCourseReset}
          pendingCourseDirty={pendingCourseDirty}
          pendingCourseSaveError={pendingCourseSaveError}
          pendingCourseSaveMessage={pendingCourseSaveMessage}
          pendingCourseJsonText={pendingCourseJsonText}
          handlePendingCourseJsonChange={handlePendingCourseJsonChange}
          PENDING_COURSES_JSON_PLACEHOLDER={PENDING_COURSES_JSON_PLACEHOLDER}
          pendingCourseJsonSaving={pendingCourseJsonSaving}
          pendingCourseJsonSaveError={pendingCourseJsonSaveError}
          pendingCourseJsonSaveMessage={pendingCourseJsonSaveMessage}
        />
      </div>
    </div>
  );
}
