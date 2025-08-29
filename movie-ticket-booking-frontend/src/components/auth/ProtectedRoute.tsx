import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being initialized
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading application...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we set things up</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirect based on user role
      switch (user.role) {
        case 'CUSTOMER':
          return <Navigate to="/customer" replace />;
        case 'THEATER_OWNER':
          return <Navigate to="/theater-owner" replace />;
        case 'ADMIN':
          return <Navigate to="/admin" replace />;
        default:
          return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;