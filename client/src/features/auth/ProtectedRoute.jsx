import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAbility } from '../../casl/AbilityContext';

const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  const ability = useAbility();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (permission) {
    const [subject, action] = permission.split('.');
    if (!ability.can(action, subject)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
