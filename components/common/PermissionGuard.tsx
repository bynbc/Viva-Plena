
import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface PermissionGuardProps {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ module, children, fallback = null }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(module)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
