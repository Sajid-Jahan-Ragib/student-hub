import { useCallback, useState } from 'react';
import { mapUserToForm, validateProfilePayload } from '../adminUtils';
import { PROFILE_JSON_PLACEHOLDER } from '../adminConstants';

export function useProfileEditor(user, updateUserProfile) {
  // Form state
  const [formData, setFormData] = useState(mapUserToForm(user));
  const [formDirty, setFormDirty] = useState(false);
  const [formSaveMessage, setFormSaveMessage] = useState('');
  const [formSaveError, setFormSaveError] = useState('');

  // JSON editor state
  const [jsonText, setJsonText] = useState('');
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonSaving, setJsonSaving] = useState(false);
  const [jsonSaveMessage, setJsonSaveMessage] = useState('');
  const [jsonSaveError, setJsonSaveError] = useState('');

  const updateFormField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormDirty(true);
    setFormSaveMessage('');
    setFormSaveError('');
  }, []);

  const saveForm = useCallback(async () => {
    setFormSaveMessage('');
    setFormSaveError('');

    const error = validateProfilePayload(formData);
    if (error) {
      setFormSaveError(error);
      return { ok: false, error };
    }

    const result = await updateUserProfile(formData);
    if (result.ok) {
      setFormSaveMessage('Profile saved successfully');
      setFormDirty(false);
    } else {
      setFormSaveError(result.error || 'Failed to save profile');
    }
    return result;
  }, [formData, updateUserProfile]);

  const resetForm = useCallback(() => {
    setFormData(mapUserToForm(user));
    setFormDirty(false);
    setFormSaveMessage('');
    setFormSaveError('');
  }, [user]);

  return {
    // Form state
    formData,
    setFormData,
    formDirty,
    formSaveMessage,
    formSaveError,
    updateFormField,
    saveForm,
    resetForm,

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
    jsonPlaceholder: PROFILE_JSON_PLACEHOLDER,
  };
}
