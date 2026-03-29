import { useMemo } from 'react';
import { useUIContext } from '../context/UIContext';
import { useUserContext } from '../context/UserContext';
import { useAcademicContext } from '../context/AcademicContext';

export function useAppContext() {
  const ui = useUIContext();
  const user = useUserContext();
  const academic = useAcademicContext();

  return useMemo(
    () => ({
      ...ui,
      ...user,
      ...academic,
    }),
    [ui, user, academic]
  );
}
