import { useCallback, useState } from 'react';
import { sortCalendarEvents } from '../adminUtils';
import { validateCalendarPayload } from '../adminValidation';
import { CALENDAR_JSON_PLACEHOLDER } from '../adminConstants';

export function useCalendarEditor(calendarEvents, updateCalendarData) {
  // Editor state
  const [items, setItems] = useState(sortCalendarEvents(calendarEvents || []));

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

  const updateCalendarItem = useCallback((index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const addCalendarItem = useCallback((item) => {
    setItems((prev) => [...prev, item]);
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const removeCalendarItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const saveCalendar = useCallback(async () => {
    setSaveMessage('');
    setSaveError('');

    const error = validateCalendarPayload(items);
    if (error) {
      setSaveError(error);
      return { ok: false, error };
    }

    const result = await updateCalendarData({ events: sortCalendarEvents(items) });
    if (result.ok) {
      setSaveMessage('Calendar saved successfully');
      setIsDirty(false);
    } else {
      setSaveError(result.error || 'Failed to save calendar');
    }
    return result;
  }, [items, updateCalendarData]);

  return {
    // Editor state
    items,
    setItems,

    // Item management
    updateCalendarItem,
    addCalendarItem,
    removeCalendarItem,

    // Dirty/save state
    isDirty,
    setIsDirty,
    saveMessage,
    setSaveMessage,
    saveError,
    setSaveError,
    saveCalendar,

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
    jsonPlaceholder: CALENDAR_JSON_PLACEHOLDER,
  };
}
