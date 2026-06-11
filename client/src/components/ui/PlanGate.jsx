import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';

/**
 * Wraps content that requires a specific plan module.
 * Shows a locked overlay if the module is not available.
 *
 * <PlanGate module="accounting" label="المحاسبة">
 *   <AccountingPage />
 * </PlanGate>
 */
const PlanGate = ({ module, label, children, className = '' }) => {
  const { can, planName } = usePlanFeatures();

  if (can(module)) return children;

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none opacity-20 blur-sm">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 border border-gray-100">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #da1f27, #b01820)' }}>
            <FaLock className="text-white text-xl" />
          </div>
          <h3 className="text-lg font-black mb-2">
            {label ? `${label} غير متاح` : 'هذه الميزة غير متاحة'}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            {planName
              ? `باقتك الحالية (${planName}) لا تتضمن هذه الميزة.`
              : 'هذه الميزة غير متاحة في باقتك الحالية.'}
            {' '}قم بالترقية للوصول إليها.
          </p>
          <Link
            to="/settings/subscription"
            className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #da1f27, #b01820)' }}>
            <FaArrowUpRightFromSquare className="text-xs" />
            ترقية الباقة
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanGate;
