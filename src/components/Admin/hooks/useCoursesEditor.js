import { useCallback, useState } from 'react';
import { sortCoursesBySemesterDesc } from '../adminUtils';
import { validateCoursesPayload, validatePendingCoursesPayload } from '../adminValidation';
import { COURSES_JSON_PLACEHOLDER, PENDING_COURSES_JSON_PLACEHOLDER } from '../adminConstants';

export function useCoursesEditor(courses, updateCoursesData, updatePendingCoursesData) {
  // Editor state
  const [allCourses, setAllCourses] = useState(sortCoursesBySemesterDesc(courses?.courses || []));
  const [pendingCourses, setPendingCourses] = useState(courses?.pendingCourses || []);
  const [courseNameMap, setCourseNameMap] = useState(courses?.courseNameMap || {});

  // Dirty/save state
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // JSON editor state (all courses)
  const [jsonText, setJsonText] = useState('');
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonSaving, setJsonSaving] = useState(false);
  const [jsonSaveMessage, setJsonSaveMessage] = useState('');
  const [jsonSaveError, setJsonSaveError] = useState('');

  // JSON editor state (pending courses)
  const [pendingJsonText, setPendingJsonText] = useState('');
  const [pendingJsonDirty, setPendingJsonDirty] = useState(false);
  const [pendingJsonSaving, setPendingJsonSaving] = useState(false);
  const [pendingJsonSaveMessage, setPendingJsonSaveMessage] = useState('');
  const [pendingJsonSaveError, setPendingJsonSaveError] = useState('');

  const updateCourseItem = useCallback((index, field, value) => {
    setAllCourses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const removeCourseItem = useCallback((index) => {
    setAllCourses((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const saveCourses = useCallback(async () => {
    setSaveMessage('');
    setSaveError('');

    const error = validateCoursesPayload(allCourses);
    if (error) {
      setSaveError(error);
      return { ok: false, error };
    }

    const payload = {
      courses: sortCoursesBySemesterDesc(allCourses),
      pendingCourses,
      courseNameMap,
    };

    const result = await updateCoursesData(payload);
    if (result.ok) {
      setSaveMessage('Courses saved successfully');
      setIsDirty(false);
    } else {
      setSaveError(result.error || 'Failed to save courses');
    }
    return result;
  }, [allCourses, pendingCourses, courseNameMap, updateCoursesData]);

  const updatePendingCourseItem = useCallback((index, field, value) => {
    setPendingCourses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addPendingCourseItem = useCallback((item) => {
    setPendingCourses((prev) => [...prev, item]);
  }, []);

  const removePendingCourseItem = useCallback((index) => {
    setPendingCourses((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const savePendingCourses = useCallback(async () => {
    setPendingJsonSaveMessage('');
    setPendingJsonSaveError('');

    const error = validatePendingCoursesPayload(pendingCourses);
    if (error) {
      setPendingJsonSaveError(error);
      return { ok: false, error };
    }

    const result = await updatePendingCoursesData({ pendingCourses });
    if (result.ok) {
      setPendingJsonSaveMessage('Pending courses saved successfully');
      setPendingJsonDirty(false);
    } else {
      setPendingJsonSaveError(result.error || 'Failed to save pending courses');
    }
    return result;
  }, [pendingCourses, updatePendingCoursesData]);

  return {
    // Editor state
    allCourses,
    setAllCourses,
    pendingCourses,
    setPendingCourses,
    courseNameMap,
    setCourseNameMap,

    // Item management
    updateCourseItem,
    removeCourseItem,
    updatePendingCourseItem,
    addPendingCourseItem,
    removePendingCourseItem,

    // Dirty/save state
    isDirty,
    setIsDirty,
    saveMessage,
    setSaveMessage,
    saveError,
    setSaveError,
    saveCourses,
    savePendingCourses,

    // JSON editor state (all courses)
    jsonText,
    setJsonText,
    jsonDirty,
    setJsonDirty,
    jsonSaving,
    setJsonSaving,
    jsonSaveMessage,
    setJsonSaveMessage,
    jsonSaveError,
    setJsonSaveError,

    // JSON editor state (pending courses)
    pendingJsonText,
    setPendingJsonText,
    pendingJsonDirty,
    setPendingJsonDirty,
    pendingJsonSaving,
    setPendingJsonSaving,
    pendingJsonSaveMessage,
    setPendingJsonSaveMessage,
    pendingJsonSaveError,
    setPendingJsonSaveError,

    // Constants
    jsonPlaceholder: COURSES_JSON_PLACEHOLDER,
    pendingJsonPlaceholder: PENDING_COURSES_JSON_PLACEHOLDER,
  };
}
