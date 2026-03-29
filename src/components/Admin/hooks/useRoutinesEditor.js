import { useCallback, useState } from 'react';
import { toRoutineSemesters } from '../adminUtils';
import { validateRoutineSemesters } from '../adminValidation';
import { ROUTINES_JSON_PLACEHOLDER, ROUTINE_SEMESTER_JSON_PLACEHOLDER } from '../adminConstants';

export function useRoutinesEditor(
  routines,
  routinesSemester,
  routinesSemesters,
  updateRoutinesData
) {
  // Editor state
  const [currentSemester, setCurrentSemester] = useState(routinesSemester);
  const [items, setItems] = useState(routines || []);
  const [semesters, setSemesters] = useState(routinesSemesters || []);
  const [selectedSemesterKey, setSelectedSemesterKey] = useState('');

  // Dirty/save state
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // JSON editor state (all semesters)
  const [jsonText, setJsonText] = useState('');
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonSaving, setJsonSaving] = useState(false);
  const [jsonSaveMessage, setJsonSaveMessage] = useState('');
  const [jsonSaveError, setJsonSaveError] = useState('');

  // JSON editor state (single semester)
  const [semesterJsonText, setSemesterJsonText] = useState('');
  const [semesterJsonAdding, setSemesterJsonAdding] = useState(false);
  const [semesterJsonAddMessage, setSemesterJsonAddMessage] = useState('');
  const [semesterJsonAddError, setSemesterJsonAddError] = useState('');

  const updateRoutineItem = useCallback((index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const addRoutineItem = useCallback((item) => {
    setItems((prev) => [...prev, item]);
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const removeRoutineItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const saveRoutines = useCallback(async () => {
    setSaveMessage('');
    setSaveError('');

    if (items.length === 0) {
      setSaveError('Routine cannot be empty');
      return { ok: false, error: 'Routine cannot be empty' };
    }

    const payload = toRoutineSemesters(semesters, currentSemester, items);
    const error = validateRoutineSemesters(payload);
    if (error) {
      setSaveError(error);
      return { ok: false, error };
    }

    const result = await updateRoutinesData({ semesters: payload });
    if (result.ok) {
      setSaveMessage('Routines saved successfully');
      setIsDirty(false);
    } else {
      setSaveError(result.error || 'Failed to save routines');
    }
    return result;
  }, [items, semesters, currentSemester, updateRoutinesData]);

  return {
    // Editor state
    currentSemester,
    setCurrentSemester,
    items,
    setItems,
    semesters,
    setSemesters,
    selectedSemesterKey,
    setSelectedSemesterKey,

    // Item management
    updateRoutineItem,
    addRoutineItem,
    removeRoutineItem,

    // Dirty/save state
    isDirty,
    setIsDirty,
    saveMessage,
    setSaveMessage,
    saveError,
    setSaveError,
    saveRoutines,

    // JSON editor state (all semesters)
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

    // JSON editor state (single semester)
    semesterJsonText,
    setSemesterJsonText,
    semesterJsonAdding,
    setSemesterJsonAdding,
    semesterJsonAddMessage,
    setSemesterJsonAddMessage,
    semesterJsonAddError,
    setSemesterJsonAddError,

    // Constants
    jsonPlaceholder: ROUTINES_JSON_PLACEHOLDER,
    semesterJsonPlaceholder: ROUTINE_SEMESTER_JSON_PLACEHOLDER,
  };
}
