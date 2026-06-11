import { useSelector } from 'react-redux';

/**
 * Returns which modules the current tenant's plan includes.
 * Usage:
 *   const { can, limits } = usePlanFeatures();
 *   can('accounting')  → true/false
 *   limits.maxUsers    → number (-1 = unlimited)
 */
export function usePlanFeatures() {
  const company = useSelector(s => s.auth.company);
  const plan = company?.plan;

  // If no plan data yet, allow everything (graceful degradation)
  const modules = plan?.modules || [];
  const hasModules = modules.length > 0;

  const can = (module) => {
    if (!hasModules) return true;
    return modules.includes(module);
  };

  const limits = {
    maxUsers:      plan?.maxUsers      ?? -1,
    maxProperties: plan?.maxProperties ?? -1,
    maxUnits:      plan?.maxUnits      ?? -1,
  };

  const planName = plan?.nameAr || plan?.name || null;
  const isStarter      = plan?.name === 'starter';
  const isProfessional = plan?.name === 'professional';
  const isEnterprise   = plan?.name === 'enterprise';

  return { can, limits, planName, isStarter, isProfessional, isEnterprise, plan };
}
