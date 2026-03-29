import { useCallback, useState } from 'react';
import { normalizeDownloadItems } from '../adminUtils';
import { validateDownloadsPayload } from '../adminValidation';
import { DOWNLOADS_JSON_PLACEHOLDER } from '../adminConstants';

export function useDownloadsEditor(downloads, updateDownloadsData) {
  // Editor state
  const [items, setItems] = useState(normalizeDownloadItems(downloads || []));

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

  const updateDownloadItem = useCallback((index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const addDownloadItem = useCallback((item) => {
    setItems((prev) => [...prev, item]);
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const removeDownloadItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveMessage('');
    setSaveError('');
  }, []);

  const saveDownloads = useCallback(async () => {
    setSaveMessage('');
    setSaveError('');

    const error = validateDownloadsPayload(items);
    if (error) {
      setSaveError(error);
      return { ok: false, error };
    }

    const normalized = normalizeDownloadItems(items);
    const result = await updateDownloadsData({ downloads: normalized });
    if (result.ok) {
      setSaveMessage('Downloads saved successfully');
      setIsDirty(false);
    } else {
      setSaveError(result.error || 'Failed to save downloads');
    }
    return result;
  }, [items, updateDownloadsData]);

  return {
    // Editor state
    items,
    setItems,

    // Item management
    updateDownloadItem,
    addDownloadItem,
    removeDownloadItem,

    // Dirty/save state
    isDirty,
    setIsDirty,
    saveMessage,
    setSaveMessage,
    saveError,
    setSaveError,
    saveDownloads,

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
    jsonPlaceholder: DOWNLOADS_JSON_PLACEHOLDER,
  };
}
