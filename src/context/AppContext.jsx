import React from 'react';
import { UIProvider } from './UIContext';
import { UserProvider } from './UserContext';
import { AcademicProvider } from './AcademicContext';

export function AppProvider({ children }) {
  return (
    <UIProvider>
      <UserProvider>
        <AcademicProvider>{children}</AcademicProvider>
      </UserProvider>
    </UIProvider>
  );
}
