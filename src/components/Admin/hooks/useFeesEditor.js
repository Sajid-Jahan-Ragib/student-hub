import { useCallback, useState } from 'react';
import { normalizeFeeEntry, toNumber } from '../adminUtils';
import { validateFeesPayload } from '../adminValidation';
import { FEES_JSON_PLACEHOLDER, FEE_SEMESTER_JSON_PLACEHOLDER } from '../adminConstants';

export function useFeesEditor(fees, updateFeesData) {
  // Editor state
  const [items, setItems] = useState(fees || []);
  const [selectedSemesterKey, setSelectedSemesterKey] = useState('');
  const [feeForm, setFeeForm] = useState({
    semester: '',
    demand: '',
    waiver: '',
    paid: '',
    status: 'ok',
    statusText: '',
    statusAmount: '',
  });

  // Dirty/save state
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // JSON editor state (all fees)
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

  const updateFeeItem = useCallback((index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const parsed = normalizeFeeEntry({ ...updated[index], [field]: value }, toNumber);
      updated[index] = parsed;
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const updateFeeForm = useCallback((field, value) => {
    setFeeForm((prev) => ({ ...prev, [field]: value }));
    setSaveMessage('');
    setSaveError('');
  }, []);

  const addFeeItem = useCallback((item) => {
    const normalized = normalizeFeeEntry(item, toNumber);
    setItems((prev) => [...prev, normalized]);
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const removeFeeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const saveFees = useCallback(async () => {
    setSaveMessage('');
    setSaveError('');

    if (items.length === 0) {
      setSaveError('At least one fee entry is required');
      return { ok: false, error: 'At least one fee entry is required' };
    }

    const error = validateFeesPayload(items);
    if (error) {
      setSaveError(error);
      return { ok: false, error };
    }

    const result = await updateFeesData({ fees: items });
    if (result.ok) {
      setSaveMessage('Fees saved successfully');
      setIsDirty(false);
    } else {
      setSaveError(result.error || 'Failed to save fees');
    }
    return result;
  }, [items, updateFeesData]);

  return {
    // Editor state
    items,
    setItems,
    selectedSemesterKey,
    setSelectedSemesterKey,
    feeForm,
    setFeeForm,

    // Item management
    updateFeeItem,
    updateFeeForm,
    addFeeItem,
    removeFeeItem,

    // Dirty/save state
    isDirty,
    setIsDirty,
    saveMessage,
    setSaveMessage,
    saveError,
    setSaveError,
    saveFees,

    // JSON editor state (all fees)
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
    jsonPlaceholder: FEES_JSON_PLACEHOLDER,
    semesterJsonPlaceholder: FEE_SEMESTER_JSON_PLACEHOLDER,
  };
}
