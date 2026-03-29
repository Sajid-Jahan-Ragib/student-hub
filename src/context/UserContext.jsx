import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useUIContext } from './UIContext';
import { getWriteRequestHeaders } from '../utils/apiClient';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { setError } = useUIContext();
  const [user, setUser] = useState(null);

  const updateUserProfile = useCallback(
    async (updates) => {
      try {
        const response = await fetch('/api/v1/user', {
          method: 'PUT',
          headers: getWriteRequestHeaders(),
          body: JSON.stringify({ user: updates }),
        });

        if (!response.ok) {
          throw new Error(`Profile save failed (${response.status})`);
        }

        const savedData = await response.json();
        if (savedData?.user) {
          setUser(savedData.user);
        }

        return { ok: true };
      } catch (saveError) {
        console.error('Error saving profile:', saveError);
        setError(saveError.message);
        return { ok: false, error: saveError.message };
      }
    },
    [setError]
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUserProfile,
    }),
    [user, updateUserProfile]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
}
