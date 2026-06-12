import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { buildAbility } from './ability';

const AbilityContext = createContext(null);

// Singleton empty ability used as fallback when context is not available
let _emptyAbility = null;
const getEmptyAbility = () => {
  if (!_emptyAbility) _emptyAbility = buildAbility(null);
  return _emptyAbility;
};

export function AbilityProvider({ children }) {
  const { user } = useSelector(s => s.auth);
  const ability = useMemo(() => buildAbility(user), [user]);
  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export function useAbility() {
  const ability = useContext(AbilityContext);
  // Return empty ability (allows nothing for non-SuperAdmin) instead of throwing
  return ability || getEmptyAbility();
}

export function useCan(action, subject) {
  const ability = useAbility();
  return ability.can(action, subject);
}
