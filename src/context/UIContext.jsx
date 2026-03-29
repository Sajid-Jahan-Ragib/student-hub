import React, { createContext, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const value = useMemo(
    () => ({
      currentScreen,
      setCurrentScreen,
      loading,
      setLoading,
      error,
      setError,
    }),
    [currentScreen, loading, error]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within UIProvider');
  }
  return context;
}
