/**
 * src/components/ProtectedRoute.jsx
 * Route protection based on authentication and role
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      /* Using our app-bg class for consistency */
      <div className="min-h-screen flex items-center justify-center app-bg">
        <div className="glass p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium opacity-80 tracking-wide">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, boot to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If page requires admin but user isn't one, send to student dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default ProtectedRoute;