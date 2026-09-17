import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl shadow-lg text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          This section is restricted to [{requiredRoles.join(', ')}] roles. Your current role is{' '}
          <strong className="text-slate-900 dark:text-white uppercase">{user.role}</strong>.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Use the demo role switcher in the top navigation bar to test this screen as Admin!
        </p>
      </div>
    );
  }

  return <Outlet />;
};
