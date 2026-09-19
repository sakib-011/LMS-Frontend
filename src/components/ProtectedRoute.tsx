import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRole: 'STUDENT' | 'MODERATOR' | 'ADMINISTRATOR';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Unauthenticated check -> Redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize user role string
  const userRoleStr = (user.role || '').toUpperCase();

  // Normalize allowedRole
  const targetRole = allowedRole.toUpperCase();

  // Helper matching role variations (e.g. STUDENT vs Student, ADMINISTRATOR vs Admin)
  const isMatch = (userRole: string, allowed: string) => {
    if (allowed === 'ADMINISTRATOR' || allowed === 'ADMIN') {
      return userRole === 'ADMINISTRATOR' || userRole === 'ADMIN';
    }
    return userRole === allowed;
  };

  // 2. Strict Role Isolation Check
  if (!isMatch(userRoleStr, targetRole)) {
    // If authenticated user tries to access a panel that does not match their role,
    // redirect them back to THEIR OWN designated panel:
    if (userRoleStr === 'STUDENT') {
      return <Navigate to="/student" replace />;
    }
    if (userRoleStr === 'MODERATOR') {
      return <Navigate to="/moderator" replace />;
    }
    if (userRoleStr === 'ADMINISTRATOR' || userRoleStr === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    // Default fallback
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
