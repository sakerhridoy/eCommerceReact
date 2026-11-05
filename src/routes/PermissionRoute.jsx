import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../utils/permissions';

/**
 * Route-level permission guard for admin pages. Complements the sidebar
 * hiding so a staff member cannot reach a page they lack access to.
 */
const PermissionRoute = ({ permission, children }) => {
  const { user } = useAuth();

  if (!can(user, permission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PermissionRoute;
