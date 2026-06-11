import React from 'react';
import { useAbility } from './AbilityContext';

export default function Can({ I: action, a: subject, children, fallback = null }) {
  const ability = useAbility();
  return ability.can(action, subject) ? <>{children}</> : <>{fallback}</>;
}
