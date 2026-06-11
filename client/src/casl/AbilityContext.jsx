import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { buildAbility } from './ability';

const AbilityContext = createContext(null);

export function AbilityProvider({ children }) {
  const { user } = useSelector(s => s.auth);
  const ability = useMemo(() => buildAbility(user), [user]);
  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) throw new Error('useAbility must be used inside AbilityProvider');
  return ability;
}

export function useCan(action, subject) {
  const ability = useAbility();
  return ability.can(action, subject);
}
