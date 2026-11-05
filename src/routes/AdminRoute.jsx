import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAdminRole } from '../utils/permissions';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (!user || !isAdminRole(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
