import { useCallback, useState } from 'react';
import { sortSemestersDesc, toNumber } from '../adminUtils';
import { validateMarksSemestersPayload } from '../adminValidation';
import { MARKS_JSON_PLACEHOLDER } from '../adminConstants';

export function useMarksEditor(marksSemesters, updateMarksData) {
  // Editor state
  const [semesters, setSemesters] = useState(
    sortSemestersDesc(marksSemesters || [], (x) => x.semester)
  );

  // Dirty/save state
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // JSON editor state
  const [jsonText, setJsonText] = useState('');
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonSaving, setJsonSaving] = useState(false);
  const [jsonSaveMessage, setJsonSaveMessage] = useState('');
  const [jsonSaveError, setJsonSaveError] = useState('');

  const updateMarkItem = useCallback((semesterIndex, subjectIndex, field, value) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const semesterEntry = { ...updated[semesterIndex] };
      const subjects = [...(semesterEntry.subjects || [])];
      const subject = { ...subjects[subjectIndex] };

      if (field === 'mark') {
        subject.mark = value === '' || value === null ? null : toNumber(value, null);
      } else {
        subject[field] = value;
      }

      subjects[subjectIndex] = subject;
      semesterEntry.subjects = subjects;
      updated[semesterIndex] = semesterEntry;
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const addMarkSubject = useCallback((semesterIndex, subject) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const semesterEntry = { ...updated[semesterIndex] };
      const subjects = [...(semesterEntry.subjects || [])];
      subjects.push(subject);
      semesterEntry.subjects = subjects;
      updated[semesterIndex] = semesterEntry;
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const removeMarkSubject = useCallback((semesterIndex, subjectIndex) => {
    setSemesters((prev) => {
      const updated = [...prev];
      const semesterEntry = { ...updated[semesterIndex] };
      const subjects = [...(semesterEntry.subjects || [])];
      subjects.splice(subjectIndex, 1);
      semesterEntry.subjects = subjects;
      updated[semesterIndex] = semesterEntry;
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const saveMarks = useCallback(async () => {
    setSaveMessage('');
    setSaveError('');

    const error = validateMarksSemestersPayload(semesters);
    if (error) {
      setSaveError(error);
      return { ok: false, error };
    }

    const result = await updateMarksData({ semesters });
    if (result.ok) {
      setSaveMessage('Marks saved successfully');
      setIsDirty(false);
    } else {
      setSaveError(result.error || 'Failed to save marks');
    }
    return result;
  }, [semesters, updateMarksData]);

  return {
    // Editor state
    semesters,
    setSemesters,

    // Item management
    updateMarkItem,
    addMarkSubject,
    removeMarkSubject,

    // Dirty/save state
    isDirty,
    setIsDirty,
    saveMessage,
    setSaveMessage,
    saveError,
    setSaveError,
    saveMarks,

    // JSON editor state
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

    // Constants
    jsonPlaceholder: MARKS_JSON_PLACEHOLDER,
  };
}
